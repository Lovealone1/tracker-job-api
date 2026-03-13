import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  IsArray,
  IsNumber,
  IsObject,
} from 'class-validator';

export class CreateResumeVariantDto {
  @ApiProperty({
    description: 'The ID of the base Resume to clone data from',
    example: 'uuid-1234',
  })
  @IsString()
  @IsNotEmpty()
  resumeId: string;

  @ApiPropertyOptional({
    description: 'The ID of the JobApplication this variant belongs to',
    example: 'uuid-5678',
  })
  @IsString()
  @IsOptional()
  jobApplicationId?: string;

  @ApiPropertyOptional({
    description: 'Custom title for this variant',
    example: 'Frontend Developer - US Market (Variant)',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Overridden name for the CV',
    example: 'Jane Doe',
  })
  @IsString()
  @IsOptional()
  resumeName?: string;

  @ApiPropertyOptional({
    description: 'Overridden personal info',
    example: { email: 'jane@example.com' },
  })
  @IsObject()
  @IsOptional()
  personalInfo?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Overridden career summary',
    example: 'Specialized frontend engineer for fintech.',
  })
  @IsString()
  @IsOptional()
  summary?: string;

  @ApiPropertyOptional({
    description: 'Overridden education array',
  })
  @IsArray()
  @IsOptional()
  education?: any[];

  @ApiPropertyOptional({
    description: 'Overridden experience array (usually tailored for the job)',
  })
  @IsArray()
  @IsOptional()
  experience?: any[];

  @ApiPropertyOptional({
    description: 'Overridden relevant projects',
  })
  @IsArray()
  @IsOptional()
  projects?: any[];

  @ApiPropertyOptional({
    description: 'Overridden skills',
  })
  @IsObject()
  @IsOptional()
  skills?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Overridden custom sections',
  })
  @IsObject()
  @IsOptional()
  others?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Log of modifications made by AI or user to the base resume',
  })
  @IsObject()
  @IsOptional()
  modifications?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Internal notes about this variant',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Was this variant generated using AI?',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  generatedWithAI?: boolean;

  @ApiPropertyOptional({
    description: 'ATS Score of this variant against the job description',
    example: 85,
  })
  @IsNumber()
  @IsOptional()
  atsScore?: number;

  @ApiPropertyOptional({
    description: 'Match score',
    example: 90,
  })
  @IsNumber()
  @IsOptional()
  matchScore?: number;

  @ApiPropertyOptional({
    description: 'URL to the rendered PDF file (if generated)',
  })
  @IsString()
  @IsOptional()
  pdfUrl?: string;

  @ApiPropertyOptional({
    description: 'RenderCV theme to use',
    example: 'classic',
  })
  @IsString()
  @IsOptional()
  template?: string;
}
