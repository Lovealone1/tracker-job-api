import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  IsObject,
  IsArray,
} from 'class-validator';

export class CreateResumeDto {
  @ApiProperty({
    description: 'Internal reference title for this resume',
    example: 'Frontend Developer - US Market',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Template identifier to use for rendering',
    example: 'modern-v1',
  })
  @IsString()
  @IsOptional()
  template?: string;

  @ApiPropertyOptional({
    description: 'Will set this resume as the default one, removing the flag from any existing default resume',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiProperty({
    description: 'Full name that will be displayed on the CV',
    example: 'Jane Doe',
  })
  @IsString()
  @IsNotEmpty()
  resumeName: string;

  @ApiProperty({
    description: 'Personal info structured data (email, phone, location, etc.)',
    example: { email: 'jane@example.com', phone: '+1234567890', location: 'New York' },
  })
  @IsObject()
  @IsNotEmpty()
  personalInfo: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Career summary or about me section',
    example: 'Experienced frontend developer passionate about React and UI/UX.',
  })
  @IsString()
  @IsOptional()
  summary?: string;

  @ApiProperty({
    description: 'Array of educational background',
    example: [{ institution: 'MIT', degree: 'BS Computer Science', year: '2020' }],
  })
  @IsArray()
  @IsNotEmpty()
  education: any[];

  @ApiProperty({
    description: 'Array of work experiences',
    example: [{ company: 'Tech Corp', role: 'Frontend Eng', startDate: '2020-01-01', endDate: '2022-01-01' }],
  })
  @IsArray()
  @IsNotEmpty()
  experience: any[];

  @ApiPropertyOptional({
    description: 'Array of relevant projects',
    example: [{ name: 'Job Tracker', description: 'Application tracking system' }],
  })
  @IsArray()
  @IsOptional()
  projects?: any[];

  @ApiPropertyOptional({
    description: 'List or categories of skills',
    example: { languages: ['JavaScript', 'TypeScript'], frameworks: ['React', 'NestJS'] },
  })
  @IsObject()
  @IsOptional()
  skills?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Other custom sections in JSON format',
    example: { certifications: ['AWS Certified Developer'] },
  })
  @IsObject()
  @IsOptional()
  others?: Record<string, any>;
}
