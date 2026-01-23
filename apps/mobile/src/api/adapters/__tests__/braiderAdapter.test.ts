import { BraiderAdapter } from '../braiderAdapter';
import { API_CONFIG } from '@/constants';

describe('BraiderAdapter', () => {
  describe('toDomain', () => {
    it('normalizes relative imageUrl', () => {
      const dto = {
        id: '1',
        name: 'Test',
        imageUrl: '/providers/1/avatar.jpg'
      };

      const domain = BraiderAdapter.toDomain(dto as any);
      const baseUrl = API_CONFIG.BASE_URL || 'http://localhost:3000';
      expect(domain.imageUrl).toBe(`${baseUrl}/providers/1/avatar.jpg`);
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
      const baseUrl = API_CONFIG.BASE_URL || 'http://localhost:3000';
      expect(domain.coverImage).toBe(`${baseUrl}/cover.jpg`);
      expect(domain.profileImage).toBe(`${baseUrl}/profile.jpg`);
    });

    it('normalizes portfolio images', () => {
      const dto = {
        id: '1',
        name: 'Test',
        portfolio: ['/p1.jpg', 'https://full.com/p2.jpg']
      };

      const domain = BraiderAdapter.toDomainProfile(dto);
      const baseUrl = API_CONFIG.BASE_URL || 'http://localhost:3000';
      expect(domain.portfolioImages).toEqual([
        `${baseUrl}/p1.jpg`,
        'https://full.com/p2.jpg'
      ]);
    });
  });
});