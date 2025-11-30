# HairConnekt — MVP Plan and Milestones

## Phase 0 — Foundation (Completed)
- Backend scaffolding (NestJS, TypeORM, validation, Swagger)
- Database (Neon Postgres); JWT access/refresh secrets
- Cache: Upstash Redis with TLS + in-memory fallback
- Storage: Backblaze B2 native upload + public URLs; local dev fallback
- Email: Brevo SMTP via Nodemailer (precedence over Resend); test route
- Mobile: Expo app, HTTP client, auth storage, Portfolio upload
- Env: `.env.example` for backend/mobile; secrets ignored

## Phase 1 — MVP Feature Completion (In Progress)
- Authentication: register/login/refresh/logout; email verification
- Provider onboarding: profile, services, availability, blocked times
- Search & discovery: filters, discover feed (cached), public profiles
- Portfolio: upload/list/edit/delete (B2)
- Appointments: create/reschedule/cancel; client/provider views
- Reviews: create/list/respond; basic analytics
- Payments: Stripe intents + Connect onboarding (test mode)
- Notifications: Brevo email, FCM push (setup), optional SMS
- Settings: language/country defaults; privacy/legal views

## Phase 2 — Launch Readiness (Pre‑Release)
- Security: HTTPS, rate limiting, OWASP checks, GDPR basics
- Reliability: logging/monitoring, health checks
- Performance: DB indexing, cache TTL, image constraints
- CI/CD: pipelines for backend/mobile; secrets management
- Content: app copy (DE/EN), store listings, support docs

## Phase 3 — Store Submission (Android + iOS)
- Google Play: AAB, listing, Data Safety, content rating; testing tracks
- App Store: bundle IDs, certs/profiles, TestFlight; privacy compliance

## Phase 4 — Public Launch (MVP)
- Staged rollout; support readiness; basic marketing and analytics

## Phase 5 — Next Build (Post‑MVP Growth)
- Provider growth: subscriptions, featured listings, vouchers
- Client experience: chat, saved styles/collections
- Advanced search: travel time, personalization
- Payments: refunds/disputes, multi‑currency, VAT
- Marketplace quality: trust & safety, moderation, verification
- Integrations: calendar sync, web app, provider CRM

---

# Acceptance Criteria Highlights
- Critical flows pass on real devices: auth, booking, portfolio, payments
- Email deliverability verified (Brevo SPF/DKIM); B2 URLs render
- App store privacy/compliance forms complete; policy links live

# Tracking
- See docs/KANBAN.md for actionable tasks per phase.
