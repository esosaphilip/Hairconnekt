**Render Deployment**

* Create a Web Service pointing to the `backend` folder.

* Build command: `npm ci && npm run build`; Start command: `node dist/main.js`.

* Set Root Directory: `backend`; Health Check Path: `/api/v1/health`.

* Environment on Render:

  * `DATABASE_URL` (Neon connection string)

  * `DATABASE_SSL=true` (required for Neon)

  * `JWT_SECRET=<secure-random>`

  * `FRONTEND_URL=*` (dev) → tighten later

  * Optional (leave empty if not needed now): `REDIS_URL`, `SMTP_*`/`RESEND_*`, Stripe keys

* Node listens on `process.env.PORT` already (backend/src/main.ts); CORS enabled (backend/src/main.ts:10–12). TypeORM uses `DATABASE_URL` + `DATABASE_SSL` (backend/src/app.module.ts:25–31).

**Migrations**

* Keep `synchronize=false` (already set). Run migrations against Neon:

  * Option A: Run once locally pointing to Neon: `DATABASE_URL=<neon> DATABASE_SSL=true node ./scripts/run-migrations.js` (we will add a small script)

  * Option B: Add Render post-deploy command `npm run typeorm:migrate` using a JS helper that initializes `AppDataSource` (`backend/src/database/data-source.ts`) and calls `runMigrations()`.

**Mobile App Update**

* Set `EXPO_PUBLIC_API_URL` to Render HTTPS base, e.g. `https://hairconnekt-dev.onrender.com` (no `/api/v1`).

* Restart Expo; confirm the log prints `[Hairconnekt] API_BASE_URL -> https://.../api/v1`.

**Verification**

* Browser: `GET https://<render-domain>/api/v1/health` returns `{ status: 'ok' }`.

* App: login as provider → `GET /providers/me` works; Services page → create service succeeds; Appointment screen shows services.

**Ngrok Alternative (if you prefer now)**

* Install and authenticate: `ngrok config add-authtoken <token>`.

* Run: `ngrok http 3000` → copy HTTPS URL → set `EXPO_PUBLIC_API_URL` to that URL.

* Note: free ngrok URLs rotate; use Render for stable domain.

**Next Actions**

* Add a migration runner script and `npm run typeorm:migrate` (backend/package.json) for Render post-deploy.

* Create the Render service with the above config and env, deploy, and test.

* Update mobile `.env` to Render URL and verify end-to-end (service creation + appointments).

