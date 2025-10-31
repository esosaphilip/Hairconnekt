import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: { userType?: 'client' | 'provider' } | undefined;
  AccountType: undefined;
  ProviderRegistration: undefined;
  ProviderPendingApproval: undefined;
  Tabs: undefined;
};

export type BookingsStackParamList = {
  BookingsList: undefined;
  AppointmentDetail: { id?: string } | undefined;
};

// Convenience type for screens that receive navigation/route props
export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;