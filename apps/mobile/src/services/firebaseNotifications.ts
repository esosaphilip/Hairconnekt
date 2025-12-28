import messaging from '@react-native-firebase/messaging';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { http } from '../api/http'; // Import your http client

export const useFirebaseNotifications = () => {

    const syncToken = async () => {
        if (Platform.OS === 'web') return;
        try {
            // 1. Request Permission
            const authStatus = await messaging().requestPermission();
            const enabled =
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;

            if (enabled) {
                // 2. Get the Token
                const fcmToken = await messaging().getToken();
                if (fcmToken) {
                    // 3. Send to Backend
                    await http.patch('/users/me/fcm-token', { fcmToken });
                    if (__DEV__) console.log('[Firebase] FCM Token synced:', fcmToken);
                }
            }
        } catch (err) {
            if (__DEV__) console.error('[Firebase] Failed to get/sync FCM Token', err);
        }
    };


    useEffect(() => {
        // Safe check for Firebase messaging
        const initFirebase = async () => {
            try {
                // Ensure messaging() is available
                if (typeof messaging !== 'function') {
                    if (__DEV__) console.warn('[Firebase] Messaging module not available');
                    return;
                }

                await syncToken();

                // Listen for token refreshes
                const unsubscribe = messaging().onTokenRefresh(token => {
                    http.patch('/users/me/fcm-token', { fcmToken: token }).catch(err => {
                        if (__DEV__) console.error('[Firebase] Failed to sync refreshed token', err);
                    });
                });

                return unsubscribe;
            } catch (err) {
                if (__DEV__) console.error('[Firebase] Initialization error', err);
                return undefined;
            }
        };

        const unsubscribePromise = initFirebase();

        return () => {
            unsubscribePromise.then(unsubscribe => {
                if (typeof unsubscribe === 'function') unsubscribe();
            });
        };
    }, []);

};
