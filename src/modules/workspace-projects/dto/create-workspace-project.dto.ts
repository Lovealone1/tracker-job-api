import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsArray, 
  IsUrl, 
  IsDateString 
} from 'class-validator';
import { WorkspaceProjectType, WorkspaceProjectStatus, WorkspaceTaskPriority } from '@prisma/client';

export class CreateWorkspaceProjectDto {
  @ApiProperty({ example: 'My Awesome Portfolio' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'my-awesome-portfolio' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({ enum: WorkspaceProjectType, default: WorkspaceProjectType.PERSONAL })
  @IsEnum(WorkspaceProjectType)
  @IsOptional()
  type?: WorkspaceProjectType;

  @ApiPropertyOptional({ enum: WorkspaceProjectStatus, default: WorkspaceProjectStatus.PLANNING })
  @IsEnum(WorkspaceProjectStatus)
  @IsOptional()
  status?: WorkspaceProjectStatus;

  @ApiPropertyOptional({ enum: WorkspaceTaskPriority, default: WorkspaceTaskPriority.MEDIUM })
  @IsEnum(WorkspaceTaskPriority)
  @IsOptional()
  priority?: WorkspaceTaskPriority;

  @ApiPropertyOptional({ example: 'A complete rewrite of my portfolio' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'Get a senior dev role' })
  @IsString()
  @IsOptional()
  goal?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  outcome?: string;

  @ApiPropertyOptional({ type: [String], example: ['mockups', 'frontend', 'backend'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  deliverables?: string[];

  @ApiPropertyOptional({ type: [String], example: ['React', 'NestJS', 'Prisma'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  stack?: string[];

  @ApiPropertyOptional({ example: 'https://github.com/johndoe/project' })
  @IsUrl()
  @IsOptional()
  repositoryUrl?: string;

  @ApiPropertyOptional({ example: 'https://my-project.com' })
  @IsUrl()
  @IsOptional()
  liveUrl?: string;

  @ApiPropertyOptional({ example: 'https://demo.my-project.com' })
  @IsUrl()
  @IsOptional()
  demoUrl?: string;

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

  @ApiPropertyOptional({ example: 'PRIVATE', default: 'PRIVATE' })
  @IsString()
  @IsOptional()
  visibility?: string;
}
