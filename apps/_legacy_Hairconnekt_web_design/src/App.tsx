import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { useEffect } from "react";
import { toast } from "sonner";
import { api } from "@/services/http";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SplashScreen } from "./components/SplashScreen";
import { ClientOnboardingScreen } from "./components/ClientOnboardingScreen";
import { LocationSelectionScreen } from "./components/LocationSelectionScreen";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { AccountTypeSelection } from "./components/AccountTypeSelection";
import { LoginScreen } from "./components/LoginScreen";
import { RegisterScreen } from "./components/RegisterScreen";
import { PasswordResetScreen } from "./components/PasswordResetScreen";
import { VerificationScreen } from "./components/VerificationScreen";
import { HomeScreen } from "./components/HomeScreen";
import { SearchScreen } from "./components/SearchScreen";
import { ProviderProfile } from "./components/ProviderProfile";
import { AppointmentsScreen } from "./components/AppointmentsScreen";
import { MessagesScreen } from "./components/MessagesScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { BookingFlow } from "./components/BookingFlow";
import { ChatScreen } from "./components/ChatScreen";
import { NotificationsScreen } from "./components/NotificationsScreen";
import { AppointmentDetailScreen } from "./components/AppointmentDetailScreen";
import { FavoritesScreen } from "./components/FavoritesScreen";
import { BottomNavigation } from "./components/BottomNavigation";
import { ProviderWelcome } from "./components/provider/ProviderWelcome";
import { ProviderTypeSelection } from "./components/provider/ProviderTypeSelection";
import { ProviderRegistrationFlow } from "./components/provider/ProviderRegistrationFlow";
import { PendingApprovalScreen } from "./components/provider/PendingApprovalScreen";
import { ProviderOnboardingTutorial } from "./components/provider/ProviderOnboardingTutorial";
import { ProviderDashboard } from "./components/provider/ProviderDashboard";
import { ProviderCalendar } from "./components/provider/ProviderCalendar";
import { ProviderClients } from "./components/provider/ProviderClients";
import { ProviderEarnings } from "./components/provider/ProviderEarnings";
import { ProviderReviews } from "./components/provider/ProviderReviews";
import { ProviderMore } from "./components/provider/ProviderMore";
import { ProviderBottomNav } from "./components/provider/ProviderBottomNav";
import { PortfolioManagementScreen } from "./components/provider/PortfolioManagementScreen";
import { UploadPortfolioScreen } from "./components/provider/UploadPortfolioScreen";
import { ServicesManagementScreen } from "./components/provider/ServicesManagementScreen";
import { AddEditServiceScreen } from "./components/provider/AddEditServiceScreen";
import { AvailabilitySettingsScreen } from "./components/provider/AvailabilitySettingsScreen";
import { BlockTimeScreen } from "./components/provider/BlockTimeScreen";
import { ClientDetailScreen } from "./components/provider/ClientDetailScreen";
import { CreateAppointmentScreen } from "./components/provider/CreateAppointmentScreen";
import { EditProfileScreen } from "./components/EditProfileScreen";
import { AddressManagementScreen } from "./components/AddressManagementScreen";
import { AddEditAddressScreen } from "./components/AddEditAddressScreen";
import { ProviderProfileScreen } from "./components/provider/ProviderProfileScreen";
import { ProviderPublicProfileScreen } from "./components/provider/ProviderPublicProfileScreen";
import { ProviderAnalyticsScreen } from "./components/provider/ProviderAnalyticsScreen";
import { ProviderVouchersScreen } from "./components/provider/ProviderVouchersScreen";
import { ProviderSubscriptionScreen } from "./components/provider/ProviderSubscriptionScreen";
import { ProviderSettingsScreen } from "./components/provider/ProviderSettingsScreen";
import { ProviderHelpScreen } from "./components/provider/ProviderHelpScreen";
import { PayoutRequestScreen } from "./components/provider/PayoutRequestScreen";
import { TransactionsScreen } from "./components/provider/TransactionsScreen";
import { MyReviewsScreen } from "./components/MyReviewsScreen";
import { BookingHistoryScreen } from "./components/BookingHistoryScreen";
import { PaymentMethodsScreen } from "./components/PaymentMethodsScreen";
import { VouchersScreen } from "./components/VouchersScreen";
import { TransactionHistoryScreen } from "./components/TransactionHistoryScreen";
import { PersonalInfoScreen } from "./components/PersonalInfoScreen";
import { HairPreferencesScreen } from "./components/HairPreferencesScreen";
import { LanguageScreen } from "./components/LanguageScreen";
import { SupportScreen } from "./components/SupportScreen";
import { AllStylesScreen } from "./components/AllStylesScreen";
import { ScreenNavigator } from "./components/ScreenNavigator";
import { PrivacySecurityScreen } from "./components/PrivacySecurityScreen";
import { TermsScreen } from "./components/TermsScreen";
import { PrivacyPolicyScreen } from "./components/PrivacyPolicyScreen";
import { ImprintScreen } from "./components/ImprintScreen";
import { DeleteAccountScreen } from "./components/DeleteAccountScreen";
import { UserManualScreen } from "./components/UserManualScreen";
import { registerPushIfNative } from "./native/push";

