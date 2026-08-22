import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  Res,
  Param,
  Query,
  Request,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request as ExpressRequest, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  PKCE_VERIFIER_COOKIE,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  pkceVerifierCookieOptions,
  clearAccessTokenCookieOptions,
  clearRefreshTokenCookieOptions,
  clearPkceVerifierCookieOptions,
} from './utils/auth-cookies';

interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 15, ttl: 900000 } }) // 15 attempts per 15 minutes (auth brute force)
  @Post('token')
  @ApiOperation({ summary: 'Login with email/password via Supabase' })
  @ApiResponse({ status: 200, description: 'JWT Token successfully obtained' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const session = await this.authService.login(loginDto);
    this.setSessionCookies(res, session);
    return session;
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Get('oauth/:provider')
  @ApiOperation({
    summary: 'Start OAuth sign-in / sign-up (google | github). Redirects to the provider consent screen.',
  })
  @ApiResponse({ status: 302, description: 'Redirect to the OAuth provider' })
  @ApiResponse({ status: 400, description: 'Unsupported provider' })
  oauth(@Param('provider') provider: string, @Res() res: Response) {
    const { url, codeVerifier } = this.authService.buildOAuthAuthorizeUrl(provider);
    res.cookie(PKCE_VERIFIER_COOKIE, codeVerifier, pkceVerifierCookieOptions());
    return res.redirect(url);
  }

  @Public()
  @Get('callback')
  @ApiOperation({
    summary: 'OAuth callback — exchanges the code, creates the profile on first sign-in, sets the session cookies and redirects to the frontend',
  })
  @ApiResponse({ status: 302, description: 'Redirect to the frontend' })
  async oauthCallback(
    @Query('code') code: string,
    @Req() req: ExpressRequest,
    @Res() res: Response,
  ) {
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    const codeVerifier = req.cookies?.[PKCE_VERIFIER_COOKIE];
    res.clearCookie(PKCE_VERIFIER_COOKIE, clearPkceVerifierCookieOptions());

    if (!code || !codeVerifier) {
      return res.redirect(`${frontendUrl}/login?error=oauth`);
    }

    try {
      const session = await this.authService.exchangeCodeForSession(code, codeVerifier);
      this.setSessionCookies(res, session);
      return res.redirect(`${frontendUrl}/dashboard`);
    } catch {
      return res.redirect(`${frontendUrl}/login?error=oauth`);
    }
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh JWT Token via Supabase (reads the httpOnly refresh cookie)' })
  @ApiResponse({ status: 200, description: 'New JWT Token successfully obtained' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE] ?? refreshTokenDto?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not provided');
    }

    const session = await this.authService.refreshToken(refreshToken);
    this.setSessionCookies(res, session);
    return session;
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Sign out — revokes the Supabase session and clears the auth cookies' })
  @ApiResponse({ status: 200, description: 'Session closed' })
  async logout(@Req() req: ExpressRequest, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.cookies?.[ACCESS_TOKEN_COOKIE]);
    res.clearCookie(ACCESS_TOKEN_COOKIE, clearAccessTokenCookieOptions());
    res.clearCookie(REFRESH_TOKEN_COOKIE, clearRefreshTokenCookieOptions());
    return { success: true };
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get the authenticated user profile' })
  @ApiResponse({ status: 200, description: 'Profile returned successfully' })
  getProfile(@Request() req: any) {
    // req.user has { sub, email, role } decoded from the JWT by JwtStrategy
    return this.authService.getProfile(req.user.sub);
  }

  private setSessionCookies(res: Response, session: SupabaseSession) {
    res.cookie(ACCESS_TOKEN_COOKIE, session.access_token, accessTokenCookieOptions(session.expires_in));
    res.cookie(REFRESH_TOKEN_COOKIE, session.refresh_token, refreshTokenCookieOptions());
  }
}
