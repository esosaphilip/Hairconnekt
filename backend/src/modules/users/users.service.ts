import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IAddressRepository } from '../../domain/repositories/IAddressRepository';
import { User } from './entities/user.entity';
import { BlockedUser } from './entities/blocked-user.entity';
import { UserReport } from './entities/report.entity';

@Injectable()
export class UsersService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepo: IUserRepository,
    @Inject('IAddressRepository')
    private readonly addressesRepo: IAddressRepository,
    @InjectRepository(BlockedUser)
    private readonly blockedUserRepo: Repository<BlockedUser>,
    @InjectRepository(UserReport)
    private readonly reportRepo: Repository<UserReport>,
  ) { }

  async blockUser(blockerId: string, blockedId: string): Promise<void> {
    if (blockerId === blockedId) throw new Error('Cannot block self');

    // Check if already blocked
    const existing = await this.blockedUserRepo.findOne({
      where: { blocker: { id: blockerId }, blocked: { id: blockedId } },
    });

    if (existing) return;

    await this.blockedUserRepo.save({
      blocker: { id: blockerId } as any,
      blocked: { id: blockedId } as any,
    });
  }

  async reportUser(reporterId: string, reportedId: string, reason: string, details?: string): Promise<void> {
    await this.reportRepo.save({
      reporter: { id: reporterId } as any,
      reported: { id: reportedId } as any,
      reason: reason as any,
      details,
      status: 'PENDING' as any,
    });
  }

  async isBlocked(userA: string, userB: string): Promise<boolean> {
    const count = await this.blockedUserRepo.count({
      where: [
        { blocker: { id: userA }, blocked: { id: userB } },
        { blocker: { id: userB }, blocked: { id: userA } },
      ],
    });
    return count > 0;
  }

  async getMe(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // Compute appointment stats for client view (be resilient to errors)
    let upcoming = { items: [], count: 0 } as any;
    let completed = { items: [], count: 0 } as any;
    let cancelled = { items: [], count: 0 } as any;
    // Temporarily omit appointments stats to reduce module dependencies
    upcoming = { items: [], count: 0 } as any;
    completed = { items: [], count: 0 } as any;
    cancelled = { items: [], count: 0 } as any;

    // Favorites count
    let favoritesCount = 0;
    // Temporarily omit favorites stats to reduce module dependencies
    favoritesCount = 0;

    // Build response DTO
    // Addresses count (avoid joining addresses in the main query to prevent FK naming issues)
    let addressesCount = 0;
    try {
      addressesCount = await this.addressesRepo.countByUserId(userId);
    } catch {
      addressesCount = 0;
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      phone: user.phone,
      avatarUrl: user.profilePictureUrl || null,
      userType: user.userType,
      preferredLanguage: user.preferredLanguage,
      memberSince: user.createdAt,
      verified: {
        email: user.emailVerified,
        phone: user.phoneVerified,
      },
      addressesCount,
      clientProfile: user.clientProfile || null,
      stats: {
        appointments: upcoming.count + completed.count + cancelled.count,
        upcoming: upcoming.count,
        completed: completed.count,
        cancelled: cancelled.count,
        favorites: favoritesCount,
        reviews: 0, // Reviews not implemented yet
      },
    };
  }

  async updateMe(userId: string, payload: Partial<User>) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // Only allow safe fields
    const allowed: Partial<User> = {} as any;
    if (typeof payload.firstName === 'string') allowed.firstName = payload.firstName;
    if (typeof payload.lastName === 'string') allowed.lastName = payload.lastName;
    if (typeof payload.phone === 'string') allowed.phone = payload.phone;
    if (typeof payload.profilePictureUrl === 'string') allowed.profilePictureUrl = payload.profilePictureUrl;
    if (typeof payload.preferredLanguage === 'string') allowed.preferredLanguage = payload.preferredLanguage;

    Object.assign(user, allowed);
    await this.userRepo.save(user);
    return { success: true };
  }

  async updateLanguage(userId: string, preferredLanguage: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    user.preferredLanguage = preferredLanguage;
    await this.userRepo.save(user);
    return { success: true };
  }
}