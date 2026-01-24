import { api } from './api';
import type { AuthResponse, User } from '../types';

export const authService = {
    async login(email: string, password: string): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/login', { emailOrPhone: email, password });
        if (response.data.user.userType !== 'ADMIN') {
            throw new Error('Access denied. Admin only.');
        }
        return response.data;
    },

    async getMe(): Promise<User> {
        const response = await api.get<User>('/users/me');
        return response.data;
    },
};
