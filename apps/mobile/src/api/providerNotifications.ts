import { http } from './http';

export const providerNotificationsApi = {
  async list(params: { filter?: 'all' | 'unread'; page?: number; limit?: number } = {}) {
    // Corrected endpoint to match backend NotificationsController ('/notifications')
    const res = await http.get('/notifications', { params });
    const payload = res?.data;
    // Backend returns { items: [], unreadCount: 0 } directly, or array depending on implementation
    if (payload && typeof payload === 'object' && 'items' in payload) {
        return payload.items;
    }
    return Array.isArray(payload) ? payload : [];
  },

  async markRead(notificationId: string) {
    // Backend uses POST for this action
    const res = await http.post(`/notifications/${notificationId}/read`);
    return res?.data;
  },

  async markAllRead() {
    // Backend uses POST for this action
    const res = await http.post('/notifications/read-all');
    return res?.data;
  },

  async remove(notificationId: string) {
    const res = await http.delete(`/notifications/${notificationId}`);
    return res?.data;
  },
};

