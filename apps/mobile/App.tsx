import { useEffect, useState } from 'react';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView, Text, Platform, StyleSheet } from 'react-native';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from '@/auth/AuthContext';
import { I18nProvider, useI18n } from '@/i18n';
import { rootNavigationRef } from '@/navigation/rootNavigation';
import { LoginScreen } from '@/screens/shared/UserManualScreen';
import RegisterScreen from '@/screens/shared/RegisterScreen';
import WelcomeScreen from '@/screens/shared/WelcomeScreen';
import AccountTypeSelectionScreen from '@/screens/shared/AccountTypeSelection';
// Newly added unauthenticated and utility screens
import { SignInPrompt } from '@/screens/shared/SignInPrompt';
import { ClientOnboardingScreen } from '@/screens/clients/ClientOnboardingScreen';
import { LocationSelectionScreen } from '@/screens/clients/LocationSelectionScreen';
import { SplashScreen } from '@/screens/shared/SplashScreen';
// Client app screens (tabs)
import { HomeScreen } from '@/screens/clients/HomeScreen';
import { SearchScreen } from '@/screens/clients/SearchScreen';
import { MessagesScreen } from '@/screens/clients/MessagesScreen';
import { ProfileScreen } from '@/screens/clients/ProfileScreen';
import { ProviderRegistrationFlow } from '@/screens/provider/ProviderRegistrationFlow';
import { PendingApprovalScreen } from '@/screens/provider/PendingApprovalScreen';
import BookingsListScreen from '@/screens/clients/BookingsListScreen';
import AppointmentDetailScreen from '@/screens/clients/AppointmentDetailScreen';
// Appointment-related new screens
import { AppointmentsScreen } from '@/screens/clients/AppointmentsScreen';
import CancelAppointmentScreen from '@/screens/shared/CancelAppointmentScreen';
import RescheduleAppointmentScreen from '@/screens/clients/RescheduleAppoinmentScreen';
// Reviews
import WriteReviewScreen from '@/screens/clients/WriteReviewsScreen';
// Provider app screens
import { ProviderDashboard } from '@/screens/provider/ProviderDashboard';
import ProviderCalendar from '@/screens/provider/ProviderCalendar';
import ProviderClients from '@/screens/provider/ProviderClients';
import { ProviderMore } from '@/screens/provider/ProviderMore';
import { AvailabilitySettingsScreen } from '@/screens/provider/AvailabilitySettingsScreen';
import { BlockTimeScreen } from '@/screens/provider/BlockTimeScreen';
import { CreateAppointmentScreen } from '@/screens/provider/CreateAppointmentScreen';
import { ClientDetailScreen } from '@/screens/provider/ClientDetailScreen';
import { ProviderProfileScreen } from '@/screens/provider/ProviderProfileScreen';
import { ProviderPublicProfileScreen } from '@/screens/provider/ProviderPublicProfileScreen';
import { ServicesManagementScreen } from '@/screens/provider/ServicesManagementScreen';
import { PortfolioManagementScreen } from '@/screens/provider/PortfolioManagementScreen';
import { ProviderAnalyticsScreen } from '@/screens/provider/ProviderAnalyticsScreen';
import { ProviderVouchersScreen } from '@/screens/provider/ProviderVouchersScreen';
import { CreateEditVoucherScreen } from '@/screens/provider/CreateEditVoucherScreen';
import { AddEditServiceScreen } from '@/screens/provider/AddEditServiceScreen';
import { ProviderSubscriptionScreen } from '@/screens/provider/ProviderSubscriptionScreen';
import { ProviderSettingsScreen } from '@/screens/provider/ProviderSettingsScreen';
import { ProviderHelpScreen } from '@/screens/provider/ProviderHelpScreen';
import { PayoutRequestScreen } from '@/screens/provider/PayoutRequestScreen';
import { ProviderReviews } from '@/screens/provider/ProviderReviews';
import { TransactionsScreen } from '@/screens/provider/TransactionsScreen';
import { BookingFlow } from '@/screens/clients/BookingFlow';
import { ChatScreen } from '@/screens/shared/ChatScreen';
import { providersApi } from '@/services/providers';
// Client utility screens
import { MapViewScreen } from '@/screens/clients/MapViewScreen';
import { SettingsScreen } from '@/screens/clients/SettingsScreen';
import { SecuritySettingsScreen } from '@/screens/clients/SecuritySettingsScreen';
// Shared client management screens
import { EditProfileScreen } from '@/screens/shared/EditProfileScreen';
import BecomeProviderScreen from '@/screens/shared/BecomeProviderScreen';
import { AddressManagementScreen } from '@/screens/clients/AddressManagementScreen';
import { AddEditAddressScreen } from '@/screens/clients/AddEditAddressScreen';
import { AllStylesScreen } from '@/screens/clients/AllStylesScreen';
// Profile payments and notifications
import AddPaymentMethodScreen from '@/screens/clients/AddPaymentMethodScreen';
import NotificationSettingsScreen from '@/screens/clients/NotificationSettingsScreen';

