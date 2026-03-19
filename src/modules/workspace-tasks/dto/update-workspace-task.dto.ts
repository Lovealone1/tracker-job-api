import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateWorkspaceTaskDto } from './create-workspace-task.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateWorkspaceTaskDto extends PartialType(CreateWorkspaceTaskDto) {}
