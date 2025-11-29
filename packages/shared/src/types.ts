export type PublicUser = {
  id: string;
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  userType?: string | null; // 'client' | 'provider' | 'admin'
};

export type Tokens = {
  accessToken: string;
  refreshToken?: string | null;
};

// Appointments
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
  status: string;
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