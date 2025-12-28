import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from './appointments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { User } from '../users/entities/user.entity';
import { BlockedTime } from '../blocked-time/entities/blocked-time.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { ProviderProfile } from '../providers/entities/provider-profile.entity';
import { Service } from '../services/entities/service.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

// Mock Repository
const mockRepo = () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
});

const mockNotifications = {
    sendPushNotification: jest.fn(),
};

describe('AppointmentsService Verification', () => {
    let service: AppointmentsService;
    let appointmentRepo: any;
    let blockedTimeRepo: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AppointmentsService,
                { provide: getRepositoryToken(Appointment), useFactory: mockRepo },
                { provide: getRepositoryToken(BlockedTime), useFactory: mockRepo },
                { provide: getRepositoryToken(ProviderProfile), useFactory: mockRepo },
                { provide: getRepositoryToken(User), useFactory: mockRepo }, // Added User
                { provide: getRepositoryToken(Service), useFactory: mockRepo },
                { provide: NotificationsService, useValue: mockNotifications },
            ],
        }).compile();

        service = module.get<AppointmentsService>(AppointmentsService);
        appointmentRepo = module.get(getRepositoryToken(Appointment));
        blockedTimeRepo = module.get(getRepositoryToken(BlockedTime));
    });

    describe('checkAvailability', () => {
        const providerId = 'provider-123';
        const start = new Date('2025-01-01T10:00:00Z');
        const end = new Date('2025-01-01T11:00:00Z');

        it('should pass if no overlaps and no blocked time', async () => {
            appointmentRepo.findOne.mockResolvedValue(null);
            blockedTimeRepo.find.mockResolvedValue([]); // No blocked times

            await expect(service.checkAvailability(providerId, start, end)).resolves.not.toThrow();
        });

        it('should throw ConflictException if appointment overlaps strict', async () => {
            // Existing appointment: 10:30 - 11:30 (overlaps 10:00-11:00)
            const existing = {
                startTime: new Date('2025-01-01T10:30:00Z'),
                endTime: new Date('2025-01-01T11:30:00Z'),
            };

            // The service calls findOne with query, then checks manual overlap
            // We simulate findOne returning an appointment that matched the query
            appointmentRepo.findOne.mockResolvedValue(existing);

            await expect(service.checkAvailability(providerId, start, end)).rejects.toThrow(ConflictException);
        });

        it('should throw ConflictException if blocked time overlaps', async () => {
            appointmentRepo.findOne.mockResolvedValue(null);

            // Blocked time: 10:30 - 11:00
            const blocked = {
                startTime: '10:30',
                endTime: '11:00',
                allDay: false,
            };

            // Service calls .find(), returns array of blocked times for that day
            blockedTimeRepo.find.mockResolvedValue([blocked]);

            await expect(service.checkAvailability(providerId, start, end)).rejects.toThrow(ConflictException);
        });

        it('should pass if blocked time does NOT overlap', async () => {
            appointmentRepo.findOne.mockResolvedValue(null);

            // Blocked time: 12:00 - 13:00 (outside 10-11)
            const blocked = {
                startTime: '12:00',
                endTime: '13:00',
                allDay: false,
            };

            blockedTimeRepo.find.mockResolvedValue([blocked]);

            await expect(service.checkAvailability(providerId, start, end)).resolves.not.toThrow();
        });
    });
});
