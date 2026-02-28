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
// [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2
// import { BookingFlow } from '@/screens/clients/Booking/BookingFlow';
// [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2
// import { ChatScreen } from '@/screens/shared/ChatScreen/ChatScreen';
// [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2
// import { PayoutRequestScreen } from '@/screens/provider/PayoutRequestScreen';
// [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2
// import { TransactionsScreen } from '@/screens/provider/TransactionsScreen';
// [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2
// import { ProviderAnalyticsScreen } from '@/screens/provider/ProviderAnalyticsScreen';
// [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2
// import { ProviderVouchersScreen } from '@/screens/provider/ProviderVouchersScreen';
// [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2
// import { CreateEditVoucherScreen } from '@/screens/provider/CreateEditVoucherScreen';
// [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2
// import { ProviderSubscriptionScreen } from '@/screens/provider/ProviderSubscriptionScreen';
// [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2
// import { ProviderReviews } from '@/screens/provider/ProviderReviews';
import { ProviderSettingsScreen } from '@/screens/provider/ProviderSettingsScreen';
import { AvailabilitySettingsScreen } from '@/screens/provider/AvailabilitySettingsScreen';
// [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2
// import { ProviderHelpScreen } from '@/screens/provider/ProviderHelpScreen';
// [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2
// import EditAboutMeScreen from '@/screens/provider/EditAboutMeScreen';
// [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2
// import EditSpecializationsScreen from '@/screens/provider/EditSpecializationsScreen';
// [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2
// import EditLanguagesScreen from '@/screens/provider/EditLanguagesScreen';
// [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2
// import EditSocialMediaScreen from '@/screens/provider/EditSocialMediaScreen';
// [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2
// import EditCertificationsScreen from '@/screens/provider/EditCertificationsScreen';
// [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2
// import { EditProfileScreen } from '@/screens/shared/EditProfileScreen';
// [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2
// import { AddressManagementScreen } from '@/screens/clients/AddressManagementScreen';
// [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2
// import { AddEditAddressScreen } from '@/screens/clients/AddEditAddressScreen';
// [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2
// import EditAddressScreen from '@/screens/provider/EditAddressScreen';
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
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ProviderMoreStack.Screen name="Booking" component={BookingFlow} options={{ title: 'Buchung' }} /> */}
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ProviderMoreStack.Screen name="ChatScreen" component={ChatScreen} options={{ title: 'Chat' }} /> */}
            <ProviderMoreStack.Screen name="ProviderProfile" component={ProviderPublicProfileScreen} options={{ title: 'Profil ansehen' }} />
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ProviderMoreStack.Screen name="PayoutRequestScreen" component={PayoutRequestScreen} options={{ title: 'Auszahlung beantragen' }} /> */}
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ProviderMoreStack.Screen name="TransactionsScreen" component={TransactionsScreen} options={{ title: 'Transaktionen' }} /> */}
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ProviderMoreStack.Screen name="ProviderAnalyticsScreen" component={ProviderAnalyticsScreen} options={{ title: 'Statistiken & Berichte' }} /> */}
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ProviderMoreStack.Screen name="ProviderVouchersScreen" component={ProviderVouchersScreen} options={{ title: 'Gutscheine & Angebote' }} /> */}
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ProviderMoreStack.Screen name="CreateEditVoucherScreen" component={CreateEditVoucherScreen} options={{ title: 'Gutschein' }} /> */}
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ProviderMoreStack.Screen name="AnalyticsDeashboardScreen" component={ProviderAnalyticsScreen} options={{ title: 'Analytics' }} /> */}
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ProviderMoreStack.Screen name="VoucherManagementScreen" component={ProviderVouchersScreen} options={{ title: 'Gutscheine verwalten' }} /> */}
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ProviderMoreStack.Screen name="CreatedEditVoucherScreen" component={CreateEditVoucherScreen} options={{ title: 'Gutschein bearbeiten' }} /> */}
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ProviderMoreStack.Screen name="ProviderSubscriptionScreen" component={ProviderSubscriptionScreen} options={{ title: 'Abonnement & Gebühren' }} /> */}
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ProviderMoreStack.Screen name="ProviderReviewsScreen" component={ProviderReviews} options={{ title: 'Bewertungen' }} /> */}
            <ProviderMoreStack.Screen name="ProviderSettingsScreen" component={ProviderSettingsScreen} options={{ title: 'Einstellungen' }} />
            <ProviderMoreStack.Screen name="ProviderAvailabilityScreen" component={AvailabilitySettingsScreen} options={{ title: 'Verfügbarkeitszeiten' }} />
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ProviderMoreStack.Screen name="ProviderHelpScreen" component={ProviderHelpScreen} options={{ title: 'Hilfe & Support' }} /> */}
            <ProviderMoreStack.Screen name="AvailabilitySettingsScreen" component={AvailabilitySettingsScreen} options={{ title: 'Verfügbarkeitszeiten' }} />
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ProviderMoreStack.Screen name="EditAboutMeScreen" component={EditAboutMeScreen} options={{ title: 'Über mich' }} /> */}
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ProviderMoreStack.Screen name="EditSpecializationsScreen" component={EditSpecializationsScreen} options={{ title: 'Spezialisierungen' }} /> */}
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ProviderMoreStack.Screen name="EditLanguagesScreen" component={EditLanguagesScreen} options={{ title: 'Sprachen' }} /> */}
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ProviderMoreStack.Screen name="EditSocialMediaScreen" component={EditSocialMediaScreen} options={{ title: 'Social Media' }} /> */}
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ProviderMoreStack.Screen name="EditCertificationsScreen" component={EditCertificationsScreen} options={{ title: 'Zertifikate & Ausbildungen' }} /> */}
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ProviderMoreStack.Screen name="EditProfileScreen" component={EditProfileScreen} options={{ title: 'Profil bearbeiten' }} /> */}
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ProviderMoreStack.Screen name="AddressManagementScreen" component={AddressManagementScreen} options={{ title: 'Meine Adressen' }} /> */}
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ProviderMoreStack.Screen name="AddEditAddressScreen" component={AddEditAddressScreen} options={{ title: 'Adresse' }} /> */}
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ProviderMoreStack.Screen name="EditAddressScreen" component={EditAddressScreen} options={{ headerShown: false, title: 'Adresse bearbeiten' }} /> */}
            <ProviderMoreStack.Screen name="ProviderOnboardingAddressScreen" component={ProviderOnboardingAddressScreen} options={{ headerShown: false }} />
        </ProviderMoreStack.Navigator>
    );
}
