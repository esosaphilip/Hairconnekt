import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ProviderMoreStackParamList } from '../types';

import { ProviderMore } from '@/screens/provider/ProviderMore';
import { ProviderProfileScreen } from '@/screens/provider/ProviderProfileScreen';
import { ProviderPublicProfileScreen } from '@/screens/provider/ProviderPublicProfileScreen';
import { ServicesManagementScreen } from '@/screens/provider/ServicesManagementScreen';
import { AddEditServiceScreen } from '@/screens/provider/AddEditServiceScreen';
import { PortfolioManagementScreen } from '@/screens/provider/PortfolioManagementScreen';
import { UploadPortfolioScreen } from '@/screens/provider/UploadPortfolioScreen';
import { ProviderPhotoUploadScreen } from '@/screens/provider/ProviderPhotoUploadScreen';
import { BookingFlow } from '@/screens/clients/Booking/BookingFlow';
import { ChatScreen } from '@/screens/shared/ChatScreen/ChatScreen';
import { PayoutRequestScreen } from '@/screens/provider/PayoutRequestScreen';
import { TransactionsScreen } from '@/screens/provider/TransactionsScreen';
import { ProviderAnalyticsScreen } from '@/screens/provider/ProviderAnalyticsScreen';
import { ProviderVouchersScreen } from '@/screens/provider/ProviderVouchersScreen';
import { CreateEditVoucherScreen } from '@/screens/provider/CreateEditVoucherScreen';
import { ProviderSubscriptionScreen } from '@/screens/provider/ProviderSubscriptionScreen';
import { ProviderReviews } from '@/screens/provider/ProviderReviews';
import { ProviderSettingsScreen } from '@/screens/provider/ProviderSettingsScreen';
import { AvailabilitySettingsScreen } from '@/screens/provider/AvailabilitySettingsScreen';
import { ProviderHelpScreen } from '@/screens/provider/ProviderHelpScreen';
import EditAboutMeScreen from '@/screens/provider/EditAboutMeScreen';
import EditSpecializationsScreen from '@/screens/provider/EditSpecializationsScreen';
import EditLanguagesScreen from '@/screens/provider/EditLanguagesScreen';
import EditSocialMediaScreen from '@/screens/provider/EditSocialMediaScreen';
import EditCertificationsScreen from '@/screens/provider/EditCertificationsScreen';
import { EditProfileScreen } from '@/screens/shared/EditProfileScreen';
import { AddressManagementScreen } from '@/screens/clients/AddressManagementScreen';
import { AddEditAddressScreen } from '@/screens/clients/AddEditAddressScreen';
import EditAddressScreen from '@/screens/provider/EditAddressScreen';
import ProviderOnboardingAddressScreen from '@/screens/provider/ProviderOnboardingAddressScreen';

const ProviderMoreStack = createNativeStackNavigator<ProviderMoreStackParamList>();

