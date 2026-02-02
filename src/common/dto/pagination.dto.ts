import { IsOptional, IsInt, Min, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DeliveryStatus } from '../interfaces/delivery.interface';

export class PaginationDto {
  @ApiPropertyOptional({ example: 1, minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, minimum: 1, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    example: 'created_at',
    enum: ['tracking_code', 'status', 'expected_delivery_at', 'created_at'],
    default: 'created_at',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'created_at';

  @ApiPropertyOptional({
    example: 'desc',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({
    example: 'all',
    enum: [
      'PENDING',
      'DISPATCHED',
      'IN_ROUTE',
      'DELIVERED',
      'DELAYED',
      'FAILED',
      'all',
    ],
    default: 'all',
  })
  @IsOptional()
  @IsIn([
    'PENDING',
    'DISPATCHED',
    'IN_ROUTE',
    'DELIVERED',
    'DELAYED',
    'FAILED',
    'all',
  ])
  status?: DeliveryStatus | 'all' = 'all';

  @ApiPropertyOptional({
    example: 'BR123456789',
    description: 'Buscar por código de rastreio ou nome do destinatário',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: '2024-01-01T00:00:00Z',
    description:
      'Filtrar por data de previsão de entrega a partir de (ISO 8601)',
  })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({
    example: '2024-12-31T23:59:59Z',
    description: 'Filtrar por data de previsão de entrega até (ISO 8601)',
  })
  @IsOptional()
  @IsString()
  dateTo?: string;
}
