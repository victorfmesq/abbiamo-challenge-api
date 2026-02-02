import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'operador@abbiamo.com',
    description: 'Endereço de e-mail do usuário',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'abbiamo2024',
    description: 'Senha do usuário (mínimo 6 caracteres)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}
