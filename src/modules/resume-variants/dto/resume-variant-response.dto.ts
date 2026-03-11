import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ResumeVariantResponseDto {
  @Expose()
  @ApiProperty({ example: 'uuid-1234' })
  id: string;

  @Expose()
  @ApiProperty({ example: 'uuid-5678' })
  resumeId: string;

  @Expose()
  @ApiProperty({ example: 'Tailored for Google - SWE' })
  title: string;

  @Expose()
  @ApiProperty({ example: 'Jane Doe' })
  resumeName: string;

  @Expose()
  @ApiProperty()
  personalInfo: Record<string, any>;

  @Expose()
  @ApiPropertyOptional()
  summary?: string;

  @Expose()
  @ApiProperty()
  education: any[];

  @Expose()
  @ApiProperty()
  experience: any[];

  @Expose()
  @ApiPropertyOptional()
  projects?: any[];

  @Expose()
  @ApiPropertyOptional()
  skills?: Record<string, any>;

  @Expose()
  @ApiPropertyOptional()
  others?: Record<string, any>;

  @Expose()
  @ApiPropertyOptional()
  modifications?: Record<string, any>;

  @Expose()
  @ApiPropertyOptional()
  notes?: string;

  @Expose()
  @ApiProperty({ example: false })
  generatedWithAI: boolean;

  @Expose()
  @ApiPropertyOptional()
  atsScore?: number;

  @Expose()
  @ApiPropertyOptional()
  matchScore?: number;

  @Expose()
  @ApiPropertyOptional()
  pdfUrl?: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}
