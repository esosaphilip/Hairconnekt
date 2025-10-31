import { http } from './http';

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
  provider?: {
    id?: string;
    name?: string;
    businessName?: string;
    avatarUrl?: string;
  } | null;
  services: AppointmentServiceItem[];
  totalPriceCents: number;
  address?: string | null;
  createdAt: string;
  updatedAt: string;
  hoursUntil?: number | null;
  // Present only for provider listings
  client?: {
    id: string;
    name: string;
    avatarUrl?: string;
  } | null;
};

export type AppointmentsListResponse = {
  items: AppointmentListItem[];
  count: number;
};

export async function getClientAppointments(status: StatusGroup = 'upcoming'): Promise<AppointmentsListResponse> {
  const res = await http.get('/appointments/client', { params: { status } });
  return res.data as AppointmentsListResponse;
}

export async function getProviderAppointments(status: StatusGroup = 'upcoming'): Promise<AppointmentsListResponse> {
  const res = await http.get('/appointments/provider', { params: { status } });
  return res.data as AppointmentsListResponse;
}