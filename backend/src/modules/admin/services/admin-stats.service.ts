import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserType } from '../../users/entities/user.entity';
import { Service } from '../../services/entities/service.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';

@Injectable()
export class AdminStatsService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Service)
        private readonly serviceRepository: Repository<Service>,
        @InjectRepository(Appointment)
        private readonly appointmentRepository: Repository<Appointment>,
    ) { }

    async getStats() {
        const totalUsers = await this.userRepository.count();
        const totalProviders = await this.userRepository.count({ where: { userType: UserType.PROVIDER } });
        const totalClients = await this.userRepository.count({ where: { userType: UserType.CLIENT } });

        // For services, we might want active ones
        const activeServices = await this.serviceRepository.count({ where: { isActive: true } });

        // Total bookings
        const totalBookings = await this.appointmentRepository.count();

        return {
            users: {
                total: totalUsers,
                providers: totalProviders,
                clients: totalClients,
            },
            services: {
                active: activeServices,
            },
            bookings: {
                total: totalBookings,
            },
        };
    }
}
