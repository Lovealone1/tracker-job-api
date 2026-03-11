import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class JobApplicationStatusCountDto {
  @ApiProperty({ example: 5, description: 'Number of saved applications' })
  @Expose()
  SAVED: number;

  @ApiProperty({ example: 10, description: 'Number of submitted applications' })
  @Expose()
  APPLIED: number;

  @ApiProperty({ example: 3, description: 'Number of applications currently in interview process' })
  @Expose()
  INTERVIEWING: number;

  @ApiProperty({ example: 1, description: 'Number of offers received' })
  @Expose()
  OFFER_RECEIVED: number;

  @ApiProperty({ example: 4, description: 'Number of rejected applications' })
  @Expose()
  REJECTED: number;

  @ApiProperty({ example: 0, description: 'Number of withdrawn applications' })
  @Expose()
  WITHDRAWN: number;

  @ApiProperty({ example: 2, description: 'Number of applications where the company ghosted' })
  @Expose()
  GHOSTED: number;
}

export class JobApplicationWorkModeCountDto {
  @ApiProperty({ example: 15, description: 'Number of remote applications' })
  @Expose()
  REMOTE: number;

  @ApiProperty({ example: 5, description: 'Number of hybrid applications' })
  @Expose()
  HYBRID: number;

  @ApiProperty({ example: 5, description: 'Number of on-site applications' })
  @Expose()
  ON_SITE: number;
}

export class JobApplicationSummaryResponseDto {
  @ApiProperty({ example: 25, description: 'Total number of applications' })
  @Expose()
  totalApplications: number;

  @ApiProperty({ type: () => JobApplicationStatusCountDto, description: 'Breakdown of applications by status' })
  @Expose()
  @Type(() => JobApplicationStatusCountDto)
  byStatus: JobApplicationStatusCountDto;

  @ApiProperty({ type: () => JobApplicationWorkModeCountDto, description: 'Breakdown of applications by work mode' })
  @Expose()
  @Type(() => JobApplicationWorkModeCountDto)
  byWorkMode: JobApplicationWorkModeCountDto;

  @ApiProperty({ example: 3, description: 'Applications moved to APPLIED status this week' })
  @Expose()
  appliedThisWeek: number;

  @ApiProperty({ example: 12, description: 'Applications moved to APPLIED status this month' })
  @Expose()
  appliedThisMonth: number;

  @ApiProperty({ example: 2, description: 'Number of upcoming interviews scheduled' })
  @Expose()
  upcomingInterviewsCount: number;

  constructor(partial: Partial<JobApplicationSummaryResponseDto>) {
    Object.assign(this, partial);
  }
}
