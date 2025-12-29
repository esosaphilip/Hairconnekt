import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useI18n } from '@/i18n';
import type { ClientProfileStackParamList } from '../types';

import { ProfileScreen } from '@/screens/clients/ProfileScreen';
import { NotificationsScreen } from '@/screens/clients/NotificationsScreen';
import { PersonalInfoScreen } from '@/screens/clients/PersonalInfoScreen';
import { HairPreferencesScreen } from '@/screens/clients/HairPreferencesScreen';
import { FavoritesScreen } from '@/screens/clients/FavoritesScreen';
import { MyReviewsScreen } from '@/screens/clients/MyReviewsScreen';
import { BookingHistoryScreen } from '@/screens/clients/BookingHistoryScreen';
import { PaymentMethodsScreen } from '@/screens/clients/PaymentMethodsScreen';
import { VouchersScreen } from '@/screens/clients/VouchersScreen';
import { TransactionHistoryScreen } from '@/screens/clients/TransactionHistoryScreen';
import { LanguageScreen } from '@/screens/shared/LanguageScreen';
import { PrivacyPolicyScreen } from '@/screens/shared/PrivacyPolicyScreen';
import { PrivacySecurityScreen } from '@/screens/shared/PrivacySecurityScreen';
import { SupportScreen } from '@/screens/shared/SupportScreen';
import { TermsScreen } from '@/screens/shared/TermsScreen';
import { ImprintScreen } from '@/screens/shared/ImprintScreen';
import { DeleteAccountScreen } from '@/screens/shared/DeleteAccountScreen';
import { LoginScreen as UserManualScreen } from '@/screens/shared/UserManualScreen';
import { EditProfileScreen } from '@/screens/shared/EditProfileScreen';
import { AddressManagementScreen } from '@/screens/clients/AddressManagementScreen';
import { AddEditAddressScreen } from '@/screens/clients/AddEditAddressScreen';
import { SettingsScreen } from '@/screens/clients/SettingsScreen';
import { SecuritySettingsScreen } from '@/screens/clients/SecuritySettingsScreen';
import NotificationSettingsScreen from '@/screens/clients/NotificationSettingsScreen';
import WriteReviewScreen from '@/screens/clients/WriteReviewsScreen';
import AddPaymentMethodScreen from '@/screens/clients/AddPaymentMethodScreen';

const ClientProfileStack = createNativeStackNavigator<ClientProfileStackParamList>();

export function ClientProfileStackScreen() {
    const { t } = useI18n();
    return (
        <ClientProfileStack.Navigator>
            <ClientProfileStack.Screen name="Profile" component={ProfileScreen} options={{ title: t('screens.profile.title') }} />
            <ClientProfileStack.Screen name="Settings" component={SettingsScreen} options={{ title: t('screens.profile.sections.settings') }} />
            <ClientProfileStack.Screen name="SecuritySettingsScreen" component={SecuritySettingsScreen} options={{ title: t('screens.profile.menu.privacy') || 'Sicherheit' }} />
            <ClientProfileStack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: t('screens.profile.editProfile') }} />
            <ClientProfileStack.Screen name="Notifications" component={NotificationsScreen} options={{ title: t('screens.profile.menu.notifications') }} />
            <ClientProfileStack.Screen name="PersonalInfo" component={PersonalInfoScreen} options={{ title: t('screens.personalInfo.title') }} />
            <ClientProfileStack.Screen name="Addresses" component={AddressManagementScreen} options={{ title: t('screens.profile.menu.addresses') }} />
            <ClientProfileStack.Screen name="AddressManagementScreen" component={AddressManagementScreen} options={{ title: t('screens.profile.menu.addresses') }} />
            <ClientProfileStack.Screen name="AddAddress" component={AddEditAddressScreen} options={{ title: t('screens.profile.menu.addressAdd') }} />
            <ClientProfileStack.Screen name="EditAddress" component={AddEditAddressScreen} options={{ title: t('screens.profile.menu.addressEdit') }} />
            <ClientProfileStack.Screen name="PrivacySettings" component={PrivacySecurityScreen} options={{ title: t('screens.profile.menu.privacy') }} />
            <ClientProfileStack.Screen name="NotificationSettings" component={NotificationSettingsScreen} options={{ title: t('screens.profile.menu.notifications') }} />
            <ClientProfileStack.Screen name="HairPreferences" component={HairPreferencesScreen} options={{ title: t('screens.profile.menu.preferences') }} />
            <ClientProfileStack.Screen name="Favorites" component={FavoritesScreen} options={{ title: t('screens.profile.menu.favorites') }} />
            <ClientProfileStack.Screen name="MyReviews" component={MyReviewsScreen} options={{ title: t('screens.profile.menu.myReviews') }} />
            <ClientProfileStack.Screen name="WriteReviews" component={WriteReviewScreen} options={{ title: t('screens.profile.menu.writeReviews') || 'Bewertung schreiben' }} />
            <ClientProfileStack.Screen name="BookingHistory" component={BookingHistoryScreen} options={{ title: t('screens.profile.menu.bookingHistory') }} />
            <ClientProfileStack.Screen name="PaymentMethods" component={PaymentMethodsScreen} options={{ title: t('screens.profile.menu.paymentMethods') }} />
            <ClientProfileStack.Screen name="AddPaymentMethod" component={AddPaymentMethodScreen} options={{ title: t('screens.profile.menu.addPaymentMethod') || 'Zahlungsmethode hinzufügen' }} />
            <ClientProfileStack.Screen name="Vouchers" component={VouchersScreen} options={{ title: t('screens.profile.menu.vouchers') }} />
            <ClientProfileStack.Screen name="Transactions" component={TransactionHistoryScreen} options={{ title: t('screens.profile.menu.transactions') }} />
            <ClientProfileStack.Screen name="Language" component={LanguageScreen} options={{ title: t('screens.language.title') }} />
            <ClientProfileStack.Screen name="Privacy" component={PrivacySecurityScreen} options={{ title: t('screens.profile.menu.privacy') }} />
            <ClientProfileStack.Screen name="Support" component={SupportScreen} options={{ title: t('screens.profile.menu.support') }} />
            <ClientProfileStack.Screen name="Terms" component={TermsScreen} options={{ title: t('screens.profile.menu.terms') }} />
            <ClientProfileStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ title: t('screens.profile.menu.privacyPolicy') }} />
            <ClientProfileStack.Screen name="Imprint" component={ImprintScreen} options={{ title: t('screens.profile.menu.imprint') }} />
            <ClientProfileStack.Screen name="DeleteAccount" component={DeleteAccountScreen} options={{ title: t('screens.profile.menu.deleteAccount') }} />
            <ClientProfileStack.Screen name="About" options={{ title: t('screens.profile.menu.aboutHairConnekt') }}>
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
            </ClientProfileStack.Screen>
        </ClientProfileStack.Navigator>
    );
}
