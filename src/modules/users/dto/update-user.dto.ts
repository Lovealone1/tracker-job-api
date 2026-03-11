import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateUserDto {
  @ApiPropertyOptional({ enum: Role, description: 'Change user permissions level' })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @ApiPropertyOptional({ description: 'Globally enable or disable user at DB level' })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}

export class SuspendUserDto {
  @ApiProperty({ description: 'Number of hours to ban the user in Supabase Auth', example: 24 })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  banDurationHours: number;
}
