# HairConnekt Kanban — Core & Extended Flows

## Columns
- Backlog
- In Progress
- Review
- Done
- Blocked

## Provider Priority Roadmap (Phase A)

Order of execution: Authentication → Provider Registration → Provider Profile → Services & Preise → Availability & Booking Settings → Calendar & Appointments → Clients → Messaging → Earnings/Payouts → Reviews → Portfolio → Settings → Analytics

All cards include endpoint mappings to backend modules to ensure provider calls the correct sources.

### Flow 1 — Authentication & Session

### Flow 1 — Authentication & Session
- Endpoints: `/auth/login`, `/auth/refresh`, `/auth/logout`
- Mobile: `src/auth/AuthContext.tsx`, `src/auth/tokenStorage.ts`, `src/api/http.ts`
- Acceptance: tokens persisted; app relaunch keeps session; 401 refresh + retry; graceful expiry

#### Card (Backlog)
- Title: Flow 1 — Authentication & Session
- Description: Implement robust login, token storage, refresh and logout across mobile.
- Endpoints: `/auth/login`, `/auth/refresh`, `/auth/logout`
- Mobile Files: `src/auth/AuthContext.tsx`, `src/auth/tokenStorage.ts`, `src/api/http.ts`
- Checklist: persist tokens; refresh on 401; session expiry UX; remove raw 401 banners; tests.
- Acceptance: session survives relaunch; refresh succeeds; expiry handled gracefully.
- Test Steps: login; kill app; relaunch; force 401; verify refresh; logout.
- Publish Notes: dev/prod EAS update IDs.
 - Backend Sources: `backend/src/modules/auth/*`

### Flow 2 — Provider Registration & Approval
- Endpoints: `/providers/register`, `/providers/me`
- Mobile: `ProviderRegistrationFlow`, `PendingApprovalScreen`
- Acceptance: non‑provider gated; pending status shown; protected routes blocked

#### Card (Backlog)
- Title: Flow 2 — Provider Registration & Approval
- Description: Gate provider features; show pending approval and registration flow.
- Endpoints: `/providers/register`, `/providers/me`
- Mobile Files: `src/screens/provider/ProviderRegistrationFlow.tsx`, `src/screens/provider/PendingApprovalScreen.tsx`, `src/hooks/useProviderGate.ts`
- Checklist: gate tabs; pending view; registration CTA; tests.
- Acceptance: non‑provider blocked; pending shows status; deep links safe.
- Test Steps: login as client; as pending provider; navigate tabs.
- Publish Notes: dev update.
 - Backend Sources: `backend/src/modules/providers/providers.controller.ts`, `providers.service.ts`

### Flow 3 — Provider Profile (Private/Public)
- Endpoints: `GET/PATCH /providers/me`, `GET /providers/:id/public`
- Mobile: `ProviderProfileScreen`, `ProviderPublicProfileScreen`
- Acceptance: edits persist; public reflects accurate info

#### Card (Backlog)
- Title: Flow 3 — Provider Profile
- Description: Edit private profile, show accurate public profile.
- Endpoints: `GET/PATCH /providers/me`, `GET /providers/:id/public`
- Mobile Files: `ProviderProfileScreen.tsx`, `ProviderPublicProfileScreen.tsx`
- Checklist: patch saves; public data loads; friendly errors; tests.
- Acceptance: edits visible after reload; public matches backend.
- Test Steps: change bio; verify public; reload.
- Publish Notes: dev update.
 - Backend Sources: `backend/src/modules/providers/providers.controller.ts` (getMyProfile, getPublicProfile), `providers.service.ts`

### Flow 4 — Services & Preise (CRUD + Client Visibility)
- Endpoints: `POST /services`, `GET /services/provider`, `PATCH/DELETE /services/:id`
- Mobile: `ServicesManagementScreen`, `AddEditServiceScreen`, `data/repositories/ServiceRepositoryImpl.ts`
- Acceptance: provider manages services; clients see updates in booking/search

#### Card (Backlog)
- Title: Flow 4 — Services & Preise
- Description: CRUD services with optimistic UI and client visibility.
- Endpoints: as above.
- Mobile Files: `ServicesManagementScreen.tsx`, `AddEditServiceScreen.tsx`, service repository.
- Checklist: create/edit/delete/toggle; optimistic updates; prefill; tests.
- Acceptance: changes reflect in booking/search.
- Test Steps: CRUD in provider; open client search/booking.
- Publish Notes: dev update.
 - Backend Sources: `backend/src/modules/services/*`

### Flow 5 — Availability & Booking Settings (Provider)

- Endpoints: `POST /providers/availability`, `PATCH /providers`
- Mobile: `AvailabilitySettingsScreen`
- Acceptance: slots and booking settings persist; screen navigates back reliably

