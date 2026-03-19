import { PartialType } from '@nestjs/swagger';
import { CreateWorkspaceProjectDto } from './create-workspace-project.dto';

export class UpdateWorkspaceProjectDto extends PartialType(CreateWorkspaceProjectDto) {}
