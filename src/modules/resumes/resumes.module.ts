import { Module } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { ResumesController } from './resumes.controller';
import { ResumesRenderingService } from './resumes-rendering.service';
import { ResumesRepository } from './resumes.repository';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [ResumesController],
  providers: [ResumesService, ResumesRenderingService, ResumesRepository, PrismaService],
  exports: [ResumesService, ResumesRenderingService, ResumesRepository],
})
export class ResumesModule {}
