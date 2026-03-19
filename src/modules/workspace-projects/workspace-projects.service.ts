import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWorkspaceProjectDto } from './dto/create-workspace-project.dto';
import { UpdateWorkspaceProjectDto } from './dto/update-workspace-project.dto';
import { WorkspaceProjectsRepository } from './workspace-projects.repository';
import { UserPayload } from '../../auth/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class WorkspaceProjectsService {
  constructor(private readonly workspaceProjectsRepository: WorkspaceProjectsRepository) {}

  async create(user: UserPayload, createDto: CreateWorkspaceProjectDto) {
    return this.workspaceProjectsRepository.create(user, createDto as any);
  }

  async findAll(user: UserPayload, query: PaginationQueryDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await this.workspaceProjectsRepository.findAll(
      user,
      skip,
      limit,
      search,
    );

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(user: UserPayload, id: string) {
    const project = await this.workspaceProjectsRepository.findOne(user, id);
    if (!project) {
      throw new NotFoundException(`Workspace project with ID ${id} not found`);
    }
    return project;
  }

  async update(user: UserPayload, id: string, updateDto: UpdateWorkspaceProjectDto) {
    const updated = await this.workspaceProjectsRepository.update(user, id, updateDto);
    if (!updated) {
      throw new NotFoundException(`Workspace project with ID ${id} not found`);
    }
    return updated;
  }

  async remove(user: UserPayload, id: string) {
    const deleted = await this.workspaceProjectsRepository.delete(user, id);
    if (!deleted) {
      throw new NotFoundException(`Workspace project with ID ${id} not found`);
    }
    return { success: true };
  }
}
