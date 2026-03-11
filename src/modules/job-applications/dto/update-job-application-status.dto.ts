import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JobApplicationStatus } from '@prisma/client';

export class UpdateJobApplicationStatusDto {
  @ApiProperty({ enum: JobApplicationStatus, example: JobApplicationStatus.APPLIED, description: 'The new status to apply to the job application' })
  @IsEnum(JobApplicationStatus)
  status: JobApplicationStatus;
}
