import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IAddressRepository } from '../../domain/repositories/IAddressRepository';
import { User } from './entities/user.entity';
import { BlockedUser } from './entities/blocked-user.entity';
import { UserReport, ReportStatus, ReportReason } from './entities/report.entity';
import { Appointment, AppointmentStatus } from '../appointments/entities/appointment.entity';
import { Favorite } from '../favorites/entities/favorite.entity';

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
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
    @InjectRepository(Favorite)
    private readonly favoriteRepo: Repository<Favorite>,
  ) { }

  async blockUser(blockerId: string, blockedId: string): Promise<void> {
    if (blockerId === blockedId) throw new Error('Cannot block self');

    // Check if already blocked
    const existing = await this.blockedUserRepo.findOne({
      where: { blocker: { id: blockerId }, blocked: { id: blockedId } },
    });

    if (existing) return;

    const block = this.blockedUserRepo.create({
      blocker: { id: blockerId } as User,
      blocked: { id: blockedId } as User,
    });
    await this.blockedUserRepo.save(block);
  }

  async reportUser(reporterId: string, reportedId: string, reason: string, details?: string): Promise<void> {
    const report = this.reportRepo.create({
      reporter: { id: reporterId } as User,
      reported: { id: reportedId } as User,
      reason: reason as ReportReason,
      details,
      status: ReportStatus.PENDING,
    });
    await this.reportRepo.save(report);
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

  async findOne(id: string) {
    return this.userRepo.findById(id);
  }

  async getMe(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // Compute appointment stats
    const upcomingCount = await this.appointmentRepo.count({
      where: {
        client: { id: userId },
        status: AppointmentStatus.CONFIRMED // or PENDING | CONFIRMED
      }
    });

    const completedCount = await this.appointmentRepo.count({
      where: {
        client: { id: userId },
        status: AppointmentStatus.COMPLETED
      }
    });

    const cancelledCount = await this.appointmentRepo.count({
      where: {
        client: { id: userId },
        status: AppointmentStatus.CANCELLED_BY_CLIENT // or both cancelled statuses
      }
    });

    // Favorites count
    const favoritesCount = await this.favoriteRepo.count({
      where: { client: { id: userId } }
    });

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
        appointments: upcomingCount + completedCount + cancelledCount,
        upcoming: upcomingCount,
        completed: completedCount,
        cancelled: cancelledCount,
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
    if (payload.notificationPreferences) allowed.notificationPreferences = payload.notificationPreferences;

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

  async updateFcmToken(userId: string, fcmToken: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    user.fcmToken = fcmToken;
    await this.userRepo.save(user);
    return { success: true };
  }

  async deactivateUser(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    user.isActive = false;
    // Optional: Anonymize or clear sensitive data if required by policy
    // user.email = `deleted_${Date.now()}_${user.email}`;
    // user.phone = `deleted_${Date.now()}_${user.phone}`;

    await this.userRepo.save(user);
    return { success: true };
  }
}