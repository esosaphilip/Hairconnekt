import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure notification behavior when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (!Device.isDevice) {
    // eslint-disable-next-line no-console
    console.log('Must use physical device for Push Notifications');
    return undefined;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    // eslint-disable-next-line no-console
    console.log('Failed to get push token for push notification!');
    return undefined;
  }

  try {
    // Get the device push token (for direct FCM usage)
    // Note: ensure your app.json has the googleServicesFile configured for this to return an FCM token
    const tokenData = await Notifications.getDevicePushTokenAsync();
    return tokenData.data;
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error('Error getting push token:', e);
    return undefined;
  }
}

import { useEffect, useRef } from 'react';
import { emit } from './eventBus';
import { useNavigation } from '@react-navigation/native';

export function useNotificationListeners() {
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      // Notification received in foreground
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[Notifications] Received:', notification);
      }
      // Emit event to refresh data (e.g. appointments)
      emit('appointment_updated');
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      // User tapped on notification
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[Notifications] Response:', response);
      }
      // Future: parse data and navigate. handling basic refresh for now.
      emit('appointment_updated');

      // Attempt to navigate if data contains screen info
      const data = response.notification.request.content.data;
      if (data?.type === 'NEW_BOOKING' || data?.type === 'APPOINTMENT_REQUEST') {
        const appointmentId = data.appointmentId || data.id;
        if (appointmentId) {
          setTimeout(() => {
            rootNavigationRef.current?.navigate('Kalender', {
              screen: 'AppointmentRequestScreen',
              params: { id: appointmentId }
            });
          }, 100);
        }
      } else if (data?.type === 'APPOINTMENT_UPDATE' || data?.appointmentId) {
        emit('appointment_updated');
      }
    });


    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);
}