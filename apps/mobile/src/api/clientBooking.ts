import { http } from './http';
import { API_CONFIG } from '@/constants';
import { IBooking, BookingStatus } from '../domain/models/booking';
import { BookingAdapter } from './adapters/bookingAdapter';
import { mapApiError } from '../domain/errors/DomainError';

export const clientBookingApi = {
  async getAppointments(status: BookingStatus): Promise<IBooking[]> {
    try {
      const res = await http.get<{ items?: any[] } | any[]>(API_CONFIG.ENDPOINTS.APPOINTMENTS.CLIENT, { params: { status } });
      const data = res.data;
      const items = Array.isArray(data) ? data : (data?.items ?? []);
      return items.map(BookingAdapter.toDomain);
    } catch (error) {
      throw mapApiError(error);
    }
  },

  async getAppointment(id: string): Promise<IBooking> {
    try {
      const res = await http.get<{ data: any } | any>(`/appointments/${id}`);
      const raw = res.data?.data || res.data;
      return BookingAdapter.toDomain(raw);
    } catch (error) {
      throw mapApiError(error);
    }
  },

  async cancelAppointment(id: string): Promise<void> {
    try {
      await http.post(`/appointments/${id}/cancel`);
    } catch (error) {
      throw mapApiError(error);
    }
  },

  async createAppointment(dto: {
    providerId: string;
    serviceIds: string[];
    startTime: string;
    endTime: string;
    notes?: string;
  }): Promise<IBooking> {
    try {
      const res = await http.post('/appointments', dto);
      return BookingAdapter.toDomain(res.data);
    } catch (error) {
      throw mapApiError(error);
    }
  }
};
