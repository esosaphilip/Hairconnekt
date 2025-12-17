import { ClientAdapter } from '../clientAdapter';

describe('ClientAdapter', () => {
  const mockDto = {
    id: 'c-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    isVIP: true,
    stats: {
      totalAppointments: 10,
      totalSpent: 500, // EUR
      lastVisit: '2024-12-01',
    },
  };

  it('transforms DTO to domain model correctly', () => {
    const model = ClientAdapter.toDomain(mockDto as any);
    
    expect(model.id).toBe('c-1');
    expect(model.name).toBe('John Doe');
    expect(model.isVIP).toBe(true);
    expect(model.stats.appointments).toBe(10);
    expect(model.stats.totalSpentCents).toBe(50000); // 500 * 100
    expect(model.lastVisitIso).toBe('2024-12-01');
  });

  it('handles flattened stats structure', () => {
    const flatDto = {
      id: 'c-2',
      name: 'Jane Doe',
      appointments: 5,
      totalSpentCents: 25000,
      lastVisitIso: '2024-11-01',
    };
    
    const model = ClientAdapter.toDomain(flatDto as any);
    
    expect(model.id).toBe('c-2');
    expect(model.name).toBe('Jane Doe');
    expect(model.appointments).toBe(5);
    expect(model.totalSpentCents).toBe(25000);
  });

  it('calculates relative time correctly (mocked logic)', () => {
    const dto = {
      id: 'c-3',
      stats: { lastVisit: new Date().toISOString() }, // Today
    };
    const model = ClientAdapter.toDomain(dto as any);
    // Based on our simplified adapter logic for "today" -> diffDays < 1
    expect(model.stats.lastVisitRelative).toBe('gerade eben');
  });
});
