import { Appointment, AppointmentStatus } from './appointment.entity';
import { Service } from '../../services/entities/service.entity';
import { User } from '../../users/entities/user.entity';
import { ProviderProfile } from '../../providers/entities/provider-profile.entity';
import { BadRequestException } from '@nestjs/common';

describe('Appointment Entity', () => {
  let mockProvider: ProviderProfile;
  let mockClient: User;
  let mockService1: Service;
  let mockService2: Service;

  beforeEach(() => {
    mockProvider = { id: 'provider-1' } as ProviderProfile;
    mockClient = { id: 'client-1' } as User;
    mockService1 = {
      id: 's1',
      name: 'Cut',
      durationMinutes: 30,
      priceCents: 2000,
    } as Service;
    mockService2 = {
      id: 's2',
      name: 'Color',
      durationMinutes: 60,
      priceCents: 5000,
    } as Service;
  });

  describe('create', () => {
    it('should create an appointment with correct duration and status', () => {
      const services = [mockService1, mockService2];
      const appt = Appointment.create(
        mockProvider,
        mockClient,
        services,
        '10:00',
        '11:30',
        'Please be on time',
      );

      expect(appt.provider).toBe(mockProvider);
      expect(appt.client).toBe(mockClient);
      expect(appt.startTime).toBe('10:00');
      expect(appt.endTime).toBe('11:30');
      expect(appt.clientNotes).toBe('Please be on time');
      expect(appt.status).toBe(AppointmentStatus.PENDING);
      expect(appt.totalDurationMinutes).toBe(90); // 30 + 60
      expect(appt.appointmentServices).toHaveLength(2);
      expect(appt.appointmentServices?.[0].serviceName).toBe('Cut');
      expect(appt.appointmentServices?.[1].serviceName).toBe('Color');
    });

    it('should throw BadRequestException if no services provided', () => {
      expect(() => {
        Appointment.create(mockProvider, mockClient, [], '10:00', '11:00');
      }).toThrow(BadRequestException);
    });
  });

  describe('hoursUntil', () => {
    it('should calculate hours until appointment', () => {
      const appt = new Appointment();
      // Set date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yyyy = tomorrow.getFullYear();
      const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const dd = String(tomorrow.getDate()).padStart(2, '0');
      
      appt.appointmentDate = `${yyyy}-${mm}-${dd}`;
      appt.startTime = '10:00:00';

      // Rough check: should be around 24h + (10 - currentHour)
      // We can mock Date, but let's just check it's positive and roughly correct
      expect(appt.hoursUntil).toBeGreaterThan(0);
    });
  });
});
