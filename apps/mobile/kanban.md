# HairConnekt Kanban — Core & Extended Flows

## Columns
- Backlog
- In Progress
- Review
- Done
- Blocked

## Core Flows (12)

### Flow 1 — Authentication & Session
- Endpoints: `/auth/login`, `/auth/refresh`, `/auth/logout`
- Mobile: `src/auth/AuthContext.tsx`, `src/auth/tokenStorage.ts`, `src/api/http.ts`
- Acceptance: tokens persisted; app relaunch keeps session; 401 refresh + retry; graceful expiry

### Flow 2 — Provider Registration & Approval
- Endpoints: `/providers/register`, `/providers/me`
- Mobile: `ProviderRegistrationFlow`, `PendingApprovalScreen`
- Acceptance: non‑provider gated; pending status shown; protected routes blocked

### Flow 3 — Provider Profile (Private/Public)
- Endpoints: `GET/PATCH /providers/me`, `GET /providers/:id/public`
- Mobile: `ProviderProfileScreen`, `ProviderPublicProfileScreen`
- Acceptance: edits persist; public reflects accurate info

### Flow 4 — Services & Preise (CRUD + Client Visibility)
- Endpoints: `POST /services`, `GET /services/provider`, `PATCH/DELETE /services/:id`
- Mobile: `ServicesManagementScreen`, `AddEditServiceScreen`, `data/repositories/ServiceRepositoryImpl.ts`
- Acceptance: provider manages services; clients see updates in booking/search

### Flow 5 — Portfolio Management
- Endpoints: `POST/DELETE /portfolio/images`, `GET /portfolio/provider`
- Mobile: `PortfolioManagementScreen`
- Acceptance: uploads succeed; thumbnails render; delete updates

### Flow 6 — Calendar & Appointments
- Endpoints: `GET /appointments/provider`, `POST /appointments`, `PATCH /appointments/:id`, `POST /calendar/block`
- Mobile: `ProviderCalendar`, `CreateAppointmentScreen`, `BlockTimeScreen`
- Acceptance: calendar loads fast; create/update reflects; conflicts handled

### Flow 7 — Clients Management
- Endpoints: `GET /clients/provider`, `GET /clients/:id`
- Mobile: `ProviderClients`, `ClientDetailScreen`
- Acceptance: counts correct; list/detail render; empty‑state + retry

### Flow 8 — Messaging
- Endpoints: `GET /messages`, `GET /messages/:thread`, `POST /messages`
- Mobile: `MessagesScreen`, `ChatScreen`
- Acceptance: threads load; send works; retry on failure

### Flow 9 — Earnings & Auszahlungen
- Endpoints: `GET /payouts/summary`, `POST /payouts/request`
- Mobile: `PayoutRequestScreen`, `TransactionsScreen`
- Acceptance: summary accurate; payout request submits; status visible

### Flow 10 — Reviews & Ratings
- Endpoints: `GET /reviews/provider/:id`, `POST /reviews`
- Mobile: `ProviderReviews`, `WriteReviewsScreen`
- Acceptance: aggregates correct; write persists

### Flow 11 — Settings & Support
- Endpoints: `PATCH /users/me/preferences`, `GET /support/articles`
- Mobile: `SettingsScreen`, `PrivacySecurityScreen`, `SupportScreen`, `LanguageScreen`
- Acceptance: preferences persist/apply; help opens

### Flow 12 — Client Discovery & Booking
- Endpoints: `GET /providers/nearby`, `GET /providers/search`, `GET /providers/:id/public`, `POST /appointments`
- Mobile: `HomeScreen`, `SearchScreen`, `ProviderPublicProfileScreen`, client booking flow
- Acceptance: search relevant; service selection matches provider services; booking completes

## Extended Flows (Phase B)
- Vouchers & Offers: `/vouchers` (CRUD); `ProviderVouchersScreen`, `CreateEditVoucherScreen`
- Provider Subscription/Billing: `/subscriptions`; `ProviderSubscriptionScreen`
- Analytics & Reports: `/analytics/provider`; `ProviderAnalyticsScreen`
- Verification (Email/Phone): `/verify/email`, `/verify/phone`; `VerificationScreen`
- Onboarding: client onboarding, location selection; `ClientOnboardingScreen`, `LocationSelectionScreen`

## Quality Criteria
- UX: localized copy; friendly errors; empty‑state + retry
- Performance: render < 300ms after data; 60fps scrolling; prefetch on tab switch
- Reliability: ErrorBoundary; uniform network error translator; eliminate raw 401 banners
- Observability: logs with endpoint/device/userType; error IDs; no PII

## Card Template
- Title: Flow X — [Name]
- Description
- Endpoints
- Mobile Files
- Checklist
- Acceptance Criteria
- Test Steps
- Publish Notes

