import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, JobApplication, Role } from '@prisma/client';
import { UserPayload } from '../auth/decorators/current-user.decorator';

@Injectable()
export class JobApplicationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private getBaseWhere(user: UserPayload): Prisma.JobApplicationWhereInput {
    // Data Scoping: If not ADMIN, user can only see their own records
    if (user.role !== Role.ADMIN) {
      return { profileId: user.sub };
    }
    return {};
  }

  async create(user: UserPayload, data: Prisma.JobApplicationCreateInput): Promise<JobApplication> {
    // Force the profile connection to the current user
    const createData: Prisma.JobApplicationCreateInput = {
      ...data,
      profile: { connect: { id: user.sub } },
    };
    return this.prisma.jobApplication.create({ data: createData });
  }

  async findAll(user: UserPayload, where?: Prisma.JobApplicationWhereInput): Promise<JobApplication[]> {
    const baseWhere = this.getBaseWhere(user);
    return this.prisma.jobApplication.findMany({
      where: { ...baseWhere, ...where },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(user: UserPayload, id: string): Promise<JobApplication | null> {
    const baseWhere = this.getBaseWhere(user);
    return this.prisma.jobApplication.findFirst({
      where: { id, ...baseWhere },
    });
  }

  async update(user: UserPayload, id: string, data: Prisma.JobApplicationUpdateInput): Promise<JobApplication | null> {
    const baseWhere = this.getBaseWhere(user);
    
    // Verify existence and ownership
    const existing = await this.prisma.jobApplication.findFirst({
        where: { id, ...baseWhere }
    });
    
    if (!existing) {
        return null;
    }

    return this.prisma.jobApplication.update({
      where: { id },
      data,
    });
  }

  async delete(user: UserPayload, id: string): Promise<boolean> {
    const baseWhere = this.getBaseWhere(user);
    
    const existing = await this.prisma.jobApplication.findFirst({
        where: { id, ...baseWhere }
    });
    
    if (!existing) {
        return false;
    }

    await this.prisma.jobApplication.delete({
      where: { id },
    });
    return true;
  }
}
