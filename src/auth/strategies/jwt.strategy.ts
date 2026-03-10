import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${process.env.SUPABASE_URL}/rest/v1/rpc/jwks`,
      }),
      algorithms: ['RS256'],
    });
  }

  async validate(payload: any) {
    // Return the decoded payload which will be attached to Request as user
    // The payload.sub contains the Supabase Auth generated User UUID
    return { sub: payload.sub, email: payload.email, role: payload.role };
  }
}
