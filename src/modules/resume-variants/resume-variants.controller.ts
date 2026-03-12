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
import { ResumeVariantsService } from './resume-variants.service';
import { CreateResumeVariantDto } from './dto/create-resume-variant.dto';
import { UpdateResumeVariantDto } from './dto/update-resume-variant.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { UserPayload } from '../../auth/decorators/current-user.decorator';
import { plainToInstance } from 'class-transformer';
import { ResumeVariantResponseDto } from './dto/resume-variant-response.dto';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Resume Variants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('resume-variants')
export class ResumeVariantsController {
  constructor(private readonly resumeVariantsService: ResumeVariantsService) {}

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post()
  @ApiOperation({ summary: 'Create a new resume variant for a specific job application' })
  @ApiResponse({
    status: 201,
    description: 'The variant has been successfully created and linked.',
    type: ResumeVariantResponseDto,
  })
  async create(
    @CurrentUser() user: UserPayload,
    @Body() createResumeVariantDto: CreateResumeVariantDto,
  ) {
    const variant = await this.resumeVariantsService.create(user, createResumeVariantDto);
    return plainToInstance(ResumeVariantResponseDto, variant);
  }

  @Get()
  @ApiOperation({ summary: 'List all variants for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Array of user resume variants.',
    type: [ResumeVariantResponseDto],
  })
  async findAll(@CurrentUser() user: UserPayload) {
    const variants = await this.resumeVariantsService.findAll(user);
    return plainToInstance(ResumeVariantResponseDto, variants);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific resume variant' })
  @ApiResponse({
    status: 200,
    description: 'The resume variant data.',
    type: ResumeVariantResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Variant not found' })
  async findOne(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    const variant = await this.resumeVariantsService.findOne(user, id);
    return plainToInstance(ResumeVariantResponseDto, variant);
  }

  @Throttle({ default: { limit: 20, ttl: 10000 } })
  @Patch(':id')
  @ApiOperation({ summary: 'Update specific fields of a resume variant (e.g. ATS score, AI edits)' })
  @ApiResponse({
    status: 200,
    description: 'The variant has been successfully updated.',
    type: ResumeVariantResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Variant not found' })
  async update(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() updateResumeVariantDto: UpdateResumeVariantDto,
  ) {
    const updated = await this.resumeVariantsService.update(user, id, updateResumeVariantDto);
    return plainToInstance(ResumeVariantResponseDto, updated);
  }

  @Throttle({ default: { limit: 20, ttl: 10000 } })
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a variant (JobApplication link will be set to Null)' })
  @ApiResponse({
    status: 200,
    description: 'The variant has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Variant not found' })
  async remove(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    await this.resumeVariantsService.remove(user, id);
    return { message: 'Resume variant deleted successfully' };
  }
}
