import { api } from './http';

export type StatusGroup = 'upcoming' | 'completed' | 'cancelled';

export type AppointmentServiceItem = {
  id: string;
  name: string;
  durationMinutes: number;
  priceCents: number;
};

export type AppointmentListItem = {
  id: string;
  appointmentNumber: string;
  appointmentDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  status: string; // backend enum value
  provider: {
    id?: string;
    name?: string;
    businessName?: string;
    avatarUrl?: string;
  };
  services: AppointmentServiceItem[];
  totalPriceCents: number;
  address?: string;
  createdAt: string;
  updatedAt: string;
  hoursUntil?: number;
  // Present only for provider listings
  client?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
};

export type AppointmentsListResponse = {
  items: AppointmentListItem[];
  count: number;
};

export async function getClientAppointments(status: StatusGroup = 'upcoming') {
  return api.get<AppointmentsListResponse>('/appointments/client', { status });
}

export async function getProviderAppointments(status: StatusGroup = 'upcoming') {
  return api.get<AppointmentsListResponse>('/appointments/provider', { status });
}