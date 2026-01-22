import { IAppointmentRequest, IAppointmentClient, IAppointmentService } from '../../domain/models/appointment';
import { normalizeUrl } from '@/utils/url';

// Define DTO shapes (approximate based on API usage)
interface AppointmentRequestDTO {
  id: string;
  client?: {
    id: string;
    firstName?: string;
    lastName?: string;
    name?: string; // Fallback
    avatar?: string;
    profilePictureUrl?: string;
    phone?: string;
    email?: string;
    stats?: {
      totalBookings?: number;
      joinedDate?: string;
    };
  };
  service?: {
    name: string;
    durationMinutes?: number;
    duration?: string; // Fallback
    priceCents?: number;
    price?: string; // Fallback
  };
  date?: string; // ISO date
  startTime?: string; // HH:mm
  alternativeDates?: Array<{ date: string; time: string }>;
  location?: string;
  address?: string;
  notes?: string;
  createdAt?: string; // ISO timestamp
  status?: string;
}

export const AppointmentAdapter = {
  toDomain(dto: AppointmentRequestDTO): IAppointmentRequest {
    const client = dto.client || {} as NonNullable<AppointmentRequestDTO['client']>;
    const service = dto.service || {} as NonNullable<AppointmentRequestDTO['service']>;
    
    // Helper to format price
    const formatPrice = (cents?: number, str?: string) => {
      if (cents !== undefined) return `€${Math.round(cents / 100)}`;
      return str || '€0';
    };

    // Helper to format duration
    const formatDuration = (mins?: number, str?: string) => {
      if (mins !== undefined) {
        const hrs = Math.floor(mins / 60);
        const remainingMins = mins % 60;
        if (hrs > 0 && remainingMins > 0) return `${hrs} Std. ${remainingMins} Min.`;
        if (hrs > 0) return `${hrs} Std.`;
        return `${mins} Min.`;
      }
      return str || '0 Min.';
    };

    // Helper to format relative time (simplified)
    const formatRelativeTime = (iso?: string) => {
      if (!iso) return 'Unbekannt';
      // In a real app, use date-fns/moment
      return 'Vor einiger Zeit'; 
    };

    const domainClient: IAppointmentClient = {
      id: client.id || '',
      name: [client.firstName, client.lastName].filter(Boolean).join(' ') || client.name || 'Unbekannt',
      avatar: normalizeUrl(client.profilePictureUrl || client.avatar),
      phone: client.phone || '',
      email: client.email || '',
      totalBookings: client.stats?.totalBookings || 0,
      joinedDate: client.stats?.joinedDate || 'Unbekannt',
    };

    const domainService: IAppointmentService = {
      name: service.name || 'Unbekannter Service',
      duration: formatDuration(service.durationMinutes, service.duration),
      price: formatPrice(service.priceCents, service.price),
      priceCents: service.priceCents || 0,
    };

    return {
      id: dto.id,
      client: domainClient,
      service: domainService,
      requestedDate: dto.date || '',
      requestedTime: dto.startTime || '',
      alternativeDates: dto.alternativeDates || [],
      location: dto.location || 'Salon',
      address: dto.address || '',
      notes: dto.notes,
      requestedAt: formatRelativeTime(dto.createdAt),
      status: (dto.status as any) || 'pending',
    };
  }
};
