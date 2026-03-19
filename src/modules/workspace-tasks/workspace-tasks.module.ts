import { Module } from '@nestjs/common';
import { WorkspaceTasksService } from './workspace-tasks.service';
import { WorkspaceTasksController } from './workspace-tasks.controller';
import { WorkspaceTasksRepository } from './workspace-tasks.repository';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [WorkspaceTasksController],
  providers: [WorkspaceTasksService, WorkspaceTasksRepository, PrismaService],
  exports: [WorkspaceTasksService],
})
export class WorkspaceTasksModule {}
