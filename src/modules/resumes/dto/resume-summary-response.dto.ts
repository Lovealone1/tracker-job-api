import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ResumeSummaryResponseDto {
  @Expose()
  @ApiProperty({ example: 'uuid-1234', description: 'The unique identifier of the resume' })
  id: string;

  @Expose()
  @ApiProperty({ example: 'Frontend Developer - US Market', description: 'Internal reference title' })
  title: string;

  @Expose()
  @ApiProperty({ example: 'Jane Doe', description: 'Full name that will be displayed on the CV' })
  resumeName: string;

  @Expose()
  @ApiPropertyOptional({ example: 'modern-v1', description: 'Template identifier to use' })
  template?: string;

  @Expose()
  @ApiProperty({ example: true, description: 'Indicates if this is the default resume for the user' })
  isDefault: boolean;

  @Expose()
  @ApiProperty({ example: '2026-03-10T23:00:00Z', description: 'Creation date' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ example: '2026-03-10T23:00:00Z', description: 'Last update date' })
  updatedAt: Date;

  @Expose()
  @ApiProperty({ description: 'Personal info structured data' })
  personalInfo: Record<string, any>;

  @Expose()
  @ApiPropertyOptional({ description: 'Career summary' })
  summary?: string;

  @Expose()
  @ApiProperty({ description: 'Educational background' })
  education: any[];

  @Expose()
  @ApiProperty({ description: 'Work experiences' })
  experience: any[];

  @Expose()
  @ApiPropertyOptional({ description: 'Projects' })
  projects?: any[];

  @Expose()
  @ApiPropertyOptional({ description: 'Skills' })
  skills?: Record<string, any>;

  @Expose()
  @ApiPropertyOptional({ description: 'Custom sections' })
  others?: Record<string, any>;
}
