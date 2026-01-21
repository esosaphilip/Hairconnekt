import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { useEffect, useRef } from 'react';
import { emit } from './eventBus';
import { useNavigation } from '@react-navigation/native';
import { rootNavigationRef } from '../navigation/rootNavigation';

// Safe check for Device module using dynamic require
const isDeviceSafe = () => {
  if (Platform.OS === 'web') return false;
  try {
    // Dynamic require helps avoid crash during top-level bundle evaluation 
    // if the native module is missing from the binary.
    const Device = require('expo-device');
    return Device.isDevice;
  } catch (e) {
    if (__DEV__) console.warn('[Notifications] expo-device native module not found');
    return false;
  }
};

// Configure notification behavior when app is in foreground
// Configure notification behavior when app is in foreground
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (e) {
  if (__DEV__) console.warn('[Notifications] Failed to set notification handler', e);
}

export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  // Safety check first
  if (!isDeviceSafe()) {
    // eslint-disable-next-line no-console
    console.log('Must use physical device for Push Notifications or native module missing');
    return undefined;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return undefined;
  }

  try {
    const tokenData = await Notifications.getDevicePushTokenAsync();
    return tokenData.data;
  } catch (e: any) {
    console.error('Error getting push token:', e);
    return undefined;
  }
}

export function useNotificationListeners() {
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    // Prevent crash if module is missing or not a device
    if (!isDeviceSafe()) return;

    let timer: ReturnType<typeof setTimeout>;

    const setupListeners = () => {
      try {
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
          if (typeof __DEV__ !== 'undefined' && __DEV__) {
            console.log('[Notifications] Received:', notification);
          }
          emit('appointment_updated');
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
          if (typeof __DEV__ !== 'undefined' && __DEV__) {
            console.log('[Notifications] Response:', response);
          }
          emit('appointment_updated');

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
      } catch (e) {
        console.warn('[Notifications] Failed to add listeners', e);
      }
    };

    // Delay listener attachment (fix for crash on some Android devices/simulators)
    timer = setTimeout(setupListeners, 1000);

    return () => {
      clearTimeout(timer);
      if (notificationListener.current) {
        notificationListener.current.remove();
        notificationListener.current = null;
      }
      if (responseListener.current) {
        responseListener.current.remove();
        responseListener.current = null;
      }
    };
  }, []);
};