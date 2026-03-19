import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, WorkspaceProject, Role } from '@prisma/client';
import { UserPayload } from '../../auth/decorators/current-user.decorator';

@Injectable()
export class WorkspaceProjectsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private getBaseWhere(user: UserPayload): Prisma.WorkspaceProjectWhereInput {
    // Data Scoping: If not ADMIN, user can only see their own records
    if (user.role !== Role.ADMIN) {
      return { profileId: user.sub };
    }
    return {};
  }

  async create(user: UserPayload, data: Omit<Prisma.WorkspaceProjectCreateInput, 'profile'>): Promise<WorkspaceProject> {
    const createData: Prisma.WorkspaceProjectCreateInput = {
      ...data,
      profile: { connect: { id: user.sub } },
    };
    return this.prisma.workspaceProject.create({ data: createData });
  }

  async findAll(
    user: UserPayload,
    skip?: number,
    take?: number,
    search?: string,
    where?: Prisma.WorkspaceProjectWhereInput
  ): Promise<[WorkspaceProject[], number]> {
    const baseWhere = this.getBaseWhere(user);
    
    const searchWhere: Prisma.WorkspaceProjectWhereInput = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    } : {};

    const combinedWhere = { ...baseWhere, ...searchWhere, ...where };

    const [data, total] = await Promise.all([
      this.prisma.workspaceProject.findMany({
        where: combinedWhere,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.workspaceProject.count({ where: combinedWhere }),
    ]);

    return [data, total];
  }

  async findOne(user: UserPayload, id: string): Promise<WorkspaceProject | null> {
    const baseWhere = this.getBaseWhere(user);
    return this.prisma.workspaceProject.findFirst({
      where: { id, ...baseWhere },
      include: {
        tasks: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });
  }

  async update(user: UserPayload, id: string, data: Prisma.WorkspaceProjectUpdateInput): Promise<WorkspaceProject | null> {
    const baseWhere = this.getBaseWhere(user);

    const existing = await this.prisma.workspaceProject.findFirst({
      where: { id, ...baseWhere }
    });

    if (!existing) {
      return null;
    }

    return this.prisma.workspaceProject.update({
      where: { id },
      data,
    });
  }

  async delete(user: UserPayload, id: string): Promise<boolean> {
    const baseWhere = this.getBaseWhere(user);

    const existing = await this.prisma.workspaceProject.findFirst({
      where: { id, ...baseWhere }
    });

    if (!existing) {
      return false;
    }

    await this.prisma.workspaceProject.delete({
      where: { id },
    });
    return true;
  }
}
