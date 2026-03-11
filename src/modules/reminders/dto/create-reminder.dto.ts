import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
  IsNotEmpty,
  IsBoolean,
} from 'class-validator';
import { ReminderType } from '@prisma/client';

export class CreateReminderDto {
  @ApiProperty({
    description: 'Title of the reminder',
    example: 'Follow up with HR',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the reminder',
    example: 'Send an email to ask about next steps.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Type of the reminder',
    enum: ReminderType,
    example: ReminderType.FOLLOW_UP,
  })
  @IsEnum(ReminderType)
  @IsNotEmpty()
  type: ReminderType;

  @ApiProperty({
    description: 'Due date and time of the reminder (ISO-8601)',
    example: '2023-11-20T15:30:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  dueAt: Date;

  @ApiPropertyOptional({
    description: 'Is this a recurring reminder?',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @ApiPropertyOptional({
    description: 'The ID of the JobApplication this reminder is loosely bound to',
    example: 'uuid-1234',
  })
  @IsString()
  @IsOptional()
  jobApplicationId?: string;

  @ApiPropertyOptional({
    description: 'The ID of the Interview this reminder is loosely bound to',
    example: 'uuid-5678',
  })
  @IsString()
  @IsOptional()
  interviewId?: string;
}
