import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '@/i18n';
import { providersApi } from '@/services/providers';
import { PendingApprovalScreen } from '@/screens/provider/PendingApprovalScreen';
import { ProviderRegistrationFlow } from '@/screens/provider/ProviderRegistrationFlow/ProviderRegistrationFlow';
import { ProviderDashboard } from '@/screens/provider/ProviderDashboard';
// [MVP-CUT] Reason: In-app messaging is not needed for MVP launch | Restore in: v2
// import { MessagesScreen } from '@/screens/clients/MessagesScreen';
import { ProviderCalendarStackScreen } from '../stacks/ProviderCalendarStack';
// [MVP-CUT] Reason: CRM and provider client management features are deferred to post-MVP | Restore in: v2
// import { ProviderClientsStackScreen } from '../stacks/ProviderClientsStack';
import { ProviderMoreStackScreen } from '../stacks/ProviderMoreStack';
import BookingsListScreen from '@/screens/clients/BookingsListScreen';

const Tab = createBottomTabNavigator();

export function ProviderTabs() {
    const { t } = useI18n();
    const [status, setStatus] = useState<'ok' | 'pending' | 'not_provider' | 'error'>('ok');
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        let done = false;
        const watchdog = setTimeout(() => {
            if (!done) {
                setStatus('error');
                setChecked(true);
            }
        }, 6000);
        (async () => {
            try {
                const profile: any = await providersApi.getMyProfile();
                const isProvider = !!(profile?.id || profile?.provider?.id);
                const pending = String(profile?.status || '').toLowerCase() === 'pending';
                if (!isProvider) setStatus('not_provider');
                else if (pending) setStatus('pending');
                else setStatus('ok');
            } catch {
                setStatus('error');
            } finally {
                done = true;
                clearTimeout(watchdog);
                setChecked(true);
            }
        })();
        return () => {
            try { clearTimeout(watchdog); } catch { }
        };
    }, []);

    const getProviderTabKey = (name: string) => (
        name === 'Dashboard' ? 'dashboard' :
            name === 'Kalender' ? 'calendar' :
                name === 'Buchungen' ? 'appointments' :
                    'profile'
    );

    if (!checked) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Laden…</Text>
            </SafeAreaView>
        );
    }

    if (status === 'pending') {
        return <PendingApprovalScreen />;
    }
    if (status === 'not_provider') {
        return <ProviderRegistrationFlow />;
    }

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: true,
                tabBarIcon: ({ color, size }) => {
                    const iconName =
                        route.name === 'Dashboard' ? 'grid-outline' :
                            route.name === 'Kalender' ? 'calendar-outline' :
                                route.name === 'Buchungen' ? 'list-outline' :
                                    'person-outline';
                    return <Ionicons name={iconName as any} size={size} color={color} />;
                },
                tabBarLabel: t(`providerTabs.${getProviderTabKey(route.name)}`),
                headerTitle: t(`providerTabs.${getProviderTabKey(route.name)}`),
            })}
        >
            <Tab.Screen
                name="Dashboard"
                component={ProviderDashboard}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        e.preventDefault();
                        navigation.navigate('Dashboard');
                    },
                })}
            />
            <Tab.Screen
                name="Kalender"
                component={ProviderCalendarStackScreen}
                options={{ headerShown: false }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        e.preventDefault();
                        navigation.navigate('Kalender', { screen: 'ProviderCalendar' });
                    },
                })}
            />
            <Tab.Screen
                name="Buchungen"
                component={BookingsListScreen}
                options={{ headerShown: true, title: 'Buchungen' }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        e.preventDefault();
                        navigation.navigate('Buchungen');
                    },
                })}
            />
            {/* [MVP-CUT] Reason: In-app messaging is not needed for MVP launch | Restore in: v2 */}
            {/* <Tab.Screen name="Nachrichten" component={MessagesScreen} /> */}
            <Tab.Screen
                name="Profil"
                component={ProviderMoreStackScreen}
                options={{ headerShown: false }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        e.preventDefault();
                        navigation.navigate('Profil', { screen: 'ProviderMore' });
                    },
                })}
            />
        </Tab.Navigator>
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