import type {
  RootStackParamList,
  RootStackScreenProps,
  BookingsStackParamList,
  ClientProfileStackParamList,
  ProviderCalendarStackParamList,
  ProviderClientsStackParamList,
  ProviderMoreStackParamList,
} from '@/navigation/types';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();
const BookingsStack = createNativeStackNavigator<BookingsStackParamList>();
const ProviderCalendarStack = createNativeStackNavigator<ProviderCalendarStackParamList>();
const ProviderClientsStack = createNativeStackNavigator<ProviderClientsStackParamList>();
const ProviderMoreStack = createNativeStackNavigator<ProviderMoreStackParamList>();
const ClientProfileStack = createNativeStackNavigator<ClientProfileStackParamList>();



function Tabs() {
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
          return <Ionicons name={iconName} size={size} color={color} />;
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
          // Ensure selecting the Profile tab always shows the root Profile screen,
          // and not the last visited sub-screen (e.g., Favorites)
          tabPress: () => {
            try {
              navigation.navigate('Profile', { screen: 'Profile' });
            } catch {}
          },
        })}
      />
    </Tab.Navigator>
  );
}

function BookingsStackScreen() {
  const { t } = useI18n();
  return (
    <BookingsStack.Navigator>
      <BookingsStack.Screen name="BookingsList" component={BookingsListScreen} options={{ title: t('screens.bookings.title') }} />
      <BookingsStack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} options={{ title: t('screens.bookings.detailTitle') }} />
      {/* Alias route for components that navigate using 'AppointmentDetails' */}
      <BookingsStack.Screen name="AppointmentDetails" component={AppointmentDetailScreen} options={{ title: t('screens.bookings.detailTitle') }} />
      {/* New flows for appointment management */}
      <BookingsStack.Screen name="CancelAppointment" component={CancelAppointmentScreen} options={{ title: t('screens.bookings.cancelTitle') }} />
      <BookingsStack.Screen name="RescheduleAppointment" component={RescheduleAppointmentScreen} options={{ title: t('screens.bookings.rescheduleTitle') }} />
      {/* Temporary overview/placeholder screen */}
      <BookingsStack.Screen name="AppointmentsOverview" component={AppointmentsScreen} options={{ title: t('screens.bookings.overviewTitle') }} />
    </BookingsStack.Navigator>
  );
}

// Provider app navigators
function ProviderCalendarStackScreen() {
  return (
    <ProviderCalendarStack.Navigator>
      <ProviderCalendarStack.Screen name="ProviderCalendar" component={ProviderCalendar} options={{ title: 'Kalender' }} />
      {/* Alias route to match navigation target used in CreateAppointmentScreen */}
      <ProviderCalendarStack.Screen name="ProviderCalendarScreen" component={ProviderCalendar} options={{ title: 'Kalender' }} />
      <ProviderCalendarStack.Screen name="CreateAppointmentScreen" component={CreateAppointmentScreen} options={{ title: 'Termin erstellen' }} />
      <ProviderCalendarStack.Screen name="BlockTimeScreen" component={BlockTimeScreen} options={{ title: 'Zeit blockieren' }} />
    </ProviderCalendarStack.Navigator>
  );
}

function ProviderClientsStackScreen() {
  return (
    <ProviderClientsStack.Navigator>
      <ProviderClientsStack.Screen name="ProviderClients" component={ProviderClients} options={{ title: 'Kunden' }} />
      <ProviderClientsStack.Screen name="ProviderClientDetail" component={ClientDetailScreen} options={{ title: 'Kunde' }} />
    </ProviderClientsStack.Navigator>
  );
}

