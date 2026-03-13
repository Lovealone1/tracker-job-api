import { ApiProperty } from '@nestjs/swagger';
import { JobApplicationResponseDto } from './job-application-response.dto';
import { PaginationMetaDto } from '../../../common/dto/pagination-meta.dto';

export class PaginatedJobApplicationResponseDto {
  @ApiProperty({ type: [JobApplicationResponseDto] })
  data: JobApplicationResponseDto[];

  @ApiProperty({ type: () => PaginationMetaDto })
  meta: PaginationMetaDto;
}
