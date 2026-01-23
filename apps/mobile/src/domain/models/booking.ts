export type BookingStatus = 'upcoming' | 'completed' | 'cancelled' | 'confirmed' | 'pending';

export interface IBookingService {
  name: string;
  durationMinutes?: number;
}

export interface IBookingProvider {
  id: string;
  name: string;
  businessName?: string;
  avatarUrl?: string;
}

export interface IBooking {
  id: string;
  providerName: string;
  providerBusiness?: string | null;
  providerImage?: string;
  serviceName: string;
  date: string; // Formatted date string for UI
  time: string; // Formatted time string
  duration?: string | null;
  price?: string | null;
  location?: string | null;
  status: BookingStatus;
  isReviewed: boolean;
  rating?: number;
  reviewCount?: number;
  cancelledBy?: string | null;
  // Expanded fields for UI requirements
  startTime: string; // ISO string
  endTime: string; // ISO string
  providerId?: string;
  address?: string; // flattened address
  provider?: {
    id: string;
    name: string;
    address?: string;
    avatar?: string;
    businessName?: string;
  } | null;
  rawDate: string; // ISO string for sorting/logic
  notes?: string | null;
  cancellationReason?: string | null;
}