function ProviderMoreStackScreen() {
  return (
    <ProviderMoreStack.Navigator>
      <ProviderMoreStack.Screen name="ProviderMore" component={ProviderMore} options={{ title: 'Mehr' }} />
      {/* Business Management */}
      <ProviderMoreStack.Screen name="ProviderProfileScreen" component={ProviderProfileScreen} options={{ title: 'Mein Profil' }} />
      <ProviderMoreStack.Screen name="ProviderPublicProfileScreen" component={ProviderPublicProfileScreen} options={{ title: 'Öffentliches Profil' }} />
      <ProviderMoreStack.Screen name="ProviderServicesScreen" component={ServicesManagementScreen} options={{ title: 'Services & Preise' }} />
      <ProviderMoreStack.Screen name="AddEditServiceScreen" component={AddEditServiceScreen} options={{ title: 'Service bearbeiten' }} />
      <ProviderMoreStack.Screen name="ProviderPortfolioScreen" component={PortfolioManagementScreen} options={{ title: 'Portfolio verwalten' }} />
      {/* Booking & Chat */}
      {/* Alias route used by ChatScreen when navigating to booking */}
      <ProviderMoreStack.Screen name="Booking" component={BookingFlow} options={{ title: 'Buchung' }} />
      <ProviderMoreStack.Screen name="BookingFlowScreen" component={BookingFlow} options={{ title: 'Buchung' }} />
      <ProviderMoreStack.Screen name="ChatScreen" component={ChatScreen} options={{ title: 'Chat' }} />
      {/* Alias to match navigation target from ChatScreen for viewing provider profile */}
      <ProviderMoreStack.Screen name="ProviderProfile" component={ProviderPublicProfileScreen} options={{ title: 'Profil ansehen' }} />
      {/* Finanzen */}
      <ProviderMoreStack.Screen name="PayoutRequestScreen" component={PayoutRequestScreen} options={{ title: 'Auszahlung beantragen' }} />
      <ProviderMoreStack.Screen name="TransactionsScreen" component={TransactionsScreen} options={{ title: 'Transaktionen' }} />
      <ProviderMoreStack.Screen name="ProviderAnalyticsScreen" component={ProviderAnalyticsScreen} options={{ title: 'Statistiken & Berichte' }} />
      <ProviderMoreStack.Screen name="ProviderVouchersScreen" component={ProviderVouchersScreen} options={{ title: 'Gutscheine & Angebote' }} />
      <ProviderMoreStack.Screen name="CreateEditVoucherScreen" component={CreateEditVoucherScreen} options={{ title: 'Gutschein' }} />
      {/* Aliases requested */}
      <ProviderMoreStack.Screen name="AnalyticsDeashboardScreen" component={ProviderAnalyticsScreen} options={{ title: 'Analytics' }} />
      <ProviderMoreStack.Screen name="VoucherManagementScreen" component={ProviderVouchersScreen} options={{ title: 'Gutscheine verwalten' }} />
      <ProviderMoreStack.Screen name="CreatedEditVoucherScreen" component={CreateEditVoucherScreen} options={{ title: 'Gutschein bearbeiten' }} />
      <ProviderMoreStack.Screen name="ProviderSubscriptionScreen" component={ProviderSubscriptionScreen} options={{ title: 'Abonnement & Gebühren' }} />
      {/* Feedback */}
      <ProviderMoreStack.Screen name="ProviderReviewsScreen" component={ProviderReviews} options={{ title: 'Bewertungen' }} />
      {/* Einstellungen */}
      <ProviderMoreStack.Screen name="ProviderSettingsScreen" component={ProviderSettingsScreen} options={{ title: 'Einstellungen' }} />
      {/* Alias to match navigation target from ProviderSettingsScreen */}
      <ProviderMoreStack.Screen name="ProviderAvailabilityScreen" component={AvailabilitySettingsScreen} options={{ title: 'Verfügbarkeitszeiten' }} />
      <ProviderMoreStack.Screen name="ProviderHelpScreen" component={ProviderHelpScreen} options={{ title: 'Hilfe & Support' }} />
      {/* Shared/edit screens */}
      <ProviderMoreStack.Screen name="AvailabilitySettingsScreen" component={AvailabilitySettingsScreen} options={{ title: 'Verfügbarkeitszeiten' }} />
      <ProviderMoreStack.Screen name="EditProfileScreen" component={EditProfileScreen} options={{ title: 'Profil bearbeiten' }} />
      <ProviderMoreStack.Screen name="AddressManagementScreen" component={AddressManagementScreen} options={{ title: 'Meine Adressen' }} />
      <ProviderMoreStack.Screen name="AddEditAddressScreen" component={AddEditAddressScreen} options={{ title: 'Adresse' }} />
    </ProviderMoreStack.Navigator>
  );
}

