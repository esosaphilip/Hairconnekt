import { Service, PriceType } from './service.entity';
import { ProviderProfile } from '../../providers/entities/provider-profile.entity';
import { BadRequestException } from '@nestjs/common';

describe('Service Entity', () => {
  let mockProvider: ProviderProfile;

  beforeEach(() => {
    mockProvider = { id: 'provider-1' } as ProviderProfile;
  });

  describe('create', () => {
    it('should create a valid service', () => {
      const service = Service.create(
        mockProvider,
        'Test Service',
        'Description',
        60,
        5000,
        PriceType.FIXED
      );

      expect(service.provider).toBe(mockProvider);
      expect(service.name).toBe('Test Service');
      expect(service.durationMinutes).toBe(60);
      expect(service.priceCents).toBe(5000);
      expect(service.isActive).toBe(true);
    });

    it('should throw if price is negative', () => {
      expect(() => {
        Service.create(mockProvider, 'S', 'D', 60, -100, PriceType.FIXED);
      }).toThrow(BadRequestException);
    });

    it('should throw if duration is zero or negative', () => {
      expect(() => {
        Service.create(mockProvider, 'S', 'D', 0, 100, PriceType.FIXED);
      }).toThrow(BadRequestException);
    });

    it('should throw if max price is less than price for RANGE type', () => {
      expect(() => {
        Service.create(mockProvider, 'S', 'D', 60, 5000, PriceType.RANGE, undefined, 4000);
      }).toThrow(BadRequestException);
    });
  });
});
