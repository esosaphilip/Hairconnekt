import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IAddressRepository } from '../../domain/repositories/IAddressRepository';
import { User } from './entities/user.entity';
import { ClientProfile } from './entities/client-profile.entity';
import { BlockedUser } from './entities/blocked-user.entity';
import { UserReport, ReportStatus, ReportReason } from './entities/report.entity';
import { Appointment, AppointmentStatus } from '../appointments/entities/appointment.entity';
import { Favorite } from '../favorites/entities/favorite.entity';

import { StorageService } from '../storage/storage.service';

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
    private readonly storageService: StorageService,
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

  async getAddresses(userId: string) {
    return this.addressesRepo.findAllByUserId(userId);
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.addressesRepo.findById(addressId);
    if (!address) throw new NotFoundException('Address not found');
    if (address.user.id !== userId) throw new NotFoundException('Address not found'); // Security check

    await this.addressesRepo.delete(addressId);
    return { success: true };
  }

  async setDefaultAddress(userId: string, addressId: string) {
    const address = await this.addressesRepo.findById(addressId);
    if (!address) throw new NotFoundException('Address not found');
    if (address.user.id !== userId) throw new NotFoundException('Address not found');

    await this.addressesRepo.resetDefaults(userId);
    address.isDefault = true;
    await this.addressesRepo.save(address);
    return { success: true };
  }

  async getPreferences(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return user.clientProfile || null;
  }

  async updatePreferences(userId: string, payload: Partial<ClientProfile>) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (!user.clientProfile) {
      user.clientProfile = new ClientProfile();
    }

    const allowed = ['dateOfBirth', 'gender', 'hairType', 'hairLength', 'preferredStyles', 'allergies', 'notes'];
    for (const key of allowed) {
      if (payload[key as keyof ClientProfile] !== undefined) {
        (user.clientProfile as any)[key] = payload[key as keyof ClientProfile];
      }
    }

    await this.userRepo.save(user);
    return user.clientProfile;
  }

  async uploadProfilePicture(userId: string, file: any) {
    try {
      const user = await this.userRepo.findById(userId);
      if (!user) throw new NotFoundException('User not found');

      // Validate file input
      if (!file) {
        throw new BadRequestException('No file provided');
      }

      if (!file.buffer) {
        throw new BadRequestException('File buffer is missing. Please select a valid image.');
      }

      if (!file.originalname) {
        throw new BadRequestException('File name is missing');
      }

      console.log(`[UsersService] Uploading avatar for user ${userId}: ${file.originalname} (${file.size || file.buffer.length} bytes)`);

      // Upload to storage
      const { url } = await this.storageService.uploadImage(`profiles/${user.id}`, file.buffer, file.originalname);

      console.log(`[UsersService] Avatar uploaded successfully: ${url}`);

      // Update user profile
      user.profilePictureUrl = url;
      await this.userRepo.save(user);

      return {
        success: true,
        profilePictureUrl: url,
        url // Add url field for compatibility
      };
    } catch (error) {
      console.error(`[UsersService] uploadProfilePicture failed for user ${userId}:`, error);

      // Re-throw known exceptions
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      // Wrap unknown errors
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload profile picture. Please try again.';
      throw new BadRequestException(errorMessage);
    }
  }
}