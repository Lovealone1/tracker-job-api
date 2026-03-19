import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { WorkspaceTaskStatus, WorkspaceTaskPriority } from '@prisma/client';

@Exclude()
export class WorkspaceTaskResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  projectId: string;

  @ApiProperty()
  @Expose()
  profileId: string;

  @ApiProperty()
  @Expose()
  customTaskId: string;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiPropertyOptional()
  @Expose()
  phase?: string;

  @ApiProperty({ enum: WorkspaceTaskStatus })
  @Expose()
  status: WorkspaceTaskStatus;

  @ApiProperty({ enum: WorkspaceTaskPriority })
  @Expose()
  priority: WorkspaceTaskPriority;

  @ApiPropertyOptional()
  @Expose()
  description?: string;

  @ApiProperty({ type: [String] })
  @Expose()
  deliverables: string[];

  @ApiPropertyOptional()
  @Expose()
  outcome?: string;

  @ApiPropertyOptional()
  @Expose()
  notes?: string;

  @ApiPropertyOptional()
  @Expose()
  startDate?: Date;

  @ApiPropertyOptional()
  @Expose()
  dueDate?: Date;

  @ApiPropertyOptional()
  @Expose()
  completedAt?: Date;

  @ApiPropertyOptional()
  @Expose()
  orderIndex?: number;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
