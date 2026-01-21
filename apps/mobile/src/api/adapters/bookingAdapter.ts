import { DateService } from '@/domain/services/DateService';
import { IBooking, BookingStatus } from '../../domain/models/booking';
import { hhmm, formatMoneyCents } from '@hairconnekt/shared';

// Backend types
interface AppointmentServiceItem {
  name: string;
  durationMinutes?: number;
}

interface AppointmentParty {
  id?: string;
  name?: string;
  businessName?: string;
  avatarUrl?: string;
}

interface AppointmentListItem {
  id: string | number;
  appointmentDate: string;
  startTime?: string;
  endTime?: string;
  services: AppointmentServiceItem[];
  totalPriceCents?: number;
  provider?: AppointmentParty;
  client?: AppointmentParty;
  status?: string;
  address?: string | null;
  reviewed?: boolean;
  rating?: number;
  reviewCount?: number;
  cancelledBy?: string | null;
}

export const BookingAdapter = {
  toDomain(dto: AppointmentListItem): IBooking {
    const services = Array.isArray(dto.services) ? dto.services : [];
    const firstService = services.length > 0 ? services[0] : undefined;
    const provider = dto.provider ?? {};

    return {
      id: String(dto.id),
      providerId: provider.id,
      providerName: provider.businessName || provider.name || 'Unbekannt',
      providerBusiness: provider.businessName || null,
      providerImage: provider.avatarUrl,
      serviceName: (firstService && firstService.name) || 'Service',
      date: DateService.formatDate(dto.appointmentDate || ''),
      time: DateService.formatTime(dto.startTime || ''),
      duration: firstService && typeof firstService.durationMinutes === 'number'
        ? `${firstService.durationMinutes} Min.`
        : null,
      price: typeof dto.totalPriceCents === 'number'
        ? formatMoneyCents(dto.totalPriceCents)
        : null,
      location: dto.address || null,
      status: (dto.status as BookingStatus) || 'upcoming',
      isReviewed: !!dto.reviewed,
      rating: dto.rating,
      reviewCount: dto.reviewCount,
      cancelledBy: dto.cancelledBy,
      rawDate: dto.appointmentDate // Keep raw ISO date for logic
    };
  }
};
