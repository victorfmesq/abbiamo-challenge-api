import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { DriversService } from './drivers.service';
import { DriverDto, DriversListResponseDto } from './dto/driver-response.dto';
import type { DriverStatus } from '../common/interfaces/driver.interface';

@ApiTags('Motoristas')
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  @ApiOperation({ summary: 'Obter lista de motoristas' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['AVAILABLE', 'BUSY', 'OFFLINE'],
    description: 'Filtrar motoristas por status',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna lista de motoristas',
    type: DriversListResponseDto,
  })
  findAll(@Query('status') status?: DriverStatus) {
    return this.driversService.findAll(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter informações detalhadas de um motorista' })
  @ApiResponse({
    status: 200,
    description: 'Retorna detalhes do motorista',
    type: DriverDto,
  })
  @ApiResponse({ status: 404, description: 'Motorista não encontrado' })
  findOne(@Param('id') id: string) {
    const driver = this.driversService.findOne(id);
    if (!driver) {
      throw new NotFoundException(`Motorista com ID ${id} não encontrado`);
    }
    return driver;
  }
}
