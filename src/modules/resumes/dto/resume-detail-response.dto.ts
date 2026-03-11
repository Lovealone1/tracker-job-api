import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { ResumeSummaryResponseDto } from './resume-summary-response.dto';

@Exclude()
export class ResumeDetailResponseDto extends ResumeSummaryResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Personal info structured data (email, phone, location, etc.)',
    example: { email: 'jane@example.com', phone: '+1234567890', location: 'New York' },
  })
  personalInfo: Record<string, any>;

  @Expose()
  @ApiPropertyOptional({
    description: 'Career summary or about me section',
    example: 'Experienced frontend developer passionate about React and UI/UX.',
  })
  summary?: string;

  @Expose()
  @ApiProperty({
    description: 'Array of educational background',
    example: [{ institution: 'MIT', degree: 'BS Computer Science', year: '2020' }],
  })
  education: any[];

  @Expose()
  @ApiProperty({
    description: 'Array of work experiences',
    example: [{ company: 'Tech Corp', role: 'Frontend Eng', startDate: '2020-01-01', endDate: '2022-01-01' }],
  })
  experience: any[];

  @Expose()
  @ApiPropertyOptional({
    description: 'Array of relevant projects',
    example: [{ name: 'Job Tracker', description: 'Application tracking system' }],
  })
  projects?: any[];

  @Expose()
  @ApiPropertyOptional({
    description: 'List or categories of skills',
    example: { languages: ['JavaScript', 'TypeScript'], frameworks: ['React', 'NestJS'] },
  })
  skills?: Record<string, any>;

  @Expose()
  @ApiPropertyOptional({
    description: 'Other custom sections in JSON format',
    example: { certifications: ['AWS Certified Developer'] },
  })
  others?: Record<string, any>;
}
