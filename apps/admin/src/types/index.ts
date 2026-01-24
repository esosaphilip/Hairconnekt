export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    userType: 'CLIENT' | 'PROVIDER' | 'ADMIN';
    emailVerified: boolean;
    phoneVerified: boolean;
    profilePictureUrl?: string;
    providerProfile?: ProviderProfile;
    createdAt: string;
}

export interface ProviderProfile {
    id: string;
    businessName?: string;
    isVerified: boolean;
    verifiedAt?: string;
}

export interface Category {
    id: string;
    nameDe: string;
    nameEn?: string;
    slug: string;
    description?: string;
    isActive: boolean;
    displayOrder: number;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface Stats {
    users: {
        total: number;
        providers: number;
        clients: number;
    };
    services: {
        active: number;
    };
    bookings: {
        total: number;
    };
}
