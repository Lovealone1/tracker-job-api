import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { ResumeSummaryResponseDto } from './resume-summary-response.dto';

@Exclude()
export class ResumeDetailResponseDto extends ResumeSummaryResponseDto {}