#### Card (Backlog)
- Title: Flow 5 — Availability & Booking Settings
- Description: Persist provider availability slots and booking settings.
- Endpoints: `POST /providers/availability` (slots), `PATCH /providers` (settings)
- Mobile Files: `AvailabilitySettingsScreen.tsx`
- Checklist: POST slots; PATCH buffer/advance/sameDay/minAdvance; friendly errors; tests.
- Acceptance: saved values visible via `GET /providers/me`; calendar uses slots.
- Test Steps: set slots/settings; reload profile; verify.
- Publish Notes: dev update.
- Backend Sources: `backend/src/modules/providers/providers.controller.ts:setAvailability`, `providers.service.ts:setAvailability/updateProfile`, `entities/provider-availability.entity.ts`, `entities/provider-profile.entity.ts`

### Flow 5 — Portfolio Management
- Endpoints: `POST/DELETE /portfolio/images`, `GET /portfolio/provider`
- Mobile: `PortfolioManagementScreen`
- Acceptance: uploads succeed; thumbnails render; delete updates

#### Card (Backlog)
- Title: Flow 5 — Portfolio Management
- Description: Upload/delete portfolio images; show thumbnails.
- Endpoints: as above.
- Mobile Files: `PortfolioManagementScreen.tsx`
- Checklist: pick images; upload; render; delete; tests.
- Acceptance: upload/delete work; UI updates.
- Test Steps: add/remove images.
- Publish Notes: dev update.

### Flow 6 — Calendar & Appointments
- Endpoints: `GET /appointments/provider`, `POST /appointments`, `PATCH /appointments/:id`, `POST /calendar/block`
- Mobile: `ProviderCalendar`, `CreateAppointmentScreen`, `BlockTimeScreen`
- Acceptance: calendar loads fast; create/update reflects; conflicts handled

#### Card (Backlog)
- Title: Flow 6 — Calendar & Appointments
- Description: Provider calendar CRUD and block time.
- Endpoints: as above.
- Mobile Files: `ProviderCalendar.tsx`, `CreateAppointmentScreen.tsx`, `BlockTimeScreen.tsx`
- Checklist: fast load; create/reschedule/cancel; conflict errors; tests.
- Acceptance: flows succeed; conflict handled.
- Test Steps: create/reschedule; simulate conflict.
- Publish Notes: dev update.
 - Backend Sources: `backend/src/modules/appointments/*`

### Flow 7 — Clients Management
- Endpoints: `GET /clients/provider`, `GET /clients/:id`
- Mobile: `ProviderClients`, `ClientDetailScreen`
- Acceptance: counts correct; list/detail render; empty‑state + retry

#### Card (Backlog)
- Title: Flow 7 — Clients Management
- Description: Clients list/detail with retry and stats.
- Endpoints: as above.
- Mobile Files: `ProviderClients.tsx`, `ClientDetailScreen.tsx`
- Checklist: list; detail; empty state; retry; tests.
- Acceptance: accurate counts; friendly errors.
- Test Steps: load; retry; open detail.
- Publish Notes: dev update.
 - Backend Sources: `backend/src/modules/providers/providers.controller.ts:getClients`, `providers.service.ts:getClients`

### Flow 8 — Messaging
- Endpoints: `GET /messages`, `GET /messages/:thread`, `POST /messages`
- Mobile: `MessagesScreen`, `ChatScreen`
- Acceptance: threads load; send works; retry on failure

#### Card (Backlog)
- Title: Flow 8 — Messaging
- Description: Conversations list/thread; send with optimistic UI.
- Endpoints: as above.
- Mobile Files: `MessagesScreen.tsx`, `ChatScreen.tsx`
- Checklist: list; thread; send; retry; tests.
- Acceptance: messages deliver; retry works.
- Test Steps: send offline; retry.
- Publish Notes: dev update.
 - Backend Sources: `backend/src/modules/messages/*` (planned)

### Flow 9 — Earnings & Auszahlungen
- Endpoints: `GET /payouts/summary`, `POST /payouts/request`
- Mobile: `PayoutRequestScreen`, `TransactionsScreen`
- Acceptance: summary accurate; payout request submits; status visible

#### Card (Backlog)
- Title: Flow 9 — Earnings & Auszahlungen
- Description: Earnings summary and payout request.
- Endpoints: as above.
- Mobile Files: `PayoutRequestScreen.tsx`, `TransactionsScreen.tsx`
- Checklist: summary; request; status; tests.
- Acceptance: accurate numbers; submit succeeds.
- Test Steps: request payout; verify status.
- Publish Notes: dev update.
 - Backend Sources: `backend/src/modules/payments/*`

### Flow 10 — Reviews & Ratings
- Endpoints: `GET /reviews/provider/:id`, `POST /reviews`
- Mobile: `ProviderReviews`, `WriteReviewsScreen`
- Acceptance: aggregates correct; write persists

