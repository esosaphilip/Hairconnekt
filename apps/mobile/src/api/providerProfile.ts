import { http } from './http';

export const providerProfileApi = {
  async getMe() {
    const res = await http.get('/providers/me');
    const payload = res?.data;
    return payload;
  },

  async updateMe(body: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
    coverPhoto?: string;
    businessName?: string;
    businessAddress?: { street: string; houseNumber: string; postalCode: string; city: string; state: string };
    businessPhone?: string;
    businessWebsite?: string;
    bio?: string;
    yearsOfExperience?: number;
    specialties?: string[];
    languagesSpoken?: string[];
    certifications?: string;
  }) {
    const res = await http.put('/providers/me', body);
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },

  async updateSettings(body: {
    notifications?: {
      newBookings?: { push?: boolean; email?: boolean; sms?: boolean };
      appointmentReminders?: { push?: boolean; email?: boolean; sms?: boolean };
      messages?: { push?: boolean; email?: boolean; sms?: boolean };
      reviews?: { push?: boolean; email?: boolean; sms?: boolean };
      payouts?: { push?: boolean; email?: boolean; sms?: boolean };
    };
    privacy?: { showPhoneOnProfile?: boolean; showEmailOnProfile?: boolean; allowClientMessages?: boolean };
  }) {
    const res = await http.patch('/providers/me/settings', body);
    return res?.data;
  },

  async publicPreview() {
    const res = await http.get('/providers/me/public-preview');
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },
};

