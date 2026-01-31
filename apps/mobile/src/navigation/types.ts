import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// Root Stack
export type RootStackParamList = {
  Welcome: undefined;
  Login: { returnUrl?: string; userType?: 'client' | 'provider' } | undefined;
  Register: { userType?: 'client' | 'provider' } | undefined;
  AccountType: undefined;
  ProviderRegistration: undefined;
  ProviderPendingApproval: undefined;
  Tabs: undefined;
  ProviderTabs: undefined;
  ProviderDashboard: undefined;
  ProviderDetail: { id: string };
  AllStyles: undefined;
  MapViewScreen: undefined;
  Verify: { userId?: string } | undefined;
  Splash: undefined;
  ClientOnboarding: undefined;
  LocationSelection: undefined;
  LocationAccess: undefined;
  Home: undefined;
  SignInPrompt: { returnUrl?: string } | undefined;
  ProviderNotificationsScreen: undefined;
  Booking: { id?: string; providerId?: string; serviceName?: string } | undefined;
  ChatScreen: { id?: string; conversationId?: string; userId?: string } | undefined;
  PasswordReset: { token?: string } | undefined;
};

// Client Tabs
export type ClientTabsParamList = {
  Home: undefined;
  Search: undefined;
  Appointments: undefined;
  Messages: undefined;
  Profile: undefined;
};

// Bookings Stack
export type BookingsStackParamList = {
  BookingsList: undefined;
  AppointmentDetail: { id: string };

  CancelAppointment: { id: string };
  RescheduleAppointment: { id: string };
  AppointmentsOverview: undefined;
};

// Client Profile Stack
export type ClientProfileStackParamList = {
  Profile: undefined;
  BecomeProvider: undefined;
  Settings: undefined;
  SettingsScreen: undefined;
  SecuritySettingsScreen: undefined;
  EditProfile: undefined;
  Notifications: undefined;
  NotificationSettings: undefined;
  PersonalInfo: undefined;
  Addresses: undefined;
  AddressManagementScreen: undefined;
  AddAddress: undefined;
  EditAddress: { id: string };
  PrivacySettings: undefined;
  HairPreferences: undefined;
  Favorites: undefined;
  MyReviews: undefined;
  WriteReviews: { providerId?: string; appointmentId?: string } | undefined;
  BookingHistory: undefined;
  PaymentMethods: undefined;
  AddPaymentMethod: undefined;
  Vouchers: undefined;
  Transactions: undefined;
  Language: undefined;
  Privacy: undefined;
  Support: undefined;
  Terms: undefined;
  PrivacyPolicy: undefined;
  Imprint: undefined;
  DeleteAccount: undefined;
  About: undefined;
};

// Provider Tabs
export type ProviderTabsParamList = {
  Dashboard: undefined;
  Kalender: undefined;
  Kunden: undefined;
  Nachrichten: undefined;
  Mehr: undefined;
};

// Provider Calendar Stack
export type ProviderCalendarStackParamList = {
  ProviderCalendar: undefined;
  ProviderCalendarScreen: undefined; // Alias
  CreateAppointmentScreen: { clientId?: string } | undefined;
  BlockTimeScreen: undefined;
  AppointmentRequestScreen: { id: string };
};


// Provider Clients Stack
export type ProviderClientsStackParamList = {
  ProviderClients: undefined;
  ProviderClientDetail: { id: string };
  ProviderAddClientScreen: undefined;
};

// Provider More Stack
export type ProviderMoreStackParamList = {
  ProviderMore: undefined;
  ProviderProfileScreen: undefined;
  ProviderNotificationsScreen: undefined;
  ProviderPublicProfileScreen: { id?: string; providerId?: string } | undefined;
  ProviderServicesScreen: { mode?: 'add' | 'edit'; serviceId?: string } | undefined;
  AddEditServiceScreen: { serviceId?: string } | undefined;
  ProviderPortfolioScreen: undefined;
  UploadPortfolioScreen: undefined;
  Booking: { id?: string; providerId?: string; serviceName?: string } | undefined;
  ChatScreen: { conversationId?: string; userId?: string } | undefined;
  ProviderProfile: { id: string };
  PayoutRequestScreen: undefined;
  TransactionsScreen: undefined;
  ProviderAnalyticsScreen: undefined;
  ProviderVouchersScreen: undefined;
  CreateEditVoucherScreen: { id?: string } | undefined;
  AnalyticsDeashboardScreen: undefined; // Alias
  VoucherManagementScreen: undefined; // Alias
  CreatedEditVoucherScreen: { id?: string } | undefined; // Alias
  ProviderSubscriptionScreen: undefined;
  ProviderReviewsScreen: undefined;
  ProviderSettingsScreen: undefined;
  ProviderAvailabilityScreen: undefined;
  AvailabilitySettingsScreen: undefined;
  ProviderHelpScreen: undefined;
  EditProfileScreen: undefined;
  EditAboutMeScreen: undefined;
  EditCertificationsScreen: undefined;
  EditLanguagesScreen: undefined;
  EditSocialMediaScreen: undefined;
  EditSpecializationsScreen: undefined;
  AddressManagementScreen: undefined;
  AddEditAddressScreen: { id?: string } | undefined;
  EditAddressScreen: { id?: string } | undefined;
  ProviderOnboardingAddressScreen: undefined;
  ProviderPhotoUploadScreen: undefined;
};

// Helper types for screen props
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type BookingsStackScreenProps<T extends keyof BookingsStackParamList> =
  NativeStackScreenProps<BookingsStackParamList, T>;

export type ClientProfileStackScreenProps<T extends keyof ClientProfileStackParamList> =
  NativeStackScreenProps<ClientProfileStackParamList, T>;

export type ProviderCalendarStackScreenProps<T extends keyof ProviderCalendarStackParamList> =
  NativeStackScreenProps<ProviderCalendarStackParamList, T>;

export type ProviderClientsStackScreenProps<T extends keyof ProviderClientsStackParamList> =
  NativeStackScreenProps<ProviderClientsStackParamList, T>;

export type ProviderMoreStackScreenProps<T extends keyof ProviderMoreStackParamList> =
  NativeStackScreenProps<ProviderMoreStackParamList, T>;

// Convenience type for screens that receive navigation/route props
// Duplicate alias removed (already declared above)
