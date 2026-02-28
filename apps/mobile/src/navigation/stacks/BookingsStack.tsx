import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useI18n } from '@/i18n';
import type { BookingsStackParamList } from '../types';

import BookingsListScreen from '@/screens/clients/BookingsListScreen';
import AppointmentDetailScreen from '@/screens/clients/AppointmentDetailScreen';
import { AppointmentsScreen } from '@/screens/clients/AppointmentsScreen';
import CancelAppointmentScreen from '@/screens/shared/CancelAppointmentScreen';
// [MVP-CUT] Reason: Advanced booking modifications like reschedule are deferred to post-MVP | Restore in: v2
// import RescheduleAppointmentScreen from '@/screens/clients/RescheduleAppoinmentScreen';

const BookingsStack = createNativeStackNavigator<BookingsStackParamList>();

export function BookingsStackScreen() {
    const { t } = useI18n();
    return (
        <BookingsStack.Navigator>
            <BookingsStack.Screen name="BookingsList" component={AppointmentsScreen} options={{ title: t('screens.bookings.title'), headerShown: false }} />
            <BookingsStack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} options={{ title: t('screens.bookings.detailTitle') }} />

            <BookingsStack.Screen name="CancelAppointment" component={CancelAppointmentScreen} options={{ title: t('screens.bookings.cancelTitle') }} />
            {/* [MVP-CUT] Reason: Advanced booking modifications like reschedule are deferred to post-MVP | Restore in: v2 */}
            {/* <BookingsStack.Screen name="RescheduleAppointment" component={RescheduleAppointmentScreen} options={{ title: t('screens.bookings.rescheduleTitle') }} /> */}
            {/* Legacy/Overview route kept just in case but main entry is now AppointmentsScreen */}
            {/* [MVP-CUT] Reason: Consolidated appointments view into a single screen | Restore in: v2 */}
            {/* <BookingsStack.Screen name="AppointmentsOverview" component={BookingsListScreen} options={{ title: t('screens.bookings.overviewTitle') }} /> */}
        </BookingsStack.Navigator >
    );
}
