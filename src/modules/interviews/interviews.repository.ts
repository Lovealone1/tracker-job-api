import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Interview } from '@prisma/client';
import { UserPayload } from '../../auth/decorators/current-user.decorator';

@Injectable()
export class InterviewsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: UserPayload, data: Omit<Prisma.InterviewUncheckedCreateInput, 'profileId'>): Promise<Interview> {
    // 1. Verificar si el JobApplication pertenece al usuario (Aislamiento de Seguridad)
    const jobApp = await this.prisma.jobApplication.findFirst({
      where: { id: data.jobApplicationId, profileId: user.sub },
    });

    if (!jobApp) {
      throw new NotFoundException(`Job Application ID ${data.jobApplicationId} not found or inaccessible.`);
    }

    return this.prisma.interview.create({
      data: {
        ...data,
        profileId: user.sub,
      },
    });
  }

  async findAll(user: UserPayload, skip: number, limit: number, search?: string): Promise<[Interview[], number]> {
    const where: Prisma.InterviewWhereInput = {
      ...(user.role === 'ADMIN' ? {} : { profileId: user.sub }),
      ...(search ? {
        jobApplication: {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { company: { contains: search, mode: 'insensitive' } },
          ],
        },
      } : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.interview.findMany({
        where,
        orderBy: { scheduledAt: 'desc' },
        skip,
        take: limit,
        include: {
          jobApplication: {
            select: { title: true, company: true },
          },
        },
      }),
      this.prisma.interview.count({ where }),
    ]);

    return [data, total];
  }

  async findUpcoming(user: UserPayload): Promise<Interview[]> {
    const today = new Date();
    const next14Days = new Date();
    next14Days.setDate(today.getDate() + 14);

    return this.prisma.interview.findMany({
      where: {
        profileId: user.sub,
        status: 'SCHEDULED',
        scheduledAt: {
          gte: today,
          lte: next14Days,
        },
      },
      orderBy: { scheduledAt: 'asc' },
      include: {
        jobApplication: {
          select: { title: true, company: true },
        },
      },
    });
  }

  async findAllByJobApplication(user: UserPayload, jobApplicationId: string): Promise<Interview[]> {
    // Verificar que el JobApplication sea del usuario
    const jobApp = await this.prisma.jobApplication.findFirst({
      where: { id: jobApplicationId, profileId: user.sub },
    });

    if (!jobApp) {
      throw new NotFoundException(`Job Application ID ${jobApplicationId} not found.`);
    }

    return this.prisma.interview.findMany({
      where: { jobApplicationId },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async findOne(user: UserPayload, id: string): Promise<Interview | null> {
    return this.prisma.interview.findFirst({
      where:
        user.role === 'ADMIN'
          ? { id }
          : { id, profileId: user.sub },
      include: {
        jobApplication: {
          select: { title: true, company: true },
        },
      },
    });
  }

  async update(user: UserPayload, id: string, data: Prisma.InterviewUncheckedUpdateInput): Promise<Interview | null> {
    const existing = await this.findOne(user, id);
    if (!existing) {
      return null;
    }

    return this.prisma.interview.update({
      where: { id },
      data,
    });
  }

  async delete(user: UserPayload, id: string): Promise<boolean> {
    const existing = await this.findOne(user, id);
    if (!existing) {
      return false;
    }

    await this.prisma.interview.delete({
      where: { id },
    });
    return true;
  }

  async getSummary(user: UserPayload) {
    const where: Prisma.InterviewWhereInput = {
      ...(user.role === 'ADMIN' ? {} : { profileId: user.sub }),
    };

    const today = new Date();
    const next14Days = new Date();
    next14Days.setDate(today.getDate() + 14);

    const [totalInterviews, statusGroups, typeGroups, upcomingInterviewsCount] = await Promise.all([
      this.prisma.interview.count({ where }),
      this.prisma.interview.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
      }),
      this.prisma.interview.groupBy({
        by: ['type'],
        where,
        _count: { type: true },
      }),
      this.prisma.interview.count({
        where: {
          ...where,
          status: 'SCHEDULED',
          scheduledAt: {
            gte: today,
            lte: next14Days,
          },
        },
      }),
    ]);

    return {
      totalInterviews,
      statusGroups,
      typeGroups,
      upcomingInterviewsCount,
    };
  }

  async findNext(user: UserPayload): Promise<Interview | null> {
    const now = new Date();
    
    return this.prisma.interview.findFirst({
      where: {
        profileId: user.sub,
        status: 'SCHEDULED',
        scheduledAt: {
          gt: now,
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
      include: {
        jobApplication: true, // Return full job application too
      },
    });
  }
}
