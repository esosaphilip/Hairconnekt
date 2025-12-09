\
this is the plan\
\
Mid-Term: Hosted Dev Backend (Stable URL)
=========================================

* Deploy the NestJS backend to a public host with TLS and a stable domain.

* Good options: Render, Railway, Fly.io, or a small VPS (Ubuntu + Docker + Nginx).

* Steps (Render example):

  1. Push repo to GitHub (backend subfolder)
  2. Create Render “Web Service” → set Root Directory to `backend`
  3. Build command: `npm ci && npm run build`
  4. Start command: `node dist/main.js`
  5. Environment variables:

     * `DATABASE_URL` → Neon/Postgres connection string

     * `JWT_SECRET` → any secure secret

     * `REDIS_URL` → Upstash (or leave empty if you don’t need Redis now)

     * `FRONTEND_URL` → `*` (dev) or your app origin

     * `PORT` → `3000` (Render sets `PORT`; Nest uses it)
  6. Enable “Force HTTPS” / TLS on the platform
  7. Obtain public URL (e.g., `https://hairconnekt-dev.onrender.com`)
  8. Set `EXPO_PUBLIC_API_URL=https://hairconnekt-dev.onrender.com` in mobile `.env`

* Optional:

  * Add a custom domain (`dev.hairconnekt.app`) and HTTPS certificate.

  * Use `pm2` or platform process manager for uptime.

## Mobile App Configuration

* In `apps/mobile/.env`, set `EXPO_PUBLIC_API_URL` to the public HTTPS base (no trailing `/api/v1`).

* Restart Expo to reload env.

* Confirm the log line: `[Hairconnekt] API_BASE_URL -> <URL>/api/v1`.

## Authentication & Testing

* Ensure you can log in on mobile (JWT added by interceptors).

* Verify:

  * `GET /api/v1/health` returns `{ status: 'ok' }`

  * `GET /api/v1/providers/me` works when logged in as provider

  * `GET /api/v1/services/provider` lists services

  * `POST /api/v1/services` creates a service

## Security & Dev Considerations

* Prefer HTTPS for all mobile traffic (tunnel or host provides it).

* Keep secrets out of the repo; set them in host env.

* For dev CORS, `true` is fine; for staging/prod, set `FRONTEND_URL` to your domain.

* If using a tunnel, consider IP allowlisting on sensitive routes or rotate URLs regularly.

## If You Approve

* I’ll set up either a tunnel (fast) or Render deployment (stable), update `EXPO_PUBLIC_API_URL`, and verify service creation from the mobile app end-to-end.

