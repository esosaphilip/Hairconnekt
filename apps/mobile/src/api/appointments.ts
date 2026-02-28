import { http } from './http';
import { API_CONFIG } from '@/constants';
import { add } from 'date-fns';

export type StatusGroup = 'upcoming' | 'completed' | 'cancelled';

export type AppointmentServiceItem = {
  name: string;
  durationMinutes?: number;
};

export type AppointmentParty = {
  name?: string;
  businessName?: string;
  avatarUrl?: string;
};

export type AppointmentListItem = {
  id: string | number;
  appointmentDate: string;
  startTime?: string;
  endTime?: string;
  services: AppointmentServiceItem[];
  totalPriceCents?: number;
  provider?: AppointmentParty;
  client?: AppointmentParty;
  status?: StatusGroup | string;
  address?: string | null;
};

export type AppointmentsListResponse = {
  items: AppointmentListItem[];
};

export async function getClientAppointments(status: StatusGroup): Promise<AppointmentsListResponse> {
  const res = await http.get<{ items?: AppointmentListItem[] } | AppointmentListItem[]>(API_CONFIG.ENDPOINTS.APPOINTMENTS.CLIENT, { params: { status } });
  const data = res.data;
  const items = Array.isArray(data) ? data : (data?.items ?? []);
  return { items };
}

export async function getProviderAppointments(status: StatusGroup): Promise<AppointmentsListResponse> {
  const res = await http.get<{ items?: AppointmentListItem[] } | AppointmentListItem[]>(API_CONFIG.ENDPOINTS.APPOINTMENTS.PROVIDER, { params: { status } });
  const data = res.data;
  const items = Array.isArray(data) ? data : (data?.items ?? []);
  return { items };
}

export async function rescheduleAppointment(appointmentId: string, newStartAt: string, newEndAt: string): Promise<any> {
  const res = await http.post<{ success: boolean; data: any }>(`${API_CONFIG.ENDPOINTS.APPOINTMENTS.CREATE}/reschedule`, {
    appointmentId,
    newStartAt,
    newEndAt
  });
  return res.data;
}
