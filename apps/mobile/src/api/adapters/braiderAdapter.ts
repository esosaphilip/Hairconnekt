import { IBraider } from '../../domain/models/braider';

// DTO for List/Search
interface NearbyProviderDTO {
  id: string;
  name: string;
  business?: string;
  imageUrl?: string;
  verified?: boolean;
  rating?: number;
  reviews?: number;
  distanceKm?: number;
  specialties?: string[];
  priceFromCents?: number;
  available?: boolean;
}

// DTO for Profile Detail (can be more extensive)
interface ProviderProfileDTO extends NearbyProviderDTO {
  bio?: string;
  address?: string;
  coverImage?: string;
  profileImage?: string;
  languages?: string[];
  // Add other backend fields as needed
}

export const BraiderAdapter = {
  toDomain(dto: NearbyProviderDTO): IBraider {
    return {
      id: String(dto.id),
      name: dto.name,
      businessName: dto.business,
      imageUrl: dto.imageUrl,
      isVerified: !!dto.verified,
      rating: dto.rating || 0,
      reviewCount: dto.reviews || 0,
      distanceKm: dto.distanceKm,
      specialties: dto.specialties || [],
      priceFromCents: dto.priceFromCents,
      isAvailable: !!dto.available,
    };
  },

  toDomainProfile(dto: ProviderProfileDTO): IBraider {
    const base = this.toDomain(dto);
    return {
      ...base,
      bio: dto.bio || '',
      address: dto.address,
      coverImage: dto.coverImage || dto.imageUrl,
      profileImage: dto.profileImage || dto.imageUrl,
      languages: dto.languages || [],
      // Mock data injection for UI elements not yet in backend
      badges: ['Salon', 'Mobil verfügbar', dto.verified ? 'Verifiziert' : ''].filter(Boolean),
      stats: [
        { label: 'Termine', value: '234' }, // Mock
        { label: 'Jahre', value: '3' },     // Mock
        { label: 'Response', value: '< 1 Std.' }, // Mock
        { label: 'Empfehlung', value: '98%' },   // Mock
      ],
      hours: [
        { day: 'Montag', hours: '09:00 - 18:00' },
        { day: 'Dienstag', hours: '09:00 - 18:00' },
        { day: 'Mittwoch', hours: '09:00 - 18:00' },
        { day: 'Donnerstag', hours: '09:00 - 20:00' },
        { day: 'Freitag', hours: '09:00 - 20:00' },
        { day: 'Samstag', hours: '10:00 - 16:00' },
        { day: 'Sonntag', hours: 'Geschlossen' },
      ], // Mock
      services: [
        {
            category: 'Box Braids',
            items: [
            {
                name: 'Classic Box Braids',
                duration: '3-4 Std.',
                price: '€45 - €65',
                description: 'Traditionelle Box Braids in verschiedenen Größen',
            },
            ],
        },
      ], // Mock
      portfolioImages: [
        'https://images.unsplash.com/photo-1733532915163-02915638c793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
        'https://images.unsplash.com/photo-1718931202052-2996aac5ed85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
      ], // Mock
      reviews: [
          {
            id: 1,
            name: 'Sarah M.',
            rating: 5,
            date: 'vor 2 Wochen',
            text: 'Fantastisch! Meine Box Braids sehen perfekt aus.',
            verified: true,
            style: 'Box Braids',
          },
      ], // Mock
    };
  }
};
