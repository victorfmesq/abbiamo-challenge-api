import { ApiProperty } from '@nestjs/swagger';

class CoordinatesDto {
  @ApiProperty({
    description: 'Latitude da localização',
    example: -23.5505,
  })
  lat: number;

  @ApiProperty({
    description: 'Longitude da localização',
    example: -46.6333,
  })
  lng: number;
}

class AddressDto {
  @ApiProperty({
    description: 'Nome da rua',
    example: 'Rua das Flores',
  })
  street: string;

  @ApiProperty({
    description: 'Número do endereço',
    example: '123',
  })
  number: string;

  @ApiProperty({
    description: 'Complemento do endereço',
    example: 'Apto 45',
    required: false,
  })
  complement?: string;

  @ApiProperty({
    description: 'Bairro',
    example: 'Centro',
  })
  neighborhood: string;

  @ApiProperty({
    description: 'Cidade',
    example: 'São Paulo',
  })
  city: string;

  @ApiProperty({
    description: 'Estado (sigla)',
    example: 'SP',
  })
  state: string;

  @ApiProperty({
    description: 'CEP',
    example: '01234-567',
  })
  zip_code: string;

  @ApiProperty({
    description: 'Coordenadas geográficas da localização',
    type: CoordinatesDto,
    required: false,
  })
  coordinates?: CoordinatesDto;
}

class RecipientDto {
  @ApiProperty({
    description: 'Nome do destinatário',
    example: 'João Silva',
  })
  name: string;

  @ApiProperty({
    description: 'Telefone do destinatário',
    example: '(11) 98765-4321',
  })
  phone: string;

  @ApiProperty({
    description: 'Documento do destinatário (CPF/CNPJ)',
    example: '123.456.789-00',
  })
  document: string;

  @ApiProperty({
    description: 'Endereço completo do destinatário',
    type: AddressDto,
  })
  address: AddressDto;
}

class DeliveryEventDto {
  @ApiProperty({
    description: 'ID único do evento',
    example: '1',
  })
  id: string;

  @ApiProperty({
    description: 'Status da entrega no momento do evento',
    enum: ['PENDING', 'DISPATCHED', 'IN_ROUTE', 'DELIVERED', 'DELAYED', 'FAILED'],
    example: 'IN_ROUTE',
  })
  status: string;

  @ApiProperty({
    description: 'Data e hora do evento no formato ISO 8601',
    example: '2024-01-15T10:30:00Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Responsável pela ação/evento',
    example: 'Sistema',
  })
  actor: string;

  @ApiProperty({
    description: 'Observações adicionais sobre o evento',
    example: 'Entrega em rota para destinatário',
    required: false,
  })
  notes?: string;
}

export class DeliveryDto {
  @ApiProperty({
    description: 'ID único da entrega',
    example: '1',
  })
  id: string;

  @ApiProperty({
    description: 'Código de rastreamento da entrega',
    example: 'BR123456789',
  })
  tracking_code: string;

  @ApiProperty({
    description: 'Status atual da entrega',
    enum: ['PENDING', 'DISPATCHED', 'IN_ROUTE', 'DELIVERED', 'DELAYED', 'FAILED'],
    example: 'IN_ROUTE',
  })
  status: string;

  @ApiProperty({
    description: 'Nível de prioridade da entrega',
    enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
    example: 'NORMAL',
  })
  priority: string;

  @ApiProperty({
    description: 'Nome do motorista atribuído à entrega',
    example: 'Carlos Silva',
    required: false,
  })
  assigned_driver?: string;

  @ApiProperty({
    description: 'Informações do destinatário',
    type: RecipientDto,
  })
  recipient: RecipientDto;

  @ApiProperty({
    description: 'Data e hora de criação da entrega no formato ISO 8601',
    example: '2024-01-15T08:00:00Z',
  })
  created_at: string;

  @ApiProperty({
    description: 'Data e hora prevista para entrega no formato ISO 8601',
    example: '2024-01-15T18:00:00Z',
  })
  expected_delivery_at: string;

  @ApiProperty({
    description: 'Número de tentativas de entrega realizadas',
    example: 1,
  })
  delivery_attempts: number;

  @ApiProperty({
    description: 'Histórico de eventos da entrega',
    type: [DeliveryEventDto],
  })
  timeline: DeliveryEventDto[];
}

export class PaginatedDeliveriesResponseDto {
  @ApiProperty({
    description: 'Lista de entregas na página atual',
    type: [DeliveryDto],
  })
  data: DeliveryDto[];

  @ApiProperty({
    description: 'Número total de entregas que correspondem aos filtros',
    example: 50,
  })
  total: number;

  @ApiProperty({
    description: 'Página atual',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Total de páginas disponíveis',
    example: 5,
  })
  totalPages: number;
}

export class DeliveryStatsDto {
  @ApiProperty({
    description: 'Total de entregas no sistema',
    example: 50,
  })
  total: number;

  @ApiProperty({
    description: 'Estatísticas de entregas em rota',
    example: { count: 15, percentage: '30.0' },
  })
  inRoute: {
    count: number;
    percentage: string;
  };

  @ApiProperty({
    description: 'Estatísticas de entregas concluídas',
    example: { count: 20, percentage: '40.0' },
  })
  completed: {
    count: number;
    percentage: string;
  };

  @ApiProperty({
    description: 'Estatísticas de entregas atrasadas',
    example: { count: 3, percentage: '6.0' },
  })
  delayed: {
    count: number;
    percentage: string;
  };

  @ApiProperty({
    description: 'Contagem de entregas por status',
    example: {
      PENDING: 5,
      DISPATCHED: 7,
      IN_ROUTE: 15,
      DELIVERED: 20,
      DELAYED: 3,
      FAILED: 0,
    },
  })
  byStatus: {
    PENDING: number;
    DISPATCHED: number;
    IN_ROUTE: number;
    DELIVERED: number;
    DELAYED: number;
    FAILED: number;
  };
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'Token JWT para autenticação',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;

  @ApiProperty({
    description: 'Informações do usuário autenticado',
    example: {
      id: '1',
      name: 'Operador Logístico',
      email: 'operador@abbiamo.com',
      role: 'operator',
    },
  })
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}
