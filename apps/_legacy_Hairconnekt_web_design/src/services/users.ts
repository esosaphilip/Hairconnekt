import { api } from "./http";

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
};

export type ClientProfile = {
  id?: string;
  dateOfBirth?: string | null;
  gender?: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY" | null;
  hairType?: "STRAIGHT" | "WAVY" | "CURLY" | "COILY" | null;
  hairLength?: "SHORT" | "MEDIUM" | "LONG" | null;
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
  preferredLanguage: "de" | "en" | "fr" | "es" | "it";
  profilePictureUrl: string;
}>;

export type UpdateClientProfileDto = Partial<{
  dateOfBirth: string | null;
  gender: ClientProfile["gender"];
  hairType: ClientProfile["hairType"];
  hairLength: ClientProfile["hairLength"];
  preferredStyles: string[] | null;
  allergies: string | null;
  notes: string | null;
}>;

export const usersApi = {
  getMe: () => api.get<MeResponse>("/users/me"),
  updateMe: (payload: UpdateUserDto) => api.patch<{ success: true }>("/users/me", payload),
  getPreferences: () => api.get<ClientProfile | null>("/users/preferences"),
  updatePreferences: (payload: UpdateClientProfileDto) =>
    api.patch<ClientProfile>("/users/preferences", payload),
  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('image', file);
    return api.postForm<{ url: string }>("/users/me/avatar", form);
  },
};