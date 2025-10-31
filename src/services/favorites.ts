import { http } from '../api/http';

// Minimal favorites service to satisfy imports and provide basic functionality
export async function addFavorite(providerId: string) {
  try {
    const res = await http.post('/favorites', { providerId });
    return res.data;
  } catch (err) {
    // Swallow errors for now to avoid breaking UI; surface via return value
    return { success: false };
  }
}

export async function removeFavorite(providerId: string) {
  try {
    const res = await http.delete(`/favorites/${providerId}`);
    return res.data;
  } catch (err) {
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
    } catch (err) {
      // Fallback: fetch the favorites list and intersect locally
      try {
        const listRes = await http.get('/favorites');
        const data = listRes.data;

        // Normalize { results: Array<{providerId: string, ...}> } to an array of provider IDs
        const allFavoriteIds: string[] = Array.isArray(data?.results)
          ? (data.results as any[])
              .map((x) => (x?.providerId ?? x?.id))
              .filter((v) => typeof v === 'string')
          : [];

        const requested = new Set(providerId);
        const intersection = allFavoriteIds.filter((id) => requested.has(id));
        return { favorites: intersection };
      } catch (fallbackErr) {
        return { favorites: [] };
      }
    }
  } else {
    // Single status: reuse the /favorites/status endpoint for consistency
    try {
      const res = await http.get('/favorites/status', { params: { providerIds: providerId } });
      const favorites = (res.data as { favorites: string[] })?.favorites ?? [];
      return { isFavorite: favorites.includes(providerId) };
    } catch (err) {
      // Fallback: fetch list and check membership
      try {
        const listRes = await http.get('/favorites');
        const data = listRes.data;
        const allFavoriteIds: string[] = Array.isArray(data?.results)
          ? (data.results as any[])
              .map((x) => (x?.providerId ?? x?.id))
              .filter((v) => typeof v === 'string')
          : [];
        return { isFavorite: allFavoriteIds.includes(providerId) };
      } catch (fallbackErr) {
        return { isFavorite: false };
      }
    }
  }
}