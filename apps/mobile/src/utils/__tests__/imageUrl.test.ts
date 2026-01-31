import { normalizeImageUrl, normalizeImageUrls } from '../imageUrl';
import { API_CONFIG } from '@/constants';

describe('imageUrl utility', () => {
    const baseUrl = API_CONFIG.BASE_URL || 'http://localhost:3000';

    describe('normalizeImageUrl', () => {
        it('returns undefined for undefined/null/empty', () => {
            expect(normalizeImageUrl(undefined)).toBeUndefined();
            expect(normalizeImageUrl(null)).toBeUndefined();
            // @ts-ignore
            expect(normalizeImageUrl('')).toBeUndefined();
        });

        it('preserves absolute URLs', () => {
            expect(normalizeImageUrl('https://example.com/img.jpg')).toBe('https://example.com/img.jpg');
            expect(normalizeImageUrl('http://example.com/img.jpg')).toBe('http://example.com/img.jpg');
        });

        it('prepends API URL to relative URLs starting with /', () => {
            expect(normalizeImageUrl('/uploads/img.jpg')).toBe('https://pub-54d0ff210bf448eebf0f240d376a9358.r2.dev/uploads/img.jpg');
        });

        it('prepends R2 URL to relative URLs without /', () => {
            expect(normalizeImageUrl('uploads/img.jpg')).toBe('https://pub-54d0ff210bf448eebf0f240d376a9358.r2.dev/uploads/img.jpg');
        });
    });

    describe('normalizeImageUrls', () => {
        it('filters out invalid urls', () => {
            const input = [
                'https://valid.com/1.jpg',
                'invalid',
                '/local.jpg',
                null,
                undefined,
                ''
            ];
            const output = normalizeImageUrls(input);
            expect(output).toEqual([
                'https://valid.com/1.jpg',
                'https://pub-54d0ff210bf448eebf0f240d376a9358.r2.dev/invalid',
                'https://api.hairconnekt.de/local.jpg'
            ]);
        });
    });
});
