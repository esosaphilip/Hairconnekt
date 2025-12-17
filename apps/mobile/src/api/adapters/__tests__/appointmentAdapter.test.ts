import { AppointmentAdapter } from '../appointmentAdapter';

describe('AppointmentAdapter', () => {
  const mockDto = {
    id: 'req-123',
    client: {
      id: 'client-1',
      firstName: 'Sarah',
      lastName: 'Connor',
      phone: '555-1234',
      stats: { totalBookings: 5 },
    },
    service: {
      name: 'Haircut',
      durationMinutes: 60,
      priceCents: 5000,
    },
    date: '2025-01-01',
    startTime: '10:00',
    status: 'pending',
  };

  it('transforms DTO to domain model correctly', () => {
    const model = AppointmentAdapter.toDomain(mockDto as any);
    
    expect(model.id).toBe('req-123');
    expect(model.client.name).toBe('Sarah Connor');
    expect(model.client.totalBookings).toBe(5);
    expect(model.service.name).toBe('Haircut');
    expect(model.service.duration).toBe('1 Std.');
    expect(model.service.price).toBe('€50');
    expect(model.requestedDate).toBe('2025-01-01');
    expect(model.status).toBe('pending');
  });

  it('formats duration correctly', () => {
    const dto1 = { ...mockDto, service: { durationMinutes: 90 } };
    const model1 = AppointmentAdapter.toDomain(dto1 as any);
    expect(model1.service.duration).toBe('1 Std. 30 Min.');

    const dto2 = { ...mockDto, service: { durationMinutes: 45 } };
    const model2 = AppointmentAdapter.toDomain(dto2 as any);
    expect(model2.service.duration).toBe('45 Min.');
  });

  it('handles missing client data gracefully', () => {
    const dto = { id: 'req-empty' };
    const model = AppointmentAdapter.toDomain(dto as any);
    
    expect(model.client.name).toBe('Unbekannt');
    expect(model.service.name).toBe('Unbekannter Service');
  });
});
