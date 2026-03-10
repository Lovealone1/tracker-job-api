import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.sub) {
      throw new UnauthorizedException('Token inválido o usuario no autenticado');
    }

    // Buscamos al usuario en la base de datos para obtener su rol actual y estado
    const profile = await this.prisma.profile.findUnique({
      where: { id: user.sub }, // user.sub es el UUID que viene del JWT de Supabase
    });

    if (!profile) {
      throw new ForbiddenException('El perfil de usuario no existe en la base de datos local');
    }

    if (!profile.enabled) {
      throw new ForbiddenException('La cuenta de usuario está desactivada');
    }

    // Verificamos si el rol del perfil está dentro de los roles requeridos para la ruta
    const hasRole = requiredRoles.includes(profile.role);

    if (!hasRole) {
      throw new ForbiddenException(`No tienes permisos suficientes. Se requiere rol: ${requiredRoles.join(', ')}`);
    }

    // Opcionalmente podemos añadir el perfil verificado a la request para que otros handlers lo usen
    request.profile = profile;

    return true;
  }
}
