import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from '../common/dto/response.dto';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Endpoint de autenticação (mock)' })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas',
  })
  login(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto;

    if (email === 'operador@abbiamo.com' && password === 'abbiamo2024') {
      return {
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJvcGVyYWRvckBhYmJpYW1vLmNvbSIsInJvbGUiOiJvcGVyYXRvciIsImlhdCI6MTYxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        user: {
          id: '1',
          name: 'Operador Logístico',
          email: 'operador@abbiamo.com',
          role: 'operator',
        },
      };
    }

    throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
  }
}
