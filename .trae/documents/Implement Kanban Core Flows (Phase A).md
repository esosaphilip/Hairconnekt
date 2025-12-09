## Board Columns

* Backlog • In Progress • Review • Done • Blocked

## Core 12 Flows (Complete)

1. Authentication & Session

* Login, token persistence, refresh, logout

* Backend: `/auth/login`, `/auth/refresh`, `/auth/logout`

* Mobile: `AuthContext.tsx`, `tokenStorage.ts`, `api/http.ts`

* Done When: 401 auto‑refresh works, session survives relaunch, graceful expiry

1. Provider Registration & Approval

* Onboarding, pending approval UX, gating

* Backend: `/providers/register`, `/providers/me`

* Mobile: `ProviderRegistrationFlow`, `PendingApprovalScreen`

* Done When: non‑provider gets CTA; pending shows status; protected routes blocked

1. Provider Profile (Private/Public)

* Edit private profile, render public profile

* Backend: `GET/PATCH /providers/me`, `GET /providers/:id/public`

* Mobile: `ProviderProfileScreen`, `ProviderPublicProfileScreen`

* Done When: edits persist; public reflects accurately

1. Services & Preise (CRUD + Client Visibility)

* Create/edit/toggle/delete/list; show on client flows

* Backend: `POST /services`, `GET /services/provider`, `PATCH/DELETE /services/:id`

* Mobile: `ServicesManagementScreen`, `AddEditServiceScreen`, repository

* Done When: provider manages services; clients see updates in booking/search

1. Portfolio Management

* Upload/delete images, public display

* Backend: `/portfolio/images` (POST/DELETE), `/portfolio/provider` (GET)

* Mobile: `PortfolioManagementScreen`

* Done When: uploads succeed, thumbnails render, delete updates

1. Calendar & Appointments

* View calendar, create/reschedule/cancel, block time

* Backend: `GET /appointments/provider`, `POST /appointments`, `PATCH /appointments/:id`, `POST /calendar/block`

* Mobile: `ProviderCalendar`, `CreateAppointmentScreen`, `BlockTimeScreen`

* Done When: calendar loads fast; create/update reflects; conflicts handled

1. Clients Management

* Provider clients list and detail

* Backend: `GET /clients/provider`, `GET /clients/:id`

* Mobile: `ProviderClients`, `ClientDetailScreen`

* Done When: counts correct; list/detail render; empty‑state + retry

1. Messaging

* Conversations list, thread, send

* Backend: `GET /messages`, `GET /messages/:thread`, `POST /messages`

* Mobile: `MessagesScreen`, `ChatScreen`

* Done When: threads load; send works (optimistic + reconciliation); retry on failure

1. Earnings & Auszahlungen

* Earnings summary, payout request

* Backend: `GET /payouts/summary`, `POST /payouts/request`

* Mobile: `PayoutRequestScreen`, `TransactionsScreen`

* Done When: summary accurate; payout validates and submits; status visible

1. Reviews & Ratings

* Show provider reviews; clients write reviews

* Backend: `GET /reviews/provider/:id`, `POST /reviews`

* Mobile: `ProviderReviews`, `WriteReviewsScreen`

* Done When: aggregates correct; write persists; moderation rules applied

1. Settings & Support

* Language, notifications, privacy/security, help

* Backend: `PATCH /users/me/preferences`, `GET /support/articles`

* Mobile: `SettingsScreen`, `PrivacySecurityScreen`, `SupportScreen`, `LanguageScreen`

* Done When: preferences persist/apply (Accept‑Language, toggles); help opens

1. Client Discovery & Booking

* Search/nearby providers, view public profile, select service, book

* Backend: `GET /providers/nearby`, `GET /providers/search`, `GET /providers/:id/public`, `POST /appointments`

* Mobile: `HomeScreen`, `SearchScreen`, `ProviderPublicProfileScreen`, client booking flow

* Done When: search relevant; service selection matches provider services; booking completes

## Extended Flows (Phase B — explicit tracking)

1. Vouchers & Offers

* Backend: `/vouchers` (CRUD)

* Mobile: `ProviderVouchersScreen`, `CreateEditVoucherScreen`

* Done When: vouchers apply to bookings and show in client UI

1. Provider Subscription/Billing

* Backend: `/subscriptions` (status/change)

* Mobile: `ProviderSubscriptionScreen`

* Done When: plan status reflects; upgrade/downgrade flows stable

1. Analytics & Reports

* Backend: `/analytics/provider`

* Mobile: `ProviderAnalyticsScreen`

* Done When: charts load; filters persist; performance acceptable

1. Verification (Email/Phone)

* Backend: `/verify/email`, `/verify/phone`

* Mobile: `VerificationScreen`

* Done When: codes sent/validated; UI updates verification flags

1. Onboarding

* Client onboarding, location selection

* Mobile: `ClientOnboardingScreen`, `LocationSelectionScreen`

* Done When: onboarding state persists and influences discovery

## Quality Criteria (All Flows)

* UX: localized copy; friendly, actionable errors; empty‑state + retry

* Performance: render u0000300ms after data; list scrolling 60fps; prefetch on tab switch

* Reliability: ErrorBoundary; uniform network error translator; no raw 401 banners

* Observability: logs with endpoint/device/userType; error IDs; no PII

## Execution Order

1. Flow 1 (Auth & Session) — unblock
2. Flow 4 (Services) — provider value + client visibility
3. Flow 3 (Profile) and Flow 7 (Clients)
4. Flow 6 (Calendar) and Flow 12 (Client booking)
5. Flow 8 (Messaging)
6. Flow 9 (Earnings) and Flow 10 (Reviews)
7. Flow 11 (Settings & Support)
8. Flow 5 (Portfolio)
9. Extended Flows 13–17

## Board Card Template (kanban.md)

* Title: Flow X — \[Name]

* Description: scope and goals

* Endpoints:

* Mobile Files:

* Checklist: validation, error handling, optimistic UI, tests

* Acceptance Criteria: functional, UX, performance

* Test Steps: Dev Client actions + curl commands

* Publish Notes: EAS update ID/runtime version

## Next Step (upon approval)

* Create/update `kanban.md` with the 12 core flows and extended flows, each as cards under Backlog

* Start Flow 1 implementation and publish a dev update when verified

