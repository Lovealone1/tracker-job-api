import { Module } from '@nestjs/common';
import { JobApplicationsService } from './job-applications.service';
import { JobApplicationsController } from './job-applications.controller';
import { JobApplicationsRepository } from './job-applications.repository';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [JobApplicationsController],
  providers: [JobApplicationsService, JobApplicationsRepository, PrismaService],
  exports: [JobApplicationsService],
})
export class JobApplicationsModule {}
