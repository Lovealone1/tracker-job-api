import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';
import { UpdateJobApplicationStatusDto } from './dto/update-job-application-status.dto';
import { UpdateJobApplicationNotesDto } from './dto/update-job-application-notes.dto';
import { UpdateJobApplicationPriorityDto } from './dto/update-job-application-priority.dto';
import { UpdateJobApplicationResumeVariantDto } from './dto/update-job-application-resume-variant.dto';
import { JobApplicationsRepository } from './job-applications.repository';
import { UserPayload } from '../../auth/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
@Injectable()
export class JobApplicationsService {
  constructor(
    private readonly jobApplicationsRepository: JobApplicationsRepository,
    private readonly prisma: PrismaService,
  ) { }

  async create(user: UserPayload, createDto: CreateJobApplicationDto) {
    // Validar ownership del resumeVariantId si viene en el body
    if (createDto.resumeVariantId) {
      await this.assertResumeVariantOwnership(user.sub, createDto.resumeVariantId);
    }
    return this.jobApplicationsRepository.create(user, createDto as any);
  }

  async findAll(user: UserPayload, query: PaginationQueryDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await this.jobApplicationsRepository.findAll(
      user,
      skip,
      limit,
      search,
    );

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
    const updateData: any = { status: updateStatusDto.status };

    // When status is anything other than SAVED, set appliedAt to now
    if (updateStatusDto.status !== 'SAVED') {
      updateData.appliedAt = new Date();
    }

    const updated = await this.jobApplicationsRepository.update(user, id, updateData);
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
    // Validar ownership del resumeVariantId antes de vincular
    await this.assertResumeVariantOwnership(user.sub, updateResumeVariantDto.resumeVariantId);

    const updated = await this.jobApplicationsRepository.update(user, id, {
      resumeVariant: { connect: { id: updateResumeVariantDto.resumeVariantId } }
    });
    if (!updated) {
      throw new NotFoundException(`Job application with ID ${id} not found`);
    }
    return updated;
  }

  // ── Ownership helpers ──────────────────────────────────────────────────

  private async assertResumeVariantOwnership(userId: string, resumeVariantId: string): Promise<void> {
    const variant = await this.prisma.resumeVariant.findFirst({
      where: { id: resumeVariantId, profileId: userId },
    });
    if (!variant) {
      throw new NotFoundException(`Resume Variant ID ${resumeVariantId} not found or inaccessible.`);
    }
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
