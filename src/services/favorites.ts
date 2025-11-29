import { http } from '../api/http';

// Minimal favorites service to satisfy imports and provide basic functionality
export async function listFavorites() {
  try {
    const res = await http.get('/favorites');
    return res.data;
  } catch {
    return { results: [] };
  }
}

export async function addFavorite(providerId: string) {
  try {
    const res = await http.post('/favorites', { providerId });
    return res.data;
  } catch {
    // Swallow errors for now to avoid breaking UI; surface via return value
    return { success: false };
  }
}

export async function removeFavorite(providerId: string) {
  try {
    const res = await http.delete(`/favorites/${providerId}`);
    return res.data;
  } catch {
    return { success: false };
  }
}

// Overloads for better type inference in callers
export async function favoriteStatus(providerId: string[]): Promise<{ favorites: string[] }>;
export async function favoriteStatus(providerId: string): Promise<{ isFavorite: boolean }>;
export async function favoriteStatus(providerId: string | string[]) {
  if (Array.isArray(providerId)) {
    // Batch status query using backend's expected CSV param 'providerIds'
    try {
      const res = await http.get('/favorites/status', { params: { providerIds: providerId.join(',') } });
      return res.data as { favorites: string[] };
    } catch {
      // Fallback: fetch the favorites list and intersect locally
      try {
        const listRes = await http.get('/favorites');
        const data = listRes.data;

        // Normalize { results: Array<{providerId: string, ...}> } to an array of provider IDs
        const allFavoriteIds: string[] = Array.isArray(data?.results)
          ? (data.results as unknown[])
              .map((x) => {
                const obj = x as Record<string, unknown>;
                const v = (obj['providerId'] ?? obj['id']) as unknown;
                return typeof v === 'string' ? v : undefined;
              })
              .filter((v): v is string => typeof v === 'string')
          : [];

        const requested = new Set(providerId);
        const intersection = allFavoriteIds.filter((id) => requested.has(id));
        return { favorites: intersection };
      } catch {
        return { favorites: [] };
      }
    }
  } else {
    // Single status: reuse the /favorites/status endpoint for consistency
    try {
      const res = await http.get('/favorites/status', { params: { providerIds: providerId } });
      const favorites = (res.data as { favorites: string[] })?.favorites ?? [];
      return { isFavorite: favorites.includes(providerId) };
    } catch {
      // Fallback: fetch list and check membership
      try {
        const listRes = await http.get('/favorites');
        const data = listRes.data;
        const allFavoriteIds: string[] = Array.isArray(data?.results)
          ? (data.results as unknown[])
              .map((x) => {
                const obj = x as Record<string, unknown>;
                const v = (obj['providerId'] ?? obj['id']) as unknown;
                return typeof v === 'string' ? v : undefined;
              })
              .filter((v): v is string => typeof v === 'string')
          : [];
        return { isFavorite: allFavoriteIds.includes(providerId) };
      } catch {
        return { isFavorite: false };
      }
    }
  }
}
