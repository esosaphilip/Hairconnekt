import { http } from './http';
import { IProviderProfile, ICertification, ISocialMedia } from '../domain/models/provider';
import { ProviderAdapter } from './adapters/providerAdapter';

export const providerProfileApi = {
  async getMe(): Promise<IProviderProfile> {
    const res = await http.get('/providers/me');
    const payload = res?.data;
    // Map DTO to Domain Model
    return ProviderAdapter.toDomain(payload);
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
      return ProviderAdapter.toDomain((payload as any).data);
    }
    return ProviderAdapter.toDomain(payload);
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

  // --- New Profile Features ---

  async updateBio(bio: string): Promise<{ bio: string }> {
    const res = await http.patch('/providers/profile/bio', { bio });
    return res.data;
  },

  async updateSpecializations(specializations: string[]): Promise<{ specializations: string[] }> {
    const res = await http.put('/providers/profile/specializations', { specializations });
    return res.data;
  },

  async updateLanguages(languages: string[]): Promise<{ languages: string[] }> {
    const res = await http.put('/providers/profile/languages', { languages });
    return res.data;
  },

  async updateSocialMedia(socialMedia: ISocialMedia): Promise<ISocialMedia> {
    const res = await http.patch('/providers/profile/social-media', socialMedia);
    return ProviderAdapter.toSocialMedia(res.data);
  },

  async getCertifications(): Promise<ICertification[]> {
    const res = await http.get('/providers/profile/certifications');
    return ProviderAdapter.toCertificationList(res.data);
  },

  async addCertification(data: { title: string; institution: string; year: string }): Promise<ICertification> {
    const res = await http.post('/providers/profile/certifications', data);
    // Assuming the response is a single certification DTO
    // We can reuse the list mapper or create a single mapper. 
    // For simplicity, let's map it manually here or add a single mapper helper.
    const dto = res.data;
    return {
      id: dto.id,
      title: dto.title,
      institution: dto.institution,
      year: dto.year?.toString() || '',
    };
  },

  async removeCertification(id: string) {
    const res = await http.delete(`/providers/profile/certifications/${id}`);
    return res.data;
  },
};

