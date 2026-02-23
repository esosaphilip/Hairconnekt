import { normalizeUrl, DEFAULT_B2_URL } from '../url';
import { BASE_URL } from '../../config';

// Mock config module
jest.mock('../../config', () => ({
  BASE_URL: 'http://192.168.1.10:3000',
}));

describe('normalizeUrl', () => {
  it('returns undefined for null/undefined input', () => {
    expect(normalizeUrl(null)).toBeUndefined();
    expect(normalizeUrl(undefined)).toBeUndefined();
    expect(normalizeUrl('')).toBeUndefined();
  });

  it('returns absolute URLs as-is', () => {
    const httpsUrl = 'https://example.com/image.jpg';
    const httpUrl = 'http://example.com/image.jpg';
    expect(normalizeUrl(httpsUrl)).toBe(httpsUrl);
    expect(normalizeUrl(httpUrl)).toBe(httpUrl);
  });

  it('prefixes local paths with DEFAULT_B2_URL', () => {
    const localPath = '/uploads/image.jpg';
    // Expect B2 URL
    expect(normalizeUrl(localPath)).toBe('https://f003.backblazeb2.com/file/hairconnekt-images/uploads/image.jpg');
  });

  it('prefixes relative paths with DEFAULT_B2_URL', () => {
    const r2Key = 'providers/123/image.jpg';
    // Expect: DEFAULT_B2_URL/providers/123/image.jpg
    expect(normalizeUrl(r2Key)).toBe(`${DEFAULT_B2_URL}/${r2Key}`);
  });
});
