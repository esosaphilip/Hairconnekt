// Utilities to register for push notifications on native (Capacitor) builds
// Safely no-op on web

import { notificationsApi } from '@/services/notifications';

export async function registerPushIfNative() {
  try {
    const { Capacitor } = await import('@capacitor/core');
    if (!Capacitor.isNativePlatform()) return;

    const { PushNotifications } = await import('@capacitor/push-notifications');

    // Request permissions
    const permStatus = await PushNotifications.checkPermissions();
    if (permStatus.receive !== 'granted') {
      const req = await PushNotifications.requestPermissions();
      if (req.receive !== 'granted') {
        return; // user declined
      }
    }

    // Register with APNs/FCM
    await PushNotifications.register();

    // If the Firebase Messaging native plugin is installed, prefer its FCM token
    try {
      const capGlobal = typeof window !== 'undefined' && 'Capacitor' in window
        ? (window as unknown as { Capacitor?: { Plugins?: { FirebaseMessaging?: { getToken?: () => Promise<{ token?: string }> } } } }).Capacitor
        : undefined;
      const fm = capGlobal?.Plugins?.FirebaseMessaging;
      if (fm?.getToken) {
        const fcm = await fm.getToken();
        const token = fcm?.token;
        if (token) {
          await notificationsApi.registerDeviceToken(token);
          return;
        }
      }
    } catch {
      // ignore and fallback
    }

    // Listen for generic registration token from PushNotifications
    const regPromise = new Promise<string | null>((resolve) => {
      const listener = PushNotifications.addListener('registration', async (token) => {
        try {
          await notificationsApi.registerDeviceToken(token.value);
          resolve(token.value);
        } catch {
          resolve(null);
        } finally {
          (await listener).remove();
        }
      });
      // Also handle registrationError to avoid hanging
      PushNotifications.addListener('registrationError', async () => {
        (await listener).remove();
        resolve(null);
      });
    });
    await regPromise;
  } catch {
    // Silently ignore on web or if plugin not available
  }
}