export interface ICertification {
  id: string;
  title: string;
  institution: string;
  year: string;
}

export interface ISocialMedia {
  website?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
  linkedin?: string;
}

export interface IProviderProfile {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  profilePictureUrl?: string;
  
  // Business Info
  businessName?: string;
  businessType?: string;
  bio: string;
  yearsOfExperience: number;
  
  // Location & Service
  isMobileService: boolean;
  serviceRadiusKm?: number;
  
  // Booking Settings
  acceptsSameDayBooking: boolean;
  advanceBookingDays: number;
  bufferTimeMinutes: number;
  cancellationPolicy: string;
  
  // Verification
  isVerified: boolean;
  
  // Collections
  specializations: string[]; // Simple array of strings for UI
  languages: string[];      // Simple array of strings for UI
  certifications: ICertification[];
  socialMedia: ISocialMedia;
}
