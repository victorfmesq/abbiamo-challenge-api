import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Delivery,
  DeliveryStatus,
} from '../common/interfaces/delivery.interface';
import { mockDeliveries } from '../common/mocks/deliveries.mock';
import { PaginationDto } from '../common/dto/pagination.dto';
import {
  BulkRescheduleDto,
  BulkAssignDriverDto,
  BulkUpdatePriorityDto,
} from '../common/dto/bulk-action.dto';
import { DriversService } from '../drivers/drivers.service';

@Injectable()
export class DeliveriesService {
  private deliveries: Delivery[] = [...mockDeliveries];

  constructor(private readonly driversService: DriversService) {}

  findAll(paginationDto: PaginationDto) {
    let filtered = [...this.deliveries];

    if (paginationDto.status && paginationDto.status !== 'all') {
      filtered = filtered.filter((d) => d.status === paginationDto.status);
    }

    if (paginationDto.search) {
      const searchLower = paginationDto.search.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.tracking_code.toLowerCase().includes(searchLower) ||
          d.recipient.name.toLowerCase().includes(searchLower),
      );
    }

    if (paginationDto.dateFrom) {
      const fromDate = new Date(paginationDto.dateFrom);
      filtered = filtered.filter(
        (d) => new Date(d.expected_delivery_at) >= fromDate,
      );
    }

    if (paginationDto.dateTo) {
      const toDate = new Date(paginationDto.dateTo);
      filtered = filtered.filter(
        (d) => new Date(d.expected_delivery_at) <= toDate,
      );
    }

    const sortBy = paginationDto.sortBy || 'created_at';
    const sortOrder = paginationDto.sortOrder || 'desc';

    filtered.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortBy) {
        case 'tracking_code':
          aVal = a.tracking_code;
          bVal = b.tracking_code;
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        case 'expected_delivery_at':
          aVal = a.expected_delivery_at;
          bVal = b.expected_delivery_at;
          break;
        default:
          aVal = a.created_at;
          bVal = b.created_at;
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedData = filtered.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      meta: {
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
      },
    };
  }

  findOne(id: string): Delivery | undefined {
    return this.deliveries.find((d) => d.id === id);
  }

  getStats() {
    const total = this.deliveries.length;
    const byStatus = this.deliveries.reduce(
      (acc, delivery) => {
        acc[delivery.status] = (acc[delivery.status] || 0) + 1;
        return acc;
      },
      {} as Record<DeliveryStatus, number>,
    );

    const inRoute = byStatus.IN_ROUTE || 0;
    const completed = byStatus.DELIVERED || 0;
    const delayed = byStatus.DELAYED || 0;

    return {
      total,
      inRoute: {
        count: inRoute,
        percentage: ((inRoute / total) * 100).toFixed(1),
      },
      completed: {
        count: completed,
        percentage: ((completed / total) * 100).toFixed(1),
      },
      delayed: {
        count: delayed,
        percentage: ((delayed / total) * 100).toFixed(1),
      },
      byStatus,
    };
  }

  updateRandomDelivery(): Delivery | null {
    const deliveriesInProgress = this.deliveries.filter(
      (d) => d.status !== 'DELIVERED' && d.status !== 'FAILED',
    );

    if (deliveriesInProgress.length === 0) return null;

    const randomDelivery =
      deliveriesInProgress[
        Math.floor(Math.random() * deliveriesInProgress.length)
      ];

    const statusProgression: Record<DeliveryStatus, DeliveryStatus> = {
      PENDING: 'DISPATCHED',
      DISPATCHED: 'IN_ROUTE',
      IN_ROUTE: 'DELIVERED',
      DELIVERED: 'DELIVERED',
      DELAYED: 'IN_ROUTE',
      FAILED: 'FAILED',
    };

    const newStatus = statusProgression[randomDelivery.status];
    randomDelivery.status = newStatus;

    randomDelivery.timeline.unshift({
      id: `${randomDelivery.timeline.length + 1}`,
      status: newStatus,
      timestamp: new Date().toISOString(),
      actor: 'Sistema de Atualização',
      notes: `Status atualizado automaticamente para ${newStatus}`,
    });

    return randomDelivery;
  }

  getDeliveries(): Delivery[] {
    return this.deliveries;
  }

  bulkReschedule(dto: BulkRescheduleDto) {
    const updatedDeliveries: Delivery[] = [];
    const notFoundIds: string[] = [];

    dto.deliveryIds.forEach((id) => {
      const delivery = this.deliveries.find((d) => d.id === id);
      if (delivery) {
        delivery.expected_delivery_at = dto.newExpectedDate;
        delivery.timeline.unshift({
          id: `${delivery.timeline.length + 1}`,
          status: delivery.status,
          timestamp: new Date().toISOString(),
          actor: 'Operador Logístico',
          notes: `Data de entrega reagendada para ${new Date(dto.newExpectedDate).toLocaleDateString('pt-BR')}`,
        });
        updatedDeliveries.push(delivery);
      } else {
        notFoundIds.push(id);
      }
    });

    return {
      success: true,
      updated: updatedDeliveries.length,
      notFound: notFoundIds.length,
      notFoundIds,
      data: updatedDeliveries,
    };
  }

  bulkAssignDriver(dto: BulkAssignDriverDto) {
    // Valida se o motorista existe
    const driver = this.driversService.findOne(dto.driverId);
    if (!driver) {
      throw new NotFoundException(
        `Motorista com ID ${dto.driverId} não encontrado`,
      );
    }

    const updatedDeliveries: Delivery[] = [];
    const notFoundIds: string[] = [];

    dto.deliveryIds.forEach((id) => {
      const delivery = this.deliveries.find((d) => d.id === id);
      if (delivery) {
        delivery.assigned_driver = driver.name;
        delivery.timeline.unshift({
          id: `${delivery.timeline.length + 1}`,
          status: delivery.status,
          timestamp: new Date().toISOString(),
          actor: 'Operador Logístico',
          notes: `Motorista atribuído: ${driver.name} (ID: ${driver.id})`,
        });
        updatedDeliveries.push(delivery);
      } else {
        notFoundIds.push(id);
      }
    });

    return {
      success: true,
      updated: updatedDeliveries.length,
      notFound: notFoundIds.length,
      notFoundIds,
      data: updatedDeliveries,
    };
  }

  bulkUpdatePriority(dto: BulkUpdatePriorityDto) {
    const updatedDeliveries: Delivery[] = [];
    const notFoundIds: string[] = [];

    dto.deliveryIds.forEach((id) => {
      const delivery = this.deliveries.find((d) => d.id === id);
      if (delivery) {
        const oldPriority = delivery.priority;
        delivery.priority = dto.priority;
        delivery.timeline.unshift({
          id: `${delivery.timeline.length + 1}`,
          status: delivery.status,
          timestamp: new Date().toISOString(),
          actor: 'Operador Logístico',
          notes: `Prioridade alterada de ${oldPriority} para ${dto.priority}`,
        });
        updatedDeliveries.push(delivery);
      } else {
        notFoundIds.push(id);
      }
    });

    return {
      success: true,
      updated: updatedDeliveries.length,
      notFound: notFoundIds.length,
      notFoundIds,
      data: updatedDeliveries,
    };
  }
}
