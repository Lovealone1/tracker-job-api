import { Module } from '@nestjs/common';
import { WorkspaceProjectsService } from './workspace-projects.service';
import { WorkspaceProjectsController } from './workspace-projects.controller';
import { WorkspaceProjectsRepository } from './workspace-projects.repository';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [WorkspaceProjectsController],
  providers: [WorkspaceProjectsService, WorkspaceProjectsRepository, PrismaService],
  exports: [WorkspaceProjectsService],
})
export class WorkspaceProjectsModule {}