export function ProviderMoreStackScreen() {
    return (
        <ProviderMoreStack.Navigator>
            <ProviderMoreStack.Screen name="ProviderMore" component={ProviderMore} options={{ title: 'Mehr' }} />
            <ProviderMoreStack.Screen name="ProviderProfileScreen" component={ProviderProfileScreen} options={{ title: 'Mein Profil' }} />
            <ProviderMoreStack.Screen name="ProviderPublicProfileScreen" component={ProviderPublicProfileScreen} options={{ title: 'Öffentliches Profil' }} />
            <ProviderMoreStack.Screen name="ProviderServicesScreen" component={ServicesManagementScreen} options={{ title: 'Services & Preise' }} />
            <ProviderMoreStack.Screen name="AddEditServiceScreen" component={AddEditServiceScreen} options={{ title: 'Service bearbeiten' }} />
            <ProviderMoreStack.Screen name="ProviderPortfolioScreen" component={PortfolioManagementScreen} options={{ title: 'Portfolio verwalten' }} />
            <ProviderMoreStack.Screen name="UploadPortfolioScreen" component={UploadPortfolioScreen} options={{ title: 'Portfolio hochladen' }} />
            <ProviderMoreStack.Screen name="ProviderPhotoUploadScreen" component={ProviderPhotoUploadScreen} options={{ title: 'Profilbild ändern' }} />
            <ProviderMoreStack.Screen name="Booking" component={BookingFlow} options={{ title: 'Buchung' }} />
            <ProviderMoreStack.Screen name="ChatScreen" component={ChatScreen} options={{ title: 'Chat' }} />
            <ProviderMoreStack.Screen name="ProviderProfile" component={ProviderPublicProfileScreen} options={{ title: 'Profil ansehen' }} />
            <ProviderMoreStack.Screen name="PayoutRequestScreen" component={PayoutRequestScreen} options={{ title: 'Auszahlung beantragen' }} />
            <ProviderMoreStack.Screen name="TransactionsScreen" component={TransactionsScreen} options={{ title: 'Transaktionen' }} />
            <ProviderMoreStack.Screen name="ProviderAnalyticsScreen" component={ProviderAnalyticsScreen} options={{ title: 'Statistiken & Berichte' }} />
            <ProviderMoreStack.Screen name="ProviderVouchersScreen" component={ProviderVouchersScreen} options={{ title: 'Gutscheine & Angebote' }} />
            <ProviderMoreStack.Screen name="CreateEditVoucherScreen" component={CreateEditVoucherScreen} options={{ title: 'Gutschein' }} />
            <ProviderMoreStack.Screen name="AnalyticsDeashboardScreen" component={ProviderAnalyticsScreen} options={{ title: 'Analytics' }} />
            <ProviderMoreStack.Screen name="VoucherManagementScreen" component={ProviderVouchersScreen} options={{ title: 'Gutscheine verwalten' }} />
            <ProviderMoreStack.Screen name="CreatedEditVoucherScreen" component={CreateEditVoucherScreen} options={{ title: 'Gutschein bearbeiten' }} />
            <ProviderMoreStack.Screen name="ProviderSubscriptionScreen" component={ProviderSubscriptionScreen} options={{ title: 'Abonnement & Gebühren' }} />
            <ProviderMoreStack.Screen name="ProviderReviewsScreen" component={ProviderReviews} options={{ title: 'Bewertungen' }} />
            <ProviderMoreStack.Screen name="ProviderSettingsScreen" component={ProviderSettingsScreen} options={{ title: 'Einstellungen' }} />
            <ProviderMoreStack.Screen name="ProviderAvailabilityScreen" component={AvailabilitySettingsScreen} options={{ title: 'Verfügbarkeitszeiten' }} />
            <ProviderMoreStack.Screen name="ProviderHelpScreen" component={ProviderHelpScreen} options={{ title: 'Hilfe & Support' }} />
            <ProviderMoreStack.Screen name="AvailabilitySettingsScreen" component={AvailabilitySettingsScreen} options={{ title: 'Verfügbarkeitszeiten' }} />
            <ProviderMoreStack.Screen name="EditAboutMeScreen" component={EditAboutMeScreen} options={{ title: 'Über mich' }} />
            <ProviderMoreStack.Screen name="EditSpecializationsScreen" component={EditSpecializationsScreen} options={{ title: 'Spezialisierungen' }} />
            <ProviderMoreStack.Screen name="EditLanguagesScreen" component={EditLanguagesScreen} options={{ title: 'Sprachen' }} />
            <ProviderMoreStack.Screen name="EditSocialMediaScreen" component={EditSocialMediaScreen} options={{ title: 'Social Media' }} />
            <ProviderMoreStack.Screen name="EditCertificationsScreen" component={EditCertificationsScreen} options={{ title: 'Zertifikate & Ausbildungen' }} />
            <ProviderMoreStack.Screen name="EditProfileScreen" component={EditProfileScreen} options={{ title: 'Profil bearbeiten' }} />
            <ProviderMoreStack.Screen name="AddressManagementScreen" component={AddressManagementScreen} options={{ title: 'Meine Adressen' }} />
            <ProviderMoreStack.Screen name="AddEditAddressScreen" component={AddEditAddressScreen} options={{ title: 'Adresse' }} />
            <ProviderMoreStack.Screen name="EditAddressScreen" component={EditAddressScreen} options={{ headerShown: false, title: 'Adresse bearbeiten' }} />
            <ProviderMoreStack.Screen name="ProviderOnboardingAddressScreen" component={ProviderOnboardingAddressScreen} options={{ headerShown: false }} />
        </ProviderMoreStack.Navigator>
    );
}
