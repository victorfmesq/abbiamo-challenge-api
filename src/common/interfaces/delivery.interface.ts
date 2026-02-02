export type DeliveryStatus =
  | 'PENDING'
  | 'DISPATCHED'
  | 'IN_ROUTE'
  | 'DELIVERED'
  | 'DELAYED'
  | 'FAILED';

export interface DeliveryEvent {
  id: string;
  status: DeliveryStatus;
  timestamp: string;
  actor: string;
  notes?: string;
}

export type DeliveryPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface Delivery {
  id: string;
  tracking_code: string;
  status: DeliveryStatus;
  priority: DeliveryPriority;
  assigned_driver?: string;
  recipient: {
    name: string;
    phone: string;
    document: string;
    address: {
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
      zip_code: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    };
  };
  created_at: string;
  expected_delivery_at: string;
  delivery_attempts: number;
  timeline: DeliveryEvent[];
}
