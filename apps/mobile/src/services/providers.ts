import { http } from '../api/http';

// Shared summary type for provider list/search cards
export type ProviderSummary = {
  id: string;
  name: string;
  business?: string | null;
  imageUrl?: string | null;
  verified?: boolean;
  rating?: number | null;
  reviews?: number | null;
  distanceKm?: number | null;
  specialties?: string[];
  priceFromCents?: number | null;
  priceLabel?: string | null; // e.g., "ab €50" when cents not available
  available?: boolean | null;
};

// Helper: normalize possibly heterogeneous backend payloads into ProviderSummary
function normalizeProvider(input: Record<string, unknown>): ProviderSummary {
  const distanceKm = (() => {
    const dVal = (input['distance'] ?? input['distanceKm']) as unknown;
    if (typeof dVal === 'number') return dVal;
    if (typeof dVal === 'string') {
      const match = dVal.match(/([0-9]+(?:\.[0-9]+)?)\s*km/i);
      return match ? parseFloat(match[1]) : null;
    }
    return null;
  })();

  const priceFromCents = (() => {
    const cents = input['priceFromCents'] as unknown;
    return typeof cents === 'number' ? cents : null;
  })();

  const imageUrlRaw = (input['imageUrl'] ?? input['image']) as unknown;
  const imageUrl = typeof imageUrlRaw === 'string' ? imageUrlRaw : null;
  const priceLabelRaw = input['price'] as unknown;
  const priceLabel = typeof priceLabelRaw === 'string' ? priceLabelRaw : null;

  const idRaw = (input['id'] ?? input['_id']) as unknown;
  const nameRaw = input['name'] as unknown;
  const businessRaw = (input['business'] ?? input['businessName']) as unknown;
  const verifiedRaw = input['verified'] as unknown;
  const ratingRaw = input['rating'] as unknown;
  const reviewsRaw = input['reviews'] as unknown;
  const specialtiesRaw = input['specialties'] as unknown;
  const availableRaw = input['available'] as unknown;

  return {
    id: String(idRaw ?? ''),
    name: typeof nameRaw === 'string' ? nameRaw : '',
    business: typeof businessRaw === 'string' ? businessRaw : null,
    imageUrl,
    verified: !!verifiedRaw,
    rating: typeof ratingRaw === 'number' ? ratingRaw : null,
    reviews: typeof reviewsRaw === 'number' ? reviewsRaw : null,
    distanceKm,
    specialties: Array.isArray(specialtiesRaw) ? (specialtiesRaw as string[]) : [],
    priceFromCents,
    priceLabel,
    available: typeof availableRaw === 'boolean' ? availableRaw : null,
  };
}

// Helper to ensure valid ISO 8601 date strings
function toIsoString(d: any): string {
  if (!d) return new Date().toISOString();
  if (d instanceof Date) return d.toISOString();
  // If it's already a string, try to parse it to check validity, otherwise return as is or current date
  const parsed = new Date(d);
  if (!isNaN(parsed.getTime())) return parsed.toISOString();
  return new Date().toISOString();
}

