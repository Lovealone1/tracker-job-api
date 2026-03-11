import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';
import { UpdateJobApplicationStatusDto } from './dto/update-job-application-status.dto';
import { UpdateJobApplicationNotesDto } from './dto/update-job-application-notes.dto';
import { UpdateJobApplicationPriorityDto } from './dto/update-job-application-priority.dto';
import { UpdateJobApplicationResumeVariantDto } from './dto/update-job-application-resume-variant.dto';
import { JobApplicationsRepository } from './job-applications.repository';
import { UserPayload } from '../../auth/decorators/current-user.decorator';

@Injectable()
export class JobApplicationsService {
  constructor(private readonly jobApplicationsRepository: JobApplicationsRepository) { }

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

  async getSummary(user: UserPayload) {
    const rawSummary = await this.jobApplicationsRepository.getSummary(user);

    // Initialize all counts to 0
    const byStatus = {
      SAVED: 0,
      APPLIED: 0,
      INTERVIEWING: 0,
      OFFER_RECEIVED: 0,
      REJECTED: 0,
      WITHDRAWN: 0,
      GHOSTED: 0,
    };

    rawSummary.statusGroups.forEach((group: any) => {
      byStatus[group.status] = group._count.status;
    });

    const byWorkMode = {
      REMOTE: 0,
      HYBRID: 0,
      ON_SITE: 0,
    };

    rawSummary.workModeGroups.forEach((group: any) => {
      byWorkMode[group.workMode] = group._count.workMode;
    });

    return {
      totalApplications: rawSummary.totalApplications,
      byStatus,
      byWorkMode,
      appliedThisWeek: rawSummary.appliedThisWeek,
      appliedThisMonth: rawSummary.appliedThisMonth,
      upcomingInterviewsCount: rawSummary.upcomingInterviewsCount,
    };
  }
}
