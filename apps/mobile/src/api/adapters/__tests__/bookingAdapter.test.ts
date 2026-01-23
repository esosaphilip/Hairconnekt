
import { BookingAdapter } from '../bookingAdapter';

describe('BookingAdapter', () => {
    it('correctly maps API response to Domain model', () => {
        const apiResponse = {
            id: '123',
            appointmentDate: '2023-11-20',
            startTime: '2023-11-20T14:30:00.000Z',
            services: [
                { name: 'Haircut', durationMinutes: 60 }
            ],
            totalPriceCents: 5000,
            provider: {
                id: 'p1',
                businessName: 'Salon A',
                name: 'Alice',
                avatarUrl: 'https://example.com/avatar.jpg'
            },
            address: 'Main St 1'
        };

        const domain = BookingAdapter.toDomain(apiResponse as any);

        expect(domain.id).toBe('123');
        expect(domain.serviceName).toBe('Haircut');
        expect(domain.duration).toBe('60 Min.');
        // Match what received (likely NBSP)
        expect(domain.price).toMatch(/50,00\s€/);
        expect(domain.location).toBe('Main St 1');
        expect(domain.providerName).toBe('Salon A');
    });

    it('handles missing services gracefully', () => {
        const apiResponse = {
            id: '123',
            appointmentDate: '2023-11-20',
            services: [],
            totalPriceCents: 0,
            provider: { name: 'Bob' }
        };

        const domain = BookingAdapter.toDomain(apiResponse as any);
        expect(domain.serviceName).toBe('Service');
        expect(domain.duration).toBeNull();
    });
});
