export type DriverStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE';

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicle: {
    plate: string;
    model: string;
    type: 'MOTORCYCLE' | 'CAR' | 'VAN' | 'TRUCK';
  };
  status: DriverStatus;
  current_deliveries: number;
  total_deliveries: number;
  rating: number;
  created_at: string;
}
