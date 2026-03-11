import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReminderDto } from './dto/create-reminder.dto';
import {
  UpdateReminderDto,
  UpdateReminderStatusDto,
  UpdateReminderTypeDto,
  RescheduleReminderDto,
} from './dto/update-reminder.dto';
import { RemindersRepository } from './reminders.repository';
import { UserPayload } from '../../auth/decorators/current-user.decorator';

@Injectable()
export class RemindersService {
  constructor(private readonly repository: RemindersRepository) {}

  async create(user: UserPayload, createReminderDto: CreateReminderDto) {
    return this.repository.create(user, createReminderDto);
  }

  async findAll(user: UserPayload) {
    return this.repository.findAll(user);
  }

  async findUpcoming(user: UserPayload) {
    return this.repository.findUpcoming(user);
  }

  async getDashboardSummary(user: UserPayload) {
    const count = await this.repository.countUpcoming(user);
    return { upcomingCount: count };
  }

  async findAllByJobApplication(user: UserPayload, jobApplicationId: string) {
    return this.repository.findAllByJobApplication(user, jobApplicationId);
  }

  async findAllByInterview(user: UserPayload, interviewId: string) {
    return this.repository.findAllByInterview(user, interviewId);
  }

  async findOne(user: UserPayload, id: string) {
    const reminder = await this.repository.findOne(user, id);
    if (!reminder) {
      throw new NotFoundException(`Reminder with ID ${id} not found.`);
    }
    return reminder;
  }

  async update(user: UserPayload, id: string, updateReminderDto: UpdateReminderDto) {
    const updated = await this.repository.update(user, id, updateReminderDto);
    if (!updated) {
      throw new NotFoundException(`Reminder with ID ${id} not found or inaccessible.`);
    }
    return updated;
  }

  async updateStatus(user: UserPayload, id: string, dto: UpdateReminderStatusDto) {
    return this.update(user, id, { 
      status: dto.status,
      completedAt: dto.status === 'COMPLETED' ? new Date() : null,
    } as any);
  }

  async updateType(user: UserPayload, id: string, dto: UpdateReminderTypeDto) {
    return this.update(user, id, { type: dto.type } as any);
  }

  async reschedule(user: UserPayload, id: string, dto: RescheduleReminderDto) {
    return this.update(user, id, { dueAt: dto.dueAt } as any);
  }

  async remove(user: UserPayload, id: string) {
    const deleted = await this.repository.delete(user, id);
    if (!deleted) {
      throw new NotFoundException(`Reminder with ID ${id} not found or inaccessible.`);
    }
    return true;
  }
}
