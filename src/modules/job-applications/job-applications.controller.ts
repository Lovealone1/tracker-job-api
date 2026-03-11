import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, SerializeOptions } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JobApplicationsService } from './job-applications.service';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';
import { UpdateJobApplicationStatusDto } from './dto/update-job-application-status.dto';
import { UpdateJobApplicationNotesDto } from './dto/update-job-application-notes.dto';
import { UpdateJobApplicationPriorityDto } from './dto/update-job-application-priority.dto';
import { UpdateJobApplicationResumeVariantDto } from './dto/update-job-application-resume-variant.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { UserPayload } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { JobApplicationResponseDto } from './dto/job-application-response.dto';
import { JobApplicationSummaryResponseDto } from './dto/job-application-summary-response.dto';
import { plainToInstance } from 'class-transformer';

@ApiTags('Job Applications')
@ApiBearerAuth()
@Controller('job-applications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JobApplicationsController {
  constructor(private readonly jobApplicationsService: JobApplicationsService) { }

  @Post()
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Create a new job application' })
  @ApiResponse({ status: 201, description: 'The job application has been successfully created.', type: JobApplicationResponseDto })
  async create(@CurrentUser() user: UserPayload, @Body() createJobApplicationDto: CreateJobApplicationDto): Promise<JobApplicationResponseDto> {
    const application = await this.jobApplicationsService.create(user, createJobApplicationDto);
    return plainToInstance(JobApplicationResponseDto, application);
  }

  @Get()
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Get all job applications for the current user' })
  @ApiResponse({ status: 200, description: 'Return all job applications.', type: [JobApplicationResponseDto] })
  async findAll(@CurrentUser() user: UserPayload): Promise<JobApplicationResponseDto[]> {
    const applications = await this.jobApplicationsService.findAll(user);
    return applications.map(app => plainToInstance(JobApplicationResponseDto, app));
  }

  @Get('summary')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Get aggregated summary and metrics for the current user job applications' })
  @ApiResponse({ status: 200, description: 'Returns the dashboard summary.', type: JobApplicationSummaryResponseDto })
  async getSummary(@CurrentUser() user: UserPayload): Promise<JobApplicationSummaryResponseDto> {
    const summary = await this.jobApplicationsService.getSummary(user);
    return plainToInstance(JobApplicationSummaryResponseDto, summary);
  }

  @Get(':id')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Get a specific job application by ID' })
  @ApiResponse({ status: 200, description: 'Return the job application.', type: JobApplicationResponseDto })
  @ApiResponse({ status: 404, description: 'Job application not found.' })
  async findOne(@CurrentUser() user: UserPayload, @Param('id') id: string): Promise<JobApplicationResponseDto> {
    const application = await this.jobApplicationsService.findOne(user, id);
    return plainToInstance(JobApplicationResponseDto, application);
  }

  @Patch(':id')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Update a job application' })
  @ApiResponse({ status: 200, description: 'The job application has been successfully updated.', type: JobApplicationResponseDto })
  @ApiResponse({ status: 404, description: 'Job application not found.' })
  async update(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() updateJobApplicationDto: UpdateJobApplicationDto,
  ): Promise<JobApplicationResponseDto> {
    const application = await this.jobApplicationsService.update(user, id, updateJobApplicationDto);
    return plainToInstance(JobApplicationResponseDto, application);
  }

  @Patch(':id/status')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Update the status of a job application' })
  @ApiResponse({ status: 200, description: 'The job application status has been successfully updated.', type: JobApplicationResponseDto })
  @ApiResponse({ status: 404, description: 'Job application not found.' })
  async updateStatus(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() updateJobApplicationStatusDto: UpdateJobApplicationStatusDto,
  ): Promise<JobApplicationResponseDto> {
    const application = await this.jobApplicationsService.updateStatus(user, id, updateJobApplicationStatusDto);
    return plainToInstance(JobApplicationResponseDto, application);
  }

  @Patch(':id/notes')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Update the notes of a job application' })
  @ApiResponse({ status: 200, description: 'The job application notes have been successfully updated.', type: JobApplicationResponseDto })
  @ApiResponse({ status: 404, description: 'Job application not found.' })
  async updateNotes(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() updateJobApplicationNotesDto: UpdateJobApplicationNotesDto,
  ): Promise<JobApplicationResponseDto> {
    const application = await this.jobApplicationsService.updateNotes(user, id, updateJobApplicationNotesDto);
    return plainToInstance(JobApplicationResponseDto, application);
  }

  @Patch(':id/priority')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Update the priority of a job application' })
  @ApiResponse({ status: 200, description: 'The job application priority has been successfully updated.', type: JobApplicationResponseDto })
  @ApiResponse({ status: 404, description: 'Job application not found.' })
  async updatePriority(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() updateJobApplicationPriorityDto: UpdateJobApplicationPriorityDto,
  ): Promise<JobApplicationResponseDto> {
    const application = await this.jobApplicationsService.updatePriority(user, id, updateJobApplicationPriorityDto);
    return plainToInstance(JobApplicationResponseDto, application);
  }

  @Patch(':id/resume-variant')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Update the resume variant used for a job application' })
  @ApiResponse({ status: 200, description: 'The job application resume variant has been successfully updated.', type: JobApplicationResponseDto })
  @ApiResponse({ status: 404, description: 'Job application not found.' })
  async updateResumeVariant(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() updateJobApplicationResumeVariantDto: UpdateJobApplicationResumeVariantDto,
  ): Promise<JobApplicationResponseDto> {
    const application = await this.jobApplicationsService.updateResumeVariant(user, id, updateJobApplicationResumeVariantDto);
    return plainToInstance(JobApplicationResponseDto, application);
  }

  @Delete(':id')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Delete a job application' })
  @ApiResponse({ status: 200, description: 'The job application has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Job application not found.' })
  async remove(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.jobApplicationsService.remove(user, id);
  }
}
