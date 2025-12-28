import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ProviderCalendarStackParamList } from '../types';

import ProviderCalendar from '@/screens/provider/ProviderCalendar';
import { CreateAppointmentScreen } from '@/screens/provider/CreateAppointmentScreen';
import { BlockTimeScreen } from '@/screens/provider/BlockTimeScreen';
import { AppointmentRequestScreen } from '@/screens/provider/AppointmentRequestScreen';

const ProviderCalendarStack = createNativeStackNavigator<ProviderCalendarStackParamList>();

export function ProviderCalendarStackScreen() {
    return (
        <ProviderCalendarStack.Navigator>
            <ProviderCalendarStack.Screen name="ProviderCalendar" component={ProviderCalendar} options={{ title: 'Kalender' }} />
            <ProviderCalendarStack.Screen name="ProviderCalendarScreen" component={ProviderCalendar} options={{ title: 'Kalender' }} />
            <ProviderCalendarStack.Screen name="CreateAppointmentScreen" component={CreateAppointmentScreen} options={{ title: 'Termin erstellen' }} />
            <ProviderCalendarStack.Screen name="BlockTimeScreen" component={BlockTimeScreen} options={{ title: 'Zeit blockieren' }} />
            <ProviderCalendarStack.Screen name="AppointmentRequestScreen" component={AppointmentRequestScreen} options={{ title: 'Buchungsanfrage' }} />
        </ProviderCalendarStack.Navigator>
    );
}
