export interface IBraiderService {
  name: string;
  duration: string;
  price: string;
  description: string;
}

export interface IBraiderServiceCategory {
  category: string;
  items: IBraiderService[];
}

export interface IBraiderReview {
  id: number;
  name: string;
  rating: number;
  date: string;
  text: string;
  verified: boolean;
  style: string;
}

export interface IBraiderHours {
  day: string;
  hours: string;
}

export interface IBraiderStat {
  label: string;
  value: string;
}

export interface IBraider {
  id: string;
  name: string;
  businessName?: string;
  imageUrl?: string;
  coverImage?: string;
  profileImage?: string;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  address?: string;
  distanceKm?: number;
  distance?: string; // Formatted distance
  specialties: string[];
  priceFromCents?: number;
  isAvailable: boolean;
  
  // Detailed Profile fields
  bio?: string;
  badges?: string[];
  languages?: string[];
  stats?: IBraiderStat[];
  hours?: IBraiderHours[];
  services?: IBraiderServiceCategory[];
  portfolioImages?: string[];
  reviews?: IBraiderReview[];
}
