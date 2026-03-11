import { ApiProperty, PartialType, OmitType } from '@nestjs/swagger';
import { CreateReminderDto } from './create-reminder.dto';
import { IsEnum, IsNotEmpty, IsDateString } from 'class-validator';
import { ReminderStatus, ReminderType } from '@prisma/client';

// Excluir FKs para prevenir reasignación de relaciones de otro usuario (IDOR fix)
export class UpdateReminderDto extends PartialType(
  OmitType(CreateReminderDto, ['jobApplicationId', 'interviewId'] as const)
) {}

export class UpdateReminderStatusDto {
  @ApiProperty({
    description: 'New status for the reminder',
    enum: ReminderStatus,
    example: ReminderStatus.COMPLETED,
  })
  @IsEnum(ReminderStatus)
  @IsNotEmpty()
  status: ReminderStatus;
}

export class UpdateReminderTypeDto {
  @ApiProperty({
    description: 'New type for the reminder',
    enum: ReminderType,
    example: ReminderType.INTERVIEW_PREP,
  })
  @IsEnum(ReminderType)
  @IsNotEmpty()
  type: ReminderType;
}

export class RescheduleReminderDto {
  @ApiProperty({
    description: 'New due date and time of the reminder (ISO-8601)',
    example: '2023-11-21T10:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  dueAt: Date;
}
