import { IsString, IsOptional, IsUrl, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WorkMode, EmploymentType, ContractType, CompensationType, Priority, JobApplicationStatus } from '@prisma/client';

export class CreateJobApplicationDto {
  @ApiProperty({ example: 'Senior Software Engineer', description: 'The title of the job position' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Google', description: 'The name of the company' })
  @IsString()
  company: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'The ID of the resume variant used for this application' })
  @IsOptional()
  @IsString()
  resumeVariantId?: string;

  @ApiPropertyOptional({ example: 'We are looking for a...', description: 'The full job description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://careers.google.com/jobs/results/...', description: 'The URL to the original job posting' })
  @IsOptional()
  @IsUrl()
  jobUrl?: string;

  @ApiPropertyOptional({ example: 'LinkedIn', description: 'Where the job was found' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ example: 'Mountain View, CA', description: 'The job location' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 'USA', description: 'The country where the job is located' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ enum: WorkMode, example: WorkMode.REMOTE, description: 'The work mode' })
  @IsOptional()
  @IsEnum(WorkMode)
  workMode?: WorkMode;

  @ApiPropertyOptional({ enum: EmploymentType, example: EmploymentType.FULL_TIME, description: 'The employment type' })
  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @ApiPropertyOptional({ enum: ContractType, example: ContractType.UNDEFINED, description: 'The contract type' })
  @IsOptional()
  @IsEnum(ContractType)
  contractType?: ContractType;

  @ApiPropertyOptional({ example: 'Senior', description: 'The required seniority level' })
  @IsOptional()
  @IsString()
  seniorityLevel?: string;

  @ApiPropertyOptional({ example: 150000, description: 'The minimum compensation amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  compensationAmountMin?: number;

  @ApiPropertyOptional({ example: 200000, description: 'The maximum compensation amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  compensationAmountMax?: number;

  @ApiPropertyOptional({ enum: CompensationType, example: CompensationType.ANNUAL, description: 'The compensation type' })
  @IsOptional()
  @IsEnum(CompensationType)
  compensationType?: CompensationType;

  @ApiPropertyOptional({ example: 'USD', description: 'The currency code (e.g. USD, EUR)' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 'Health insurance, 401k, remote work', description: 'The benefits offered' })
  @IsOptional()
  @IsString()
  benefits?: string;

  @ApiPropertyOptional({ enum: JobApplicationStatus, example: JobApplicationStatus.SAVED, description: 'The current status of the application' })
  @IsOptional()
  @IsEnum(JobApplicationStatus)
  status?: JobApplicationStatus;

  @ApiPropertyOptional({ enum: Priority, example: Priority.MEDIUM, description: 'The priority of the application' })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiPropertyOptional({ example: 'Spoke with the recruiter on Monday', description: 'Personal notes about the application' })
  @IsOptional()
  @IsString()
  notes?: string;
}
