import { BraiderAdapter } from '../braiderAdapter';

describe('BraiderAdapter Hours Mapping', () => {
  const mockDtoBase = {
    id: '1',
    name: 'Test',
    verified: true,
  };

  it('maps English weekdays correctly', () => {
    const dto = {
      ...mockDtoBase,
      profile: {
        availability: [
          { weekday: 'Monday', start: '09:00', end: '18:00' },
          { weekday: 'Tuesday', start: '09:00', end: '18:00' },
        ]
      }
    };

    const result = BraiderAdapter.toDomainProfile(dto);
    const monday = result.hours?.find(h => h.day === 'Montag');
    
    expect(monday?.hours).toBe('09:00 - 18:00');
  });

  it('maps Number weekdays correctly (0=Monday based on backend)', () => {
    const dto = {
      ...mockDtoBase,
      profile: {
        availability: [
          { weekday: 0, start: '09:00', end: '18:00' }, // Monday
          { weekday: 1, start: '09:00', end: '18:00' }, // Tuesday
        ]
      }
    };

    const result = BraiderAdapter.toDomainProfile(dto);
    const monday = result.hours?.find(h => h.day === 'Montag');
    
    expect(monday?.hours).toBe('09:00 - 18:00');
  });

  it('maps lowercase English weekdays correctly', () => {
    const dto = {
      ...mockDtoBase,
      profile: {
        availability: [
          { weekday: 'monday', start: '09:00', end: '18:00' },
        ]
      }
    };

    const result = BraiderAdapter.toDomainProfile(dto);
    const monday = result.hours?.find(h => h.day === 'Montag');
    
    expect(monday?.hours).toBe('09:00 - 18:00');
  });
});
