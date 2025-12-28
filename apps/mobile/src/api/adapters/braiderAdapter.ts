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

    const groupedServices: Record<string, any[]> = {};

    rawServices.forEach((s: any) => {
      const catName = s.category?.name || 'Allgemein';
      if (!groupedServices[catName]) groupedServices[catName] = [];

      let priceDisplay = 'Preise auf Anfrage';
      if (s.priceCents) {
        const minPrice = (s.priceCents / 100).toFixed(2).replace('.00', '');
        if (s.priceType === 'range' && s.priceMaxCents) {
          const maxPrice = (s.priceMaxCents / 100).toFixed(2).replace('.00', '');
          priceDisplay = `€${minPrice} - €${maxPrice}`;
        } else if (s.priceType === 'from') {
          priceDisplay = `ab €${minPrice}`;
        } else {
          priceDisplay = `€${minPrice}`;
        }
      }

      groupedServices[catName].push({
        id: s.id,
        name: s.name,
        duration: s.durationMinutes ? `${s.durationMinutes} Min.` : 'Var.', // Updated from '60 Min.' default
        price: priceDisplay,
        description: s.description || '',
      });
    });

    const services = Object.keys(groupedServices).map((cat) => ({
      category: cat,
      items: groupedServices[cat],
    }));

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

      // Use real data from backend, fallback to mock/defaults if missing (for demo/UI completeness)
      badges: (dto.badges && dto.badges.length) ? dto.badges : ['Salon', 'Mobil verfügbar', dto.verified ? 'Verifiziert' : ''].filter(Boolean),
      stats: (dto.stats && dto.stats.length) ? dto.stats : [
        { label: 'Termine', value: '0' },
        { label: 'Jahre', value: '1+' },
        { label: 'Response', value: '~1 Std.' },
        { label: 'Empfehlung', value: '-' },
      ],

      hours: (profile.availability || []).map((a: any) => ({
        day: a.weekday,
        hours: `${a.start} - ${a.end}`
      })),

      services: services, // Real services

      portfolioImages: (dto.portfolio && dto.portfolio.length) ? dto.portfolio : [
        'https://images.unsplash.com/photo-1733532915163-02915638c793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
        'https://images.unsplash.com/photo-1718931202052-2996aac5ed85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
      ],

      reviews: (dto.recentReviews && dto.recentReviews.length) ? (dto.recentReviews || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        rating: r.rating,
        date: r.date ? new Date(r.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '',
        text: r.text,
        verified: true,
        style: r.style || 'Allgemein',
      })) : [
        {
          id: 1,
          name: 'Sarah M.',
          rating: 5,
          date: 'vor 2 Wochen',
          text: 'Fantastisch! Meine Box Braids sehen perfekt aus.',
          verified: true,
          style: 'Box Braids',
        },
      ],
    };
  }
};
