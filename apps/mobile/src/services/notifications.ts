import { http } from '../api/http';

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
  async list(limit = 50): Promise<{ items: BackendNotification[]; unreadCount: number }>
  {
    const res = await http.get('/notifications', { params: { limit } });
    return res.data as { items: BackendNotification[]; unreadCount: number };
  },
  async unreadCount(): Promise<{ count: number }>
  {
    const res = await http.get('/notifications/unread-count');
    return res.data as { count: number };
  },
  async markRead(id: string): Promise<{ success: boolean }>
  {
    const res = await http.post(`/notifications/${id}/read`);
    return res.data as { success: boolean };
  },
  async markAllRead(): Promise<{ success: boolean }>
  {
    const res = await http.post('/notifications/read-all');
    return res.data as { success: boolean };
  },
  async clearAll(): Promise<{ success: boolean }>
  {
    const res = await http.delete('/notifications');
    return res.data as { success: boolean };
  },
  async registerDeviceToken(token: string): Promise<{ success: boolean }>
  {
    if (!token) throw new Error('Missing device token');
    const res = await http.post('/notifications/token', { token });
    return res.data as { success: boolean };
  },
};