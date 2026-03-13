import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateJobApplicationResumeVariantDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'The ID of the resume variant used for this application', required: false })
  @IsString()
  @IsOptional()
  resumeVariantId?: string;
}
