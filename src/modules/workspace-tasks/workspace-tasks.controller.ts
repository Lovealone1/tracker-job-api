import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WorkspaceTasksService, WorkspaceTaskQueryDto } from './workspace-tasks.service';
import { CreateWorkspaceTaskDto } from './dto/create-workspace-task.dto';
import { UpdateWorkspaceTaskDto } from './dto/update-workspace-task.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { UserPayload } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { WorkspaceTaskResponseDto } from './dto/workspace-task-response.dto';
import { plainToInstance } from 'class-transformer';
import { Throttle } from '@nestjs/throttler';
import { PaginatedWorkspaceTaskResponseDto } from './dto/paginated-workspace-task-response.dto';

@ApiTags('Workspace Tasks')
@ApiBearerAuth()
@Controller('workspace-tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkspaceTasksController {
  constructor(private readonly workspaceTasksService: WorkspaceTasksService) {}

  @Throttle({ default: { limit: 20, ttl: 10000 } })
  @Post()
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Create a new workspace task' })
  @ApiResponse({ status: 201, description: 'The task has been successfully created.', type: WorkspaceTaskResponseDto })
  async create(@CurrentUser() user: UserPayload, @Body() createWorkspaceTaskDto: CreateWorkspaceTaskDto): Promise<WorkspaceTaskResponseDto> {
    const task = await this.workspaceTasksService.create(user, createWorkspaceTaskDto);
    return plainToInstance(WorkspaceTaskResponseDto, task);
  }

  @Get()
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Get all workspace tasks for the current user' })
  @ApiResponse({ status: 200, description: 'Return all workspace tasks.', type: PaginatedWorkspaceTaskResponseDto })
  async findAll(
    @CurrentUser() user: UserPayload,
    @Query() query: WorkspaceTaskQueryDto,
  ): Promise<PaginatedWorkspaceTaskResponseDto> {
    const result = await this.workspaceTasksService.findAll(user, query);
    return {
      data: result.data.map(t => plainToInstance(WorkspaceTaskResponseDto, t)),
      meta: result.meta,
    };
  }

  @Get(':id')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Get a specific workspace task by ID' })
  @ApiResponse({ status: 200, description: 'Return the workspace task.', type: WorkspaceTaskResponseDto })
  @ApiResponse({ status: 404, description: 'Workspace task not found.' })
  async findOne(@CurrentUser() user: UserPayload, @Param('id') id: string): Promise<WorkspaceTaskResponseDto> {
    const task = await this.workspaceTasksService.findOne(user, id);
    return plainToInstance(WorkspaceTaskResponseDto, task);
  }

  @Throttle({ default: { limit: 20, ttl: 10000 } })
  @Patch(':id')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Update a workspace task' })
  @ApiResponse({ status: 200, description: 'The workspace task has been successfully updated.', type: WorkspaceTaskResponseDto })
  @ApiResponse({ status: 404, description: 'Workspace task not found.' })
  async update(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() updateWorkspaceTaskDto: UpdateWorkspaceTaskDto,
  ): Promise<WorkspaceTaskResponseDto> {
    const task = await this.workspaceTasksService.update(user, id, updateWorkspaceTaskDto);
    return plainToInstance(WorkspaceTaskResponseDto, task);
  }

  @Throttle({ default: { limit: 20, ttl: 10000 } })
  @Delete(':id')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Delete a workspace task' })
  @ApiResponse({ status: 200, description: 'The workspace task has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Workspace task not found.' })
  async remove(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.workspaceTasksService.remove(user, id);
  }
}