// Client profile stack with all profile-related screens
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
// Alias the LoginScreen from UserManualScreen file to serve as a temporary About/User Manual screen
import { LoginScreen as UserManualScreen } from '@/screens/shared/UserManualScreen';
// Verification screen is a named export; import and register it directly instead of using dynamic require
import { VerificationScreen } from '@/screens/shared/VerificationScreen';

function ClientProfileStackScreen() {
  const { t } = useI18n();
  return (
    <ClientProfileStack.Navigator>
      <ClientProfileStack.Screen name="Profile" component={ProfileScreen} options={{ title: t('screens.profile.title') }} />
      {/* Settings screens */}
      <ClientProfileStack.Screen name="Settings" component={PrivacySecurityScreen} options={{ title: t('screens.profile.sections.settings') }} />
      <ClientProfileStack.Screen name="SettingsScreen" component={SettingsScreen} options={{ title: t('screens.profile.sections.settings') }} />
      <ClientProfileStack.Screen name="SecuritySettingsScreen" component={SecuritySettingsScreen} options={{ title: t('screens.profile.menu.privacy') || 'Sicherheit' }} />
      {/* Profile management */}
      <ClientProfileStack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: t('screens.profile.editProfile') }} />
      <ClientProfileStack.Screen name="Notifications" component={NotificationsScreen} options={{ title: t('screens.profile.menu.notifications') }} />
      <ClientProfileStack.Screen name="PersonalInfo" component={PersonalInfoScreen} options={{ title: t('screens.personalInfo.title') }} />
      <ClientProfileStack.Screen name="Addresses" component={AddressManagementScreen} options={{ title: t('screens.profile.menu.addresses') }} />
      {/* Alias to match navigation targets used in AddEditAddressScreen */}
      <ClientProfileStack.Screen name="AddressManagementScreen" component={AddressManagementScreen} options={{ title: t('screens.profile.menu.addresses') }} />
      {/* Address add/edit flows */}
      <ClientProfileStack.Screen name="AddAddress" component={AddEditAddressScreen} options={{ title: t('screens.profile.menu.addressAdd') }} />
      <ClientProfileStack.Screen name="EditAddress" component={AddEditAddressScreen} options={{ title: t('screens.profile.menu.addressEdit') }} />
      {/* Aliases to match navigation targets from DeleteAccountScreen */}
      <ClientProfileStack.Screen name="PrivacySettings" component={PrivacySecurityScreen} options={{ title: t('screens.profile.menu.privacy') }} />
      {/* Dedicated notification settings screen */}
      <ClientProfileStack.Screen name="NotificationSettings" component={NotificationSettingsScreen} options={{ title: t('screens.profile.menu.notifications') }} />
      <ClientProfileStack.Screen name="HairPreferences" component={HairPreferencesScreen} options={{ title: t('screens.profile.menu.preferences') }} />
      {/* Activities */}
      <ClientProfileStack.Screen name="Favorites" component={FavoritesScreen} options={{ title: t('screens.profile.menu.favorites') }} />
      <ClientProfileStack.Screen name="MyReviews" component={MyReviewsScreen} options={{ title: t('screens.profile.menu.myReviews') }} />
      {/* Allow users to write reviews */}
      <ClientProfileStack.Screen name="WriteReviews" component={WriteReviewScreen} options={{ title: t('screens.profile.menu.writeReviews') || 'Bewertung schreiben' }} />
      <ClientProfileStack.Screen name="BookingHistory" component={BookingHistoryScreen} options={{ title: t('screens.profile.menu.bookingHistory') }} />
      {/* Payments */}
      <ClientProfileStack.Screen name="PaymentMethods" component={PaymentMethodsScreen} options={{ title: t('screens.profile.menu.paymentMethods') }} />
      <ClientProfileStack.Screen name="AddPaymentMethod" component={AddPaymentMethodScreen} options={{ title: t('screens.profile.menu.addPaymentMethod') || 'Zahlungsmethode hinzufügen' }} />
      <ClientProfileStack.Screen name="Vouchers" component={VouchersScreen} options={{ title: t('screens.profile.menu.vouchers') }} />
      <ClientProfileStack.Screen name="Transactions" component={TransactionHistoryScreen} options={{ title: t('screens.profile.menu.transactions') }} />
      {/* Settings subpages */}
      <ClientProfileStack.Screen name="Language" component={LanguageScreen} options={{ title: t('screens.language.title') }} />
      <ClientProfileStack.Screen name="Privacy" component={PrivacySecurityScreen} options={{ title: t('screens.profile.menu.privacy') }} />
      <ClientProfileStack.Screen name="Support" component={SupportScreen} options={{ title: t('screens.profile.menu.support') }} />
      {/* Legal */}
      <ClientProfileStack.Screen name="Terms" component={TermsScreen} options={{ title: t('screens.profile.menu.terms') }} />
      <ClientProfileStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ title: t('screens.profile.menu.privacyPolicy') }} />
      <ClientProfileStack.Screen name="Imprint" component={ImprintScreen} options={{ title: t('screens.profile.menu.imprint') }} />
      {/* Account actions */}
      <ClientProfileStack.Screen name="DeleteAccount" component={DeleteAccountScreen} options={{ title: t('screens.profile.menu.deleteAccount') }} />
      {/* Render placeholder UserManualScreen (Login UI) with required props until a dedicated About screen exists */}
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

