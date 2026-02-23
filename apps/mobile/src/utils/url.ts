import { BASE_URL } from '../config';

export const DEFAULT_B2_URL = 'https://f003.backblazeb2.com/file/hairconnekt-images';

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
 * 2. Legacy "uploads/" paths -> Strip prefix and point to R2/B2
 * 3. Relative paths starting with "/" -> Prepend API Base URL (for local assets served by API)
 * 4. Simple keys (e.g. "providers/123.jpg") -> Point to R2/B2
 */
export function normalizeUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;

  // 1. Handle absolute URLs, local file URIs, and Base64 data
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('file://') || url.startsWith('data:')) {
    // FIX: Replace legacy R2 domains with B2 domain
    if (url.includes('pub-08fbbd44374741679ded7c08d0adad27.r2.dev')) {
      return url.replace('https://pub-08fbbd44374741679ded7c08d0adad27.r2.dev', DEFAULT_B2_URL);
    }
    if (url.includes('pub-54d0ff210bf448eebf0f240d376a9358.r2.dev')) {
      return url.replace('https://pub-54d0ff210bf448eebf0f240d376a9358.r2.dev', DEFAULT_B2_URL);
    }
    return url;
  }

  // 2. Detect legacy local "uploads/" paths -> Migrate to B2
  // We strip "uploads/" or any leading slash to treat everything as an object key
  const cleanKey = url.replace(/^\/?(uploads\/[^/]+\/|\/)/, '');

  return `${DEFAULT_B2_URL}/${cleanKey}`;
}

/**
 * Helper for arrays of URLs
 */
export function normalizeUrlList(urls: (string | null | undefined)[]): string[] {
  return urls
    .map(normalizeUrl)
    .filter((url): url is string => !!url);
}
