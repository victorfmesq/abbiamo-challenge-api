import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { DeliveryPriority } from '../interfaces/delivery.interface';

export class BulkRescheduleDto {
  @ApiProperty({
    description: 'Lista de IDs das entregas a serem reagendadas',
    example: ['1', '2', '3'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  deliveryIds: string[];

  @ApiProperty({
    description:
      'Nova data de previsão de entrega no formato ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)',
    example: '2024-12-31T23:59:59Z',
  })
  @IsDateString()
  @IsNotEmpty()
  newExpectedDate: string;
}

export class BulkAssignDriverDto {
  @ApiProperty({
    description: 'Lista de IDs das entregas para atribuir motorista',
    example: ['1', '2', '3'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  deliveryIds: string[];

  @ApiProperty({
    description: 'ID do motorista a ser atribuído às entregas',
    example: '1',
  })
  @IsString()
  @IsNotEmpty()
  driverId: string;
}

export class BulkUpdatePriorityDto {
  @ApiProperty({
    description: 'Lista de IDs das entregas para atualizar prioridade',
    example: ['1', '2', '3'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  deliveryIds: string[];

  @ApiProperty({
    description: 'Nível de prioridade a ser aplicado às entregas',
    enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
    example: 'HIGH',
  })
  @IsEnum(['LOW', 'NORMAL', 'HIGH', 'URGENT'])
  @IsNotEmpty()
  priority: DeliveryPriority;
}
