import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInterviewDto } from './dto/create-interview.dto';
import {
  UpdateInterviewDto,
  UpdateInterviewStatusDto,
  UpdateInterviewNotesDto,
  UpdateInterviewFeedbackDto,
  RescheduleInterviewDto,
} from './dto/update-interview.dto';
import { InterviewsRepository } from './interviews.repository';
import { UserPayload } from '../../auth/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class InterviewsService {
  constructor(private readonly repository: InterviewsRepository) {}

  async create(user: UserPayload, createInterviewDto: CreateInterviewDto) {
    return this.repository.create(user, createInterviewDto);
  }

  async findAll(user: UserPayload, query: PaginationQueryDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repository.findAll(user, skip, limit, search);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findUpcoming(user: UserPayload) {
    return this.repository.findUpcoming(user);
  }

  async findAllByJobApplication(user: UserPayload, jobApplicationId: string) {
    return this.repository.findAllByJobApplication(user, jobApplicationId);
  }

  async findOne(user: UserPayload, id: string) {
    const interview = await this.repository.findOne(user, id);
    if (!interview) {
      throw new NotFoundException(`Interview with ID ${id} not found.`);
    }
    return interview;
  }

  async update(user: UserPayload, id: string, updateInterviewDto: UpdateInterviewDto) {
    const updated = await this.repository.update(user, id, updateInterviewDto);
    if (!updated) {
      throw new NotFoundException(`Interview with ID ${id} not found or inaccessible.`);
    }
    return updated;
  }

  async updateStatus(user: UserPayload, id: string, dto: UpdateInterviewStatusDto) {
    return this.update(user, id, { status: dto.status } as any);
  }

  async updateNotes(user: UserPayload, id: string, dto: UpdateInterviewNotesDto) {
    return this.update(user, id, { notes: dto.notes } as any);
  }

  async updateFeedback(user: UserPayload, id: string, dto: UpdateInterviewFeedbackDto) {
    return this.update(user, id, { feedback: dto.feedback } as any);
  }

  async reschedule(user: UserPayload, id: string, dto: RescheduleInterviewDto) {
    return this.update(user, id, { 
      scheduledAt: dto.scheduledAt, 
      durationMinutes: dto.durationMinutes,
      timezone: dto.timezone
    } as any);
  }

  async remove(user: UserPayload, id: string) {
    const deleted = await this.repository.delete(user, id);
    if (!deleted) {
      throw new NotFoundException(`Interview with ID ${id} not found or inaccessible.`);
    }
    return true;
  }

  async getSummary(user: UserPayload) {
    const rawSum = await this.repository.getSummary(user);

    const byStatus = {
      SCHEDULED: 0,
      COMPLETED: 0,
      CANCELED: 0,
      RESCHEDULED: 0,
      NO_SHOW: 0,
    };

    rawSum.statusGroups.forEach((group: any) => {
      byStatus[group.status] = group._count.status;
    });

    const byType = {
      SCREENING: 0,
      HR: 0,
      TECHNICAL: 0,
      CULTURAL: 0,
      BEHAVIORAL: 0,
      CASE_STUDY: 0,
      FINAL: 0,
      OTHER: 0,
    };

    rawSum.typeGroups.forEach((group: any) => {
      byType[group.type] = group._count.type;
    });

    return {
      totalInterviews: rawSum.totalInterviews,
      byStatus,
      byType,
      upcomingInterviewsCount: rawSum.upcomingInterviewsCount,
    };
  }

  async findNext(user: UserPayload) {
    return this.repository.findNext(user);
  }
}
