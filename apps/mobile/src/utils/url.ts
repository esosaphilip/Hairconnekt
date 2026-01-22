
// Constants
export const DEFAULT_R2_URL = 'https://pub-08fbbd44374741679ded7c08d0adad27.r2.dev';

// Helper to determine if running in emulator/simulator vs physical device
// For now, we rely on the implementation ensuring full URLs are returned by backend
// or we prepend the Production R2 URL as a safe fallback for "relative" paths 
// that might be coming from legacy data.

/**
 * Normalizes an image URL to ensure it is absolute and renderable.
 * - If null/undefined -> returns undefined
 * - If already absolute (http/https) -> returns as is
 * - If relative -> prepends the confirmed R2 Public Base URL
 */
export function normalizeUrl(url?: string | null): string | undefined {
  if (!url) return undefined;

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Clean leading slash
  const cleanPath = url.startsWith('/') ? url.slice(1) : url;

  return `${DEFAULT_R2_URL}/${cleanPath}`;
}