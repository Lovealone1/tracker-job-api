import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Resume } from '@prisma/client';
import { UserPayload } from '../../auth/decorators/current-user.decorator';

@Injectable()
export class ResumesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: UserPayload, data: Omit<Prisma.ResumeUncheckedCreateInput, 'profileId'>): Promise<Resume> {
    const createData = {
      ...data,
      profileId: user.sub,
    };

    if (createData.isDefault) {
      // Usamos una transacción para asegurar atomicidad al cambiar el isDefault
      return this.prisma.$transaction(async (tx) => {
        // 1. Quitar el isDefault a todos los resumes existentes de este usuario
        await tx.resume.updateMany({
          where: { profileId: user.sub, isDefault: true },
          data: { isDefault: false },
        });

        // 2. Crear el nuevo con isDefault = true
        return tx.resume.create({
          data: createData,
        });
      });
    } else {
      // Si no es default, crear normalmente
      return this.prisma.resume.create({
        data: createData,
      });
    }
  }

  async findAll(user: UserPayload): Promise<Resume[]> {
    // Para user normal retorna solo los suyos.
    return this.prisma.resume.findMany({
      where: user.role === 'ADMIN' ? undefined : { profileId: user.sub },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(user: UserPayload, id: string): Promise<Resume | null> {
    return this.prisma.resume.findFirst({
      where:
        user.role === 'ADMIN'
          ? { id }
          : { id, profileId: user.sub },
    });
  }

  async update(user: UserPayload, id: string, data: Prisma.ResumeUncheckedUpdateInput): Promise<Resume | null> {
    // Primero verificamos que exista y pertenezca al usuario (o sea admin)
    const existing = await this.findOne(user, id);
    if (!existing) {
      return null;
    }

    if (data.isDefault) {
      // Transacción para mantener un único isDefault
      return this.prisma.$transaction(async (tx) => {
        // 1. Apagar
        await tx.resume.updateMany({
          where: { profileId: user.sub, isDefault: true, id: { not: id } },
          data: { isDefault: false },
        });

        // 2. Actualizar el target
        return tx.resume.update({
          where: { id },
          data,
        });
      });
    } else {
      return this.prisma.resume.update({
        where: { id },
        data,
      });
    }
  }

  async setDefault(user: UserPayload, id: string): Promise<Resume | null> {
    const existing = await this.findOne(user, id);
    if (!existing) {
      return null;
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Quitar isDefault a todos los demás resumes del usuario
      await tx.resume.updateMany({
        where: { profileId: user.sub, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });

      // 2. Establecer este resume como isDefault
      return tx.resume.update({
        where: { id },
        data: { isDefault: true },
      });
    });
  }

  async delete(user: UserPayload, id: string): Promise<boolean> {
    const existing = await this.findOne(user, id);
    if (!existing) {
      return false; // No encontrado o no autorizado
    }

    if (existing.isDefault) {
      // Buscar el currículum más reciente del usuario (excluyendo el que se va a eliminar)
      const nextDefault = await this.prisma.resume.findFirst({
        where: { profileId: user.sub, id: { not: id } },
        orderBy: { createdAt: 'desc' },
      });

      await this.prisma.$transaction(async (tx) => {
        // Ejecutamos la eliminación
        await tx.resume.delete({ where: { id } });

        // Si existe otro CV, lo designamos como el nuevo por defecto
        if (nextDefault) {
          await tx.resume.update({
            where: { id: nextDefault.id },
            data: { isDefault: true },
          });
        }
      });
      return true;
    }

    // Si no era el default, simplemente se elimina
    await this.prisma.resume.delete({
      where: { id },
    });
    return true;
  }
}
