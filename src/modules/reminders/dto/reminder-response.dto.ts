import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReminderType, ReminderStatus } from '@prisma/client';
import { Expose, Type } from 'class-transformer';

class JobApplicationBriefDto {
  @ApiPropertyOptional({ example: 'Software Engineer' })
  @Expose()
  title?: string;

  @ApiPropertyOptional({ example: 'Tech Corp' })
  @Expose()
  company?: string;
}

class InterviewBriefDto {
  @ApiPropertyOptional({ enum: ['HR', 'TECHNICAL', 'CULTURAL'] })
  @Expose()
  type?: string;

  @ApiPropertyOptional({ example: '2023-11-20T15:30:00.000Z' })
  @Expose()
  scheduledAt?: Date;
}

export class ReminderSummaryResponseDto {
  @ApiProperty({ example: 'uuid-1234' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'Follow up with HR' })
  @Expose()
  title: string;

  @ApiProperty({ enum: ReminderType })
  @Expose()
  type: ReminderType;

  @ApiProperty({ enum: ReminderStatus })
  @Expose()
  status: ReminderStatus;

  @ApiProperty({ example: '2023-11-20T15:30:00.000Z' })
  @Expose()
  dueAt: Date;
  
  @ApiPropertyOptional()
  @Expose()
  @Type(() => JobApplicationBriefDto)
  jobApplication?: JobApplicationBriefDto;

  @ApiPropertyOptional()
  @Expose()
  @Type(() => InterviewBriefDto)
  interview?: InterviewBriefDto;
}

export class ReminderDetailResponseDto extends ReminderSummaryResponseDto {
  @ApiPropertyOptional({ example: 'Send an email to ask about next steps.' })
  @Expose()
  description?: string;

  @ApiProperty({ example: false })
  @Expose()
  isRecurring: boolean;

  @ApiPropertyOptional({ example: 'uuid-1234' })
  @Expose()
  jobApplicationId?: string;

  @ApiPropertyOptional({ example: 'uuid-5678' })
  @Expose()
  interviewId?: string;

  @ApiPropertyOptional({ example: '2023-11-20T16:00:00.000Z' })
  @Expose()
  completedAt?: Date;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}

export class ReminderDashboardSummaryDto {
  @ApiProperty({ example: 5, description: 'Number of upcoming pending reminders in the next 14 days' })
  @Expose()
  @Type(() => Number)
  upcomingCount: number;

  @ApiProperty({ example: 10, description: 'Total number of completed reminders' })
  @Expose()
  @Type(() => Number)
  completedCount: number;
}

class PaginationMetaDto {
  @ApiProperty()
  @Expose()
  total: number;

  @ApiProperty()
  @Expose()
  page: number;

  @ApiProperty()
  @Expose()
  limit: number;

  @ApiProperty()
  @Expose()
  totalPages: number;
}

export class PaginatedRemindersResponseDto {
  @ApiProperty({ type: [ReminderSummaryResponseDto] })
  @Expose()
  @Type(() => ReminderSummaryResponseDto)
  data: ReminderSummaryResponseDto[];

  @ApiProperty()
  @Expose()
  @Type(() => PaginationMetaDto)
  meta: PaginationMetaDto;
}

