HairConnekt mobile migration mapping (Phase 0)

This document maps the existing web UI (apps/Hairconnekt web design/src) to the React Native mobile app screens and navigation.

High-level navigation
- Bottom tabs (client mode):
  - Home: Landing feed, quick entry points
  - Explore: Search and discovery
  - Bookings: Appointments list and details
  - Messages: Conversations and chat
  - Profile: Personal info and settings

- Per-tab stacks:
  - Explore → Salon/Provider detail → Booking flow → Checkout
  - Bookings → Appointment detail → (Reschedule/Cancel)
  - Messages → Chat thread
  - Profile → Edit profile → Addresses → Notifications → Privacy & Security → Payment methods → Vouchers → Support → Legal

Screen/component mapping (web → mobile)
- SplashScreen.tsx, WelcomeScreen.tsx, ClientOnboardingScreen.tsx
  → Native splash handled by Expo + optional onboarding stack (post-MVP)

- LoginScreen.tsx, RegisterScreen.tsx, VerificationScreen.tsx, PasswordResetScreen.tsx
  → Auth stack in RN; Login implemented; Register/Verify/Reset planned

- HomeScreen.tsx
  → Home tab (RN)

- SearchScreen.tsx
  → Explore tab. Includes search input, filters, results list; map toggle optional

- ProviderProfile.tsx, ProviderPublicProfileScreen.tsx
  → Provider detail screen within Explore stack

- BookingFlow.tsx
  → Booking stack in RN (date/time selection, staff, add-ons, summary)

- AppointmentsScreen.tsx, BookingHistoryScreen.tsx, AppointmentDetailScreen.tsx
  → Bookings tab and detail screen

- MessagesScreen.tsx, ChatScreen.tsx
  → Messages tab and chat thread screen

- ProfileScreen.tsx, PersonalInfoScreen.tsx, EditProfileScreen.tsx, AddressManagementScreen.tsx, AddEditAddressScreen.tsx,
  NotificationsScreen.tsx, PrivacySecurityScreen.tsx, PaymentMethodsScreen.tsx, VouchersScreen.tsx, SupportScreen.tsx,
  TermsScreen.tsx, PrivacyPolicyScreen.tsx, ImprintScreen.tsx, LanguageScreen.tsx, DeleteAccountScreen.tsx
  → Profile tab stack

- FavoritesScreen.tsx, MyReviewsScreen.tsx
  → Profile tab stack or Explore sub-stack (decision TBD)

Provider flows (apps/Hairconnekt web design/src/components/provider/*)
- ProviderDashboard, Calendar, Clients, Services, Earnings, Reviews, Settings, Analytics, Subscription, Vouchers, Payouts, etc.
  → Phase later or separate Provider app mode (conditional on userType === 'provider'). Navigation would mirror ProviderBottomNav + stacks.

Services/endpoints reference (from web/services)
- HTTP base and auth: src/services/http.ts (refresh on 401, hc_access_token/hc_refresh_token)
- Appointments: src/services/appointments.ts → /appointments/client|provider
- Notifications: src/services/notifications.ts → /notifications/token (device token)
- Users: src/services/users.ts → profile and updates

Notes
- Colors/tokens in web: src/styles/globals.css defines brand palette, spacing, radii, shadows
- Mobile theme will mirror these as RN constants
- Expo SecureStore is used for tokens on mobile; semantics match web localStorage keys for consistency (hc_access_token, hc_refresh_token, hc_auth)