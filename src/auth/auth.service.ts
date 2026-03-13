import { Injectable, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { lastValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

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
      
      // Ensure the profile exists in Prisma, if not let's sync or throw error.
      // Usually you create a trigger in supabase to insert the Profile, but just in case:
      if (data.user && data.user.id) {
        const profile = await this.prisma.profile.findUnique({
          where: { id: data.user.id }
        });

        if (!profile) {
          // If using Auth hook or manual sync:
          await this.prisma.profile.create({
            data: {
              id: data.user.id,
              email: data.user.email,
              role: 'USER',
              enabled: true,
            }
          });
        }
      }

      return data; // contains access_token, refresh_token, user
    } catch (error) {
      if (error.response) {
        throw new HttpException(
          error.response.data.error_description || error.response.data.msg || 'Invalid login credentials',
          error.response.status || HttpStatus.UNAUTHORIZED,
        );
      }
      throw new UnauthorizedException('Error conectando con Supabase Auth');
    }
  }

  async getProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!profile) {
      throw new UnauthorizedException('User profile not found in local database');
    }

    return profile;
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${this.supabaseUrl}/auth/v1/token?grant_type=refresh_token`,
          {
            refresh_token: refreshTokenDto.refreshToken,
          },
          {
            headers: {
              apikey: this.supabaseKey,
              'Content-Type': 'application/json',
            },
          },
        )
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
}
