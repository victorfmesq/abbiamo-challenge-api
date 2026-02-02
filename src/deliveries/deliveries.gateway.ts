import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DeliveriesService } from './deliveries.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class DeliveriesGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private updateInterval: NodeJS.Timeout;

  constructor(private readonly deliveriesService: DeliveriesService) {}

  afterInit() {
    console.log('WebSocket Gateway initialized');
    this.startRandomUpdates();
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  private startRandomUpdates() {
    this.updateInterval = setInterval(() => {
      const updatedDelivery = this.deliveriesService.updateRandomDelivery();

      if (updatedDelivery) {
        console.log(
          `Delivery ${updatedDelivery.tracking_code} updated to ${updatedDelivery.status}`,
        );
      }
    }, 12000);
  }

  onModuleDestroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}
