import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import * as jwksRsa from 'jwks-rsa';
import { ACCESS_TOKEN_COOKIE } from '../utils/auth-cookies';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

/** Session tokens live in httpOnly cookies; the Bearer header stays as a fallback (Swagger, tests, API clients). */
const fromAuthCookie = (req: Request): string | null =>
  req?.cookies?.[ACCESS_TOKEN_COOKIE] ?? null;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        fromAuthCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,

      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 10,
        jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
      }),

      audience: 'authenticated',
      issuer: `${supabaseUrl}/auth/v1`,
      algorithms: ['ES256'],
    });
  }

  validate(payload: JwtPayload) {
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
