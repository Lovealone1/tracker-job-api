import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import {
  UpdateInterviewDto,
  UpdateInterviewStatusDto,
  UpdateInterviewNotesDto,
  UpdateInterviewFeedbackDto,
  RescheduleInterviewDto,
} from './dto/update-interview.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { UserPayload } from '../../auth/decorators/current-user.decorator';
import { plainToInstance } from 'class-transformer';
import { InterviewSummaryResponseDto, InterviewDetailResponseDto } from './dto/interview-response.dto';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Interviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/interviews')
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Throttle({ default: { limit: 20, ttl: 10000 } })
  @Post()
  @ApiOperation({ summary: 'Create a new interview for a job application' })
  @ApiResponse({
    status: 201,
    description: 'The interview has been successfully created.',
    type: InterviewDetailResponseDto,
  })
  async create(@CurrentUser() user: UserPayload, @Body() createInterviewDto: CreateInterviewDto) {
    const interview = await this.interviewsService.create(user, createInterviewDto);
    return plainToInstance(InterviewDetailResponseDto, interview);
  }

  @Get()
  @ApiOperation({ summary: 'List all interviews for the user (includes job title)' })
  @ApiResponse({
    status: 200,
    description: 'Lightweight list of user interviews.',
    type: [InterviewSummaryResponseDto],
  })
  async findAll(@CurrentUser() user: UserPayload) {
    const interviews = await this.interviewsService.findAll(user);
    return plainToInstance(InterviewSummaryResponseDto, interviews);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get scheduled interviews for the next 14 days' })
  @ApiResponse({
    status: 200,
    description: 'Array of upcoming scheduled interviews suitable for dashboards.',
    type: [InterviewSummaryResponseDto],
  })
  async findUpcoming(@CurrentUser() user: UserPayload) {
    const interviews = await this.interviewsService.findUpcoming(user);
    return plainToInstance(InterviewSummaryResponseDto, interviews);
  }

  @Get('job-application/:jobApplicationId')
  @ApiOperation({ summary: 'List all interviews specific to a job application' })
  @ApiResponse({
    status: 200,
    description: 'Array of interviews.',
    type: [InterviewSummaryResponseDto],
  })
  async findAllByJobApplication(
    @CurrentUser() user: UserPayload,
    @Param('jobApplicationId') jobApplicationId: string,
  ) {
    const interviews = await this.interviewsService.findAllByJobApplication(user, jobApplicationId);
    return plainToInstance(InterviewSummaryResponseDto, interviews);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific interview' })
  @ApiResponse({
    status: 200,
    description: 'The complete interview data.',
    type: InterviewDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  async findOne(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    const interview = await this.interviewsService.findOne(user, id);
    return plainToInstance(InterviewDetailResponseDto, interview);
  }

  @Throttle({ default: { limit: 20, ttl: 10000 } })
  @Patch(':id')
  @ApiOperation({ summary: 'Update an interview generically' })
  @ApiResponse({
    status: 200,
    description: 'The interview has been successfully updated.',
    type: InterviewDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  async update(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() updateInterviewDto: UpdateInterviewDto,
  ) {
    const updated = await this.interviewsService.update(user, id, updateInterviewDto);
    return plainToInstance(InterviewDetailResponseDto, updated);
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update interview status explicitly' })
  @ApiResponse({ type: InterviewSummaryResponseDto })
  async updateStatus(@CurrentUser() user: UserPayload, @Param('id') id: string, @Body() dto: UpdateInterviewStatusDto) {
    const updated = await this.interviewsService.updateStatus(user, id, dto);
    return plainToInstance(InterviewSummaryResponseDto, updated);
  }

  @Throttle({ default: { limit: 20, ttl: 10000 } })
  @Patch(':id/notes')
  @ApiOperation({ summary: 'Update interview preparation notes explicitly' })
  @ApiResponse({ type: InterviewDetailResponseDto })
  async updateNotes(@CurrentUser() user: UserPayload, @Param('id') id: string, @Body() dto: UpdateInterviewNotesDto) {
    const updated = await this.interviewsService.updateNotes(user, id, dto);
    return plainToInstance(InterviewDetailResponseDto, updated);
  }

  @Throttle({ default: { limit: 20, ttl: 10000 } })
  @Patch(':id/feedback')
  @ApiOperation({ summary: 'Update interview feedback explicitly' })
  @ApiResponse({ type: InterviewDetailResponseDto })
  async updateFeedback(@CurrentUser() user: UserPayload, @Param('id') id: string, @Body() dto: UpdateInterviewFeedbackDto) {
    const updated = await this.interviewsService.updateFeedback(user, id, dto);
    return plainToInstance(InterviewDetailResponseDto, updated);
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Patch(':id/reschedule')
  @ApiOperation({ summary: 'Reschedule interview date/time exclusively' })
  @ApiResponse({ type: InterviewSummaryResponseDto })
  async reschedule(@CurrentUser() user: UserPayload, @Param('id') id: string, @Body() dto: RescheduleInterviewDto) {
    const updated = await this.interviewsService.reschedule(user, id, dto);
    return plainToInstance(InterviewSummaryResponseDto, updated);
  }

  @Throttle({ default: { limit: 20, ttl: 10000 } })
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an interview' })
  @ApiResponse({
    status: 200,
    description: 'The interview has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  async remove(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    await this.interviewsService.remove(user, id);
    return { message: 'Interview deleted successfully' };
  }
}
