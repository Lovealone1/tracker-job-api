import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WorkspaceProjectsService } from './workspace-projects.service';
import { CreateWorkspaceProjectDto } from './dto/create-workspace-project.dto';
import { UpdateWorkspaceProjectDto } from './dto/update-workspace-project.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { UserPayload } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { WorkspaceProjectResponseDto } from './dto/workspace-project-response.dto';
import { plainToInstance } from 'class-transformer';
import { Throttle } from '@nestjs/throttler';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PaginatedWorkspaceProjectResponseDto } from './dto/paginated-workspace-project-response.dto';
import { Public } from '../../auth/decorators/public.decorator';

@ApiTags('Workspace Projects')
@ApiBearerAuth()
@Controller('workspace-projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkspaceProjectsController {
  constructor(private readonly workspaceProjectsService: WorkspaceProjectsService) {}

  @Throttle({ default: { limit: 20, ttl: 10000 } })
  @Post()
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Create a new workspace project' })
  @ApiResponse({ status: 201, description: 'The project has been successfully created.', type: WorkspaceProjectResponseDto })
  async create(@CurrentUser() user: UserPayload, @Body() createWorkspaceProjectDto: CreateWorkspaceProjectDto): Promise<WorkspaceProjectResponseDto> {
    const project = await this.workspaceProjectsService.create(user, createWorkspaceProjectDto);
    return plainToInstance(WorkspaceProjectResponseDto, project);
  }

  @Get()
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Get all workspace projects for the current user' })
  @ApiResponse({ status: 200, description: 'Return all workspace projects.', type: PaginatedWorkspaceProjectResponseDto })
  async findAll(
    @CurrentUser() user: UserPayload,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedWorkspaceProjectResponseDto> {
    const result = await this.workspaceProjectsService.findAll(user, query);
    return {
      data: result.data.map(proj => plainToInstance(WorkspaceProjectResponseDto, proj)),
      meta: result.meta,
    };
  }

  @Get(':id')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Get a specific workspace project by ID' })
  @ApiResponse({ status: 200, description: 'Return the workspace project.', type: WorkspaceProjectResponseDto })
  @ApiResponse({ status: 404, description: 'Workspace project not found.' })
  async findOne(@CurrentUser() user: UserPayload, @Param('id') id: string): Promise<WorkspaceProjectResponseDto> {
    const project = await this.workspaceProjectsService.findOne(user, id);
    return plainToInstance(WorkspaceProjectResponseDto, project);
  }

  @Throttle({ default: { limit: 20, ttl: 10000 } })
  @Patch(':id')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Update a workspace project' })
  @ApiResponse({ status: 200, description: 'The workspace project has been successfully updated.', type: WorkspaceProjectResponseDto })
  @ApiResponse({ status: 404, description: 'Workspace project not found.' })
  async update(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() updateWorkspaceProjectDto: UpdateWorkspaceProjectDto,
  ): Promise<WorkspaceProjectResponseDto> {
    const project = await this.workspaceProjectsService.update(user, id, updateWorkspaceProjectDto);
    return plainToInstance(WorkspaceProjectResponseDto, project);
  }

  @Throttle({ default: { limit: 20, ttl: 10000 } })
  @Delete(':id')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Delete a workspace project' })
  @ApiResponse({ status: 200, description: 'The workspace project has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Workspace project not found.' })
  async remove(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.workspaceProjectsService.remove(user, id);
  }

  @Public()
  @Get('public/:username/:slug')
  @ApiOperation({ summary: 'Get a public workspace project by username and slug' })
  @ApiResponse({ status: 200, description: 'Return the public workspace project.', type: WorkspaceProjectResponseDto })
  @ApiResponse({ status: 404, description: 'Workspace project not found.' })
  async findPublicBySlug(
    @Param('username') username: string,
    @Param('slug') slug: string
  ): Promise<WorkspaceProjectResponseDto> {
    const project = await this.workspaceProjectsService.findPublicBySlug(username, slug);
    return plainToInstance(WorkspaceProjectResponseDto, project);
  }
}
