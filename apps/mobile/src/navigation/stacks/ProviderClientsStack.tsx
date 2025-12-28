import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ProviderClientsStackParamList } from '../types';

import ProviderClients from '@/screens/provider/ProviderClients';
import { ClientDetailScreen } from '@/screens/provider/ClientDetailScreen';

const ProviderClientsStack = createNativeStackNavigator<ProviderClientsStackParamList>();

export function ProviderClientsStackScreen() {
    return (
        <ProviderClientsStack.Navigator>
            <ProviderClientsStack.Screen name="ProviderClients" component={ProviderClients} options={{ title: 'Kunden' }} />
            <ProviderClientsStack.Screen name="ProviderClientDetail" component={ClientDetailScreen} options={{ title: 'Kunde' }} />
        </ProviderClientsStack.Navigator>
    );
}
