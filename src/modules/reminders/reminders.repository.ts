import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Reminder } from '@prisma/client';
import { UserPayload } from '../../auth/decorators/current-user.decorator';

import { ReminderPaginationQueryDto } from './dto/reminder-pagination.dto';

@Injectable()
export class RemindersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: UserPayload, data: Omit<Prisma.ReminderUncheckedCreateInput, 'profileId'>): Promise<Reminder> {
    // Verificamos propiedad de jobApplication si se envía
    if (data.jobApplicationId) {
      const jobApp = await this.prisma.jobApplication.findFirst({
        where: { id: data.jobApplicationId, profileId: user.sub },
      });
      if (!jobApp) {
        throw new NotFoundException(`Job Application ID ${data.jobApplicationId} not found or inaccessible.`);
      }
    }

    // Verificamos propiedad de interview si se envía
    if (data.interviewId) {
      const interview = await this.prisma.interview.findFirst({
        where: { id: data.interviewId, profileId: user.sub },
      });
      if (!interview) {
        throw new NotFoundException(`Interview ID ${data.interviewId} not found or inaccessible.`);
      }
    }

    return this.prisma.reminder.create({
      data: {
        ...data,
        profileId: user.sub,
      },
    });
  }

  async findAll(user: UserPayload, query: ReminderPaginationQueryDto): Promise<{ data: Reminder[]; total: number }> {
    const { page = 1, limit = 100, search, from, to, status, type } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ReminderWhereInput = {
      profileId: user.role === 'ADMIN' && !user.sub ? undefined : user.sub,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (from || to) {
      where.dueAt = {};
      if (from) where.dueAt.gte = new Date(from);
      if (to) where.dueAt.lte = new Date(to);
    }

    if (status) where.status = status;
    if (type) where.type = type;

    const [data, total] = await Promise.all([
      this.prisma.reminder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dueAt: 'asc' },
        include: {
          jobApplication: {
            select: { title: true, company: true },
          },
          interview: {
            select: { type: true, scheduledAt: true },
          },
        },
      }),
      this.prisma.reminder.count({ where }),
    ]);

    return { data, total };
  }

  async findUpcoming(user: UserPayload): Promise<Reminder[]> {
    const today = new Date();
    const next14Days = new Date();
    next14Days.setDate(today.getDate() + 14);

    return this.prisma.reminder.findMany({
      where: {
        profileId: user.sub,
        status: 'PENDING',
        dueAt: {
          gte: today,
          lte: next14Days,
        },
      },
      orderBy: { dueAt: 'asc' },
      include: {
        jobApplication: {
          select: { title: true, company: true },
        },
        interview: {
          select: { type: true, scheduledAt: true },
        },
      },
    });
  }

  async countUpcoming(user: UserPayload): Promise<number> {
    const today = new Date();
    const next14Days = new Date();
    next14Days.setDate(today.getDate() + 14);

    return this.prisma.reminder.count({
      where: {
        profileId: user.sub,
        status: 'PENDING',
        dueAt: {
          gte: today,
          lte: next14Days,
        },
      },
    });
  }

  async countCompleted(user: UserPayload): Promise<number> {
    return this.prisma.reminder.count({
      where: {
        profileId: user.sub,
        status: 'COMPLETED',
      },
    });
  }

  async findAllByJobApplication(user: UserPayload, jobApplicationId: string): Promise<Reminder[]> {
    const jobApp = await this.prisma.jobApplication.findFirst({
      where: { id: jobApplicationId, profileId: user.sub },
    });

    if (!jobApp) {
      throw new NotFoundException(`Job Application ID ${jobApplicationId} not found or inaccessible.`);
    }

    return this.prisma.reminder.findMany({
      where: { jobApplicationId },
      orderBy: { dueAt: 'asc' },
    });
  }

  async findAllByInterview(user: UserPayload, interviewId: string): Promise<Reminder[]> {
    const interview = await this.prisma.interview.findFirst({
      where: { id: interviewId, profileId: user.sub },
    });

    if (!interview) {
      throw new NotFoundException(`Interview ID ${interviewId} not found or inaccessible.`);
    }

    return this.prisma.reminder.findMany({
      where: { interviewId },
      orderBy: { dueAt: 'asc' },
    });
  }

  async findOne(user: UserPayload, id: string): Promise<Reminder | null> {
    return this.prisma.reminder.findFirst({
      where:
        user.role === 'ADMIN'
          ? { id }
          : { id, profileId: user.sub },
      include: {
        jobApplication: {
          select: { title: true, company: true },
        },
        interview: {
          select: { type: true, scheduledAt: true },
        },
      },
    });
  }

  async update(user: UserPayload, id: string, data: Prisma.ReminderUncheckedUpdateInput): Promise<Reminder | null> {
    const existing = await this.findOne(user, id);
    if (!existing) {
      return null;
    }

    return this.prisma.reminder.update({
      where: { id },
      data,
    });
  }

  async delete(user: UserPayload, id: string): Promise<boolean> {
    const existing = await this.findOne(user, id);
    if (!existing) {
      return false;
    }

    await this.prisma.reminder.delete({
      where: { id },
    });
    return true;
  }
}
