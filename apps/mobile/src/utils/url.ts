import { BASE_URL } from '../config';

export const DEFAULT_R2_URL = 'https://pub-08fbbd44374741679ded7c08d0adad27.r2.dev';

export function normalizeUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  
  // Handle absolute URLs
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Handle local/backend paths (starting with /)
  if (url.startsWith('/')) {
    // Remove trailing slash from base if present
    const cleanBase = BASE_URL.replace(/\/$/, '');
    return `${cleanBase}${url}`;
  }

  // Handle relative paths without leading slash (assume R2 key or relative to R2)
  return `${DEFAULT_R2_URL}/${url}`;
}
