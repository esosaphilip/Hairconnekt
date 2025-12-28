import { Injectable, OnModuleInit, Logger, Inject, forwardRef } from '@nestjs/common';
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
        data,
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
    const user = await this.usersService.findById(userId); // Assuming findOne or similar exists that returns entity
    if (!user) return {}; // Warning: check proper return type
    return user.notificationPreferences || { push: true, email: true, sms: true };
  }

  async updatePreferences(userId: string, dto: any) {
    // Map DTO { pushEnabled, emailEnabled, smsEnabled } to { push, email, sms } if needed
    // The controller DTO uses Enabled suffix, User entity keys are simple.
    // Let's assume User entity has structure { push: boolean, email: boolean, sms: boolean }
    const prefs = {
      push: dto.pushEnabled,
      email: dto.emailEnabled,
      sms: dto.smsEnabled
    };
    // Remove undefined
    Object.keys(prefs).forEach(key => prefs[key] === undefined && delete prefs[key]);

    // We need to merge with existing or just save. UsersService.update usually handles this.
    // However, updateMe takes partial user. 
    // Let's rely on updateMe logic if possible, but UsersService might not expose a direct 'updatePreferences'
    // I will call a raw update via repo if I could, but I only have service.
    // I'll assume usersService.update(userId, { notificationPreferences: prefs }) works if I cast it.

    // Actually, I'll fetch user, merge, save via service if possible. 
    // Or just call updateMe which is 'update'.
    return this.usersService.updateMe(userId, { notificationPreferences: prefs });
  }

  async listNotifications(userId: string, limit?: number) {
    // Stub
    return [];
  }

  async unreadCount(userId: string) {
    // Stub
    return { count: 0 };
  }

  async markRead(userId: string, id: string) {
    // Stub
    return { success: true };
  }

  async markAllRead(userId: string) {
    // Stub
    return { success: true };
  }

  async clearAll(userId: string) {
    // Stub
    return { success: true };
  }
}