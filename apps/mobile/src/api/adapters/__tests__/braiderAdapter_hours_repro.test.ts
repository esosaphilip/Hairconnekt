import { BraiderAdapter } from '../braiderAdapter';

describe('BraiderAdapter Hours Mapping Fallback', () => {
  const mockDtoBase = {
    id: '1',
    name: 'Test',
    verified: true,
  };

  it('maps hours when availability is in dto.availability (not profile.availability)', () => {
    const dto = {
      ...mockDtoBase,
      availability: [
        { weekday: 'Monday', start: '09:00', end: '18:00' },
      ],
      // No profile object, or profile object without availability
      profile: {}
    } as any;

    const result = BraiderAdapter.toDomainProfile(dto);
    const monday = result.hours?.find(h => h.day === 'Montag');
    
    expect(monday?.hours).toBe('09:00 - 18:00');
  });

  it('prioritizes profile.availability over dto.availability if both exist', () => {
    const dto = {
      ...mockDtoBase,
      availability: [
        { weekday: 'Monday', start: '08:00', end: '17:00' }, // Ignored
      ],
      profile: {
        availability: [
          { weekday: 'Monday', start: '10:00', end: '19:00' }, // Used
        ]
      }
    } as any;

    const result = BraiderAdapter.toDomainProfile(dto);
    const monday = result.hours?.find(h => h.day === 'Montag');
    
    expect(monday?.hours).toBe('10:00 - 19:00');
  });
});
