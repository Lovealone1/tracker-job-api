import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWorkspaceTaskDto } from './dto/create-workspace-task.dto';
import { UpdateWorkspaceTaskDto } from './dto/update-workspace-task.dto';
import { WorkspaceTasksRepository } from './workspace-tasks.repository';
import { UserPayload } from '../../auth/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

// Extended Pagination DTO to include optional projectId filter
export class WorkspaceTaskQueryDto extends PaginationQueryDto {
  projectId?: string;
}

@Injectable()
export class WorkspaceTasksService {
  constructor(private readonly workspaceTasksRepository: WorkspaceTasksRepository) {}

  async create(user: UserPayload, createDto: CreateWorkspaceTaskDto) {
    const { projectId, ...rest } = createDto;
    // We connect the project correctly
    const createData = {
      ...rest,
      project: { connect: { id: projectId } }
    };
    return this.workspaceTasksRepository.create(user, createData as any);
  }

  async findAll(user: UserPayload, query: WorkspaceTaskQueryDto) {
    const { page = 1, limit = 50, search, projectId } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await this.workspaceTasksRepository.findAll(
      user,
      projectId,
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
    const task = await this.workspaceTasksRepository.findOne(user, id);
    if (!task) {
      throw new NotFoundException(`Workspace task with ID ${id} not found`);
    }
    return task;
  }

  async update(user: UserPayload, id: string, updateDto: UpdateWorkspaceTaskDto) {
    const { projectId, ...rest } = updateDto;
    const updateData: any = { ...rest };
    if (projectId) {
       updateData.project = { connect: { id: projectId } };
    }

    const updated = await this.workspaceTasksRepository.update(user, id, updateData);
    if (!updated) {
      throw new NotFoundException(`Workspace task with ID ${id} not found`);
    }
    return updated;
  }

  async remove(user: UserPayload, id: string) {
    const deleted = await this.workspaceTasksRepository.delete(user, id);
    if (!deleted) {
      throw new NotFoundException(`Workspace task with ID ${id} not found`);
    }
    return { success: true };
  }
}
