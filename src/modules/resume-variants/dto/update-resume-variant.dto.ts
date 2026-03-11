import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateResumeVariantDto } from './create-resume-variant.dto';

export class UpdateResumeVariantDto extends PartialType(
  OmitType(CreateResumeVariantDto, ['resumeId', 'jobApplicationId'] as const)
) {}
