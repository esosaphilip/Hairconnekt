import { normalizeUrl, DEFAULT_R2_URL } from '../../utils/url';

describe('normalizeUrl', () => {
  it('returns undefined for null/undefined', () => {
    expect(normalizeUrl(null)).toBeUndefined();
    expect(normalizeUrl(undefined)).toBeUndefined();
  });

  it('returns absolute URLs as is', () => {
    expect(normalizeUrl('https://example.com/img.jpg')).toBe('https://example.com/img.jpg');
    expect(normalizeUrl('http://example.com/img.jpg')).toBe('http://example.com/img.jpg');
  });

  it('prepends R2 URL to relative paths', () => {
    expect(normalizeUrl('/path/to/img.jpg')).toBe(`${DEFAULT_R2_URL}/path/to/img.jpg`);
    expect(normalizeUrl('path/to/img.jpg')).toBe(`${DEFAULT_R2_URL}/path/to/img.jpg`);
  });
});
