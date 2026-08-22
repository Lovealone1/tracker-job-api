import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest<TUser = any>(err: any, user: any) {
    if (err || !user) {
      // The session travels in the httpOnly cookie (jt_access_token); no
      // Bearer header is ever sent by the frontend. Say so accurately.
      throw (
        err ||
        new UnauthorizedException(
          'Sesión no válida o expirada. Vuelve a iniciar sesión.',
        )
      );
    }
    return user as TUser;
  }
}
