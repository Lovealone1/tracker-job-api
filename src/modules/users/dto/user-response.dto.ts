import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Role } from '@prisma/client';

export class UserSummaryResponseDto {
  @ApiProperty({ example: 'uuid-1234' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  @Expose()
  email: string;

  @ApiProperty({ enum: Role, example: Role.USER })
  @Expose()
  role: Role;

  @ApiProperty({ example: true })
  @Expose()
  enabled: boolean;

  @ApiPropertyOptional({ example: 'John' })
  @Expose()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @Expose()
  lastName?: string;

  @ApiProperty({ example: '2023-11-20T15:30:00.000Z' })
  @Expose()
  createdAt: Date;
}

export class UserDetailResponseDto extends UserSummaryResponseDto {
  @ApiPropertyOptional({ example: '123456789' })
  @Expose()
  document?: string;

  @ApiPropertyOptional({ example: 'CO' })
  @Expose()
  country?: string;

  @ApiPropertyOptional({ example: '+573001234567' })
  @Expose()
  phone?: string;

  @ApiPropertyOptional()
  @Expose()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'America/Bogota' })
  @Expose()
  timezone?: string;

  @ApiPropertyOptional({ example: 'es-CO' })
  @Expose()
  language?: string;

  @ApiPropertyOptional()
  @Expose()
  lastLoginAt?: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
