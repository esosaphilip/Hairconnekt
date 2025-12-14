import { http } from './http';

export const providerMessagingApi = {
  async listConversations(params: { filter?: 'all' | 'unread' | 'archived'; page?: number; limit?: number } = {}) {
    const res = await http.get('/providers/conversations', { params });
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },

  async listMessages(conversationId: string, params: { page?: number; limit?: number } = {}) {
    const res = await http.get(`/conversations/${conversationId}/messages`, { params });
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },

  async sendMessage(conversationId: string, body: { text?: string; attachments?: string[]; type?: 'text' | 'image' }) {
    const res = await http.post(`/conversations/${conversationId}/messages`, body);
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },

  async markRead(conversationId: string) {
    const res = await http.patch(`/conversations/${conversationId}/mark-read`);
    return res?.data;
  },

  async archive(conversationId: string, archived: boolean) {
    const res = await http.patch(`/conversations/${conversationId}/archive`, { archived });
    return res?.data;
  },
};

