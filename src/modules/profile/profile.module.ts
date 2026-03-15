import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { StorageService } from '../../common/services/storage.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService, StorageService, PrismaService],
  exports: [ProfileService],
})
export class ProfileModule {}
