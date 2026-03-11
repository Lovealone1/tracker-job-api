import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';
import { UpdateJobApplicationStatusDto } from './dto/update-job-application-status.dto';
import { UpdateJobApplicationNotesDto } from './dto/update-job-application-notes.dto';
import { UpdateJobApplicationPriorityDto } from './dto/update-job-application-priority.dto';
import { UpdateJobApplicationResumeVariantDto } from './dto/update-job-application-resume-variant.dto';
import { JobApplicationsRepository } from './job-applications.repository';
import { UserPayload } from '../auth/decorators/current-user.decorator';

@Injectable()
export class JobApplicationsService {
  constructor(private readonly jobApplicationsRepository: JobApplicationsRepository) {}

  async create(user: UserPayload, createDto: CreateJobApplicationDto) {
    return this.jobApplicationsRepository.create(user, createDto as any);
  }

  async findAll(user: UserPayload) {
    return this.jobApplicationsRepository.findAll(user);
  }

  async findOne(user: UserPayload, id: string) {
    const jobApplication = await this.jobApplicationsRepository.findOne(user, id);
    if (!jobApplication) {
      throw new NotFoundException(`Job application with ID ${id} not found`);
    }
    return jobApplication;
  }

  async update(user: UserPayload, id: string, updateDto: UpdateJobApplicationDto) {
    const updated = await this.jobApplicationsRepository.update(user, id, updateDto);
    if (!updated) {
      throw new NotFoundException(`Job application with ID ${id} not found`);
    }
    return updated;
  }

  async updateStatus(user: UserPayload, id: string, updateStatusDto: UpdateJobApplicationStatusDto) {
    const updated = await this.jobApplicationsRepository.update(user, id, { status: updateStatusDto.status });
    if (!updated) {
      throw new NotFoundException(`Job application with ID ${id} not found`);
    }
    return updated;
  }

  async updateNotes(user: UserPayload, id: string, updateNotesDto: UpdateJobApplicationNotesDto) {
    const updated = await this.jobApplicationsRepository.update(user, id, { notes: updateNotesDto.notes });
    if (!updated) {
      throw new NotFoundException(`Job application with ID ${id} not found`);
    }
    return updated;
  }

  async updatePriority(user: UserPayload, id: string, updatePriorityDto: UpdateJobApplicationPriorityDto) {
    const updated = await this.jobApplicationsRepository.update(user, id, { priority: updatePriorityDto.priority });
    if (!updated) {
      throw new NotFoundException(`Job application with ID ${id} not found`);
    }
    return updated;
  }

  async updateResumeVariant(user: UserPayload, id: string, updateResumeVariantDto: UpdateJobApplicationResumeVariantDto) {
    const updated = await this.jobApplicationsRepository.update(user, id, { 
      resumeVariant: { connect: { id: updateResumeVariantDto.resumeVariantId } } 
    });
    if (!updated) {
      throw new NotFoundException(`Job application with ID ${id} not found`);
    }
    return updated;
  }

  async remove(user: UserPayload, id: string) {
    const deleted = await this.jobApplicationsRepository.delete(user, id);
    if (!deleted) {
      throw new NotFoundException(`Job application with ID ${id} not found`);
    }
    return { success: true };
  }
}
