import { Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JobApplicationStatus, Priority, WorkMode, EmploymentType, ContractType, CompensationType } from '@prisma/client';

export class JobApplicationResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'The unique identifier of the job application' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'Senior Software Engineer', description: 'The title of the job position' })
  @Expose()
  title: string;

  @ApiProperty({ example: 'Google', description: 'The name of the company' })
  @Expose()
  company: string;

  @ApiPropertyOptional({ example: 'We are looking for a...', description: 'The full job description' })
  @Expose()
  description: string;

  @ApiPropertyOptional({ example: 'https://careers.google.com/jobs/results/...', description: 'The URL to the original job posting' })
  @Expose()
  jobUrl: string;

  @ApiPropertyOptional({ example: 'LinkedIn', description: 'Where the job was found' })
  @Expose()
  source: string;

  @ApiPropertyOptional({ example: 'Mountain View, CA', description: 'The job location' })
  @Expose()
  location: string;

  @ApiPropertyOptional({ example: 'USA', description: 'The country where the job is located' })
  @Expose()
  country: string;

  @ApiPropertyOptional({ enum: WorkMode, example: WorkMode.REMOTE, description: 'The work mode' })
  @Expose()
  workMode: WorkMode;

  @ApiPropertyOptional({ enum: EmploymentType, example: EmploymentType.FULL_TIME, description: 'The employment type' })
  @Expose()
  employmentType: EmploymentType;

  @ApiPropertyOptional({ enum: ContractType, example: ContractType.UNDEFINED, description: 'The contract type' })
  @Expose()
  contractType: ContractType;

  @ApiPropertyOptional({ example: 'Senior', description: 'The required seniority level' })
  @Expose()
  seniorityLevel: string;

  @ApiPropertyOptional({ example: 150000, description: 'The minimum compensation amount' })
  @Expose()
  compensationAmountMin: number;

  @ApiPropertyOptional({ example: 200000, description: 'The maximum compensation amount' })
  @Expose()
  compensationAmountMax: number;

  @ApiPropertyOptional({ enum: CompensationType, example: CompensationType.ANNUAL, description: 'The compensation type' })
  @Expose()
  compensationType: CompensationType;

  @ApiPropertyOptional({ example: 'USD', description: 'The currency code (e.g. USD, EUR)' })
  @Expose()
  currency: string;

  @ApiPropertyOptional({ example: 'Health insurance, 401k, remote work', description: 'The benefits offered' })
  @Expose()
  benefits: string;

  @ApiPropertyOptional({ enum: JobApplicationStatus, example: JobApplicationStatus.SAVED, description: 'The current status of the application' })
  @Expose()
  status: JobApplicationStatus;

  @ApiPropertyOptional({ enum: Priority, example: Priority.MEDIUM, description: 'The priority of the application' })
  @Expose()
  priority: Priority;

  @ApiPropertyOptional({ example: '2026-03-10T12:00:00Z', description: 'When the application was submitted' })
  @Expose()
  appliedAt: Date;

  @ApiPropertyOptional({ example: '2026-03-10T12:00:00Z', description: 'When the application was saved' })
  @Expose()
  savedAt: Date;

  @ApiPropertyOptional({ example: '2026-03-15T12:00:00Z', description: 'When the application was closed/rejected' })
  @Expose()
  closedAt: Date;

  @ApiPropertyOptional({ example: 'Spoke with the recruiter on Monday', description: 'Personal notes about the application' })
  @Expose()
  notes: string;
  @ApiProperty({ example: '2026-03-10T12:00:00Z', description: 'Creation date' })
  @Expose()
  createdAt: Date;
  @ApiProperty({ example: '2026-03-10T12:00:00Z', description: 'Last update date' })
  @Expose()
  updatedAt: Date;
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'The ID of the user profile that owns this application' })
  @Expose()
  profileId: string;
  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'The ID of the resume variant used for this application' })
  @Expose()
  resumeVariantId: string;

  constructor(partial: Partial<JobApplicationResponseDto>) {
    Object.assign(this, partial);
  }
}
