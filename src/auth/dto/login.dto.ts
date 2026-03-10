import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'correo@gmail.com',
    description: 'El correo electrónico del usuario registrado',
  })
  @IsEmail({}, { message: 'El formato del correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'La contraseña usada para autenticarse',
  })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;
}
