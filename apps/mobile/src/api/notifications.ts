import { http } from './http';

export interface BackendNotification {
    id: string;
    type: 'BOOKING_REQUEST' | 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'MESSAGE_RECEIVED' | 'REVIEW_RECEIVED' | 'PAYMENT_RECEIVED' | 'PAYOUT_COMPLETED' | 'SYSTEM';
    title: string;
    message: string;
    createdAt: string;
    isRead: boolean;
    data?: {
        avatar?: string;
        actionUrl?: string;
        appointmentId?: string;
    };
}

export const notificationsApi = {
    async list(limit: number = 50) {
        const res = await http.get('/notifications', { params: { limit } });
        const payload = res?.data;
        // Ensure we return the expected structure { items: [], unreadCount: 0 }
        if (payload && typeof payload === 'object' && 'items' in payload) {
            return {
                items: payload.items as BackendNotification[],
                unreadCount: (payload.unreadCount as number) || 0
            };
        }
        // Fallback if backend returns just array
        const items = Array.isArray(payload) ? payload : [];
        return { items: items as BackendNotification[], unreadCount: 0 };
    },

    async markRead(notificationId: string) {
        const res = await http.post(`/notifications/${notificationId}/read`);
        return res?.data;
    },

    async markAllRead() {
        const res = await http.post('/notifications/read-all');
        return res?.data;
    },

    async clearAll() {
        const res = await http.delete('/notifications');
        return res?.data;
    },

    async getPreferences() {
        const res = await http.get<{ pushEnabled: boolean; emailEnabled: boolean; smsEnabled: boolean }>('/notifications/preferences');
        return res?.data;
    },

    async updatePreferences(dto: { pushEnabled?: boolean; emailEnabled?: boolean; smsEnabled?: boolean }) {
        const res = await http.put('/notifications/preferences', dto);
        return res?.data;
    }
};
