import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, WorkspaceTask, Role } from '@prisma/client';
import { UserPayload } from '../../auth/decorators/current-user.decorator';

@Injectable()
export class WorkspaceTasksRepository {
  constructor(private readonly prisma: PrismaService) {}

  private getBaseWhere(user: UserPayload): Prisma.WorkspaceTaskWhereInput {
    // Data Scoping: If not ADMIN, user can only see their own records
    if (user.role !== Role.ADMIN) {
      return { profileId: user.sub };
    }
    return {};
  }

  async create(user: UserPayload, data: Omit<Prisma.WorkspaceTaskCreateInput, 'profile'>): Promise<WorkspaceTask> {
    const createData: Prisma.WorkspaceTaskCreateInput = {
      ...data,
      profile: { connect: { id: user.sub } },
    };
    return this.prisma.workspaceTask.create({ data: createData });
  }

  async findAll(
    user: UserPayload,
    projectId?: string,
    skip?: number,
    take?: number,
    search?: string,
    where?: Prisma.WorkspaceTaskWhereInput
  ): Promise<[WorkspaceTask[], number]> {
    const baseWhere = this.getBaseWhere(user);
    
    const searchWhere: Prisma.WorkspaceTaskWhereInput = search ? {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { customTaskId: { contains: search, mode: 'insensitive' } },
      ]
    } : {};

    const projectWhere: Prisma.WorkspaceTaskWhereInput = projectId ? { projectId } : {};

    const combinedWhere = { ...baseWhere, ...projectWhere, ...searchWhere, ...where };

    const [data, total] = await Promise.all([
      this.prisma.workspaceTask.findMany({
        where: combinedWhere,
        orderBy: { orderIndex: 'asc' }, // usually tasks are ordered by their index
        skip,
        take,
      }),
      this.prisma.workspaceTask.count({ where: combinedWhere }),
    ]);

    return [data, total];
  }

  async findOne(user: UserPayload, id: string): Promise<WorkspaceTask | null> {
    const baseWhere = this.getBaseWhere(user);
    return this.prisma.workspaceTask.findFirst({
      where: { id, ...baseWhere },
    });
  }

  async update(user: UserPayload, id: string, data: Prisma.WorkspaceTaskUpdateInput): Promise<WorkspaceTask | null> {
    const baseWhere = this.getBaseWhere(user);

    const existing = await this.prisma.workspaceTask.findFirst({
      where: { id, ...baseWhere }
    });

    if (!existing) {
      return null;
    }

    return this.prisma.workspaceTask.update({
      where: { id },
      data,
    });
  }

  async delete(user: UserPayload, id: string): Promise<boolean> {
    const baseWhere = this.getBaseWhere(user);

    const existing = await this.prisma.workspaceTask.findFirst({
      where: { id, ...baseWhere }
    });

    if (!existing) {
      return false;
    }

    await this.prisma.workspaceTask.delete({
      where: { id },
    });
    return true;
  }
}
