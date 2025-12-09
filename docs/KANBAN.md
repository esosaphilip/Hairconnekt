# Kanban — MVP Execution

## Backlog
- Auth: email verification flow (Brevo SMTP), resend verification endpoint UX
- Provider onboarding: services CRUD, availability & blocked times UI
- Search: filters (distance, price, rating), cached discover feed
- Portfolio: B2 upload error handling, captions edit, delete
- Appointments: booking/reschedule/cancel, client/provider lists
- Reviews: create/list/respond; analytics endpoint
- Payments: Stripe payment intent (test), Connect onboarding
- Notifications: FCM push setup and token management; reminder emails
- Settings: language/country defaults; legal pages
 - Remove placeholder screens; replace mocked data with real backend calls
- Performance: DB indexes for search; cache TTL tuning
- Security: rate limiting; input validation audit; privacy policy link in app
- CI/CD: backend deploy pipeline; mobile build pipeline; secrets management
- Store assets: screenshots, listing copy (DE/EN), privacy policy URL

## In Progress
- Brevo SMTP precedence and test route
- Backblaze B2 native upload + public URLs (dev fallback OK)
- Mobile Maps: autocomplete and geocoding helpers
- Portfolio upload: end‑to‑end from mobile → B2 URLs
 - Provider app: connect CreateAppointment screen to backend, persist data

## Review
- Payment intent test flow (Stripe) with test cards
- Discover feed caching and pagination
- Provider dashboard completeness: profile/services/schedule

## Done
- Backend scaffolding; global `api/v1`; validation; Swagger
- Neon Postgres DB + JWT tokens wired
- Redis cache via Upstash TLS with fallback
- B2 storage (native) + public URL building
- Email via Brevo SMTP (Nodemailer) and test route
- Mobile env wiring and HTTP client with timeout
- Portfolio upload integration and local dev static serving
 - Blocked time: mobile payload flattened and persists to backend

## Blockers / Risks
- App store compliance: ensure Data Safety (Play) and privacy forms (Apple)
- Email deliverability: SPF/DKIM completion required
- Payments: provider KYC and payout onboarding readiness

## Links
- Plan: docs/PROJECT_PLAN_MVP.md
