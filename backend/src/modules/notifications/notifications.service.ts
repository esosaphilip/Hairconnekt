import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);

  onModuleInit() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      // Check if already initialized
      if (admin.apps.length > 0) {
        this.logger.log('Firebase already initialized');
        return;
      }

      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || path.resolve(process.cwd(), 'serviceAccountKey.json');

      this.logger.log(`Initializing Firebase with credentials from: ${serviceAccountPath}`);

      // We are using require here to load the JSON file synchronously at startup
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const serviceAccount = require(serviceAccountPath);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      this.logger.log('Firebase Admin initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin', error);
      // We don't throw here to avoid crashing the backend if Firebase fails, 
      // but notifications won't work.
    }
  }

  async sendPushNotification(
    fcmToken: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    if (!fcmToken) {
      this.logger.warn('No FCM token provided for notification');
      return;
    }

    try {
      if (admin.apps.length === 0) {
        this.logger.warn('Firebase not initialized, skipping notification');
        return;
      }

      await admin.messaging().send({
        token: fcmToken,
        notification: {
          title,
          body,
        },
        data: data, // Data payload for navigation/logic in app
      });

      this.logger.log(`Notification sent to ${fcmToken.substring(0, 10)}...: ${title}`);
    } catch (error) {
      this.logger.error(`Error sending push notification to ${fcmToken.substring(0, 10)}...`, error);
      // Don't rethrow, just log. We don't want to break the main transaction flow for a notification failure.
    }
  }
}