function ProviderTabs() {
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
      try { clearTimeout(watchdog); } catch {}
    };
  }, []);
  const gateResolved = checked;
  const getProviderTabKey = (name: string) => (
    name === 'Dashboard' ? 'dashboard' :
    name === 'Kalender' ? 'calendar' :
    name === 'Kunden' ? 'clients' :
    name === 'Nachrichten' ? 'messages' :
    'more'
  );
  if (!gateResolved) {
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
            route.name === 'Kunden' ? 'people-outline' :
            route.name === 'Nachrichten' ? 'chatbubble-ellipses-outline' :
            'menu-outline';
          // Use dynamic iconName without TypeScript assertions for JS compatibility
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabel: t(`providerTabs.${getProviderTabKey(route.name)}`),
        headerTitle: t(`providerTabs.${getProviderTabKey(route.name)}`),
      })}
    >
      <Tab.Screen name="Dashboard" component={ProviderDashboard} />
      <Tab.Screen name="Kalender" component={ProviderCalendarStackScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Kunden" component={ProviderClientsStackScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Nachrichten" component={MessagesScreen} />
      <Tab.Screen name="Mehr" component={ProviderMoreStackScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();
  const { mode } = useUserMode();
  // Shared root navigation ref is used for imperative navigation (web hash-based routing)
  
  // Ensure that after logout (user becomes null) we immediately reset to Welcome on the root navigator.
  // This avoids race conditions where nested screens attempt to reset to a route not present in the logged-in stack.
  useEffect(() => {
    if (!loading && !user) {
      // Defer slightly to ensure the unauthenticated stack is mounted
      setTimeout(() => {
        try {
          rootNavigationRef.current?.dispatch(
            CommonActions.reset({ index: 0, routes: [{ name: 'Welcome' }] })
          );
        } catch {}
      }, 0);
    }
  }, [user, loading]);
  
  // Minimal web hash router to keep backward-compat with existing window.location.hash paths
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handleHashNavigation = () => {
      const rawHash = typeof window !== 'undefined' ? window.location.hash || '' : '';
      const path = rawHash.replace(/^#/, '');
      const [route, queryString] = path.split('?');
      const qs = new URLSearchParams(queryString || '');
      const userType = String(user?.userType || '').toLowerCase();
      const isProvider = userType === 'provider' || userType === 'both';
      // Map common provider and client routes
      // Dynamic routes first
      if (route?.startsWith('/provider/clients/')) {
        if (isProvider) {
          const id = route.split('/').pop();
          rootNavigationRef.current?.navigate('ProviderTabs', { screen: 'Kunden', params: { screen: 'ProviderClientDetail', params: { id } } });
        }
        return;
      }
      if (route?.startsWith('/provider/services/edit/')) {
        if (isProvider) {
          // Services management handles edit mode by reading the hash itself; navigate to the Services screen
          rootNavigationRef.current?.navigate('ProviderTabs', { screen: 'Mehr', params: { screen: 'ProviderServicesScreen' } });
        }
        return;
      }
      // Public provider detail: allow deep linking via hash
      if (route?.startsWith('/provider/public/')) {
        const id = route.split('/').pop();
        if (id) rootNavigationRef.current?.navigate('ProviderDetail', { id });
        return;
      }
      // Generic provider detail alias: /provider/:id
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
      // Static routes
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
          if (isProvider) {
            rootNavigationRef.current?.navigate('ProviderTabs', { screen: 'Mehr', params: { screen: 'ProviderServicesScreen' } });
          }
          break;
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
            // When logged out, send users to Login/Welcome instead of Tabs
            rootNavigationRef.current?.navigate('Login');
          }
          break;
        case '/login':
          rootNavigationRef.current?.navigate('Login');
          break;
        case '/register':
          rootNavigationRef.current?.navigate('Register');
          break;
        default:
          // No-op for paths we don't explicitly handle
          break;
      }
    };
    window.addEventListener('hashchange', handleHashNavigation);
    // Perform an initial navigation for the current hash on load
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
      {user ? (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
          {/* Route to provider vs client app based on userType */}
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
          {/* Global provider detail (public profile) route accessible from anywhere */}
          <Stack.Screen name="ProviderDetail" component={ProviderPublicProfileScreen} options={{ headerShown: false }} />
          {/* Global client routes accessible from anywhere */}
          <Stack.Screen name="AllStyles" component={AllStylesScreen} options={{ headerShown: true, title: 'Alle Styles' }} />
          {/* Client map view */}
          <Stack.Screen name="MapViewScreen" component={MapViewScreen} options={{ headerShown: true, title: 'Karte' }} />
          {/* Shared verification screen used by MessagesScreen */}
          <Stack.Screen name="Verify" component={VerificationScreen} options={{ headerShown: true, title: 'Verifizieren' }} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator initialRouteName="Welcome">
          {/* Optional splash screen that can redirect based on auth state */}
          <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginRoute} options={{ title: 'Anmelden' }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Registrieren' }} />
          {/* Alias for Register component removed to align with typed routes */}
          {/* Guest browsing entry */}
          <Stack.Screen name="SignInPrompt" component={SignInPrompt} options={{ title: 'Anmelden oder fortfahren' }} />
          {/* Onboarding and location selection */}
          <Stack.Screen name="ClientOnboarding" component={ClientOnboardingScreen} options={{ headerShown: false }} />
          <Stack.Screen name="LocationSelection" component={LocationSelectionScreen} options={{ title: 'Standort wählen' }} />
          {/* Alias to match navigation target used in ClientOnboardingScreen */}
          <Stack.Screen name="LocationAccess" component={LocationSelectionScreen} options={{ title: 'Standortzugriff' }} />
          {/* Alias for Home navigation from unauthenticated flows; renders Tabs */}
          <Stack.Screen name="Home" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen name="AccountType" component={AccountTypeSelectionScreen} options={{ title: 'Kontotyp' }} />
          <Stack.Screen name="ProviderRegistration" component={ProviderRegistrationFlow} options={{ title: 'Anbieter-Registrierung' }} />
          <Stack.Screen name="ProviderPendingApproval" component={PendingApprovalScreen} options={{ title: 'Prüfung ausstehend' }} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <UserModeProvider>
        <I18nProvider>
          <ErrorBoundary>
            <ModeSwitcher />
            <RootNavigator />
          </ErrorBoundary>
        </I18nProvider>
      </UserModeProvider>
    </AuthProvider>
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
      onForgotPasswordPress={() => {}}
      onLoginSuccess={() => {
        // No-op: the RootNavigator will re-render to the authenticated stack
        // based on the updated auth context.
      }}
    />
  );
}
import { UserModeProvider, useUserMode } from '@/state/UserModeContext';
import ModeSwitcher from '@/components/ModeSwitcher';
      <ClientProfileStack.Screen name="BecomeProvider" component={BecomeProviderScreen} options={{ title: 'Anbieter werden' }} />
