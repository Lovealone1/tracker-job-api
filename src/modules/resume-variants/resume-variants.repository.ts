import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, ResumeVariant } from '@prisma/client';
import { UserPayload } from '../../auth/decorators/current-user.decorator';

@Injectable()
export class ResumeVariantsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: UserPayload, data: any): Promise<ResumeVariant> {
    const { resumeId, jobApplicationId, ...overrides } = data;

    // 1. Verificar si el Resume base pertenece al usuario
    const baseResume = await this.prisma.resume.findFirst({
      where: { id: resumeId, profileId: user.sub },
    });

    if (!baseResume) {
      throw new NotFoundException(`Base Resume ID ${resumeId} not found or you don't have access.`);
    }

    // 2. Verificar si el JobApplication pertenece al usuario (si se proporciona)
    if (jobApplicationId) {
      const jobApp = await this.prisma.jobApplication.findFirst({
        where: { id: jobApplicationId, profileId: user.sub },
      });

      if (!jobApp) {
        throw new NotFoundException(`Job Application ID ${jobApplicationId} not found or you don't have access.`);
      }
    }

    // 3. Crear variante heredando de la base y aplicando overrides
    const variantData: Prisma.ResumeVariantUncheckedCreateInput = {
      profileId: user.sub,
      resumeId: baseResume.id,
      title: overrides.title || `Variant of ${baseResume.title}`,
      resumeName: overrides.resumeName || baseResume.resumeName,
      personalInfo: overrides.personalInfo || baseResume.personalInfo,
      summary: overrides.summary !== undefined ? overrides.summary : baseResume.summary,
      education: overrides.education || baseResume.education,
      experience: overrides.experience || baseResume.experience,
      projects: overrides.projects || baseResume.projects,
      skills: overrides.skills || baseResume.skills,
      others: overrides.others || baseResume.others,
      modifications: overrides.modifications || null,
      notes: overrides.notes || null,
      generatedWithAI: overrides.generatedWithAI || false,
      atsScore: overrides.atsScore || null,
      matchScore: overrides.matchScore || null,
      pdfUrl: overrides.pdfUrl || null,
      template: overrides.template || baseResume.template,
    };

    return this.prisma.$transaction(async (tx) => {
      // Crear la variante
      const newVariant = await tx.resumeVariant.create({
        data: variantData,
      });

      // Vincular a la Job Application si se proporcionó
      if (jobApplicationId) {
        await tx.jobApplication.update({
          where: { id: jobApplicationId },
          data: { resumeVariantId: newVariant.id },
        });
      }

      return newVariant;
    });
  }

  async findAll(user: UserPayload): Promise<ResumeVariant[]> {
    return this.prisma.resumeVariant.findMany({
      where: user.role === 'ADMIN' ? undefined : { profileId: user.sub },
      orderBy: { updatedAt: 'desc' },
      include: {
        jobApplications: {
          select: { id: true, company: true, title: true }
        }
      }
    });
  }

  async findOne(user: UserPayload, id: string): Promise<ResumeVariant | null> {
    return this.prisma.resumeVariant.findFirst({
      where:
        user.role === 'ADMIN'
          ? { id }
          : { id, profileId: user.sub },
    });
  }

  async update(user: UserPayload, id: string, data: Prisma.ResumeVariantUpdateInput): Promise<ResumeVariant | null> {
    const existing = await this.findOne(user, id);
    if (!existing) {
      return null;
    }

    return this.prisma.resumeVariant.update({
      where: { id },
      data,
    });
  }

  async delete(user: UserPayload, id: string): Promise<boolean> {
    const existing = await this.findOne(user, id);
    if (!existing) {
      return false; 
    }

    await this.prisma.resumeVariant.delete({
      where: { id },
    });
    return true;
  }
}
