import { Injectable, OnModuleInit, Logger, Inject, forwardRef, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';
import { UsersService } from '../users/users.service';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) { }

  onModuleInit() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      if (admin.apps.length > 0) {
        this.logger.log('Firebase already initialized');
        return;
      }

      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || path.resolve(process.cwd(), 'serviceAccountKey.json');
      this.logger.log(`Initializing Firebase with credentials from: ${serviceAccountPath}`);

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const serviceAccount = require(serviceAccountPath);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      this.logger.log('Firebase Admin initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin', error);
    }
  }

  async sendPushNotification(fcmToken: string, title: string, body: string, data?: Record<string, string>): Promise<void> {
    if (!fcmToken) return;
    try {
      if (admin.apps.length === 0) return;
      await admin.messaging().send({
        token: fcmToken,
        notification: { title, body },
        data: data || {},
      });
      this.logger.log(`Notification sent to ${fcmToken.substring(0, 10)}...: ${title}`);
    } catch (error) {
      this.logger.error(`Error sending push notification to ${fcmToken.substring(0, 10)}...`, error);
    }
  }

  // --- Methods required by NotificationsController ---

  async registerFcmToken(userId: string, token: string) {
    return this.usersService.updateFcmToken(userId, token);
  }

  async getPreferences(userId: string) {
    const user = await this.usersService.findOne(userId);
    if (!user) throw new NotFoundException('User not found');
    return user.notificationPreferences || { push: true, email: true, sms: true };
  }

  async updatePreferences(userId: string, dto: any) {
    const user = await this.usersService.findOne(userId);
    if (!user) throw new NotFoundException('User not found');

    const prefsToUpdate: Partial<{ push: boolean; email: boolean; sms: boolean }> = {};
    if (dto.pushEnabled !== undefined) prefsToUpdate.push = dto.pushEnabled;
    if (dto.emailEnabled !== undefined) prefsToUpdate.email = dto.emailEnabled;
    if (dto.smsEnabled !== undefined) prefsToUpdate.sms = dto.smsEnabled;

    // Merge with existing preferences
    const updatedPrefs = {
      ...(user.notificationPreferences || { push: true, email: true, sms: true }),
      ...prefsToUpdate
    } as { push: boolean; email: boolean; sms: boolean };

    return this.usersService.updateMe(userId, { notificationPreferences: updatedPrefs });
  }

  async listNotifications(userId: string, limit?: number) {
    // Stub for now
    return [];
  }

  async unreadCount(userId: string) {
    // Stub for now
    return { count: 0 };
  }

  async markRead(userId: string, id: string) {
    // Stub for now
    return { success: true };
  }

  async markAllRead(userId: string) {
    // Stub for now
    return { success: true };
  }

  async clearAll(userId: string) {
    // Stub for now
    return { success: true };
  }
}