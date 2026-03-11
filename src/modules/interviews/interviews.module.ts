import { Module } from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import { InterviewsController } from './interviews.controller';
import { InterviewsRepository } from './interviews.repository';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [InterviewsController],
  providers: [InterviewsService, InterviewsRepository, PrismaService],
  exports: [InterviewsService, InterviewsRepository],
})
export class InterviewsModule {}
