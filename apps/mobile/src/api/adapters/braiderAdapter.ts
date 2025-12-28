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

  toDomainProfile(dto: any): IBraider {
    const base = this.toDomain(dto);
    const profile = dto.profile || {};

    // Map services if they exist in the profile
    // Backend returns flat services list with ID
    const rawServices = profile.services || [];

    // Group services by category if possible, or put them in a "General" category
    // Since backend "listForProvider" grouped them by category (maybe?), but here we get a flat list?
    // ProvidersController.getPublicProfileById -> profile.services: (provider.services || []).map...
    // These are IBraiderService (flat).
    // Domain expects IBraiderServiceCategory[].

    const services: any[] = [];
    if (rawServices.length > 0) {
      services.push({
        category: 'Alle Services',
        items: rawServices.map((s: any) => ({
          id: s.id,
          name: s.name,
          duration: s.durationMinutes ? `${s.durationMinutes} Min.` : '60 Min.',
          price: s.priceCents ? `€${(s.priceCents / 100).toFixed(2)}` : 'Preise auf Anfrage',
          description: s.description || '',
        }))
      });
    }

    return {
      ...base,
      bio: profile.bio || '',
      address: dto.address, // Address might be at top level in some DTOs, or in profile?
      // Controller: address not explicitly top level in getPublicProfileById return?
      // Actually it returns 'business', 'name', etc.
      // Let's assume address is not critical or is handled by base if 'business' serves as location
      coverImage: dto.imageUrl || dto.coverImage, // Cover image
      profileImage: profile.profilePictureUrl || dto.imageUrl, // Handle nested if needed
      languages: profile.languages || dto.languages || [],

      // Use real data from backend, fallback to empty arrays if missing (prevents crash, but relies on backend data)
      badges: dto.badges || [],
      stats: dto.stats || [],

      hours: (profile.availability || []).map((a: any) => ({
        day: a.weekday,
        hours: `${a.start} - ${a.end}`
      })),

      services: services, // Real services

      portfolioImages: dto.portfolio || [], // Real portfolio images

      reviews: (dto.recentReviews || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        rating: r.rating,
        date: r.date ? new Date(r.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '',
        text: r.text,
        verified: true,
        style: r.style || 'Allgemein',
      })),
    };
  }
};
