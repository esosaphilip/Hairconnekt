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

  it('prepends Base URL to paths starting with /', () => {
    // In test env, BASE_URL might be undefined or mocked, typically defaults to http://localhost:3000 in the util if missing
    const expectedBase = 'http://localhost:3000'; 
    expect(normalizeUrl('/path/to/img.jpg')).toBe(`${expectedBase}/path/to/img.jpg`);
  });

  it('prepends R2 URL to relative paths without leading slash', () => {
    expect(normalizeUrl('path/to/img.jpg')).toBe(`${DEFAULT_R2_URL}/path/to/img.jpg`);
  });
});
