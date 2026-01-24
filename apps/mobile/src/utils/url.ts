import { API_CONFIG } from '@/constants';

export const DEFAULT_R2_URL = 'https://pub-08fbbd44374741679ded7c08d0adad27.r2.dev';

export function normalizeUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  
  // Handle absolute URLs
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Handle local/backend paths (starting with /)
  if (url.startsWith('/')) {
    const baseUrl = API_CONFIG.BASE_URL || 'http://localhost:3000';
    // Remove trailing slash from base if present (though BASE_URL usually doesn't have it)
    const cleanBase = baseUrl.replace(/\/$/, '');
    return `${cleanBase}${url}`;
  }

  // Handle relative paths without leading slash (assume R2 key or relative to R2)
  return `${DEFAULT_R2_URL}/${url}`;
}
