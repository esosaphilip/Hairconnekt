
import { http } from './http';

export interface Address {
    id: string;
    label: string;
    streetAddress: string;
    city: string;
    postalCode: string;
    state: string;
    country: string;
    latitude?: number | null;
    longitude?: number | null;
    isDefault: boolean;
}

export const clientUserApi = {
    getAddresses: async (): Promise<Address[]> => {
        const response = await http.get<{ success: boolean; data: Address[] }>('/users/me/addresses');
        return response.data.data;
    },

    createAddress: async (payload: Partial<Address>): Promise<Address> => {
        const response = await http.post<{ success: boolean; data: Address }>('/users/me/addresses', payload);
        return response.data.data;
    },

    updateAddress: async (id: string, payload: Partial<Address>): Promise<Address> => {
        const response = await http.patch<{ success: boolean; data: Address }>(`/users/me/addresses/${id}`, payload);
        return response.data.data;
    },

    deleteAddress: async (id: string): Promise<void> => {
        await http.delete(`/users/me/addresses/${id}`);
    },

    setDefaultAddress: async (id: string): Promise<void> => {
        await http.patch(`/users/me/addresses/${id}/default`);
    },

    updateLanguage: async (language: string): Promise<void> => {
        await http.patch('/users/me/language', { preferredLanguage: language });
    },

    deleteAccount: async (): Promise<void> => {
        await http.delete('/users/me');
    },

    changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
        await http.post('/auth/change-password', data);
    },
};
