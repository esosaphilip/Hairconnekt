export interface IAppointmentService {
  name: string;
  duration: string;
  price: string; // Formatted price (e.g. "€95")
  priceCents: number;
}

export interface IAppointmentAlternativeDate {
  date: string;
  time: string;
}

export interface IAppointmentClient {
  id: string;
  name: string;
  avatar?: string;
  phone: string;
  email: string;
  totalBookings: number;
  joinedDate: string;
}

export interface IAppointmentRequest {
  id: string;
  client: IAppointmentClient;
  service: IAppointmentService;
  requestedDate: string;
  requestedTime: string;
  alternativeDates: IAppointmentAlternativeDate[];
  location: string;
  address: string;
  notes?: string;
  requestedAt: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}
