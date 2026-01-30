import { BASE_URL } from '../config';

export const DEFAULT_R2_URL = 'https://pub-54d0ff210bf448eebf0f240d376a9358.r2.dev';

/**
 * Strips legacy "uploads/bucketName/" prefixes to make paths R2-compatible
 * Example: "uploads/hairconnekt-images/providers/123.jpg" -> "providers/123.jpg"
 */
function stripUploadsPrefix(url: string): string {
  // Regex to match "uploads/" followed by a bucket name segment (non-slashes)
  // and then the rest.
  // backend/src/modules/storage/r2.service.ts uses "uploads/{bucket}/{key}"
  const match = url.match(/^(?:\/)?uploads\/[^/]+\/(.+)$/);
  if (match && match[1]) {
    return match[1];
  }
  // Also handle simple providers/ case if no bucket in path (legacy-legacy?)
  return url;
}

export function normalizeUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;

  // Handle absolute URLs
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Detect legacy local upload paths (from R2Service fallback)
  // These look like "/uploads/hairconnekt-images/..." or "uploads/hairconnekt-images/..."
  if (url.includes('uploads/')) {
    // If we migrated them, they are now at the root of the bucket (key).
    // So we strip the prefix and append to R2 URL.
    const key = stripUploadsPrefix(url);
    return `${DEFAULT_R2_URL}/${key}`;
  }

  // Handle local/backend paths (starting with /) that are NOT uploads
  if (url.startsWith('/')) {
    // Remove trailing slash from base if present
    const cleanBase = BASE_URL.replace(/\/$/, '');
    return `${cleanBase}${url}`;
  }

  // Handle relative paths without leading slash (assume R2 key)
  return `${DEFAULT_R2_URL}/${url}`;
}
