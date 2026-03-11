import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateInterviewDto } from './create-interview.dto';
import { IsEnum, IsString, IsNotEmpty, IsDateString, IsInt, Min, IsOptional } from 'class-validator';
import { InterviewStatus } from '@prisma/client';

// General update ignores jobApplicationId
export class UpdateInterviewDto extends PartialType(CreateInterviewDto) {}

// Specific DTO for /status endpoint
export class UpdateInterviewStatusDto {
  @ApiProperty({
    description: 'New status for the interview',
    enum: InterviewStatus,
    example: 'COMPLETED',
  })
  @IsEnum(InterviewStatus)
  @IsNotEmpty()
  status: InterviewStatus;
}

// Specific DTO for /notes endpoint
export class UpdateInterviewNotesDto {
  @ApiProperty({
    description: 'Update the notes content',
  })
  @IsString()
  @IsNotEmpty()
  notes: string;
}

// Specific DTO for /feedback endpoint
export class UpdateInterviewFeedbackDto {
  @ApiProperty({
    description: 'Update feedback written after taking the interview',
  })
  @IsString()
  @IsNotEmpty()
  feedback: string;
}

// Specific DTO for /reschedule endpoint
export class RescheduleInterviewDto {
  @ApiProperty({
    description: 'New Scheduled date and time of the interview (ISO-8601)',
    example: '2023-11-20T15:30:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  scheduledAt: Date;

  @ApiProperty({
    description: 'Expected duration in minutes',
    example: 60,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  durationMinutes?: number;

  @ApiProperty({
    description: 'Timezone for the scheduled time',
    example: 'America/Bogota',
  })
  @IsString()
  @IsOptional()
  timezone?: string;
}
