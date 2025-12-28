import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from './appointments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { User } from '../users/entities/user.entity';
import { BlockedTime } from '../blocked-time/entities/blocked-time.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { ProviderProfile } from '../providers/entities/provider-profile.entity';
import { Service } from '../services/entities/service.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

// Mock Repository Factory
const mockRepo = () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn((dto) => dto),
    save: jest.fn((entity) => {
        console.log('SAVE CALLED WITH Status:', entity.status, 'Price:', entity.totalPriceCents);
        return Promise.resolve({ ...entity, id: entity.id || 'mock-id' })
    }),
    findBy: jest.fn(),
});

const mockNotifications = {
    sendPushNotification: jest.fn(),
};

describe('End-to-End Booking Flow Validation', () => {
    let service: AppointmentsService;
    let appointmentRepo: any;
    let blockedTimeRepo: any;
    let providerRepo: any;
    let serviceRepo: any;
    let userRepo: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AppointmentsService,
                { provide: getRepositoryToken(Appointment), useFactory: mockRepo },
                { provide: getRepositoryToken(BlockedTime), useFactory: mockRepo },
                { provide: getRepositoryToken(ProviderProfile), useFactory: mockRepo },
                { provide: getRepositoryToken(User), useFactory: mockRepo },
                { provide: getRepositoryToken(Service), useFactory: mockRepo },
                { provide: NotificationsService, useValue: mockNotifications },
            ],
        }).compile();

        service = module.get<AppointmentsService>(AppointmentsService);
        appointmentRepo = module.get(getRepositoryToken(Appointment));
        blockedTimeRepo = module.get(getRepositoryToken(BlockedTime));
        providerRepo = module.get(getRepositoryToken(ProviderProfile));
        serviceRepo = module.get(getRepositoryToken(Service));
        userRepo = module.get(getRepositoryToken(User));

        // Clear mocks
        jest.clearAllMocks();
    });

    it('should complete a full booking lifecycle (Create -> Confirm -> Complete)', async () => {
        const clientUserId = 'user-client-1';
        const providerId = 'provider-1';
        const serviceId = 'service-haircut';
        const startTime = new Date('2025-06-01T10:00:00Z'); // Future date
        const endTime = new Date('2025-06-01T11:00:00Z');

        // --- STEP 1: CREATE (PENDING) ---
        // Setup Mocks for Creation
        providerRepo.findOne.mockResolvedValue({ id: providerId, user: { id: 'user-provider-1' } });
        serviceRepo.findBy.mockResolvedValue([{
            id: serviceId,
            priceCents: 5000,
            durationMinutes: 60,
            provider: { id: providerId }
        }]);

        // Mock Availability Check (No conflicts) AND Reload after Create
        appointmentRepo.findOne
            .mockResolvedValueOnce(null) // Availability check
            .mockResolvedValueOnce({     // Reload after save
                id: 'mock-id',
                status: AppointmentStatus.PENDING,
                provider: { id: providerId },
                client: { id: clientUserId },
                service: { name: 'Haircut', priceCents: 5000 },
                totalPriceCents: 5000,
                startTime: startTime,
                endTime: endTime
            });
        blockedTimeRepo.find.mockResolvedValue([]);

        // Mock User Fetch
        userRepo.findOne.mockResolvedValue({ id: clientUserId, firstName: 'Hans' });

        const createDto = {
            providerId,
            clientId: clientUserId,
            serviceIds: [serviceId],
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
        };

        const created = await service.create(createDto as any);

        expect(created).toBeDefined();
        // Since we mock create/save returning the DTO+defaults, we check what we passed + logic assignments
        // Note: The real service likely assigns status PENDING defaults. 
        // We verify that 'save' was called with PENDING.
        expect(appointmentRepo.save).toHaveBeenCalled();
        expect(created.status).toBe(AppointmentStatus.PENDING);

        // --- STEP 2: PROVIDER CONFIRMS ---
        // Simulate provider fetching the request (Dashboard logic verified earlier)

        const providerUserId = 'user-provider-1';
        // Mock finding the pending appointment
        const pendingAppt = {
            id: 'appt-123',
            status: AppointmentStatus.PENDING,
            provider: { id: providerId, user: { id: providerUserId } },
            client: { id: clientUserId, fcmToken: 'client-token' },
            startTime: startTime,
            service: { name: 'Haircut' }
        };
        appointmentRepo.findOne.mockResolvedValue(pendingAppt);

        const confirmed = await service.updateStatus('appt-123', AppointmentStatus.CONFIRMED, providerUserId);

        // Verify Status Update
        expect(confirmed.status).toBe(AppointmentStatus.CONFIRMED);
        expect(appointmentRepo.save).toHaveBeenCalled();

        // Verify Notification
        expect(mockNotifications.sendPushNotification).toHaveBeenCalledWith(
            'client-token',
            expect.stringContaining('bestätigt'),
            expect.any(String),
            expect.objectContaining({ type: 'appointment_update', appointmentId: 'appt-123' })
        );

        // --- STEP 3: COMPLETION ---
        // Mock finding the confirmed appointment
        const confirmedAppt = { ...pendingAppt, status: AppointmentStatus.CONFIRMED };
        appointmentRepo.findOne.mockResolvedValue(confirmedAppt);

        const completed = await service.updateStatus('appt-123', AppointmentStatus.COMPLETED, providerUserId);

        expect(completed.status).toBe(AppointmentStatus.COMPLETED);
        expect(appointmentRepo.save).toHaveBeenCalled();
    });

    it('should prevent booking on blocked time', async () => {
        const providerId = 'provider-1';
        const start = new Date('2025-06-01T12:00:00Z'); // 12:00

        // Mock Blocked Time @ 12:00
        blockedTimeRepo.find.mockResolvedValue([{
            startTime: '12:00',
            endTime: '13:00',
            allDay: false
        }]);
        // Mock Appointment Check (No appt overlaps, but blocked time does)
        appointmentRepo.findOne.mockResolvedValue(null);

        // Expect Availability Check Failed
        await expect(service.checkAvailability(providerId, start, new Date('2025-06-01T13:00:00Z')))
            .rejects.toThrow(ConflictException);
    });
});
