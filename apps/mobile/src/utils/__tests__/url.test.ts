import { normalizeUrl, DEFAULT_R2_URL } from '../url';
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

  it('prefixes local paths with BASE_URL', () => {
    const localPath = '/uploads/image.jpg';
    // Expect: http://192.168.1.10:3000/uploads/image.jpg
    expect(normalizeUrl(localPath)).toBe('http://192.168.1.10:3000/uploads/image.jpg');
  });

  it('prefixes relative paths with DEFAULT_R2_URL', () => {
    const r2Key = 'providers/123/image.jpg';
    // Expect: https://pub-.../providers/123/image.jpg
    expect(normalizeUrl(r2Key)).toBe(`${DEFAULT_R2_URL}/${r2Key}`);
  });
});
