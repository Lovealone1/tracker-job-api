import { ApiProperty } from '@nestjs/swagger';
import { WorkspaceProjectResponseDto } from './workspace-project-response.dto';
import { PaginationMetaDto } from '../../../common/dto/pagination-meta.dto';

export class PaginatedWorkspaceProjectResponseDto {
  @ApiProperty({ type: [WorkspaceProjectResponseDto] })
  data: WorkspaceProjectResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
