import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User, UserType } from '../../users/entities/user.entity';
import { ProviderProfile } from '../../providers/entities/provider-profile.entity';

@Injectable()
export class AdminUsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(ProviderProfile)
        private readonly providerProfileRepository: Repository<ProviderProfile>,
    ) { }

    async findAll(query: { role?: UserType; search?: string; page?: number; limit?: number }) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        const qb = this.userRepository.createQueryBuilder('user');

        // Join Client Profile
        qb.leftJoinAndSelect('user.clientProfile', 'clientProfile');

        // Join Provider Profile manually since relation is commented out in User entity
        // We map it to a property 'providerProfile' on the result
        qb.leftJoinAndMapOne(
            'user.providerProfile',
            ProviderProfile,
            'providerProfile',
            'providerProfile.userId = user.id'
        );

        if (query.role) {
            qb.andWhere('user.userType = :role', { role: query.role });
        }

        if (query.search) {
            qb.andWhere(
                '(user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)',
                { search: `%${query.search}%` }
            );
        }

        qb.orderBy('user.createdAt', 'DESC');
        qb.skip(skip);
        qb.take(limit);

        const [users, total] = await qb.getManyAndCount();

        return {
            data: users,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async verifyProvider(userId: string, isVerified: boolean) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException(`User with ID "${userId}" not found`);

        if (user.userType !== UserType.PROVIDER && user.userType !== UserType.BOTH) {
            throw new Error('User is not a provider');
        }

        // Find profile by userId
        const profile = await this.providerProfileRepository.findOne({ where: { userId } });
        if (!profile) throw new NotFoundException('Provider profile not found');

        profile.isVerified = isVerified;
        if (isVerified) {
            profile.verifiedAt = new Date();
        } else {
            profile.verifiedAt = null;
        }

        await this.providerProfileRepository.save(profile);
        return { success: true, isVerified };
    }
}
