import { http } from './http';

export const providerNotificationsApi = {
  async list(params: { filter?: 'all' | 'unread'; page?: number; limit?: number } = {}) {
    const res = await http.get('/providers/notifications', { params });
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },

  async markRead(notificationId: string) {
    const res = await http.patch(`/notifications/${notificationId}/read`);
    return res?.data;
  },

  async markAllRead() {
    const res = await http.patch('/providers/notifications/read-all');
    return res?.data;
  },

  async remove(notificationId: string) {
    const res = await http.delete(`/notifications/${notificationId}`);
    return res?.data;
  },
};

