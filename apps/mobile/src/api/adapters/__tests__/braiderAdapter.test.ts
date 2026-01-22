import { BraiderAdapter } from '../braiderAdapter';
import { DEFAULT_R2_URL } from '@/utils/url';

describe('BraiderAdapter', () => {
  describe('toDomain', () => {
    it('normalizes relative imageUrl', () => {
      const dto = {
        id: '1',
        name: 'Test',
        imageUrl: '/providers/1/avatar.jpg'
      };

      const domain = BraiderAdapter.toDomain(dto as any);
      expect(domain.imageUrl).toBe(`${DEFAULT_R2_URL}/providers/1/avatar.jpg`);
    });

    it('keeps absolute imageUrl', () => {
      const dto = {
        id: '1',
        name: 'Test',
        imageUrl: 'https://example.com/avatar.jpg'
      };

      const domain = BraiderAdapter.toDomain(dto as any);
      expect(domain.imageUrl).toBe('https://example.com/avatar.jpg');
    });
  });

  describe('toDomainProfile', () => {
    it('normalizes profile and cover images', () => {
      const dto = {
        id: '1',
        name: 'Test',
        imageUrl: '/cover.jpg',
        profile: {
          profilePictureUrl: '/profile.jpg'
        }
      };

      const domain = BraiderAdapter.toDomainProfile(dto);
      expect(domain.coverImage).toBe(`${DEFAULT_R2_URL}/cover.jpg`);
      expect(domain.profileImage).toBe(`${DEFAULT_R2_URL}/profile.jpg`);
    });

    it('normalizes portfolio images', () => {
      const dto = {
        id: '1',
        name: 'Test',
        portfolio: ['/p1.jpg', 'https://full.com/p2.jpg']
      };

      const domain = BraiderAdapter.toDomainProfile(dto);
      expect(domain.portfolioImages).toEqual([
        `${DEFAULT_R2_URL}/p1.jpg`,
        'https://full.com/p2.jpg'
      ]);
    });
  });
});