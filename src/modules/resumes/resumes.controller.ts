import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  StreamableFile,
  Header,
  NotFoundException,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ResumesService } from './resumes.service';
import { ResumesRenderingService } from './resumes-rendering.service';
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
import { createReadStream } from 'fs';
import * as path from 'path';
import * as fs from 'fs';

@ApiTags('Resumes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('resumes')
export class ResumesController {
  constructor(
    private readonly resumesService: ResumesService,
    private readonly renderingService: ResumesRenderingService,
  ) {}

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

  @Post(':id/render')
  @ApiOperation({ summary: 'Render the resume using RenderCV engine' })
  @ApiResponse({ status: 200, description: 'Resume rendered successfully' })
  async render(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    const result = await this.renderingService.renderResume(user, id);
    return {
      message: 'Resume rendered successfully',
      pdfUrl: `/resumes/${id}/pdf`,
      previewUrl: `/resumes/${id}/preview`,
      pageCount: result.pngPaths.length,
    };
  }

  @Post('render-live/pdf')
  @ApiOperation({ summary: 'Generate PDF from current editor state' })
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename="resume.pdf"')
  async renderLivePdf(@CurrentUser() user: UserPayload, @Body() data: any) {
    const { pdfPath, tempDir } = await this.renderingService.renderFromData(data, 'live');
    const file = createReadStream(pdfPath);
    file.on('close', () => this.renderingService.cleanup(tempDir));
    return new StreamableFile(file);
  }

  @Post('render-live/preview')
  @ApiOperation({ summary: 'Generate PNG preview from current editor state' })
  async renderLivePreview(
    @CurrentUser() user: UserPayload, 
    @Body() data: any,
    @Res({ passthrough: true }) res: Response
  ) {
    const { pngPaths, tempDir } = await this.renderingService.renderFromData(data, 'live');
    if (pngPaths.length === 0) {
      this.renderingService.cleanup(tempDir);
      throw new NotFoundException('Preview not available');
    }

    res.set('x-page-count', pngPaths.length.toString());
    res.set('Content-Type', 'image/png');
    
    const file = createReadStream(pngPaths[0]);
    file.on('close', () => this.renderingService.cleanup(tempDir));
    return new StreamableFile(file);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Download generated PDF' })
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename="resume.pdf"')
  async getPdf(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    const { pdfPath, tempDir } = await this.renderingService.renderResume(user, id);
    const file = createReadStream(pdfPath);
    
    file.on('close', () => {
      this.renderingService.cleanup(tempDir);
    });

    return new StreamableFile(file);
  }

  @Get(':id/preview')
  @ApiOperation({ summary: 'Get generated PNG preview' })
  @Header('Content-Type', 'image/png')
  async getPreview(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    const { pngPaths, tempDir } = await this.renderingService.renderResume(user, id);
    if (pngPaths.length === 0 || !fs.existsSync(pngPaths[0])) {
      this.renderingService.cleanup(tempDir);
      throw new NotFoundException('Preview not available');
    }
    
    const file = createReadStream(pngPaths[0]);
    
    file.on('close', () => {
      this.renderingService.cleanup(tempDir);
    });

    return new StreamableFile(file);
  }
}
