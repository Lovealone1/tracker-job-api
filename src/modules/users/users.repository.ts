import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserPayload } from '../../auth/decorators/current-user.decorator';
import { Profile, Prisma } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Profile[]> {
    return this.prisma.profile.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Profile | null> {
    return this.prisma.profile.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.ProfileUncheckedUpdateInput): Promise<Profile | null> {
    return this.prisma.profile.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.findOne(id);
    if (!existing) {
      return false;
    }

    await this.prisma.profile.delete({
      where: { id },
    });
    return true;
  }
}
