import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { ResumesRepository } from './resumes.repository';
import { UserPayload } from '../../auth/decorators/current-user.decorator';

@Injectable()
export class ResumesService {
  constructor(private readonly repository: ResumesRepository) {}

  async create(user: UserPayload, createResumeDto: CreateResumeDto) {
    return this.repository.create(user, createResumeDto);
  }

  async findAll(user: UserPayload) {
    return this.repository.findAll(user);
  }

  async findOne(user: UserPayload, id: string) {
    const resume = await this.repository.findOne(user, id);
    if (!resume) {
      throw new NotFoundException(`Resume with ID ${id} not found`);
    }
    return resume;
  }

  async update(user: UserPayload, id: string, updateResumeDto: UpdateResumeDto) {
    const updated = await this.repository.update(user, id, updateResumeDto);
    if (!updated) {
      throw new NotFoundException(`Resume with ID ${id} not found or you don't have access`);
    }
    return updated;
  }

  async setDefault(user: UserPayload, id: string) {
    const updated = await this.repository.setDefault(user, id);
    if (!updated) {
      throw new NotFoundException(`Resume with ID ${id} not found or you don't have access`);
    }
    return updated;
  }

  async remove(user: UserPayload, id: string) {
    const deleted = await this.repository.delete(user, id);
    if (!deleted) {
      throw new NotFoundException(`Resume with ID ${id} not found or you don't have access`);
    }
    return deleted;
  }
}
