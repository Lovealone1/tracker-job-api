import { Module } from '@nestjs/common';
import { ResumeVariantsService } from './resume-variants.service';
import { ResumeVariantsController } from './resume-variants.controller';
import { ResumeVariantsRepository } from './resume-variants.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { ResumesModule } from '../resumes/resumes.module';

@Module({
  imports: [ResumesModule],
  controllers: [ResumeVariantsController],
  providers: [ResumeVariantsService, ResumeVariantsRepository, PrismaService],
  exports: [ResumeVariantsService, ResumeVariantsRepository],
})
export class ResumeVariantsModule {}
