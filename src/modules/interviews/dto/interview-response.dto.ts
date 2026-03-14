import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { InterviewType, InterviewStatus } from '@prisma/client';

class JobApplicationLightDto {
  @Expose()
  @ApiProperty()
  title: string;

  @Expose()
  @ApiProperty()
  company: string;
}

@Exclude()
export class InterviewSummaryResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  jobApplicationId: string;

  @Expose()
  @ApiProperty({ enum: InterviewType })
  type: InterviewType;

  @Expose()
  @ApiProperty({ enum: InterviewStatus })
  status: InterviewStatus;

  @Expose()
  @ApiProperty()
  scheduledAt: Date;

  @Expose()
  @ApiPropertyOptional()
  durationMinutes?: number;
  
  // Include this to show the job title in list view
  @Expose()
  @ApiPropertyOptional({ type: JobApplicationLightDto })
  @Type(() => JobApplicationLightDto)
  jobApplication?: JobApplicationLightDto;

  @Expose()
  @ApiPropertyOptional()
  notes?: string;

  @Expose()
  @ApiPropertyOptional()
  feedback?: string;

  @Expose()
  @ApiPropertyOptional()
  meetingUrl?: string;

  @Expose()
  @ApiPropertyOptional()
  interviewerName?: string;
}

@Exclude()
export class InterviewDetailResponseDto extends InterviewSummaryResponseDto {
  @Expose()
  @ApiPropertyOptional()
  timezone?: string;

  @Expose()
  @ApiPropertyOptional()
  interviewerEmail?: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}
