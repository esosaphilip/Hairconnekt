import { BraiderAdapter } from '../braiderAdapter';
import { normalizeUrl } from '@/utils/url';

jest.mock('@/utils/url', () => ({
  normalizeUrl: jest.fn((url) => url ? `NORMALIZED_${url}` : undefined),
}));

describe('BraiderAdapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('toDomain', () => {
    it('extracts imageUrl from imageUrl field', () => {
      const result = BraiderAdapter.toDomain({
        id: '1',
        name: 'Test',
        imageUrl: 'image.jpg',
      });
      expect(result.imageUrl).toBe('NORMALIZED_image.jpg');
    });

    it('extracts imageUrl from profilePictureUrl field', () => {
      const result = BraiderAdapter.toDomain({
        id: '1',
        name: 'Test',
        profilePictureUrl: 'profile.jpg',
      });
      expect(result.imageUrl).toBe('NORMALIZED_profile.jpg');
    });

    it('extracts imageUrl from profileImage field', () => {
      const result = BraiderAdapter.toDomain({
        id: '1',
        name: 'Test',
        profileImage: 'profile_img.jpg',
      });
      expect(result.imageUrl).toBe('NORMALIZED_profile_img.jpg');
    });

    it('extracts imageUrl from user.profilePictureUrl field', () => {
      const result = BraiderAdapter.toDomain({
        id: '1',
        name: 'Test',
        user: {
          profilePictureUrl: 'user_profile.jpg',
        },
      });
      expect(result.imageUrl).toBe('NORMALIZED_user_profile.jpg');
    });

    it('prioritizes imageUrl over other fields', () => {
      const result = BraiderAdapter.toDomain({
        id: '1',
        name: 'Test',
        imageUrl: 'priority.jpg',
        profilePictureUrl: 'ignored.jpg',
      });
      expect(result.imageUrl).toBe('NORMALIZED_priority.jpg');
    });
  });
});
