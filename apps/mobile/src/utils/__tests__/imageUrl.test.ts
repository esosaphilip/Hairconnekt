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

        it('prepends API path to relative URLs starting with /', () => {
            expect(normalizeImageUrl('/uploads/img.jpg')).toBe(`${baseUrl}/uploads/img.jpg`);
        });

        it('prepends API path to relative URLs without /', () => {
            expect(normalizeImageUrl('uploads/img.jpg')).toBe(`${baseUrl}/uploads/img.jpg`);
        });
    });

    describe('normalizeImageUrls', () => {
        it('filters out invalid urls', () => {
            const input = [
                undefined,
                'https://valid.com/1.jpg',
                '/local.jpg',
                null
            ];
            const output = normalizeImageUrls(input);
            expect(output).toEqual([
                'https://valid.com/1.jpg',
                `${baseUrl}/local.jpg`
            ]);
        });
    });
});
