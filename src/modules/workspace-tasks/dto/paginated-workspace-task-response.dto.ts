import { ApiProperty } from '@nestjs/swagger';
import { WorkspaceTaskResponseDto } from './workspace-task-response.dto';
import { PaginationMetaDto } from '../../../common/dto/pagination-meta.dto';

export class PaginatedWorkspaceTaskResponseDto {
  @ApiProperty({ type: [WorkspaceTaskResponseDto] })
  data: WorkspaceTaskResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
