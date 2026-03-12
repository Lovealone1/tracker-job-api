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
import { RemindersService } from './reminders.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import {
  UpdateReminderDto,
  UpdateReminderStatusDto,
  UpdateReminderTypeDto,
  RescheduleReminderDto,
} from './dto/update-reminder.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { UserPayload } from '../../auth/decorators/current-user.decorator';
import { plainToInstance } from 'class-transformer';
import {
  ReminderSummaryResponseDto,
  ReminderDetailResponseDto,
  ReminderDashboardSummaryDto,
} from './dto/reminder-response.dto';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Reminders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Throttle({ default: { limit: 20, ttl: 10000 } })
  @Post()
  @ApiOperation({ summary: 'Create a new reminder' })
  @ApiResponse({
    status: 201,
    description: 'The reminder has been successfully created.',
    type: ReminderDetailResponseDto,
  })
  async create(@CurrentUser() user: UserPayload, @Body() createReminderDto: CreateReminderDto) {
    const reminder = await this.remindersService.create(user, createReminderDto);
    return plainToInstance(ReminderDetailResponseDto, reminder);
  }

  @Get()
  @ApiOperation({ summary: 'List all reminders for the user' })
  @ApiResponse({
    status: 200,
    description: 'Lightweight list of user reminders.',
    type: [ReminderSummaryResponseDto],
  })
  async findAll(@CurrentUser() user: UserPayload) {
    const reminders = await this.remindersService.findAll(user);
    return plainToInstance(ReminderSummaryResponseDto, reminders);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get pending reminders for the next 14 days' })
  @ApiResponse({
    status: 200,
    description: 'Array of upcoming pending reminders suitable for dashboards.',
    type: [ReminderSummaryResponseDto],
  })
  async findUpcoming(@CurrentUser() user: UserPayload) {
    const reminders = await this.remindersService.findUpcoming(user);
    return plainToInstance(ReminderSummaryResponseDto, reminders);
  }

  @Get('summary/dashboard')
  @ApiOperation({ summary: 'Get a lightweight count of upcoming reminders for dashboards' })
  @ApiResponse({
    status: 200,
    type: ReminderDashboardSummaryDto,
  })
  async getDashboardSummary(@CurrentUser() user: UserPayload) {
    const summary = await this.remindersService.getDashboardSummary(user);
    return plainToInstance(ReminderDashboardSummaryDto, summary);
  }

  @Get('job-application/:jobApplicationId')
  @ApiOperation({ summary: 'List all reminders specific to a job application' })
  @ApiResponse({
    status: 200,
    description: 'Array of reminders.',
    type: [ReminderSummaryResponseDto],
  })
  async findAllByJobApplication(
    @CurrentUser() user: UserPayload,
    @Param('jobApplicationId') jobApplicationId: string,
  ) {
    const reminders = await this.remindersService.findAllByJobApplication(user, jobApplicationId);
    return plainToInstance(ReminderSummaryResponseDto, reminders);
  }

  @Get('interview/:interviewId')
  @ApiOperation({ summary: 'List all reminders specific to an interview' })
  @ApiResponse({
    status: 200,
    description: 'Array of reminders.',
    type: [ReminderSummaryResponseDto],
  })
  async findAllByInterview(
    @CurrentUser() user: UserPayload,
    @Param('interviewId') interviewId: string,
  ) {
    const reminders = await this.remindersService.findAllByInterview(user, interviewId);
    return plainToInstance(ReminderSummaryResponseDto, reminders);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific reminder' })
  @ApiResponse({
    status: 200,
    description: 'The complete reminder data.',
    type: ReminderDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Reminder not found' })
  async findOne(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    const reminder = await this.remindersService.findOne(user, id);
    return plainToInstance(ReminderDetailResponseDto, reminder);
  }

  @Throttle({ default: { limit: 20, ttl: 10000 } })
  @Patch(':id')
  @ApiOperation({ summary: 'Update a reminder generically' })
  @ApiResponse({
    status: 200,
    description: 'The reminder has been successfully updated.',
    type: ReminderDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Reminder not found' })
  async update(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() updateReminderDto: UpdateReminderDto,
  ) {
    const updated = await this.remindersService.update(user, id, updateReminderDto);
    return plainToInstance(ReminderDetailResponseDto, updated);
  }

  @Throttle({ default: { limit: 20, ttl: 10000 } })
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update reminder status explicitly' })
  @ApiResponse({ type: ReminderSummaryResponseDto })
  async updateStatus(@CurrentUser() user: UserPayload, @Param('id') id: string, @Body() dto: UpdateReminderStatusDto) {
    const updated = await this.remindersService.updateStatus(user, id, dto);
    return plainToInstance(ReminderSummaryResponseDto, updated);
  }

  @Throttle({ default: { limit: 20, ttl: 10000 } })
  @Patch(':id/type')
  @ApiOperation({ summary: 'Update reminder type explicitly' })
  @ApiResponse({ type: ReminderDetailResponseDto })
  async updateType(@CurrentUser() user: UserPayload, @Param('id') id: string, @Body() dto: UpdateReminderTypeDto) {
    const updated = await this.remindersService.updateType(user, id, dto);
    return plainToInstance(ReminderDetailResponseDto, updated);
  }

  @Throttle({ default: { limit: 20, ttl: 10000 } })
  @Patch(':id/reschedule')
  @ApiOperation({ summary: 'Reschedule reminder date/time exclusively' })
  @ApiResponse({ type: ReminderSummaryResponseDto })
  async reschedule(@CurrentUser() user: UserPayload, @Param('id') id: string, @Body() dto: RescheduleReminderDto) {
    const updated = await this.remindersService.reschedule(user, id, dto);
    return plainToInstance(ReminderSummaryResponseDto, updated);
  }

  @Throttle({ default: { limit: 20, ttl: 10000 } })
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a reminder' })
  @ApiResponse({
    status: 200,
    description: 'The reminder has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Reminder not found' })
  async remove(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    await this.remindersService.remove(user, id);
    return { message: 'Reminder deleted successfully' };
  }
}
