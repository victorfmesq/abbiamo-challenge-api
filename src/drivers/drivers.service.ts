import { Injectable } from '@nestjs/common';
import { Driver, DriverStatus } from '../common/interfaces/driver.interface';
import { mockDrivers } from '../common/mocks/drivers.mock';

@Injectable()
export class DriversService {
  private drivers: Driver[] = [...mockDrivers];

  findAll(status?: DriverStatus): { data: Driver[]; total: number } {
    let filteredDrivers = this.drivers;

    if (status) {
      filteredDrivers = this.drivers.filter(
        (driver) => driver.status === status,
      );
    }

    return {
      data: filteredDrivers,
      total: filteredDrivers.length,
    };
  }

  findOne(id: string): Driver | undefined {
    return this.drivers.find((driver) => driver.id === id);
  }

  findByName(name: string): Driver | undefined {
    return this.drivers.find(
      (driver) => driver.name.toLowerCase() === name.toLowerCase(),
    );
  }
}
