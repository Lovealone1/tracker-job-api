import { Controller, Post, Body, Get, Req, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('token')
  @ApiOperation({ summary: 'Login con email/password hacia Supabase' })
  @ApiResponse({ status: 200, description: 'Token JWT obtenido correctamente' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener el perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil devuelto exitosamente' })
  getProfile(@Request() req: any) {
    // req.user has { sub, email, role } decoded from the JWT by JwtStrategy
    return this.authService.getProfile(req.user.sub);
  }
}
