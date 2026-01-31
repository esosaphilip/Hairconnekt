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

export function normalizeUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;

  // Handle absolute URLs and local file URIs
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('file://')) {
    return url;
  }

  // Detect legacy local "uploads/" paths
  if (url.includes('uploads/')) {
    const key = stripUploadsPrefix(url);
    // Ensure no double slashes if key starts with /
    const cleanKey = key.startsWith('/') ? key.slice(1) : key;
    return `${DEFAULT_R2_URL}/${cleanKey}`;
  }

  // Handle relative R2 paths (no leading slash logic needed mostly, but for safety)
  // If it *starts* with a slash but is NOT an API route (unlikely for images unless local), treat as R2 key?
  // Actually, backend might send `/providers/123.jpg`.
  // R2 keys usually don't have leading slash.

  // Check if it looks like an API Key (no slash at start) vs a local path
  const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
  return `${DEFAULT_R2_URL}/${cleanUrl}`;
}
