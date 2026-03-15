import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { StorageService } from '../../common/services/storage.service';
import type { Express } from 'express';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto, avatarFile?: Express.Multer.File) {
    let avatarUrl: string | undefined = undefined;

    if (avatarFile) {
      avatarUrl = await this.storageService.uploadFile(avatarFile, `profiles/${userId}`);
    }

    const updateData: any = {
      ...dto,
    };

    if (avatarUrl) {
      updateData.avatarUrl = avatarUrl;
    }

    const updatedProfile = await this.prisma.profile.update({
      where: { id: userId },
      data: updateData,
    });

    return updatedProfile;
  }
}
