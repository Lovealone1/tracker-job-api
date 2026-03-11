import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, JobApplication, Role } from '@prisma/client';
import { UserPayload } from '../../auth/decorators/current-user.decorator';

@Injectable()
export class JobApplicationsRepository {
  constructor(private readonly prisma: PrismaService) { }

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

  async getSummary(user: UserPayload) {
    const baseWhere = this.getBaseWhere(user);

    // Get total count
    const totalApplications = await this.prisma.jobApplication.count({
      where: baseWhere,
    });

    // Get status breakdown
    const statusGroups = await this.prisma.jobApplication.groupBy({
      by: ['status'],
      where: baseWhere,
      _count: {
        status: true,
      },
    });

    // Get work mode breakdown
    const workModeGroups = await this.prisma.jobApplication.groupBy({
      by: ['workMode'],
      where: baseWhere,
      _count: {
        workMode: true,
      },
    });

    // Date metrics
    const now = new Date();

    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const appliedThisWeek = await this.prisma.jobApplication.count({
      where: {
        ...baseWhere,
        appliedAt: {
          gte: oneWeekAgo,
        },
      },
    });

    const appliedThisMonth = await this.prisma.jobApplication.count({
      where: {
        ...baseWhere,
        appliedAt: {
          gte: oneMonthAgo,
        },
      },
    });

    // Interview metrics
    const upcomingInterviewsCount = await this.prisma.interview.count({
      where: {
        profileId: user.sub,
        status: 'SCHEDULED',
        scheduledAt: {
          gt: now,
        },
      },
    });

    return {
      totalApplications,
      statusGroups,
      workModeGroups,
      appliedThisWeek,
      appliedThisMonth,
      upcomingInterviewsCount,
    };
  }
}
