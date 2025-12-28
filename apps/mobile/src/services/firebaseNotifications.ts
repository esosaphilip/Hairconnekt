import messaging from '@react-native-firebase/messaging';
import { useEffect } from 'react';
import { http } from '../api/http'; // Import your http client

export const useFirebaseNotifications = () => {

    const syncToken = async () => {
        // 1. Request Permission
        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
            // 2. Get the Token
            try {
                const fcmToken = await messaging().getToken();
                if (fcmToken) {
                    // 3. Send to Backend
                    // We use http client which handles auth headers
                    await http.patch('/users/fcm-token', { fcmToken });
                    if (__DEV__) console.log('[Firebase] FCM Token synced:', fcmToken);
                }
            } catch (err) {
                if (__DEV__) console.error('[Firebase] Failed to get/sync FCM Token', err);
            }
        }
    };

    useEffect(() => {
        syncToken();

        // Listen for token refreshes
        return messaging().onTokenRefresh(token => {
            http.patch('/users/fcm-token', { fcmToken: token }).catch(err => {
                if (__DEV__) console.error('[Firebase] Failed to sync refreshed token', err);
            });
        });
    }, []);
};
