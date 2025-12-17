import { IClient, IClientStats } from '../../domain/models/client';

interface ClientDTO {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string; // Fallback
  avatar?: string;
  profilePictureUrl?: string; // Standardized field
  image?: string; // Fallback
  phone?: string;
  contactInfo?: { phone?: string }; // Nested structure often used
  email?: string;
  isVIP?: boolean;
  stats?: {
    totalAppointments?: number;
    totalSpent?: number; // Usually in EUR or Cents? Let's assume EUR based on current code dividing by 100 later, or Cents directly?
    // Looking at ClientDetailScreen: totalSpentCents: Math.round(Number(detail?.stats?.totalSpent || 0) * 100)
    // This implies the API returns EUR (float).
    lastVisit?: string;
  };
  // Flattened properties often returned by list endpoints
  appointments?: number;
  totalSpentCents?: number;
  lastVisitIso?: string;
}

export const ClientAdapter = {
  toDomain(dto: ClientDTO): IClient {
    const name = [dto.firstName, dto.lastName].filter(Boolean).join(' ') || dto.name || 'Unbekannt';
    const image = dto.profilePictureUrl || dto.avatar || dto.image;
    const phone = dto.contactInfo?.phone || dto.phone;
    
    // Normalize stats
    // Ideally API should return consistently.
    // List endpoint returns flattened: appointments, totalSpentCents
    // Detail endpoint returns nested: stats.totalAppointments, stats.totalSpent (EUR)
    
    let appointments = 0;
    let totalSpentCents = 0;
    let lastVisitIso: string | undefined = undefined;

    if (dto.stats) {
      appointments = Number(dto.stats.totalAppointments || 0);
      // Assuming detail endpoint returns EUR, convert to cents
      totalSpentCents = Math.round(Number(dto.stats.totalSpent || 0) * 100);
      lastVisitIso = dto.stats.lastVisit;
    } else {
      appointments = Number(dto.appointments || 0);
      totalSpentCents = Number(dto.totalSpentCents || 0);
      lastVisitIso = dto.lastVisitIso;
    }

    // Helper for relative time (simplified for now)
    const formatRelativeGerman = (iso?: string) => {
        if (!iso) return '';
        try {
            const date = new Date(iso);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            if (diffDays < 1) return 'gerade eben';
            return `vor ${diffDays} Tagen`;
        } catch { return ''; }
    };

    const stats: IClientStats = {
      appointments,
      totalSpentCents,
      lastVisitIso,
      lastVisitRelative: formatRelativeGerman(lastVisitIso),
    };

    return {
      id: String(dto.id),
      name,
      image,
      phone,
      email: dto.email,
      isVIP: !!dto.isVIP,
      stats,
      // Shortcuts for list views
      appointments: stats.appointments,
      totalSpentCents: stats.totalSpentCents,
      lastVisitIso: stats.lastVisitIso,
    };
  }
};
