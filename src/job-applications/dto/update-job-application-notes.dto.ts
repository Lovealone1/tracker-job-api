import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateJobApplicationNotesDto {
  @ApiProperty({ example: 'Great interview, expecting an offer soon.', description: 'Personal notes about the application' })
  @IsString()
  notes: string;
}
