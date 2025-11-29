# Hairconnekt Backend — Tech Stack Options and Monthly Cost Plan

A dual‑purpose mobile app for the German market that connects clients with independent braiders, salons, and barbers. The app supports two user modes (Provider and Client) under a unified design system.

## Implementation strategy (phased)
- Phase 1 is what we will implement now (target 0–100 users).
- As the user base grows, we’ll upgrade to Phase 2 (100–1000 users) and then Phase 3 (1000+ users).
- This document captures tech stack options and monthly cost planning to guide those transitions.

---

## Tech stack options

Below are recommended choices for Phase 1 (Launch) and alternatives we can switch to or add in later phases.

### Core backend
- Language & Runtime (Recommended): TypeScript on Node.js
- Framework (Recommended): NestJS
  - Alternatives: Fastify + modular structure, Express.js + middleware
- API Style (Recommended): REST + OpenAPI (Swagger)
  - Alternatives: GraphQL (Apollo/Envelop) if needed later
- Authentication (Recommended): JWT (access + refresh), phone/email OTP (Twilio)
  - Alternatives: OAuth2/Social login (Google/Apple), sessions with Redis store
- Authorization: Role-based access control (Client, Provider, Admin)

### Data & storage
- Primary Database (Recommended): PostgreSQL (Neon.tech)
  - Alternatives: PostgreSQL on Railway/Render, Supabase (managed Postgres)
- ORM/DB Toolkit (Recommended): Prisma
  - Alternatives: TypeORM, Drizzle ORM
- Cache & Queues (Recommended): Redis (Upstash)
  - Job processing: BullMQ on Redis
- File Storage (Recommended): Cloudflare R2
  - Alternatives: AWS S3 (+ CloudFront), Backblaze B2
- CDN (Recommended): Cloudflare (Free plan)

### Communications & notifications
- Email (Recommended): Resend
  - Alternatives: Postmark, SendGrid
- SMS/Phone (Recommended): Twilio
  - Alternatives: MessageBird
- Push Notifications (Recommended): Firebase Cloud Messaging (FCM) for Android; APNs via FCM for iOS

### Location & discovery
- Maps/Geocoding (Recommended): Google Maps Platform
  - Alternatives: Mapbox, OpenStreetMap + Nominatim (cost‑optimized)
- Optional Search (Phase 3): Elasticsearch or Meilisearch

### Payments & compliance
- Payments (Recommended): Stripe (including Stripe Connect for marketplace payouts)
  - Notes: EU PSD2/SCA compliant flows; IBAN payouts for providers
  - Alternatives: Adyen (if enterprise later)

### Operations & tooling
- Hosting (Recommended): Railway.app (NestJS service)
  - Alternatives: Render, Fly.io, AWS ECS/Fargate (later scale)
- Monitoring/Logging (Recommended): Better Stack (Logs + Monitoring)
  - Alternatives: Sentry (errors), DataDog (later), Grafana/Loki (self‑hosted)
- CI/CD: GitHub Actions (build, test, deploy)
- Containerization: Docker + docker-compose (dev), slim runtime image (prod)
- Security: Helmet, rate limiting, IP throttling, input validation, secrets management (Railway/ENV), encryption at rest for PII where applicable
- Documentation: OpenAPI auto‑generated via NestJS Swagger
- Testing: Jest + Supertest (API), Pact (optional for consumer contracts)

---

## Monthly cost breakdown (realistic for solo startup)

These figures reflect conservative estimates and the free/low‑cost tiers of the recommended providers.

### Phase 1: Launch (0–100 users) — Month 1–3

| Service | Cost | Notes |
| --- | --- | --- |
| NestJS API (Railway.app) | €5–15/month | Hobby tier, auto‑scales |
| PostgreSQL (Neon.tech) | €0/month | Free tier (0.5GB) |
| Redis (Upstash) | €0/month | Free tier |
| File Storage (Cloudflare R2) | €2/month | ~10GB images |
| Email (Resend) | €0/month | Free tier (3k emails) |
| SMS (Twilio) | €5–10/month | ~100 verifications |
| Push Notifications (FCM) | €0/month | Free (unlimited) |
| Maps (Google) | €0/month | Within free tier |
| Payment (Stripe) | €0/month | Pay per transaction only |
| Monitoring (Better Stack) | €0/month | Free tier |
| Domain | €12/year | .de or .com |
| SSL Certificate | €0/month | Free (Let’s Encrypt via Railway) |

- Total monthly (excluding yearly domain): €12–27/month
- Very affordable!

### Phase 2: Growing (100–1000 users) — Month 4–12

| Service | Cost | Notes |
| --- | --- | --- |
| NestJS API (Railway.app) | €25–40/month | More traffic |
| PostgreSQL (Neon.tech) | €10–20/month | Scale plan |
| Redis (Upstash) | €5–10/month | More requests |
| File Storage (Cloudflare R2) | €5–10/month | ~50GB images |
| Email (Resend) | €20/month | 50k emails/month |
| SMS (Twilio) | €50–75/month | ~1000 verifications |
| Push Notifications (FCM) | €0/month | Still free |
| Maps (Google) | €10–20/month | More searches |
| Payment (Stripe) | Transaction fees only | ~1.4% per transaction |
| Monitoring (Better Stack) | €9/month | Basic plan |
| CDN (Cloudflare) | €0/month | Free plan (Pro €20 optional) |

- Total monthly: €134–204/month
- Still very reasonable.

### Phase 3: Established (1000+ users) — Year 2+

| Service | Cost | Notes |
| --- | --- | --- |
| NestJS API (Railway/Render) | €100–150/month | Scaled instances |
| PostgreSQL | €50–100/month | More data |
| Redis | €20–30/month | More caching |
| File Storage (R2) | €15–25/month | ~200GB images |
| Email | €40/month | 150k emails |
| SMS | €150–200/month | More users |
| Elasticsearch (if added) | €50/month | Search optimization |
| Monitoring | €29/month | Better Stack Pro |

- Total monthly: €454–624/month
- At this stage, you’re profitable.

---

## Notes & assumptions
- We will not begin implementation until schemas and complete specifications are provided.
- Costs are indicative and may shift with usage patterns (image sizes, SMS volume, email campaigns, etc.).
- Stripe fees are per transaction and not included in monthly totals.
- Yearly domain cost is listed separately; SSL via Let’s Encrypt is free through Railway.
- GDPR compliance, consent management, data retention, and user data export/delete flows will be designed during schema/API definition.

## Next steps
- Await schemas and business rules to finalize endpoints, data models, and migration strategy.
- Confirm which optional integrations (e.g., social login, advanced search) are needed in Phase 1 vs later phases.