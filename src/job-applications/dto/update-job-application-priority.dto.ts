import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Priority } from '@prisma/client';

export class UpdateJobApplicationPriorityDto {
  @ApiProperty({ enum: Priority, example: Priority.HIGH, description: 'The priority of the job application' })
  @IsEnum(Priority)
  priority: Priority;
}
