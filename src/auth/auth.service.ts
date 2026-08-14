import {
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { createHash, randomBytes } from 'crypto';
import { LoginDto } from './dto/login.dto';
import { lastValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

/** OAuth providers enabled for sign-in AND sign-up (no password registration). */
const ALLOWED_OAUTH_PROVIDERS = ['google', 'github'] as const;
type OAuthProvider = (typeof ALLOWED_OAUTH_PROVIDERS)[number];

interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
}

@Injectable()
export class AuthService {
  private readonly supabaseUrl = process.env.SUPABASE_URL;
  private readonly supabaseKey = process.env.SUPABASE_ANON_KEY;

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {
    if (!this.supabaseUrl || !this.supabaseKey) {
      console.warn('SUPABASE_URL and SUPABASE_ANON_KEY must be defined');
    }
  }

  /* ─────────────────────────── OAuth (Google / GitHub) ─────────────────────────── */

  /**
   * Builds the Supabase authorize URL for a server-side PKCE flow.
   * The returned code verifier must be kept (httpOnly cookie) until the callback.
   * New users are registered implicitly on their first OAuth sign-in.
   */
  buildOAuthAuthorizeUrl(provider: string): { url: string; codeVerifier: string } {
    if (!ALLOWED_OAUTH_PROVIDERS.includes(provider as OAuthProvider)) {
      throw new BadRequestException(
        `Unsupported OAuth provider "${provider}". Allowed: ${ALLOWED_OAUTH_PROVIDERS.join(', ')}`,
      );
    }

    const codeVerifier = randomBytes(32).toString('base64url');
    const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url');

    const params = new URLSearchParams({
      provider,
      redirect_to: `${this.apiPublicUrl()}/api/v1/auth/callback`,
      code_challenge: codeChallenge,
      code_challenge_method: 's256',
    });

    return { url: `${this.supabaseUrl}/auth/v1/authorize?${params.toString()}`, codeVerifier };
  }

  /** Exchanges the authorization code (+ PKCE verifier) for a Supabase session. */
  async exchangeCodeForSession(code: string, codeVerifier: string) {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${this.supabaseUrl}/auth/v1/token?grant_type=pkce`,
          { auth_code: code, code_verifier: codeVerifier },
          {
            headers: {
              apikey: this.supabaseKey,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const session = response.data;
      if (session.user?.id) {
        await this.syncProfile(session.user);
      }
      return session;
    } catch (error) {
      if (error instanceof ConflictException || error instanceof HttpException) {
        throw error;
      }
      if (error.response) {
        throw new HttpException(
          error.response.data.error_description || error.response.data.msg || 'OAuth code exchange failed',
          error.response.status || HttpStatus.UNAUTHORIZED,
        );
      }
      throw new UnauthorizedException('Error conectando con Supabase Auth');
    }
  }

  /* ─────────────────────── Email + password (login only) ─────────────────────── */

  async login(loginDto: LoginDto) {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${this.supabaseUrl}/auth/v1/token?grant_type=password`,
          {
            email: loginDto.email,
            password: loginDto.password,
          },
          {
            headers: {
              apikey: this.supabaseKey,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const data = response.data;

      if (data.user?.id) {
        await this.syncProfile(data.user);
      }

      return data;
    } catch (error) {
      if (error.response) {
        const errorMsg = error.response.data.error_description || error.response.data.msg || '';

        // Custom message for unconfirmed emails
        if (errorMsg.includes('Email not confirmed')) {
          throw new HttpException(
            'Please verify your email address before logging in. Check your inbox for the confirmation link.',
            HttpStatus.BAD_REQUEST,
          );
        }

        throw new HttpException(
          errorMsg || 'Invalid login credentials',
          error.response.status || HttpStatus.UNAUTHORIZED,
        );
      }
      throw new UnauthorizedException('Error conectando con Supabase Auth');
    }
  }

  /* ───────────────────────────── Session helpers ───────────────────────────── */

  async getProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!profile) {
      throw new UnauthorizedException('User profile not found in local database');
    }

    return profile;
  }

  async refreshToken(refreshToken: string) {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${this.supabaseUrl}/auth/v1/token?grant_type=refresh_token`,
          { refresh_token: refreshToken },
          {
            headers: {
              apikey: this.supabaseKey,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return response.data; // contains new access_token, refresh_token, etc.
    } catch (error) {
      if (error.response) {
        throw new HttpException(
          error.response.data.error_description || error.response.data.msg || 'Error refreshing token',
          error.response.status || HttpStatus.UNAUTHORIZED,
        );
      }
      throw new UnauthorizedException('Error refreshing token with Supabase Auth');
    }
  }

  /** Best-effort revocation of the Supabase session — never throws. */
  async logout(accessToken?: string): Promise<void> {
    if (!accessToken) return;

    try {
      await lastValueFrom(
        this.httpService.post(`${this.supabaseUrl}/auth/v1/logout`, null, {
          headers: {
            apikey: this.supabaseKey,
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      );
    } catch {
      // Intentionally ignored: cookies are cleared regardless.
    }
  }

  /* ─────────────────────────────── Internals ─────────────────────────────── */

  /**
   * Creates the local Profile on the very first sign-in (this is where OAuth
   * sign-ups materialize) and touches lastLoginAt on subsequent ones.
   * Names/avatar are mapped from the provider metadata (Google: given_name/
   * family_name/picture, GitHub: name/avatar_url).
   */
  private async syncProfile(user: SupabaseUser): Promise<void> {
    const metadata = user.user_metadata ?? {};
    const fullName: string = metadata.full_name ?? metadata.name ?? '';
    const [first, ...rest] = fullName.split(' ').filter(Boolean);

    const firstName: string | undefined =
      metadata.given_name ?? metadata.first_name ?? first ?? undefined;
    const lastName: string | undefined =
      metadata.family_name ?? metadata.last_name ?? (rest.length ? rest.join(' ') : undefined);
    const avatarUrl: string | undefined = metadata.avatar_url ?? metadata.picture ?? undefined;

    const existing = await this.prisma.profile.findUnique({ where: { id: user.id } });

    if (existing) {
      await this.prisma.profile.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          // Backfill the avatar only if the user never set one locally
          ...(existing.avatarUrl ? {} : { avatarUrl }),
        },
      });
      return;
    }

    if (!user.email) {
      // e.g. an OAuth provider without email scope — a local profile cannot be provisioned
      throw new UnauthorizedException('Your OAuth provider did not return an email address.');
    }

    const emailTaken = await this.prisma.profile.findUnique({ where: { email: user.email } });
    if (emailTaken) {
      // A profile already exists under a different Supabase user id
      // (identities not linked). Never duplicate the local profile.
      throw new ConflictException(
        'An account with this email already exists. Sign in with your original method.',
      );
    }

    await this.prisma.profile.create({
      data: {
        id: user.id,
        email: user.email,
        firstName,
        lastName,
        avatarUrl,
        role: 'USER',
        enabled: true,
        lastLoginAt: new Date(),
      },
    });
  }

  private apiPublicUrl(): string {
    const url = process.env.API_PUBLIC_URL;
    if (url) return url;
    if (process.env.NODE_ENV === 'production') {
      throw new InternalServerErrorException(
        'API_PUBLIC_URL is not set. It must be the public URL of this API (e.g. https://api.example.com) ' +
          'because it is used to build the OAuth callback URL.',
      );
    }
    return `http://localhost:${process.env.PORT ?? 3001}`;
  }
}
