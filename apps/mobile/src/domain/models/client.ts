export interface IClientStats {
  appointments: number;
  totalSpentCents: number;
  lastVisitIso?: string;
  lastVisitRelative?: string; // "vor 3 Tagen"
}

export interface IClient {
  id: string;
  name: string;
  image?: string;
  phone?: string;
  email?: string;
  isVIP: boolean;
  stats: IClientStats;
  // Details often needed in list views
  appointments: number; // Shortcut to stats.appointments
  totalSpentCents: number; // Shortcut to stats.totalSpentCents
  lastVisitIso?: string; // Shortcut to stats.lastVisitIso
}
