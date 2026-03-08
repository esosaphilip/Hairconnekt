import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useI18n } from '@/i18n';
import type { ClientProfileStackParamList } from '../types';

import { ProfileScreen } from '@/screens/clients/ProfileScreen';
// [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2
// import { NotificationsScreen } from '@/screens/clients/NotificationsScreen';
import { PersonalInfoScreen } from '@/screens/clients/PersonalInfoScreen';
// [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2
// import { HairPreferencesScreen } from '@/screens/clients/HairPreferencesScreen';
// [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2
import { FavoritesScreen } from '@/screens/clients/FavoritesScreen';
// [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2
// import { MyReviewsScreen } from '@/screens/clients/MyReviewsScreen';
// [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2
// import { BookingHistoryScreen } from '@/screens/clients/BookingHistoryScreen';
// [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2
// import { PaymentMethodsScreen } from '@/screens/clients/PaymentMethodsScreen';
// [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2
// import { VouchersScreen } from '@/screens/clients/VouchersScreen';
// [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2
// import { TransactionHistoryScreen } from '@/screens/clients/TransactionHistoryScreen';
// [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2
// import { LanguageScreen } from '@/screens/shared/LanguageScreen';
import { PrivacyPolicyScreen } from '@/screens/shared/PrivacyPolicyScreen';
// [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2
import { PrivacySecurityScreen } from '@/screens/shared/PrivacySecurityScreen';
// [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2
// import { SupportScreen } from '@/screens/shared/SupportScreen';
import { TermsScreen } from '@/screens/shared/TermsScreen';
import { ImprintScreen } from '@/screens/shared/ImprintScreen';
// [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2
import { DeleteAccountScreen } from '@/screens/shared/DeleteAccountScreen';
// [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2
// import { LoginScreen as UserManualScreen } from '@/screens/shared/UserManualScreen';
import { EditProfileScreen } from '@/screens/shared/EditProfileScreen';
// [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2
// import { AddressManagementScreen } from '@/screens/clients/AddressManagementScreen';
// [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2
// import { AddEditAddressScreen } from '@/screens/clients/AddEditAddressScreen';
// [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2
// import { SettingsScreen } from '@/screens/clients/SettingsScreen';
// [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2
// import { SecuritySettingsScreen } from '@/screens/clients/SecuritySettingsScreen';
// [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2
// import NotificationSettingsScreen from '@/screens/clients/NotificationSettingsScreen';
// [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2
// import WriteReviewScreen from '@/screens/clients/WriteReviewsScreen';
// [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2
// import AddPaymentMethodScreen from '@/screens/clients/AddPaymentMethodScreen';

const ClientProfileStack = createNativeStackNavigator<ClientProfileStackParamList>();

