import { API_CONFIG } from '@/constants';

/**
 * Normalizes image URLs to handle both R2 and local storage paths
 * - Converts relative paths to absolute URLs
 * - Handles already-absolute URLs
 * - Ensures consistent protocol (https)
 */
export function normalizeImageUrl(url: string | null | undefined): string | undefined {
    if (!url) return undefined;

    // Already a complete URL with protocol
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    // Relative path - prepend API base URL
    if (url.startsWith('/')) {
        const baseUrl = API_CONFIG.BASE_URL;
        return `${baseUrl}${url}`;
    }

    // Assume it's a path without leading slash
    const baseUrl = API_CONFIG.BASE_URL;
    return `${baseUrl}/${url}`;
}

/**
 * Normalizes multiple image URLs (for arrays)
 */
export function normalizeImageUrls(urls: (string | null | undefined)[]): (string | undefined)[] {
    return urls.map(normalizeImageUrl).filter((url): url is string => url !== undefined);
}
