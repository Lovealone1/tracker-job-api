import { Injectable, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
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

  async register(registerDto: RegisterDto) {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${this.supabaseUrl}/auth/v1/signup`,
          {
            email: registerDto.email,
            password: registerDto.password,
            data: {
              first_name: registerDto.firstName,
              last_name: registerDto.lastName,
            },
          },
          {
            headers: {
              apikey: this.supabaseKey,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(
          error.response.data.error_description || error.response.data.msg || 'Error creating account',
          error.response.status || HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException('Error conectando con Supabase Auth', HttpStatus.INTERNAL_SERVER_ERROR);
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
      
      if (data.user && data.user.id) {
        const userId = data.user.id;
        const metadata = data.user.user_metadata || {};
        
        // Find if profile already exists or create/update it
        const currentProfile = await this.prisma.profile.findUnique({
          where: { id: userId }
        });

        if (!currentProfile) {
          await this.prisma.profile.create({
            data: {
              id: userId,
              email: data.user.email,
              firstName: metadata.first_name,
              lastName: metadata.last_name,
              role: 'USER',
              enabled: true,
              lastLoginAt: new Date(),
            }
          });
        } else {
          // Update profile on every login: lastLoginAt
          await this.prisma.profile.update({
            where: { id: userId },
            data: {
              lastLoginAt: new Date(),
            }
          });
        }
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