#### Card (Backlog)
- Title: Flow 10 — Reviews & Ratings
- Description: Show aggregates; write reviews.
- Endpoints: as above.
- Mobile Files: `ProviderReviews.tsx`, `WriteReviewsScreen.tsx`
- Checklist: list; aggregate; write; tests.
- Acceptance: accurate aggregates; persisted writes.
- Test Steps: write review; reload.
- Publish Notes: dev update.
 - Backend Sources: `backend/src/modules/reviews/*`

### Flow 11 — Settings & Support
- Endpoints: `PATCH /users/me/preferences`, `GET /support/articles`
- Mobile: `SettingsScreen`, `PrivacySecurityScreen`, `SupportScreen`, `LanguageScreen`
- Acceptance: preferences persist/apply; help opens

#### Card (Backlog)
- Title: Flow 11 — Settings & Support
- Description: Preferences (language, privacy) and support articles.
- Endpoints: as above.
- Mobile Files: settings/support screens.
- Checklist: preferences save/apply; help list; tests.
- Acceptance: toggles work; language applies.
- Test Steps: change language; reopen app.
- Publish Notes: dev update.
 - Backend Sources: `backend/src/modules/users/*`, `backend/src/modules/support/*`

### Flow 12 — Client Discovery & Booking
- Endpoints: `GET /providers/nearby`, `GET /providers/search`, `GET /providers/:id/public`, `POST /appointments`
- Mobile: `HomeScreen`, `SearchScreen`, `ProviderPublicProfileScreen`, client booking flow
- Acceptance: search relevant; service selection matches provider services; booking completes

#### Card (Backlog)
- Title: Flow 12 — Client Discovery & Booking
- Description: Discovery, public profile, booking flow.
- Endpoints: as above.
- Mobile Files: `HomeScreen.tsx`, `SearchScreen.tsx`, public profile, booking flow.
- Checklist: search; select; book; tests.
- Acceptance: end‑to‑end booking succeeds.
- Test Steps: search → profile → book.
- Publish Notes: dev update.
 - Backend Sources: `backend/src/modules/providers/providers.controller.ts:nearby`, `providers.service.ts`

## Extended Flows (Phase B)
- Vouchers & Offers: `/vouchers` (CRUD); `ProviderVouchersScreen`, `CreateEditVoucherScreen`
- Provider Subscription/Billing: `/subscriptions`; `ProviderSubscriptionScreen`
- Analytics & Reports: `/analytics/provider`; `ProviderAnalyticsScreen`
- Verification (Email/Phone): `/verify/email`, `/verify/phone`; `VerificationScreen`
- Onboarding: client onboarding, location selection; `ClientOnboardingScreen`, `LocationSelectionScreen`

#### Card — Vouchers & Offers (Backlog)
- Title: Vouchers & Offers
- Description: CRUD vouchers and apply in bookings.
- Endpoints: `/vouchers`
- Mobile Files: vouchers screens.
- Checklist: create/edit/delete; apply; tests.
- Acceptance: voucher discounts applied.
- Test Steps: create voucher; book with voucher.
- Publish Notes: dev update.
 - Backend Sources: `backend/src/modules/vouchers/*`

#### Card — Provider Subscription/Billing (Backlog)
- Title: Provider Subscription/Billing
- Description: Show/change plan, billing state.
- Endpoints: `/subscriptions`
- Mobile Files: `ProviderSubscriptionScreen.tsx`
- Checklist: display; change; confirm; tests.
- Acceptance: plan status accurate.
- Test Steps: switch plan.
- Publish Notes: dev update.
 - Backend Sources: `backend/src/modules/subscriptions/*` (planned)

#### Card — Analytics & Reports (Backlog)
- Title: Analytics & Reports
- Description: Provider KPIs and charts.
- Endpoints: `/analytics/provider`
- Mobile Files: `ProviderAnalyticsScreen.tsx`
- Checklist: charts; filters; performance.
- Acceptance: responsive charts; filter persistence.
- Test Steps: change filters.
- Publish Notes: dev update.
 - Backend Sources: `backend/src/modules/analytics/*`

#### Card — Verification (Backlog)
- Title: Verification (Email/Phone)
- Description: Send/validate codes; update flags.
- Endpoints: `/verify/email`, `/verify/phone`
- Mobile Files: `VerificationScreen.tsx`
- Checklist: send; validate; update; tests.
- Acceptance: flags update; errors friendly.
- Test Steps: verify flows.
- Publish Notes: dev update.
 - Backend Sources: `backend/src/modules/verification/*`

#### Card — Onboarding (Backlog)
- Title: Client Onboarding
- Description: First‑run onboarding and location selection.
- Endpoints: N/A
- Mobile Files: `ClientOnboardingScreen.tsx`, `LocationSelectionScreen.tsx`
- Checklist: steps; persistence; skip; tests.
- Acceptance: onboarding state saved; influences discovery.
- Test Steps: complete onboarding; check home/feed.
- Publish Notes: dev update.
 - Backend Sources: N/A (client‑side state)

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
