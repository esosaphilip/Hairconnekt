import { Test, TestingModule } from '@nestjs/testing';
import { AdminModule } from './admin.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { AuthService } from '../auth/auth.service';

import { EmailService } from '../email/email.service';
import { SmsService } from '../sms/sms.service';

// Entities
import { ServiceCategory } from '../services/entities/service-category.entity';
import { User } from '../users/entities/user.entity';
import { ProviderProfile } from '../providers/entities/provider-profile.entity';
import { Service } from '../services/entities/service.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { RefreshToken } from '../auth/entities/refresh-token.entity';
import { VerificationCode } from '../auth/entities/verification-code.entity';
import { BlockedUser } from '../users/entities/blocked-user.entity';
import { Address } from '../users/entities/address.entity';
import { ClientProfile } from '../users/entities/client-profile.entity';
import { UserReport } from '../users/entities/report.entity';
import { Favorite } from '../favorites/entities/favorite.entity';

describe('AdminModule Integration', () => {
    let moduleRef: TestingModule;

    beforeAll(async () => {
        const mockRepo = {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                leftJoinAndMapOne: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                take: jest.fn().mockReturnThis(),
                getManyAndCount: jest.fn().mockReturnValue([[], 0]),
                delete: jest.fn().mockReturnThis(),
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                execute: jest.fn().mockResolvedValue({}),
                update: jest.fn().mockReturnThis(),
                set: jest.fn().mockReturnThis(),
            })),
            manager: {
                getRepository: jest.fn().mockReturnThis(), // Returns mockRepo itself roughly
            }
        };

        // Fix circular mock for manager.getRepository returning mockRepo
        mockRepo.manager.getRepository.mockReturnValue(mockRepo);

        const mockDataSource = {
            createQueryRunner: jest.fn(() => ({
                connect: jest.fn(),
                startTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                rollbackTransaction: jest.fn(),
                release: jest.fn(),
                manager: {
                    getRepository: jest.fn().mockReturnValue(mockRepo),
                }
            })),
            transaction: jest.fn((cb) => cb({ getRepository: jest.fn().mockReturnValue(mockRepo) })),
        };

        moduleRef = await Test.createTestingModule({
            imports: [AdminModule],
            providers: [
                { provide: DataSource, useValue: mockDataSource },
                { provide: ConfigService, useValue: { get: () => 'test-secret' } },
            ],
        })
            // AdminModule dependencies
            .overrideProvider(getRepositoryToken(ServiceCategory)).useValue(mockRepo)
            .overrideProvider(getRepositoryToken(User)).useValue(mockRepo)
            .overrideProvider(getRepositoryToken(ProviderProfile)).useValue(mockRepo)
            .overrideProvider(getRepositoryToken(Service)).useValue(mockRepo)
            .overrideProvider(getRepositoryToken(Appointment)).useValue(mockRepo)

            // AuthModule dependencies (via UsersModule)
            .overrideProvider(getRepositoryToken(RefreshToken)).useValue(mockRepo)
            .overrideProvider(getRepositoryToken(VerificationCode)).useValue(mockRepo)
            .overrideProvider(getRepositoryToken(BlockedUser)).useValue(mockRepo)
            .overrideProvider(getRepositoryToken(Address)).useValue(mockRepo)
            .overrideProvider(getRepositoryToken(ClientProfile)).useValue(mockRepo)
            .overrideProvider(getRepositoryToken(UserReport)).useValue(mockRepo)
            .overrideProvider(getRepositoryToken(Favorite)).useValue(mockRepo)

            // Services
            .overrideProvider(ConfigService).useValue({ get: () => 'test-secret' })
            .overrideProvider(DataSource).useValue(mockDataSource)
            .overrideProvider(EmailService).useValue({ sendVerificationCodeEmail: jest.fn(), sendWelcomeEmail: jest.fn() })
            .overrideProvider(SmsService).useValue({ sendSms: jest.fn() })
            .overrideProvider(AuthService).useValue({
                validateUser: jest.fn(),
                login: jest.fn(),
                register: jest.fn(),
            })
            .compile();
    });

    it('should compile the module', () => {
        expect(moduleRef).toBeDefined();
    });

    it('should resolve JwtStrategy', () => {
        const strategy = moduleRef.get<JwtStrategy>(JwtStrategy);
        expect(strategy).toBeDefined();
        expect(strategy.validate).toBeDefined();
    });
});
