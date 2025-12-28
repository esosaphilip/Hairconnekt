import { http } from './http';
import { IAppointmentRequest } from '../domain/models/appointment';
import { AppointmentAdapter } from './adapters/appointmentAdapter';

export const providerAppointmentsApi = {
  async listRequests(params: { status?: 'pending' | 'all'; page?: number; limit?: number } = {}) {
    const res = await http.get('/providers/appointment-requests', { params });
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      // Assuming payload.data is an array of requests
      const list = (payload as any).data;
      if (Array.isArray(list)) {
        return list.map(AppointmentAdapter.toDomain);
      }
      return [];
    }
    return [];
  },

  async accept(id: string) {
    const res = await http.post(`/appointments/${id}/accept`);
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },

  async decline(id: string, body: { reason: string; messageToClient?: string }) {
    const res = await http.post(`/appointments/${id}/decline`, body);
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },

  async providerView(id: string) {
    const res = await http.get(`/appointments/${id}/provider-view`);
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },

  async complete(id: string, body: { finalPrice?: number; paymentConfirmed: boolean; providerNotes?: string }) {
    const res = await http.post(`/appointments/${id}/complete`, body);
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },

  async rescheduleProvider(id: string, body: { newDate: string; newStartTime: string; reason: string; messageToClient?: string }) {
    const res = await http.post(`/appointments/${id}/reschedule-provider`, body);
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },

  async cancelProvider(id: string, body: { reason: string; messageToClient?: string }) {
    const res = await http.post(`/appointments/${id}/cancel-provider`, body);
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },

  async patchProviderNotes(id: string, body: { providerNotes: string }) {
    const res = await http.patch(`/appointments/${id}/provider-notes`, body);
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload) {
      return payload;
    }
    return payload;
  },

  async getTodayAppointments() {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const res = await http.get('/appointments/provider', {
        params: {
          status: 'CONFIRMED',
          date: today
        }
      });
      const data = res?.data;
      if (data?.success && Array.isArray(data?.data)) {
        return data.data.map(AppointmentAdapter.toDomain);
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch today\'s appointments:', error);
      return [];
    }
  }
};


