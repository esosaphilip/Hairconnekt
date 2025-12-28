import React, { useEffect } from 'react';
import { Platform, SafeAreaView, Text, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { useAuth } from '@/auth/AuthContext';
import { useUserMode } from '@/state/UserModeContext';
import { rootNavigationRef } from '@/navigation/rootNavigation';
import { useNotificationListeners } from '@/services/notifications';
import { useFirebaseNotifications } from '@/services/firebaseNotifications';
import type { RootStackParamList, RootStackScreenProps } from './types';

import { ClientTabs as Tabs } from './tabs/ClientTabs';
import { ProviderTabs } from './tabs/ProviderTabs';
import { SplashScreen } from '@/screens/shared/SplashScreen';
import WelcomeScreen from '@/screens/shared/WelcomeScreen';
import RegisterScreen from '@/screens/shared/RegisterScreen';
import { SignInPrompt } from '@/screens/shared/SignInPrompt';
import { ClientOnboardingScreen } from '@/screens/clients/ClientOnboardingScreen';
import { LocationSelectionScreen } from '@/screens/clients/LocationSelectionScreen';
import AccountTypeSelectionScreen from '@/screens/shared/AccountTypeSelection';
import { ProviderRegistrationFlow } from '@/screens/provider/ProviderRegistrationFlow/ProviderRegistrationFlow';
import { PendingApprovalScreen } from '@/screens/provider/PendingApprovalScreen';
import ProviderProfile from '@/screens/clients/ProviderProfile';
import ProviderNotificationsScreen from '@/screens/provider/ProviderNotificationsScreen';
import { AllStylesScreen } from '@/screens/clients/AllStylesScreen';
import { MapViewScreen } from '@/screens/clients/MapViewScreen';
import { VerificationScreen } from '@/screens/shared/VerificationScreen';
import { BookingFlow } from '@/screens/clients/Booking/BookingFlow';
import { LoginScreen } from '@/screens/shared/UserManualScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

function NotificationManager() {
    useNotificationListeners();
    useFirebaseNotifications();
    return null;
}

function LoginRoute({ route, navigation }: RootStackScreenProps<'Login'>) {
    return (
        <LoginScreen
            initialState={{
                returnUrl: route.params?.returnUrl,
                userType: route.params?.userType,
            }}
            onRegisterPress={(userType) => {
                navigation.navigate('Register', { userType });
            }}
            onForgotPasswordPress={() => { }}
            onLoginSuccess={() => { }}
        />
    );
}

export function RootNavigator() {
    const { user, loading } = useAuth();
    const { mode } = useUserMode();

    useEffect(() => {
        if (!loading && !user) {
            setTimeout(() => {
                try {
                    rootNavigationRef.current?.dispatch(
                        CommonActions.reset({ index: 0, routes: [{ name: 'Welcome' }] })
                    );
                } catch { }
            }, 0);
        }
    }, [user, loading]);

    useEffect(() => {
        if (Platform.OS !== 'web') return;
        const handleHashNavigation = () => {
            const rawHash = typeof window !== 'undefined' ? window.location.hash || '' : '';
            const path = rawHash.replace(/^#/, '');
            const [route, queryString] = path.split('?');
            const qs = new URLSearchParams(queryString || '');
            const userType = String(user?.userType || '').toLowerCase();
            const isProvider = userType === 'provider' || userType === 'both';

            if (route?.startsWith('/provider/clients/')) {
                if (isProvider) {
                    const id = route.split('/').pop();
                    rootNavigationRef.current?.navigate('ProviderTabs', { screen: 'Kunden', params: { screen: 'ProviderClientDetail', params: { id } } });
                }
                return;
            }
            if (route?.startsWith('/provider/services/edit/')) {
                if (isProvider) {
                    rootNavigationRef.current?.navigate('ProviderTabs', { screen: 'Mehr', params: { screen: 'ProviderServicesScreen' } });
                }
                return;
            }
            if (route?.startsWith('/provider/public/')) {
                const id = route.split('/').pop();
                if (id) rootNavigationRef.current?.navigate('ProviderDetail', { id });
                return;
            }
            if (route?.match(/^\/provider\/[A-Za-z0-9_-]+$/)) {
                const id = route.split('/').pop();
                if (id) rootNavigationRef.current?.navigate('ProviderDetail', { id });
                return;
            }
            if (route === '/provider/appointments/create') {
                if (isProvider) {
                    const clientId = qs.get('clientId');
                    rootNavigationRef.current?.navigate('ProviderTabs', { screen: 'Kalender', params: { screen: 'CreateAppointmentScreen', params: clientId ? { clientId } : undefined } });
                }
                return;
            }

            switch (route) {
                case '/provider/dashboard':
                    if (isProvider) {
                        rootNavigationRef.current?.navigate('ProviderTabs', { screen: 'Dashboard' });
                    } else if (user) {
                        rootNavigationRef.current?.navigate('Tabs', { screen: 'Home' });
                    } else {
                        rootNavigationRef.current?.navigate('Login');
                    }
                    break;
                case '/provider/more/public-profile':
                    if (isProvider) {
                        rootNavigationRef.current?.navigate('ProviderTabs', { screen: 'Mehr', params: { screen: 'ProviderPublicProfileScreen' } });
                    }
                    break;
                case '/provider/services':
                case '/provider/services/add':
                    if (isProvider) {
                        rootNavigationRef.current?.navigate('ProviderTabs', { screen: 'Mehr', params: { screen: 'ProviderServicesScreen' } });
                    }
                    break;
                case '/provider/calendar':
                    if (isProvider) {
                        rootNavigationRef.current?.navigate('ProviderTabs', { screen: 'Kalender' });
                    }
                    break;
                case '/provider/calendar/block':
                    if (isProvider) {
                        rootNavigationRef.current?.navigate('ProviderTabs', { screen: 'Kalender', params: { screen: 'BlockTimeScreen' } });
                    }
                    break;
                case '/provider/clients':
                    if (isProvider) {
                        rootNavigationRef.current?.navigate('ProviderTabs', { screen: 'Kunden' });
                    }
                    break;
                case '/provider/messages':
                    if (isProvider) {
                        rootNavigationRef.current?.navigate('ProviderTabs', { screen: 'Nachrichten' });
                    }
                    break;
                case '/provider/more':
                    if (isProvider) {
                        rootNavigationRef.current?.navigate('ProviderTabs', { screen: 'Mehr' });
                    }
                    break;
                case '/provider/more/profile':
                    if (isProvider) {
                        rootNavigationRef.current?.navigate('ProviderTabs', { screen: 'Mehr', params: { screen: 'ProviderProfileScreen' } });
                    }
                    break;
                case '/home':
                    if (user) {
                        rootNavigationRef.current?.navigate('Tabs', { screen: 'Home' });
                    } else {
                        rootNavigationRef.current?.navigate('Login');
                    }
                    break;
                case '/login':
                    rootNavigationRef.current?.navigate('Login');
                    break;
                case '/register':
                    rootNavigationRef.current?.navigate('Register');
                    break;
            }
        };
        window.addEventListener('hashchange', handleHashNavigation);
        handleHashNavigation();
        return () => window.removeEventListener('hashchange', handleHashNavigation);
    }, [user]);

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Laden…</Text>
            </SafeAreaView>
        );
    }

    return (
        <NavigationContainer ref={rootNavigationRef}>
            <NotificationManager />
            {user ? (
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    {(() => {
                        const userType = String(user?.userType || '').toLowerCase();
                        if (userType === 'both') {
                            return mode === 'provider' ? (
                                <>
                                    <Stack.Screen name="ProviderTabs" component={ProviderTabs} />
                                    <Stack.Screen name="ProviderDashboard" component={ProviderTabs} />
                                </>
                            ) : (
                                <Stack.Screen name="Tabs" component={Tabs} />
                            );
                        }
                        if (userType === 'provider') {
                            return (
                                <>
                                    <Stack.Screen name="ProviderTabs" component={ProviderTabs} />
                                    <Stack.Screen name="ProviderDashboard" component={ProviderTabs} />
                                </>
                            );
                        }
                        return <Stack.Screen name="Tabs" component={Tabs} />;
                    })()}
                    <Stack.Screen name="ProviderDetail" component={ProviderProfile} options={{ headerShown: false }} />
                    <Stack.Screen name="ProviderNotificationsScreen" component={ProviderNotificationsScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="AllStyles" component={AllStylesScreen} options={{ headerShown: true, title: 'Alle Styles' }} />
                    <Stack.Screen name="MapViewScreen" component={MapViewScreen} options={{ headerShown: true, title: 'Karte' }} />
                    <Stack.Screen name="Verify" component={VerificationScreen} options={{ headerShown: true, title: 'Verifizieren' }} />
                    <Stack.Screen name="LocationSelection" component={LocationSelectionScreen} options={{ title: 'Standort wählen' }} />
                    <Stack.Screen name="Booking" component={BookingFlow} options={{ headerShown: false }} />
                </Stack.Navigator>
            ) : (
                <Stack.Navigator initialRouteName="Welcome">
                    <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Login" component={LoginRoute} options={{ title: 'Anmelden' }} />
                    <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Registrieren' }} />
                    <Stack.Screen name="SignInPrompt" component={SignInPrompt} options={{ title: 'Anmelden oder fortfahren' }} />
                    <Stack.Screen name="ClientOnboarding" component={ClientOnboardingScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="LocationSelection" component={LocationSelectionScreen} options={{ title: 'Standort wählen' }} />
                    <Stack.Screen name="LocationAccess" component={LocationSelectionScreen} options={{ title: 'Standortzugriff' }} />
                    <Stack.Screen name="Home" component={Tabs} options={{ headerShown: false }} />
                    <Stack.Screen name="AccountType" component={AccountTypeSelectionScreen} options={{ title: 'Kontotyp' }} />
                    <Stack.Screen name="ProviderRegistration" component={ProviderRegistrationFlow} options={{ title: 'Anbieter-Registrierung' }} />
                    <Stack.Screen name="ProviderPendingApproval" component={PendingApprovalScreen} options={{ title: 'Prüfung ausstehend' }} />
                </Stack.Navigator>
            )}
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    loadingText: {
        fontSize: 18,
    },
});
