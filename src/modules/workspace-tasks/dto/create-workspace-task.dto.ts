import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsArray, 
  IsDateString, 
  IsNumber
} from 'class-validator';
import { WorkspaceTaskStatus, WorkspaceTaskPriority } from '@prisma/client';

export class CreateWorkspaceTaskDto {
  @ApiProperty()
  @IsString()
  projectId: string;

  @ApiProperty({ example: 'PORT-001' })
  @IsString()
  customTaskId: string;

  @ApiProperty({ example: 'Create initial layout' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Frontend' })
  @IsString()
  @IsOptional()
  phase?: string;

  @ApiPropertyOptional({ enum: WorkspaceTaskStatus, default: WorkspaceTaskStatus.TODO })
  @IsEnum(WorkspaceTaskStatus)
  @IsOptional()
  status?: WorkspaceTaskStatus;

  @ApiPropertyOptional({ enum: WorkspaceTaskPriority, default: WorkspaceTaskPriority.MEDIUM })
  @IsEnum(WorkspaceTaskPriority)
  @IsOptional()
  priority?: WorkspaceTaskPriority;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  deliverables?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  outcome?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: '2024-01-01T10:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-12-31T23:59:59.000Z' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ example: '2024-06-15T12:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  completedAt?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  orderIndex?: number;
}
