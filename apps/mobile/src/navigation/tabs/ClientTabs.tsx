import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '@/i18n';

import { HomeScreen } from '@/screens/clients/HomeScreen';
import { SearchScreen } from '@/screens/clients/SearchScreen';
import { MessagesScreen } from '@/screens/clients/MessagesScreen';
import { BookingsStackScreen } from '../stacks/BookingsStack';
import { ClientProfileStackScreen } from '../stacks/ClientProfileStack';

const Tab = createBottomTabNavigator();

export function ClientTabs() {
    const { t } = useI18n();
    const getClientTabKey = (name: string) => (
        name === 'Home' ? 'home' :
            name === 'Search' ? 'search' :
                name === 'Appointments' ? 'appointments' :
                    name === 'Messages' ? 'messages' :
                        'profile'
    );
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: true,
                tabBarIcon: ({ color, size }) => {
                    const iconName =
                        route.name === 'Home' ? 'home' :
                            route.name === 'Search' ? 'search' :
                                route.name === 'Appointments' ? 'calendar' :
                                    route.name === 'Messages' ? 'chatbubble' :
                                        'person';
                    return <Ionicons name={iconName as any} size={size} color={color} />;
                },
                tabBarLabel: t(`tabs.${getClientTabKey(route.name)}`),
                headerTitle: t(`tabs.${getClientTabKey(route.name)}`),
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Search" component={SearchScreen} />
            <Tab.Screen name="Appointments" component={BookingsStackScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Messages" component={MessagesScreen} />
            <Tab.Screen
                name="Profile"
                component={ClientProfileStackScreen}
                options={{ headerShown: false }}
                listeners={({ navigation }) => ({
                    tabPress: () => {
                        try {
                            navigation.navigate('Profile', { screen: 'Profile' });
                        } catch { }
                    },
                })}
            />
        </Tab.Navigator>
    );
}
