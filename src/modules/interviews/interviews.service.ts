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

@Injectable()
export class InterviewsService {
  constructor(private readonly repository: InterviewsRepository) {}

  async create(user: UserPayload, createInterviewDto: CreateInterviewDto) {
    return this.repository.create(user, createInterviewDto);
  }

  async findAll(user: UserPayload) {
    return this.repository.findAll(user);
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
}