export function ClientProfileStackScreen() {
    const { t } = useI18n();
    return (
        <ClientProfileStack.Navigator>
            <ClientProfileStack.Screen name="Profile" component={ProfileScreen} options={{ title: t('screens.profile.title') }} />
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ClientProfileStack.Screen name="Settings" component={SettingsScreen} options={{ title: t('screens.profile.sections.settings') }} /> */}
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ClientProfileStack.Screen name="SecuritySettingsScreen" component={SecuritySettingsScreen} options={{ title: t('screens.profile.menu.privacy') || 'Sicherheit' }} /> */}
            <ClientProfileStack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: t('screens.profile.editProfile') }} />
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ClientProfileStack.Screen name="Notifications" component={NotificationsScreen} options={{ title: t('screens.profile.menu.notifications') }} /> */}
            <ClientProfileStack.Screen name="PersonalInfo" component={PersonalInfoScreen} options={{ title: t('screens.personalInfo.title') }} />
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ClientProfileStack.Screen name="Addresses" component={AddressManagementScreen} options={{ title: t('screens.profile.menu.addresses') }} /> */}
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ClientProfileStack.Screen name="AddressManagementScreen" component={AddressManagementScreen} options={{ title: t('screens.profile.menu.addresses') }} /> */}
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ClientProfileStack.Screen name="AddAddress" component={AddEditAddressScreen} options={{ title: t('screens.profile.menu.addressAdd') }} /> */}
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ClientProfileStack.Screen name="EditAddress" component={AddEditAddressScreen} options={{ title: t('screens.profile.menu.addressEdit') }} /> */}
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ClientProfileStack.Screen name="PrivacySettings" component={PrivacySecurityScreen} options={{ title: t('screens.profile.menu.privacy') }} /> */}
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ClientProfileStack.Screen name="NotificationSettings" component={NotificationSettingsScreen} options={{ title: t('screens.profile.menu.notifications') }} /> */}
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ClientProfileStack.Screen name="HairPreferences" component={HairPreferencesScreen} options={{ title: t('screens.profile.menu.preferences') }} /> */}
            {/* [MVP-RESTORED] */}
            <ClientProfileStack.Screen name="Favorites" component={FavoritesScreen} options={{ title: t('screens.profile.menu.favorites') }} />
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ClientProfileStack.Screen name="MyReviews" component={MyReviewsScreen} options={{ title: t('screens.profile.menu.myReviews') }} /> */}
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ClientProfileStack.Screen name="WriteReviews" component={WriteReviewScreen} options={{ title: t('screens.profile.menu.writeReviews') || 'Bewertung schreiben' }} /> */}
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ClientProfileStack.Screen name="BookingHistory" component={BookingHistoryScreen} options={{ title: t('screens.profile.menu.bookingHistory') }} /> */}
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ClientProfileStack.Screen name="PaymentMethods" component={PaymentMethodsScreen} options={{ title: t('screens.profile.menu.paymentMethods') }} /> */}
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ClientProfileStack.Screen name="AddPaymentMethod" component={AddPaymentMethodScreen} options={{ title: t('screens.profile.menu.addPaymentMethod') || 'Zahlungsmethode hinzufügen' }} /> */}
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ClientProfileStack.Screen name="Vouchers" component={VouchersScreen} options={{ title: t('screens.profile.menu.vouchers') }} /> */}
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ClientProfileStack.Screen name="Transactions" component={TransactionHistoryScreen} options={{ title: t('screens.profile.menu.transactions') }} /> */}
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ClientProfileStack.Screen name="Language" component={LanguageScreen} options={{ title: t('screens.language.title') }} /> */}
            {/* [MVP-RESTORED] mandatory for GDPR */}
            <ClientProfileStack.Screen name="Privacy" component={PrivacySecurityScreen} options={{ title: t('screens.profile.menu.privacy') }} />
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ClientProfileStack.Screen name="Support" component={SupportScreen} options={{ title: t('screens.profile.menu.support') }} /> */}
            <ClientProfileStack.Screen name="Terms" component={TermsScreen} options={{ title: t('screens.profile.menu.terms') }} />
            <ClientProfileStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ title: t('screens.profile.menu.privacyPolicy') }} />
            <ClientProfileStack.Screen name="Imprint" component={ImprintScreen} options={{ title: t('screens.profile.menu.imprint') }} />
            {/* [MVP-RESTORED] mandatory for App Store Guidelines */}
            <ClientProfileStack.Screen name="DeleteAccount" component={DeleteAccountScreen} options={{ title: t('screens.profile.menu.deleteAccount') }} />
            {/* [MVP-CUT] Reason: Feature cut for MVP reduction | Restore in: v2 */}
            {/* <ClientProfileStack.Screen name="About" options={{ title: t('screens.profile.menu.aboutHairConnekt') }}>
                {() => (
                    <UserManualScreen
                        initialState={{}}
                        onRegisterPress={(userType: 'client' | 'provider', returnUrl: string) => {
                            console.log('About: onRegisterPress', { userType, returnUrl });
                        }}
                        onForgotPasswordPress={() => {
                            console.log('About: onForgotPasswordPress');
                        }}
                        onLoginSuccess={(userType: 'client' | 'provider', returnUrl: string) => {
                            console.log('About: onLoginSuccess', { userType, returnUrl });
                        }}
                    />
                )}
            </ClientProfileStack.Screen> */}
        </ClientProfileStack.Navigator>
    );
}
