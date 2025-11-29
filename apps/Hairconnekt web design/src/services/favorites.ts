import { api } from './http';

export type FavoriteItem = {
  id: string;
  providerId: string;
  name: string;
  business: string | null;
  image?: string;
  createdAt: string;
};

export type FavoritesListResponse = {
  results: FavoriteItem[];
};

export async function listFavorites() {
  return api.get<FavoritesListResponse>('/favorites');
}

export async function addFavorite(providerId: string) {
  return api.post<{ id: string; providerId: string }>('/favorites', { providerId });
}

export async function removeFavorite(providerId: string) {
  return api.delete<{ removed: boolean }>(`/favorites/${providerId}`);
}

export async function favoriteStatus(providerIds: string[]) {
  const query = providerIds.length ? { providerIds: providerIds.join(',') } : undefined;
  return api.get<{ favorites: string[] }>(`/favorites/status`, query);
}