import { Module } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { ResumesController } from './resumes.controller';
import { ResumesRepository } from './resumes.repository';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [ResumesController],
  providers: [ResumesService, ResumesRepository, PrismaService],
  exports: [ResumesService, ResumesRepository],
})
export class ResumesModule {}
