import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { WorkspaceProjectType, WorkspaceProjectStatus, WorkspaceTaskPriority } from '@prisma/client';

@Exclude()
export class WorkspaceProjectResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  profileId: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiPropertyOptional()
  @Expose()
  slug?: string;

  @ApiProperty({ enum: WorkspaceProjectType })
  @Expose()
  type: WorkspaceProjectType;

  @ApiProperty({ enum: WorkspaceProjectStatus })
  @Expose()
  status: WorkspaceProjectStatus;

  @ApiProperty({ enum: WorkspaceTaskPriority })
  @Expose()
  priority: WorkspaceTaskPriority;

  @ApiPropertyOptional()
  @Expose()
  description?: string;

  @ApiPropertyOptional()
  @Expose()
  goal?: string;

  @ApiPropertyOptional()
  @Expose()
  outcome?: string;

  @ApiProperty({ type: [String] })
  @Expose()
  deliverables: string[];

  @ApiProperty({ type: [String] })
  @Expose()
  stack: string[];

  @ApiPropertyOptional()
  @Expose()
  repositoryUrl?: string;

  @ApiPropertyOptional()
  @Expose()
  liveUrl?: string;

  @ApiPropertyOptional()
  @Expose()
  demoUrl?: string;

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

  @ApiProperty()
  @Expose()
  visibility: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
