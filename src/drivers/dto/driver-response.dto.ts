import { ApiProperty } from '@nestjs/swagger';

class VehicleDto {
  @ApiProperty({
    description: 'Placa do veículo',
    example: 'ABC-1234',
  })
  plate: string;

  @ApiProperty({
    description: 'Modelo do veículo',
    example: 'Honda CG 160',
  })
  model: string;

  @ApiProperty({
    description: 'Tipo do veículo',
    enum: ['MOTORCYCLE', 'CAR', 'VAN', 'TRUCK'],
    example: 'MOTORCYCLE',
  })
  type: 'MOTORCYCLE' | 'CAR' | 'VAN' | 'TRUCK';
}

export class DriverDto {
  @ApiProperty({
    description: 'ID único do motorista',
    example: '1',
  })
  id: string;

  @ApiProperty({
    description: 'Nome completo do motorista',
    example: 'Carlos Silva',
  })
  name: string;

  @ApiProperty({
    description: 'Telefone do motorista',
    example: '(11) 98765-4321',
  })
  phone: string;

  @ApiProperty({
    description: 'E-mail do motorista',
    example: 'carlos.silva@abbiamo.com',
  })
  email: string;

  @ApiProperty({
    description: 'Informações do veículo do motorista',
    type: VehicleDto,
  })
  vehicle: VehicleDto;

  @ApiProperty({
    description: 'Status atual do motorista',
    enum: ['AVAILABLE', 'BUSY', 'OFFLINE'],
    example: 'AVAILABLE',
  })
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';

  @ApiProperty({
    description: 'Número de entregas atuais em andamento',
    example: 3,
  })
  current_deliveries: number;

  @ApiProperty({
    description: 'Total de entregas realizadas',
    example: 150,
  })
  total_deliveries: number;

  @ApiProperty({
    description: 'Avaliação média do motorista (0-5)',
    example: 4.7,
    minimum: 0,
    maximum: 5,
  })
  rating: number;

  @ApiProperty({
    description: 'Data e hora de cadastro no formato ISO 8601',
    example: '2024-01-01T10:00:00Z',
  })
  created_at: string;
}

export class DriversListResponseDto {
  @ApiProperty({
    description: 'Lista de motoristas',
    type: [DriverDto],
  })
  data: DriverDto[];

  @ApiProperty({
    description: 'Total de motoristas',
    example: 10,
  })
  total: number;
}
