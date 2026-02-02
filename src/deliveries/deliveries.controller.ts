import {
  Controller,
  Get,
  Param,
  Query,
  Patch,
  Body,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { DeliveriesService } from './deliveries.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import {
  BulkRescheduleDto,
  BulkAssignDriverDto,
  BulkUpdatePriorityDto,
} from '../common/dto/bulk-action.dto';
import { BulkOperationResponseDto } from '../common/dto/bulk-response.dto';
import {
  DeliveryDto,
  PaginatedDeliveriesResponseDto,
  DeliveryStatsDto,
} from '../common/dto/response.dto';

@ApiTags('Entregas')
@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Get()
  @ApiOperation({
    summary: 'Obter lista paginada de entregas com filtros e ordenação',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Número da página',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Itens por página',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['tracking_code', 'status', 'expected_delivery_at', 'created_at'],
    description: 'Campo para ordenação',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Ordem de classificação',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: [
      'PENDING',
      'DISPATCHED',
      'IN_ROUTE',
      'DELIVERED',
      'DELAYED',
      'FAILED',
      'all',
    ],
    description: 'Filtrar por status',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Buscar por código de rastreio ou nome do destinatário',
  })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    type: String,
    description:
      'Filtrar por data de previsão de entrega a partir de (ISO 8601)',
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    type: String,
    description: 'Filtrar por data de previsão de entrega até (ISO 8601)',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna entregas paginadas',
    type: PaginatedDeliveriesResponseDto,
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.deliveriesService.findAll(paginationDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obter KPIs e estatísticas sobre as entregas' })
  @ApiResponse({
    status: 200,
    description: 'Retorna estatísticas de entregas',
    type: DeliveryStatsDto,
  })
  getStats() {
    return this.deliveriesService.getStats();
  }

  @Patch('bulk/reschedule')
  @ApiOperation({ summary: 'Reagendar múltiplas entregas em massa' })
  @ApiBody({ type: BulkRescheduleDto })
  @ApiResponse({
    status: 200,
    description: 'Entregas reagendadas com sucesso',
    type: BulkOperationResponseDto,
  })
  bulkReschedule(@Body() dto: BulkRescheduleDto) {
    return this.deliveriesService.bulkReschedule(dto);
  }

  @Patch('bulk/assign-driver')
  @ApiOperation({
    summary: 'Atribuir motorista para múltiplas entregas em massa',
  })
  @ApiBody({ type: BulkAssignDriverDto })
  @ApiResponse({
    status: 200,
    description: 'Motorista atribuído com sucesso',
    type: BulkOperationResponseDto,
  })
  bulkAssignDriver(@Body() dto: BulkAssignDriverDto) {
    return this.deliveriesService.bulkAssignDriver(dto);
  }

  @Patch('bulk/priority')
  @ApiOperation({
    summary: 'Atualizar prioridade de múltiplas entregas em massa',
  })
  @ApiBody({ type: BulkUpdatePriorityDto })
  @ApiResponse({
    status: 200,
    description: 'Prioridade atualizada com sucesso',
    type: BulkOperationResponseDto,
  })
  bulkUpdatePriority(@Body() dto: BulkUpdatePriorityDto) {
    return this.deliveriesService.bulkUpdatePriority(dto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obter informações detalhadas sobre uma entrega específica',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna detalhes da entrega',
    type: DeliveryDto,
  })
  @ApiResponse({ status: 404, description: 'Entrega não encontrada' })
  findOne(@Param('id') id: string) {
    const delivery = this.deliveriesService.findOne(id);
    if (!delivery) {
      throw new NotFoundException(`Delivery with ID ${id} not found`);
    }
    return delivery;
  }
}
