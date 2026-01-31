import { BASE_URL } from '../config';

export const DEFAULT_R2_URL = 'https://pub-54d0ff210bf448eebf0f240d376a9358.r2.dev';

/**
 * Strips legacy "uploads/bucketName/" prefixes to make paths R2-compatible
 */
function stripUploadsPrefix(url: string): string {
  const match = url.match(/^(?:\/)?uploads\/[^/]+\/(.+)$/);
  if (match && match[1]) {
    return match[1];
  }
  return url;
}

/**
 * Unified image URL normalization
 * Handles:
 * 1. Absolute URLs (http/https/file) -> Return as is
 * 2. Legacy "uploads/" paths -> Strip prefix and point to R2
 * 3. Relative paths starting with "/" -> Prepend API Base URL (for local assets served by API)
 * 4. Simple keys (e.g. "providers/123.jpg") -> Point to R2
 */
export function normalizeUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;

  // 1. Handle absolute URLs and local file URIs
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('file://')) {
    return url;
  }

  // 2. Detect legacy local "uploads/" paths -> Migrate to R2
  if (url.includes('uploads/')) {
    const key = stripUploadsPrefix(url);
    const cleanKey = key.startsWith('/') ? key.slice(1) : key;
    return `${DEFAULT_R2_URL}/${cleanKey}`;
  }

  // 3. Handle backend-served assets (must start with /)
  // This logic was previously in imageUrl.ts
  if (url.startsWith('/')) {
    const cleanBase = BASE_URL.replace(/\/$/, '');
    return `${cleanBase}${url}`;
  }

  // 4. Default: Treat as R2 object key
  const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
  return `${DEFAULT_R2_URL}/${cleanUrl}`;
}

/**
 * Helper for arrays of URLs
 */
export function normalizeUrlList(urls: (string | null | undefined)[]): string[] {
  return urls
    .map(normalizeUrl)
    .filter((url): url is string => !!url);
}