type LayoutProps = { children: React.ReactNode };

function AppLayout({ children }: LayoutProps) {
  return (
    <div className="app-container">
      {children}
    </div>
  );
}

function MainLayout({ children }: LayoutProps) {
  return (
    <div className="app-container">
      {children}
      <BottomNavigation />
    </div>
  );
}

function ProviderLayout({ children }: LayoutProps) {
  return (
    <div className="app-container">
      {children}
      <ProviderBottomNav />
    </div>
  );
}

export default function App() {
  useEffect(() => {
    api
      .get("/health")
      .then(() => toast.success("Backend verbunden"))
      .catch(() => toast.error("Backend nicht erreichbar"));
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <NativePushRegistrar />
        <Toaster position="top-center" richColors />
        <Routes>
        {/* Developer Navigator - Remove in production */}
        <Route path="/navigator" element={<AppLayout><ScreenNavigator /></AppLayout>} />
        
        {/* Splash & Onboarding */}
        <Route path="/splash" element={<AppLayout><SplashScreen /></AppLayout>} />
        <Route path="/onboarding" element={<AppLayout><ClientOnboardingScreen /></AppLayout>} />
        <Route path="/location" element={<AppLayout><LocationSelectionScreen /></AppLayout>} />
        
        {/* Authentication */}
        <Route path="/" element={<AppLayout><WelcomeScreen /></AppLayout>} />
        <Route path="/account-type" element={<AppLayout><AccountTypeSelection /></AppLayout>} />
        <Route path="/login" element={<AppLayout><LoginScreen /></AppLayout>} />
        <Route path="/register" element={<AppLayout><RegisterScreen /></AppLayout>} />
        <Route path="/forgot-password" element={<AppLayout><PasswordResetScreen /></AppLayout>} />
        <Route path="/reset-password" element={<AppLayout><PasswordResetScreen /></AppLayout>} />

        {/* Client App with Bottom Navigation */}
        <Route path="/home" element={<ProtectedRoute><MainLayout><HomeScreen /></MainLayout></ProtectedRoute>} />
        <Route path="/verify" element={<ProtectedRoute><AppLayout><VerificationScreen /></AppLayout></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><MainLayout><SearchScreen /></MainLayout></ProtectedRoute>} />
        <Route path="/appointments" element={<ProtectedRoute><MainLayout><AppointmentsScreen /></MainLayout></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><MainLayout><MessagesScreen /></MainLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><MainLayout><ProfileScreen /></MainLayout></ProtectedRoute>} />

        {/* Provider & Booking */}
        <Route path="/provider/:id" element={<AppLayout><ProviderProfile /></AppLayout>} />
        <Route path="/booking/:id" element={<AppLayout><BookingFlow /></AppLayout>} />
        
        {/* Additional Client Screens */}
        <Route path="/chat/:id" element={<AppLayout><ChatScreen /></AppLayout>} />
        <Route path="/notifications" element={<ProtectedRoute><AppLayout><NotificationsScreen /></AppLayout></ProtectedRoute>} />
        <Route path="/appointment/:id" element={<AppLayout><AppointmentDetailScreen /></AppLayout>} />
        <Route path="/favorites" element={<AppLayout><FavoritesScreen /></AppLayout>} />
        
        {/* Client Profile Management */}
        <Route path="/edit-profile" element={<AppLayout><EditProfileScreen /></AppLayout>} />
        <Route path="/addresses" element={<AppLayout><AddressManagementScreen /></AppLayout>} />
        <Route path="/addresses/add" element={<AppLayout><AddEditAddressScreen /></AppLayout>} />
        <Route path="/addresses/edit/:id" element={<AppLayout><AddEditAddressScreen /></AppLayout>} />
        <Route path="/personal-info" element={<AppLayout><PersonalInfoScreen /></AppLayout>} />
        <Route path="/hair-preferences" element={<AppLayout><HairPreferencesScreen /></AppLayout>} />
        <Route path="/my-reviews" element={<AppLayout><MyReviewsScreen /></AppLayout>} />
        <Route path="/booking-history" element={<AppLayout><BookingHistoryScreen /></AppLayout>} />
        <Route path="/payment-methods" element={<AppLayout><PaymentMethodsScreen /></AppLayout>} />
        <Route path="/vouchers" element={<AppLayout><VouchersScreen /></AppLayout>} />
        <Route path="/transactions" element={<AppLayout><TransactionHistoryScreen /></AppLayout>} />
        <Route path="/language" element={<AppLayout><LanguageScreen /></AppLayout>} />
        <Route path="/support" element={<AppLayout><SupportScreen /></AppLayout>} />
        <Route path="/all-styles" element={<AppLayout><AllStylesScreen /></AppLayout>} />
        
        {/* Legal & Help Screens */}
        <Route path="/privacy" element={<AppLayout><PrivacySecurityScreen /></AppLayout>} />
        <Route path="/terms" element={<AppLayout><TermsScreen /></AppLayout>} />
        <Route path="/privacy-policy" element={<AppLayout><PrivacyPolicyScreen /></AppLayout>} />
        <Route path="/imprint" element={<AppLayout><ImprintScreen /></AppLayout>} />
        <Route path="/delete-account" element={<AppLayout><DeleteAccountScreen /></AppLayout>} />
        <Route path="/user-manual" element={<AppLayout><UserManualScreen /></AppLayout>} />

        {/* Provider Onboarding */}
        <Route path="/provider-onboarding" element={<AppLayout><ProviderWelcome /></AppLayout>} />
        <Route path="/provider-onboarding/type" element={<AppLayout><ProviderTypeSelection /></AppLayout>} />
        <Route path="/provider-onboarding/registration" element={<AppLayout><ProviderRegistrationFlow /></AppLayout>} />
        <Route path="/provider/pending-approval" element={<AppLayout><PendingApprovalScreen /></AppLayout>} />
        <Route path="/provider-onboarding/tutorial" element={<AppLayout><ProviderOnboardingTutorial /></AppLayout>} />

        {/* Provider App with Bottom Navigation */}
        <Route path="/provider/dashboard" element={<ProtectedRoute><ProviderLayout><ProviderDashboard /></ProviderLayout></ProtectedRoute>} />
        <Route path="/provider/calendar" element={<ProtectedRoute><ProviderLayout><ProviderCalendar /></ProviderLayout></ProtectedRoute>} />
        <Route path="/provider/clients" element={<ProtectedRoute><ProviderLayout><ProviderClients /></ProviderLayout></ProtectedRoute>} />
        <Route path="/provider/messages" element={<ProtectedRoute><ProviderLayout><MessagesScreen /></ProviderLayout></ProtectedRoute>} />
        <Route path="/provider/more" element={<ProtectedRoute><ProviderLayout><ProviderMore /></ProviderLayout></ProtectedRoute>} />
        
        {/* Additional Provider Screens */}
        <Route path="/provider/earnings" element={<ProtectedRoute><ProviderLayout><ProviderEarnings /></ProviderLayout></ProtectedRoute>} />
        <Route path="/provider/reviews" element={<ProtectedRoute><ProviderLayout><ProviderReviews /></ProviderLayout></ProtectedRoute>} />
        
        {/* Provider Portfolio Management */}
        <Route path="/provider/portfolio" element={<AppLayout><PortfolioManagementScreen /></AppLayout>} />
        <Route path="/provider/portfolio/upload" element={<AppLayout><UploadPortfolioScreen /></AppLayout>} />
        
        {/* Provider Services Management */}
        <Route path="/provider/services" element={<AppLayout><ServicesManagementScreen /></AppLayout>} />
        <Route path="/provider/services/add" element={<AppLayout><AddEditServiceScreen /></AppLayout>} />
        <Route path="/provider/services/edit/:id" element={<AppLayout><AddEditServiceScreen /></AppLayout>} />
        
        {/* Provider Business Management */}
        <Route path="/provider/availability" element={<AppLayout><AvailabilitySettingsScreen /></AppLayout>} />
        <Route path="/provider/calendar/block" element={<AppLayout><BlockTimeScreen /></AppLayout>} />
        <Route path="/provider/clients/:id" element={<AppLayout><ClientDetailScreen /></AppLayout>} />
        <Route path="/provider/appointments/create" element={<AppLayout><CreateAppointmentScreen /></AppLayout>} />
        
        {/* Provider More Section Screens */}
        <Route path="/provider/more/profile" element={<AppLayout><ProviderProfileScreen /></AppLayout>} />
        <Route path="/provider/more/public-profile" element={<AppLayout><ProviderPublicProfileScreen /></AppLayout>} />
        <Route path="/provider/more/analytics" element={<AppLayout><ProviderAnalyticsScreen /></AppLayout>} />
        <Route path="/provider/more/vouchers" element={<AppLayout><ProviderVouchersScreen /></AppLayout>} />
        <Route path="/provider/more/subscription" element={<AppLayout><ProviderSubscriptionScreen /></AppLayout>} />
        <Route path="/provider/more/settings" element={<AppLayout><ProviderSettingsScreen /></AppLayout>} />
        <Route path="/provider/more/help" element={<AppLayout><ProviderHelpScreen /></AppLayout>} />
        
        {/* Provider Earnings Screens */}
        <Route path="/provider/earnings/payout-request" element={<AppLayout><PayoutRequestScreen /></AppLayout>} />
        <Route path="/provider/earnings/transactions" element={<AppLayout><TransactionsScreen /></AppLayout>} />

        {/* Catch all - redirect to splash */}
        <Route path="*" element={<Navigate to="/splash" replace />} />
      </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function NativePushRegistrar() {
  const { tokens, user } = useAuth();
  useEffect(() => {
    if (tokens?.accessToken && user?.id) {
      registerPushIfNative().catch(() => undefined);
    }
  }, [tokens?.accessToken, user?.id]);
  return null;
}
