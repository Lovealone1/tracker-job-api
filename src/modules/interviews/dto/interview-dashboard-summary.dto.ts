import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class InterviewStatusCountDto {
  @ApiProperty({ example: 3 })
  @Expose()
  SCHEDULED: number;

  @ApiProperty({ example: 5 })
  @Expose()
  COMPLETED: number;

  @ApiProperty({ example: 1 })
  @Expose()
  CANCELED: number;

  @ApiProperty({ example: 0 })
  @Expose()
  RESCHEDULED: number;

  @ApiProperty({ example: 0 })
  @Expose()
  NO_SHOW: number;
}

export class InterviewTypeCountDto {
  @ApiProperty({ example: 2 })
  @Expose()
  SCREENING: number;

  @ApiProperty({ example: 3 })
  @Expose()
  HR: number;

  @ApiProperty({ example: 5 })
  @Expose()
  TECHNICAL: number;

  @ApiProperty({ example: 1 })
  @Expose()
  CULTURAL: number;

  @ApiProperty({ example: 1 })
  @Expose()
  BEHAVIORAL: number;

  @ApiProperty({ example: 0 })
  @Expose()
  CASE_STUDY: number;

  @ApiProperty({ example: 1 })
  @Expose()
  FINAL: number;

  @ApiProperty({ example: 0 })
  @Expose()
  OTHER: number;
}

export class InterviewDashboardSummaryDto {
  @ApiProperty({ example: 15 })
  @Expose()
  totalInterviews: number;

  @ApiProperty({ type: () => InterviewStatusCountDto })
  @Expose()
  @Type(() => InterviewStatusCountDto)
  byStatus: InterviewStatusCountDto;

  @ApiProperty({ type: () => InterviewTypeCountDto })
  @Expose()
  @Type(() => InterviewTypeCountDto)
  byType: InterviewTypeCountDto;

  @ApiProperty({ example: 2 })
  @Expose()
  upcomingInterviewsCount: number;

  constructor(partial: Partial<InterviewDashboardSummaryDto>) {
    Object.assign(this, partial);
  }
}
