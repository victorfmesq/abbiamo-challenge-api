import { fakerPT_BR as faker } from '@faker-js/faker';
import { Driver, DriverStatus } from '../interfaces/driver.interface';

type VehicleType = 'MOTORCYCLE' | 'CAR' | 'VAN' | 'TRUCK';
const vehicleTypes: VehicleType[] = ['MOTORCYCLE', 'CAR', 'VAN', 'TRUCK'];

const motorcycleModels = [
  'Honda CG 160',
  'Yamaha Fazer 250',
  'Honda Biz 125',
  'Honda PCX 150',
  'Yamaha XTZ 150',
  'Honda CB 300',
];

const carModels = [
  'Volkswagen Gol',
  'Fiat Uno',
  'Chevrolet Onix',
  'Hyundai HB20',
  'Toyota Corolla',
];

const vanModels = [
  'Fiat Fiorino',
  'Renault Kangoo',
  'Citroën Berlingo',
  'Peugeot Partner',
];

const truckModels = [
  'Volkswagen Saveiro',
  'Chevrolet Montana',
  'Fiat Strada',
  'Ford Ranger',
];

function randomItem<T>(array: T[]): T {
  return faker.helpers.arrayElement(array);
}

function generatePlate(): string {
  // Brazilian plate format: ABC-1234 or ABC1D23 (Mercosul)
  const useMercosul = faker.datatype.boolean();
  if (useMercosul) {
    return `${faker.string.alpha({ length: 3, casing: 'upper' })}${faker.string.numeric(1)}${faker.string.alpha({ length: 1, casing: 'upper' })}${faker.string.numeric(2)}`;
  }
  return `${faker.string.alpha({ length: 3, casing: 'upper' })}-${faker.string.numeric(4)}`;
}

function getVehicleModel(type: VehicleType): string {
  switch (type) {
    case 'MOTORCYCLE':
      return randomItem(motorcycleModels);
    case 'CAR':
      return randomItem(carModels);
    case 'VAN':
      return randomItem(vanModels);
    case 'TRUCK':
      return randomItem(truckModels);
  }
}

function generateDriver(id: number): Driver {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const name = `${firstName} ${lastName}`;
  const email = faker.internet
    .email({
      firstName: firstName.toLowerCase(),
      lastName: lastName.toLowerCase(),
      provider: 'abbiamo.com',
    })
    .toLowerCase();

  const vehicleType = randomItem(vehicleTypes);

  // Define status based on weights: 50% AVAILABLE, 35% BUSY, 15% OFFLINE
  const statusOptions: DriverStatus[] = ['AVAILABLE', 'BUSY', 'OFFLINE'];
  const weights = [0.5, 0.35, 0.15];

  const random = Math.random();
  let status: DriverStatus = 'AVAILABLE';
  let cumulativeWeight = 0;

  for (let i = 0; i < statusOptions.length; i++) {
    cumulativeWeight += weights[i];
    if (random <= cumulativeWeight) {
      status = statusOptions[i];
      break;
    }
  }

  // Current deliveries based on status
  let currentDeliveries = 0;
  if (status === 'BUSY') {
    currentDeliveries = faker.number.int({ min: 1, max: 5 });
  } else if (status === 'AVAILABLE') {
    currentDeliveries = faker.number.int({ min: 0, max: 2 });
  }

  // Total deliveries and rating (experienced drivers have higher ratings)
  const totalDeliveries = faker.number.int({ min: 50, max: 300 });
  const baseRating =
    totalDeliveries > 200 ? 4.5 : totalDeliveries > 150 ? 4.3 : 4.0;
  const rating = parseFloat(
    faker.number
      .float({
        min: baseRating,
        max: 5.0,
        fractionDigits: 1,
      })
      .toFixed(1),
  );

  const createdAt = faker.date.past({ years: 2 });

  return {
    id: id.toString(),
    name,
    phone: `(${faker.string.numeric(2)}) ${faker.string.numeric(5)}-${faker.string.numeric(4)}`,
    email,
    vehicle: {
      plate: generatePlate(),
      model: getVehicleModel(vehicleType),
      type: vehicleType,
    },
    status,
    current_deliveries: currentDeliveries,
    total_deliveries: totalDeliveries,
    rating,
    created_at: createdAt.toISOString(),
  };
}

export function generateMockDrivers(count: number = 50): Driver[] {
  return Array.from({ length: count }, (_, i) => generateDriver(i + 1));
}

export const mockDrivers = generateMockDrivers(50);
