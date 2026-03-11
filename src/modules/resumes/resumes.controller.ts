import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { UserPayload } from '../../auth/decorators/current-user.decorator';
import { plainToInstance } from 'class-transformer';
import { ResumeSummaryResponseDto } from './dto/resume-summary-response.dto';
import { ResumeDetailResponseDto } from './dto/resume-detail-response.dto';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Resumes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Throttle({ default: { limit: 20, ttl: 10000 } })
  @Post()
  @ApiOperation({ summary: 'Create a new base resume' })
  @ApiResponse({
    status: 201,
    description: 'The resume has been successfully created.',
    type: ResumeDetailResponseDto,
  })
  async create(
    @CurrentUser() user: UserPayload,
    @Body() createResumeDto: CreateResumeDto,
  ) {
    const resume = await this.resumesService.create(user, createResumeDto);
    return plainToInstance(ResumeDetailResponseDto, resume);
  }

  @Get()
  @ApiOperation({ summary: 'List all user resumes with basic metadata' })
  @ApiResponse({
    status: 200,
    description: 'Returns an array of lightweight resume summaries.',
    type: [ResumeSummaryResponseDto],
  })
  async findAll(@CurrentUser() user: UserPayload) {
    const resumes = await this.resumesService.findAll(user);
    return plainToInstance(ResumeSummaryResponseDto, resumes);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full details of a specific resume' })
  @ApiResponse({
    status: 200,
    description: 'Returns the full content of the resume.',
    type: ResumeDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Resume not found' })
  async findOne(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    const resume = await this.resumesService.findOne(user, id);
    return plainToInstance(ResumeDetailResponseDto, resume);
  }

  @Throttle({ default: { limit: 20, ttl: 10000 } })
  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing resume' })
  @ApiResponse({
    status: 200,
    description: 'The resume has been successfully updated.',
    type: ResumeDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Resume not found' })
  async update(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() updateResumeDto: UpdateResumeDto,
  ) {
    const updatedResume = await this.resumesService.update(
      user,
      id,
      updateResumeDto,
    );
    return plainToInstance(ResumeDetailResponseDto, updatedResume);
  }

  @Throttle({ default: { limit: 20, ttl: 10000 } })
  @Patch(':id/default')
  @ApiOperation({ summary: 'Set a specific resume as the default' })
  @ApiResponse({
    status: 200,
    description: 'The resume has been successfully set as default.',
    type: ResumeSummaryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Resume not found' })
  async setDefault(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
  ) {
    const updatedResume = await this.resumesService.setDefault(user, id);
    return plainToInstance(ResumeSummaryResponseDto, updatedResume);
  }

  @Throttle({ default: { limit: 20, ttl: 10000 } })
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a resume' })
  @ApiResponse({
    status: 200,
    description: 'The resume has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Resume not found' })
  async remove(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    await this.resumesService.remove(user, id);
    return { message: 'Resume deleted successfully' };
  }
}
