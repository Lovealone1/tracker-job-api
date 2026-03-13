import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
  IsNotEmpty,
  IsInt,
  Min,
} from 'class-validator';
import { InterviewType, InterviewStatus } from '@prisma/client';

export class CreateInterviewDto {
  @ApiProperty({
    description: 'The ID of the JobApplication this interview belongs to',
    example: 'uuid-1234',
  })
  @IsString()
  @IsNotEmpty()
  jobApplicationId: string;

  @ApiProperty({
    description: 'Type of the interview (e.g. TECHNICAL, HR, MANAGER)',
    enum: InterviewType,
    example: 'TECHNICAL',
  })
  @IsEnum(InterviewType)
  @IsNotEmpty()
  type: InterviewType;

  @ApiProperty({
    description: 'Scheduled date and time of the interview (ISO-8601)',
    example: '2023-11-20T15:30:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  scheduledAt: Date;

  @ApiPropertyOptional({
    description: 'Expected duration in minutes',
    example: 60,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  durationMinutes?: number;

  @ApiPropertyOptional({
    description: 'Timezone for the scheduled time',
    example: 'America/Bogota',
  })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiPropertyOptional({
    description: 'Physical location if on-site',
    example: '123 Tech Street, Suite 400',
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({
    description: 'Meeting link for remote interviews (Zoom, Meet, etc)',
    example: 'https://meet.google.com/abc-defg-hij',
  })
  @IsString()
  @IsOptional()
  meetingUrl?: string;

  @ApiPropertyOptional({
    description: 'Name of the interviewer',
    example: 'Jane Doe',
  })
  @IsString()
  @IsOptional()
  interviewerName?: string;

  @ApiPropertyOptional({
    description: 'Email of the interviewer',
    example: 'jane.doe@techcorp.com',
  })
  @IsString()
  @IsOptional()
  interviewerEmail?: string;

  @ApiPropertyOptional({
    description: 'Personal notes for preparation',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Feedback after the interview',
  })
  @IsString()
  @IsOptional()
  feedback?: string;

  @ApiPropertyOptional({
    description: 'Interview status',
    enum: InterviewStatus,
  })
  @IsEnum(InterviewStatus)
  @IsOptional()
  status?: InterviewStatus;
}
