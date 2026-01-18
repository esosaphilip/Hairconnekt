import { http } from './http';

export interface ChatUser {
    id: string;
    name: string;
    avatar?: string | null;
}

export interface Conversation {
    id: string;
    otherUser: ChatUser;
    lastMessage?: string | null;
    lastMessageAt: string;
}

export interface Message {
    id: string;
    text: string;
    sender: 'me' | 'other';
    timestamp: string;
    isRead: boolean;
}

export const chatApi = {
    // GET /messages/conversations
    async getConversations() {
        const res = await http.get<Conversation[]>('/messages/conversations');
        return res.data;
    },

    // GET /messages/conversations/:id
    async getMessages(conversationId: string) {
        const res = await http.get<Message[]>(`/messages/conversations/${conversationId}`);
        return res.data;
    },

    // POST /messages
    async sendMessage(conversationId: string, content: string) {
        const res = await http.post('/messages', { conversationId, content });
        return res.data;
    },

    // POST /messages/start
    async startConversation(recipientId: string) {
        const res = await http.post<{ id: string }>('/messages/start', { recipientId });
        return res.data;
    }
};
