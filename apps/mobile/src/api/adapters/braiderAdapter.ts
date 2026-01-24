import { IBraider } from '../../domain/models/braider';
import { normalizeUrl } from '@/utils/url';

// DTO for List/Search
interface NearbyProviderDTO {
  id: string;
  name: string;
  business?: string;
  imageUrl?: string;
  profilePictureUrl?: string;
  profileImage?: string;
  avatar?: string;
  avatarUrl?: string;
  // Snake case variants
  profile_picture_url?: string;
  profile_image?: string;
  image_url?: string;
  user?: {
    profilePictureUrl?: string;
    profile_picture_url?: string;
    avatarUrl?: string;
    avatar?: string;
  };
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
      imageUrl: normalizeUrl(
        dto.imageUrl || 
        dto.profilePictureUrl || 
        dto.profileImage || 
        dto.avatar || 
        dto.avatarUrl ||
        dto.profile_picture_url ||
        dto.profile_image ||
        dto.image_url ||
        dto.user?.profilePictureUrl ||
        dto.user?.profile_picture_url ||
        dto.user?.avatarUrl ||
        dto.user?.avatar
      ), // Normalized!
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
      coverImage: normalizeUrl(dto.imageUrl || dto.coverImage || dto.image_url), // Cover image
      profileImage: normalizeUrl(
        profile.user?.profilePictureUrl || 
        profile.profilePictureUrl || 
        dto.imageUrl || 
        dto.profilePictureUrl ||
        dto.profile_picture_url ||
        profile.user?.profile_picture_url ||
        dto.avatar ||
        dto.avatarUrl ||
        profile.user?.avatar ||
        profile.user?.avatarUrl
      ),
      languages: profile.languages || dto.languages || [],

      // Use real data from backend, fallback to mock/defaults if missing (for demo/UI completeness)
      // Use specialties from DB (Hair Styles) as the primary badges for "Spezialisierungen" section
      badges: (dto.specialties && dto.specialties.length) ? dto.specialties : (dto.badges || []),
      stats: (dto.stats && dto.stats.length) ? dto.stats : [
        { label: 'Termine', value: '0' },
        { label: 'Jahre', value: '1+' },
        { label: 'Response', value: '~1 Std.' },
        { label: 'Empfehlung', value: '-' },
      ],

      hours: (() => {
        const days = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
        
        const normalizeWeekday = (w: any): string | null => {
          if (typeof w === 'number') {
            // Backend uses 0=Monday (from ProvidersService.numberToWeekday)
            const mapBackend = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
            // If it falls in 0-6 range
            if (w >= 0 && w <= 6) {
               return mapBackend[w];
            }
            // Fallback for ISO 1-7 (1=Monday) just in case
            if (w === 7) return 'Sonntag'; 
            return null;
          }
          if (typeof w === 'string') {
             const lower = w.trim().toLowerCase();
             if (lower.startsWith('mon')) return 'Montag';
             if (lower.startsWith('tue') || lower.startsWith('die')) return 'Dienstag';
             if (lower.startsWith('wed') || lower.startsWith('mit')) return 'Mittwoch';
             if (lower.startsWith('thu') || lower.startsWith('don')) return 'Donnerstag';
             if (lower.startsWith('fri') || lower.startsWith('fre')) return 'Freitag';
             if (lower.startsWith('sat') || lower.startsWith('sam')) return 'Samstag';
             if (lower.startsWith('sun') || lower.startsWith('son')) return 'Sonntag';
          }
          return null;
        };

        const rawAvailability = profile.availability || dto.availability || [];
        const availabilityMap = rawAvailability.reduce((acc: any, curr: any) => {
          const germanDay = normalizeWeekday(curr.weekday);
          if (germanDay) {
             acc[germanDay] = `${curr.start} - ${curr.end}`;
          }
          return acc;
        }, {});

        return days.map(day => ({
          day,
          hours: availabilityMap[day] || 'Geschlossen'
        }));
      })(),

      services: services, // Real services

      portfolioImages: (dto.portfolio && dto.portfolio.length)
        ? dto.portfolio.map((img: string) => normalizeUrl(img)).filter((url: string | undefined): url is string => !!url)
        : [],

      reviews: (dto.recentReviews && dto.recentReviews.length) ? (dto.recentReviews || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        rating: r.rating,
        date: r.date ? new Date(r.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '',
        text: r.text,
        verified: true,
        style: r.style || 'Allgemein',
      })) : [],
    };
  }
};
