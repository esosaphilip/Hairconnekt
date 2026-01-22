import { normalizeUrl, DEFAULT_R2_URL } from '../url';

describe('normalizeUrl', () => {
  it('returns undefined for null or undefined', () => {
    expect(normalizeUrl(null)).toBeUndefined();
    expect(normalizeUrl(undefined)).toBeUndefined();
    expect(normalizeUrl('')).toBeUndefined();
  });

  it('returns the URL as-is if it is already absolute (http)', () => {
    const url = 'http://example.com/image.jpg';
    expect(normalizeUrl(url)).toBe(url);
  });

  it('returns the URL as-is if it is already absolute (https)', () => {
    const url = 'https://example.com/image.jpg';
    expect(normalizeUrl(url)).toBe(url);
  });

  it('prepends default R2 URL if the path is relative', () => {
    const path = 'providers/123/avatar.jpg';
    expect(normalizeUrl(path)).toBe(`${DEFAULT_R2_URL}/${path}`);
  });

  it('prepends default R2 URL and handles leading slash', () => {
    const path = '/providers/123/avatar.jpg';
    expect(normalizeUrl(path)).toBe(`${DEFAULT_R2_URL}/providers/123/avatar.jpg`);
  });
});