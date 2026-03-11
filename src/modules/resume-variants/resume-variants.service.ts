import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateResumeVariantDto } from './dto/create-resume-variant.dto';
import { UpdateResumeVariantDto } from './dto/update-resume-variant.dto';
import { ResumeVariantsRepository } from './resume-variants.repository';
import { UserPayload } from '../../auth/decorators/current-user.decorator';

@Injectable()
export class ResumeVariantsService {
  constructor(private readonly repository: ResumeVariantsRepository) {}

  async create(user: UserPayload, createResumeVariantDto: CreateResumeVariantDto) {
    return this.repository.create(user, createResumeVariantDto);
  }

  async findAll(user: UserPayload) {
    return this.repository.findAll(user);
  }

  async findOne(user: UserPayload, id: string) {
    const variant = await this.repository.findOne(user, id);
    if (!variant) {
      throw new NotFoundException(`Resume Variant with ID ${id} not found.`);
    }
    return variant;
  }

  async update(user: UserPayload, id: string, updateResumeVariantDto: UpdateResumeVariantDto) {
    const updated = await this.repository.update(user, id, updateResumeVariantDto);
    if (!updated) {
      throw new NotFoundException(`Resume Variant with ID ${id} not found or you don't have access.`);
    }
    return updated;
  }

  async remove(user: UserPayload, id: string) {
    const deleted = await this.repository.delete(user, id);
    if (!deleted) {
      throw new NotFoundException(`Resume Variant with ID ${id} not found or you don't have access.`);
    }
    return true;
  }
}
