import { IProviderProfile, ICertification, ISocialMedia } from '../../domain/models/provider';

// Define expected DTO shapes (from backend)
interface ProviderDTO {
  id: string;
  businessName?: string;
  businessType?: string;
  bio?: string;
  yearsOfExperience?: number;
  isVerified?: boolean;
  isMobileService?: boolean;
  serviceRadiusKm?: number;
  acceptsSameDayBooking?: boolean;
  advanceBookingDays?: number;
  bufferTimeMinutes?: number;
  cancellationPolicy?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id: string;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    profilePictureUrl?: string;
  };
  // API might return these directly or nested
  specializations?: any[];
  languages?: any[];
  certifications?: any[];
  website?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
  linkedin?: string;
}

export const ProviderAdapter = {
  toDomain(dto: ProviderDTO): IProviderProfile {
    const user = dto.user || {} as any;
    
    return {
      id: dto.id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      fullName: [user.firstName, user.lastName].filter(Boolean).join(' '),
      email: user.email || '',
      phone: user.phone || '',
      profilePictureUrl: user.profilePictureUrl,
      
      businessName: dto.businessName,
      businessType: dto.businessType,
      bio: dto.bio || '',
      yearsOfExperience: dto.yearsOfExperience || 0,
      
      isMobileService: !!dto.isMobileService,
      serviceRadiusKm: dto.serviceRadiusKm,
      
      acceptsSameDayBooking: !!dto.acceptsSameDayBooking,
      advanceBookingDays: dto.advanceBookingDays || 0,
      bufferTimeMinutes: dto.bufferTimeMinutes || 0,
      cancellationPolicy: dto.cancellationPolicy || '',
      
      isVerified: !!dto.isVerified,
      
      // Default to empty arrays, can be populated by separate calls if needed
      specializations: [], 
      languages: [],
      certifications: [],
      
      socialMedia: {
        website: dto.website,
        instagram: dto.instagram,
        facebook: dto.facebook,
        twitter: dto.twitter,
        youtube: dto.youtube,
        linkedin: dto.linkedin,
      }
    };
  },

  toCertificationList(dtos: any[]): ICertification[] {
    if (!Array.isArray(dtos)) return [];
    return dtos.map(dto => ({
      id: dto.id,
      title: dto.title,
      institution: dto.institution,
      year: dto.year?.toString() || '',
    }));
  },
  
  toSocialMedia(dto: any): ISocialMedia {
    return {
      website: dto.website,
      instagram: dto.instagram,
      facebook: dto.facebook,
      twitter: dto.twitter,
      youtube: dto.youtube,
      linkedin: dto.linkedin,
    };
  }
};
