import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { Notification, NotificationType } from './entities/notification.entity';

export interface NotificationPreferences {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled?: boolean; // reserved for future use
}

@Injectable()
export class NotificationsService {
  // Temporary in-memory store for user notification preferences until schema is finalized
  // Keyed by userId
  private readonly prefs = new Map<string, NotificationPreferences>();
  // In-memory fallback store for notifications when DB schema is not available
  private readonly inMemoryNotifications = new Map<string, Array<{
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, any> | null;
    isRead: boolean;
    readAt?: Date | null;
    createdAt: Date;
  }>>();
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(NotificationPreference)
    private readonly prefsRepo: Repository<NotificationPreference>,
    @InjectRepository(Notification)
    private readonly notificationsRepo: Repository<Notification>,
  ) {}

  async registerFcmToken(userId: string, token: string) {
    await this.usersRepo.update({ id: userId }, { fcmToken: token });
    return { success: true };
  }

  async getPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      let record = await this.prefsRepo.findOne({ where: { user: { id: userId } } });
      if (!record) {
        // Create default preferences if none exist yet
        record = await this.prefsRepo.save(
          this.prefsRepo.create({
            user: { id: userId } as any,
            pushEnabled: true,
            emailEnabled: true,
            smsEnabled: false,
          }),
        );
      }
      return {
        pushEnabled: record.pushEnabled,
        emailEnabled: record.emailEnabled,
        smsEnabled: record.smsEnabled,
      };
    } catch (err: any) {
      // Fallback for when the table doesn't exist yet (e.g., SQLite dev without migrations)
      this.logger.warn(`Falling back to in-memory notification prefs for ${userId}: ${err?.message}`);
      return this.prefs.get(userId) ?? { pushEnabled: true, emailEnabled: true, smsEnabled: false };
    }
  }

  async updatePreferences(userId: string, patch: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    try {
      let record = await this.prefsRepo.findOne({ where: { user: { id: userId } } });
      if (!record) {
        record = this.prefsRepo.create({
          user: { id: userId } as any,
          pushEnabled: true,
          emailEnabled: true,
          smsEnabled: false,
        });
      }
      if (typeof patch.pushEnabled === 'boolean') record.pushEnabled = patch.pushEnabled;
      if (typeof patch.emailEnabled === 'boolean') record.emailEnabled = patch.emailEnabled;
      if (typeof patch.smsEnabled === 'boolean') record.smsEnabled = patch.smsEnabled;
      const saved = await this.prefsRepo.save(record);
      const next: NotificationPreferences = {
        pushEnabled: saved.pushEnabled,
        emailEnabled: saved.emailEnabled,
        smsEnabled: saved.smsEnabled,
      };
      this.logger.log(`Updated notification preferences for user ${userId}: ${JSON.stringify(next)}`);
      return next;
    } catch (err: any) {
      // Fallback to in-memory if DB unavailable
      const current = await this.getPreferences(userId);
      const next = { ...current, ...patch };
      this.prefs.set(userId, next);
      this.logger.warn(
        `Using in-memory notification prefs for ${userId} due to error: ${err?.message}. Updated to ${JSON.stringify(next)}`,
      );
      return next;
    }
  }

  // --- Notification listing and actions ---
  async listNotifications(userId: string, limit = 50): Promise<{ items: Notification[]; unreadCount: number }> {
    try {
      const [items, unreadCount] = await Promise.all([
        this.notificationsRepo.find({
          where: { user: { id: userId } as any },
          order: { createdAt: 'DESC' },
          take: Math.min(Math.max(limit, 1), 100),
        }),
        this.notificationsRepo.count({ where: { user: { id: userId } as any, isRead: false } }),
      ]);
      return { items, unreadCount };
    } catch (err: any) {
      // Fallback: use in-memory store
      this.ensureSeedNotifications(userId);
      const items = (this.inMemoryNotifications.get(userId) || [])
        .slice()
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, Math.min(Math.max(limit, 1), 100)) as any as Notification[];
      const unreadCount = (this.inMemoryNotifications.get(userId) || []).filter((n) => !n.isRead).length;
      this.logger.warn(`Using in-memory notifications for user ${userId}: ${err?.message}`);
      return { items, unreadCount };
    }
  }

  async unreadCount(userId: string): Promise<{ count: number }> {
    try {
      const count = await this.notificationsRepo.count({ where: { user: { id: userId } as any, isRead: false } });
      return { count };
    } catch (err: any) {
      this.ensureSeedNotifications(userId);
      const count = (this.inMemoryNotifications.get(userId) || []).filter((n) => !n.isRead).length;
      return { count };
    }
  }

  async markRead(userId: string, id: string): Promise<{ success: boolean }> {
    try {
      const notification = await this.notificationsRepo.findOne({ where: { id, user: { id: userId } as any } });
      if (!notification) return { success: false };
      if (!notification.isRead) {
        notification.isRead = true;
        notification.readAt = new Date();
        await this.notificationsRepo.save(notification);
      }
      return { success: true };
    } catch (err: any) {
      // Fallback
      const list = this.ensureSeedNotifications(userId);
      const n = list.find((n) => n.id === id);
      if (!n) return { success: false };
      n.isRead = true;
      n.readAt = new Date();
      return { success: true };
    }
  }

  async markAllRead(userId: string): Promise<{ success: boolean }> {
    try {
      await this.notificationsRepo.update({ user: { id: userId } as any, isRead: false } as any, {
        isRead: true,
        readAt: () => 'CURRENT_TIMESTAMP',
      });
      return { success: true };
    } catch (err: any) {
      const list = this.ensureSeedNotifications(userId);
      list.forEach((n) => {
        n.isRead = true;
        n.readAt = new Date();
      });
      return { success: true };
    }
  }

  async clearAll(userId: string): Promise<{ success: boolean }> {
    try {
      await this.notificationsRepo.delete({ user: { id: userId } as any } as any);
      return { success: true };
    } catch (err: any) {
      this.inMemoryNotifications.delete(userId);
      return { success: true };
    }
  }

  private ensureSeedNotifications(userId: string) {
    if (!this.inMemoryNotifications.has(userId)) {
      const now = new Date();
      this.inMemoryNotifications.set(userId, [
        {
          id: 'n-1',
          type: NotificationType.BOOKING_CONFIRMED,
          title: 'Buchungsbestätigung',
          message: 'Dein Termin wurde bestätigt - Morgen um 14:00 Uhr',
          data: { actionUrl: '/appointments' },
          isRead: false,
          createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        },
        {
          id: 'n-2',
          type: NotificationType.MESSAGE_RECEIVED,
          title: 'Neue Nachricht',
          message: 'Du hast eine neue Nachricht erhalten',
          data: { actionUrl: '/messages' },
          isRead: false,
          createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
        },
        {
          id: 'n-3',
          type: NotificationType.SYSTEM,
          title: 'Terminerinnerung',
          message: 'Dein Termin ist in 24 Stunden',
          data: { actionUrl: '/appointments' },
          isRead: true,
          readAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
          createdAt: new Date(now.getTime() - 8 * 60 * 60 * 1000),
        },
      ]);
    }
    return this.inMemoryNotifications.get(userId)!;
  }
}