export const providersApi = {
  async nearby(params: { lat: number; lon: number; radiusKm?: number; limit?: number }): Promise<ProviderSummary[]> {
    const { lat, lon, radiusKm = 25, limit = 10 } = params;
    const res = await http.get('/providers/nearby', { params: { lat, lon, radiusKm, limit } });
    const items = res?.data?.items ?? res?.data?.results ?? res?.data ?? [];
    return (Array.isArray(items) ? items : []).map(normalizeProvider);
  },

  async search(
    term: string,
    filters: { category?: string; sortBy?: string; providerTypes?: string[]; priceRanges?: number[]; rating?: number } = {},
  ): Promise<ProviderSummary[]> {
    const res = await http.get('/providers/search', { params: { term, ...filters } });
    return res.data as ProviderSummary[];
  },

  async getMyProfile(): Promise<unknown> {
    const res = await http.get('/providers/me');
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },

  async updateProfile(body: any): Promise<any> {
    const res = await http.patch('/providers/me', body);
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },

  async getDashboard(): Promise<unknown> {
    const res = await http.get('/providers/dashboard');
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },

  async getVerificationStatus(): Promise<{ status: string; submittedAt?: string; reviewedAt?: string; rejectionReason?: string; requiredActions?: string[] } | null> {
    const res = await http.get('/providers/me/verification-status');
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data ?? null;
    }
    return (payload as any) ?? null;
  },

  async setOnlineStatus(isOnline: boolean): Promise<{ isOnline: boolean; message?: string }> {
    const res = await http.patch('/providers/me/online-status', { isOnline });
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data ?? { isOnline };
    }
    return (payload as any) ?? { isOnline };
  },

  async getCalendar(params: { startDate: string; endDate: string; view?: 'day' | 'week' | 'month' }): Promise<any> {
    const res = await http.get('/providers/calendar', { params });
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data ?? { appointments: [], blockedSlots: [], availableSlots: [] };
    }
    return (payload as any) ?? { appointments: [], blockedSlots: [], availableSlots: [] };
  },

  async createProviderAppointment(body: {
    clientId?: string;
    newClient?: { name: string; phone: string; email?: string };
    serviceIds: string[];
    startTime: string;
    endTime: string;
    notes?: string;
  }): Promise<{ appointmentId: string; message?: string; clientNotified?: boolean }> {
    const payload = {
      ...body,
      startTime: toIsoString(body.startTime),
      endTime: toIsoString(body.endTime),
    };
    const res = await http.post('/appointments/provider-create', payload);
    const data = res?.data;
    if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
      return (data as any).data ?? { appointmentId: '' };
    }
    return (data as any) ?? { appointmentId: '' };
  },


  async blockTimeCreate(body: any): Promise<{ blockId: string; message?: string }> {
    // Pass through body but ensure dates are ISO strings if needed
    // The checking logic in BlockTimeScreen seems robust for dates.
    // We'll trust the caller (Screen) to format largely, but we can ensure basic fields.
    const payload = {
      ...body,
      startDate: toIsoString(body.startDate),
      endDate: body.endDate ? toIsoString(body.endDate) : toIsoString(body.startDate),
      startTime: body.allDay ? undefined : body.startTime,
      endTime: body.allDay ? undefined : body.endTime,
    };

    // Endpoint: POST /providers/me/calendar/blocks
    const res = await http.post('/providers/me/calendar/blocks', payload);
    const data = res?.data;
    if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
      return (data as any).data ?? { blockId: '' };
    }
    return (data as any) ?? { blockId: '' };
  },

  async blockTimeUpdate(id: string, body: any): Promise<{ blockId: string; message?: string }> {
    const payload = {
      ...body,
      startDate: toIsoString(body.startDate),
      endDate: body.endDate ? toIsoString(body.endDate) : toIsoString(body.startDate),
      startTime: body.allDay ? undefined : body.startTime,
      endTime: body.allDay ? undefined : body.endTime,
    };
    // Endpoint: PATCH /providers/me/calendar/blocks/:id
    const res = await http.patch(`/providers/me/calendar/blocks/${id}`, payload);
    const data = res?.data;
    if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
      return (data as any).data ?? { blockId: id };
    }
    return (data as any) ?? { blockId: id };
  },

  async blockTimeDelete(id: string): Promise<{ message?: string }> {
    // Endpoint: DELETE /providers/me/calendar/blocks/:id
    const res = await http.delete(`/providers/me/calendar/blocks/${id}`);
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload) {
      return { message: (payload as any)?.message };
    }
    return (payload as any) ?? {};
  },

  async getAvailabilitySettings(): Promise<any> {
    const res = await http.get('/providers/me/availability-settings');
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data ?? null;
    }
    return (payload as any) ?? null;
  },

  async updateAvailabilitySettings(body: any): Promise<{ message?: string }> {
    // Endpoint: PUT /providers/me/availability
    const res = await http.put('/providers/me/availability', body);
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data ?? {};
    }
    return (payload as any) ?? {};
  },
  return(payload as any) ?? {};
  },

  async updateAddress(body: { street: string; houseNumber: string; postalCode: string; city: string; state: string; showOnMap?: boolean }): Promise < any > {
  const res = await http.put('/providers/me/address', body);
  const payload = res?.data;
  if(payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
  return (payload as any).data;
}
return payload;
  },
};
