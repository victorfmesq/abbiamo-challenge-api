import { fakerPT_BR as faker } from '@faker-js/faker';
import {
  Delivery,
  DeliveryStatus,
  DeliveryEvent,
  DeliveryPriority,
} from '../interfaces/delivery.interface';
import { mockDrivers } from './drivers.mock';

const drivers = mockDrivers.map((driver) => driver.name);

const distributionCenters = [
  'CD São Paulo - Centro',
  'CD São Paulo - Zona Sul',
  'CD São Paulo - Zona Norte',
  'CD Rio de Janeiro - Centro',
  'CD Rio de Janeiro - Zona Sul',
  'CD Belo Horizonte - Centro',
  'CD Curitiba - Centro',
  'CD Porto Alegre - Centro',
];

function randomItem<T>(array: T[]): T {
  return faker.helpers.arrayElement(array);
}

function generateTrackingCode(): string {
  return `BR${faker.string.numeric(9)}`;
}

function generateCPF(): string {
  // Simple CPF format generator
  const numbers = faker.string.numeric(9);
  const digit1 = faker.string.numeric(1);
  const digit2 = faker.string.numeric(1);
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${digit1}${digit2}`;
}

function generateTimeline(
  status: DeliveryStatus,
  createdAt: Date,
): DeliveryEvent[] {
  const timeline: DeliveryEvent[] = [];
  let currentDate = new Date(createdAt);

  const statusFlow: DeliveryStatus[] = ['PENDING', 'DISPATCHED', 'IN_ROUTE'];

  if (status === 'DELIVERED') {
    statusFlow.push('DELIVERED');
  } else if (status === 'DELAYED') {
    statusFlow.push('DELAYED');
  } else if (status === 'FAILED') {
    statusFlow.push('FAILED');
  }

  statusFlow.forEach((eventStatus, index) => {
    const isCurrentStatus = eventStatus === status;
    const isLastEvent = index === statusFlow.length - 1;

    if (!isLastEvent || isCurrentStatus) {
      let notes: string | undefined;
      let actor: string;

      switch (eventStatus) {
        case 'PENDING':
          actor = 'Sistema';
          notes = 'Pedido recebido e aguardando processamento';
          break;
        case 'DISPATCHED':
          actor = randomItem(distributionCenters);
          notes = 'Saiu para entrega';
          break;
        case 'IN_ROUTE':
          actor = `Motorista: ${randomItem(drivers)}`;
          notes = 'Em rota de entrega';
          break;
        case 'DELIVERED':
          actor = `Recebido por: ${faker.person.fullName()}`;
          notes = 'Entrega concluída com sucesso';
          break;
        case 'DELAYED':
          actor = `Motorista: ${randomItem(drivers)}`;
          notes = 'Atraso na entrega devido ao trânsito';
          break;
        case 'FAILED':
          actor = `Motorista: ${randomItem(drivers)}`;
          notes = 'Tentativa de entrega sem sucesso - Destinatário ausente';
          break;
        default:
          actor = 'Sistema';
      }

      timeline.push({
        id: `${timeline.length + 1}`,
        status: eventStatus,
        timestamp: currentDate.toISOString(),
        actor,
        notes,
      });

      if (index < statusFlow.length - 1) {
        const hoursToAdd = faker.number.int({ min: 1, max: 12 });
        currentDate = new Date(
          currentDate.getTime() + hoursToAdd * 60 * 60 * 1000,
        );
      }
    }
  });

  return timeline.reverse();
}

function generateDelivery(id: number): Delivery {
  const createdAt = faker.date.recent({ days: 7 });
  const expectedDeliveryAt = faker.date.soon({ days: 3 });

  const statusOptions: DeliveryStatus[] = [
    'PENDING',
    'DISPATCHED',
    'IN_ROUTE',
    'DELIVERED',
    'DELAYED',
    'FAILED',
  ];
  const weights = [0.1, 0.15, 0.3, 0.35, 0.05, 0.05];

  const random = Math.random();
  let status: DeliveryStatus = 'PENDING';
  let cumulativeWeight = 0;

  for (let i = 0; i < statusOptions.length; i++) {
    cumulativeWeight += weights[i];
    if (random <= cumulativeWeight) {
      status = statusOptions[i];
      break;
    }
  }

  // Generate Brazilian coordinates (focusing on major cities)
  const baseCoords = faker.helpers.arrayElement([
    { lat: -23.5505, lng: -46.6333, city: 'São Paulo', state: 'SP' },
    { lat: -22.9068, lng: -43.1729, city: 'Rio de Janeiro', state: 'RJ' },
    { lat: -19.9167, lng: -43.9345, city: 'Belo Horizonte', state: 'MG' },
    { lat: -25.4284, lng: -49.2733, city: 'Curitiba', state: 'PR' },
    { lat: -30.0346, lng: -51.2177, city: 'Porto Alegre', state: 'RS' },
  ]);

  const coordinates = {
    lat:
      baseCoords.lat +
      faker.number.float({ min: -0.1, max: 0.1, fractionDigits: 4 }),
    lng:
      baseCoords.lng +
      faker.number.float({ min: -0.1, max: 0.1, fractionDigits: 4 }),
  };

  const deliveryAttempts =
    status === 'FAILED'
      ? faker.number.int({ min: 1, max: 3 })
      : status === 'DELAYED'
        ? faker.number.int({ min: 1, max: 2 })
        : status === 'DELIVERED'
          ? 1
          : 0;

  // Generate priority based on status and random factor
  const priorityOptions: DeliveryPriority[] = [
    'LOW',
    'NORMAL',
    'HIGH',
    'URGENT',
  ];
  const priorityWeights = [0.2, 0.5, 0.2, 0.1];
  const priorityRandom = Math.random();
  let priority: DeliveryPriority = 'NORMAL';
  let priorityCumulativeWeight = 0;

  for (let i = 0; i < priorityOptions.length; i++) {
    priorityCumulativeWeight += priorityWeights[i];
    if (priorityRandom <= priorityCumulativeWeight) {
      priority = priorityOptions[i];
      break;
    }
  }

  // Assign driver if status is DISPATCHED, IN_ROUTE, DELIVERED, DELAYED, or FAILED
  const assignedDriver = [
    'DISPATCHED',
    'IN_ROUTE',
    'DELIVERED',
    'DELAYED',
    'FAILED',
  ].includes(status)
    ? randomItem(drivers)
    : undefined;

  return {
    id: id.toString(),
    tracking_code: generateTrackingCode(),
    status,
    priority,
    assigned_driver: assignedDriver,
    recipient: {
      name: faker.person.fullName(),
      phone: `(${faker.string.numeric(2)}) ${faker.string.numeric(5)}-${faker.string.numeric(4)}`,
      document: generateCPF(),
      address: {
        street: faker.location.streetAddress(),
        number: faker.location.buildingNumber(),
        complement: faker.datatype.boolean()
          ? `Apto ${faker.number.int({ min: 1, max: 200 })}`
          : undefined,
        neighborhood: faker.location.county(),
        city: baseCoords.city,
        state: baseCoords.state,
        zip_code: faker.location.zipCode('#####-###'),
        coordinates,
      },
    },
    created_at: createdAt.toISOString(),
    expected_delivery_at: expectedDeliveryAt.toISOString(),
    delivery_attempts: deliveryAttempts,
    timeline: generateTimeline(status, createdAt),
  };
}

export function generateMockDeliveries(count: number = 300): Delivery[] {
  return Array.from({ length: count }, (_, i) => generateDelivery(i + 1));
}

export const mockDeliveries = generateMockDeliveries(300);
