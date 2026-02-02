import { Module } from '@nestjs/common';
import { DeliveriesController } from './deliveries.controller';
import { DeliveriesService } from './deliveries.service';
import { DeliveriesGateway } from './deliveries.gateway';
import { DriversModule } from '../drivers/drivers.module';

@Module({
  imports: [DriversModule],
  controllers: [DeliveriesController],
  providers: [DeliveriesService, DeliveriesGateway],
  exports: [DeliveriesService],
})
export class DeliveriesModule {}
