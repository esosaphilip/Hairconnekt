import { http } from '../api/http';
import { Platform } from 'react-native';

// Types copied from the web app to keep payloads in sync with backend DTOs
export type MeResponse = {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string | null;
  userType: string;
  preferredLanguage: string;
  memberSince: string; // ISO date
  verified: { email: boolean; phone: boolean };
  addressesCount: number;
  clientProfile?: ClientProfile | null;
  stats: {
    appointments: number;
    upcoming: number;
    completed: number;
    cancelled: number;
    favorites: number;
    reviews: number;
  };
  notificationPreferences?: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
};

export type ClientProfile = {
  id?: string;
  dateOfBirth?: string | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY' | null;
  hairType?: 'STRAIGHT' | 'WAVY' | 'CURLY' | 'COILY' | null;
  hairLength?: 'SHORT' | 'MEDIUM' | 'LONG' | null;
  preferredStyles?: string[] | null;
  allergies?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type UpdateUserDto = Partial<{
  phone: string;
  firstName: string;
  lastName: string;
  preferredLanguage: 'de' | 'en' | 'fr' | 'es' | 'it';
  profilePictureUrl: string;
  notificationPreferences: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
}>;

export type UpdateClientProfileDto = Partial<{
  dateOfBirth: string | null;
  gender: ClientProfile['gender'];
  hairType: ClientProfile['hairType'];
  hairLength: ClientProfile['hairLength'];
  preferredStyles: string[] | null;
  allergies: string | null;
  notes: string | null;
}>;

type UploadImage = { uri: string; name?: string; type?: string } | string;

function guessNameFromUri(uri: string): string {
  try {
    const last = uri.split('/').pop() || 'avatar.jpg';
    return last.includes('.') ? last : `${last}.jpg`;
  } catch {
    return 'avatar.jpg';
  }
}

function guessMimeFromUri(uri: string): string {
  const lower = (uri || '').toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.heic') || lower.endsWith('.heif')) return 'image/heic';
  return 'image/jpeg';
}

export const usersApi = {
  // GET /users/me
  async getMe() {
    const res = await http.get<MeResponse>('/users/me');
    return res.data;
  },

  // PATCH /users/me
  async updateMe(payload: UpdateUserDto) {
    const res = await http.patch<{ success: true }>(
      '/users/me',
      payload,
    );
    return res.data;
  },

  // GET /users/preferences
  async getPreferences() {
    const res = await http.get<ClientProfile | null>('/users/preferences');
    return res.data;
  },

  // PATCH /users/preferences
  async updatePreferences(payload: UpdateClientProfileDto) {
    const res = await http.patch<ClientProfile>('/users/preferences', payload);
    return res.data;
  },

  // [UPLOAD-REMOVED] uploadAvatar removed — rebuild with new upload system
};

export default usersApi;

// Helpers
async function uriToBlob(uri: string, mime: string): Promise<Blob> {
  try {
    // data: URL
    if (uri.startsWith('data:')) {
      const base64 = uri.split(',')[1] || '';
      const byteChars = atob(base64);
      const byteNumbers = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) {
        byteNumbers[i] = byteChars.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: mime || 'application/octet-stream' });
    }
    // http(s) URL
    const response = await fetch(uri);
    const contentType = response.headers.get('Content-Type') || mime || 'application/octet-stream';
    const arrayBuffer = await response.arrayBuffer();
    return new Blob([arrayBuffer], { type: contentType });
  } catch {
    // Fallback: empty blob; server may still accept the multipart
    return new Blob([], { type: mime || 'application/octet-stream' });
  }
}
