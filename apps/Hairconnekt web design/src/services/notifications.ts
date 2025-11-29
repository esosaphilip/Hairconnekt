import { api } from './http';

export type BackendNotification = {
  id: string;
  type:
    | 'BOOKING_REQUEST'
    | 'BOOKING_CONFIRMED'
    | 'BOOKING_CANCELLED'
    | 'MESSAGE_RECEIVED'
    | 'REVIEW_RECEIVED'
    | 'PAYMENT_RECEIVED'
    | 'PAYOUT_COMPLETED'
    | 'SYSTEM';
  title: string;
  message: string;
  data?: { actionUrl?: string; avatar?: string; [k: string]: unknown } | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
};

export const notificationsApi = {
  async list(limit = 50): Promise<{ items: BackendNotification[]; unreadCount: number }> {
    return api.get('/notifications', { limit });
  },
  async unreadCount(): Promise<{ count: number }> {
    return api.get('/notifications/unread-count');
  },
  async markRead(id: string): Promise<{ success: boolean }> {
    return api.post(`/notifications/${id}/read`);
  },
  async markAllRead(): Promise<{ success: boolean }> {
    return api.post('/notifications/read-all');
  },
  async clearAll(): Promise<{ success: boolean }> {
    return api.delete('/notifications');
  },
  async registerDeviceToken(token: string): Promise<{ success: boolean }> {
    if (!token) throw new Error('Missing device token');
    return api.post('/notifications/token', { token });
  },
};