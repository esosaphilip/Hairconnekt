## Goal
Set up `backend/.env` using your provided configuration, aligned with the backend’s validation and actual usage, then boot the API and test from the mobile app.

## Key Differences And Normalization
- JWT: Backend requires `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` (min 16 chars). It also accepts legacy names (`JWT_SECRET`, `JWT_EXPIRATION`), but validation demands the access/refresh secrets explicitly.
- Redis: Prefer `rediss://…` for Upstash TLS. If you supply `redis://…`, we can still try, but TLS is recommended.
- Cloudflare R2: Backend uses `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` or `R2_BUCKET_NAME`, and `R2_PUBLIC_URL` (or `R2_PUBLIC_BASE_URL`). `R2_REGION` is not used.
- URL values: Do not wrap values in backticks in `.env`.

## Variables To Collect (One By One)
1. Database (Neon)
   - `DATABASE_URL` (e.g., `postgresql://user:pass@host/db?sslmode=require`)
   - Optional discrete: `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`
   - `DATABASE_SSL` = `true`
2. JWT
   - `JWT_ACCESS_SECRET` (≥16 chars)
   - `JWT_ACCESS_EXPIRES_IN` (e.g., `15m`)
   - `JWT_REFRESH_SECRET` (≥16 chars)
   - `JWT_REFRESH_EXPIRES_IN` (e.g., `7d`)
   - Legacy provided fields (`JWT_SECRET`, `JWT_EXPIRATION`) will be mapped, but we will still include the required access/refresh keys to satisfy validation.
3. Redis (Upstash)
   - `REDIS_URL` (recommended `rediss://default:<password>@<host>:<port>`)
4. Cloudflare R2
   - `R2_ACCOUNT_ID`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET_NAME` (or `R2_BUCKET`)
   - `R2_PUBLIC_URL` (or `R2_PUBLIC_BASE_URL`)
5. Stripe
   - `STRIPE_SECRET_KEY`
   - (Optional) `STRIPE_WEBHOOK_SECRET` — not used in code currently, can be stored for future webhook route.
6. Twilio
   - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
7. Resend (Email)
   - `RESEND_API_KEY`
   - `RESEND_FROM` (preferred) or `FROM_EMAIL`
8. Firebase (Push)
   - `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL` (note: FCM is a stub; keys can be stored for future use)
9. Google Maps
   - `GOOGLE_MAPS_API_KEY` (not used by backend; primarily mobile/web)
10. Better Stack
   - `BETTER_STACK_SOURCE_TOKEN` (if used later)
11. App Settings
   - `PLATFORM_FEE_PERCENTAGE`, `MIN_PAYOUT_AMOUNT_CENTS` (not referenced currently; can be added for later use).
12. General App URLs
   - `NODE_ENV=production`, `PORT=3000`
   - `APP_URL=https://api.hairconnekt.de`, `FRONTEND_URL=https://hairconnekt.de`

## Implementation Steps
1. Create `backend/.env` and paste values (normalized: no backticks, `rediss://` for Upstash).
2. Add required JWT access/refresh keys even if legacy JWT vars are present.
3. Start backend (`npm run start:dev`) and verify `GET /health`.
4. Test mobile app flows hitting `http://192.168.2.85:3000/api/v1`.

## Confirmation Needed
- I will prompt you for each group, starting with Database (Neon). After we fill one group, I’ll proceed to the next. Ready to start with the Database credentials?