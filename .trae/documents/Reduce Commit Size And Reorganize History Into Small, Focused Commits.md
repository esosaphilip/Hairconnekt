## Goal
Make the repository history easier to review by splitting recent changes into small, topic‑focused commits and isolating lockfile noise.

## Strategy
- Create topic branches for each area (storage, email, mobile, env/gitignore, lockfiles).
- Rebuild commits from the last baseline (`307db6b5`) so each commit is focused and concise.
- Keep lockfile changes in a single chore commit to avoid inflating feature diffs.
- Ensure no secrets are committed; keep `.env` files ignored, only `.env.example` included.

## Commit Plan
1. Storage (B2)
- Files: `backend/src/modules/storage/r2.service.ts`, `backend/src/modules/storage/storage.service.ts`, `backend/scripts/test-b2-upload.ts`.
- Commit: “feat(storage): Backblaze B2 native upload fallback and URL building; add diagnostic script”.

2. Email (Brevo SMTP)
- Files: `backend/src/modules/email/email.service.ts`, `backend/src/modules/email/email.module.ts`, `backend/src/modules/email/email.controller.ts`.
- Change precedence to prefer SMTP over Resend.
- Commit: “feat(email): SMTP (Brevo) fallback with Nodemailer; add /email/test route; prefer SMTP over Resend”.

3. Mobile (Maps helpers)
- Files: `apps/mobile/src/api/maps.ts`, `apps/mobile/src/config.ts`, `apps/mobile/app.config.ts`.
- Commit: “feat(mobile): wire Google Maps API via Expo env and add Places/Geocoding helpers”.

4. Mobile (Portfolio upload integration)
- Files: `apps/mobile/src/screens/provider/UploadPortfolioScreen.tsx`.
- Commit: “feat(mobile): integrate portfolio upload flow to backend”.

5. Env and gitignore
- Files: `backend/.env.example`, `apps/mobile/.env.example`, `.gitignore`.
- Commit: “chore: add example env files and update gitignore to keep secrets out of VCS”.

6. Lockfiles
- Files: `backend/package-lock.json`, `apps/mobile/package-lock.json`.
- Commit: “chore(lockfiles): update npm lockfiles after dependency changes”.

## Execution Steps
1. Soft reset to baseline `307db6b5`.
2. Stage only files for each topic and create the respective commit.
3. Push updated `main` (or open PRs from topic branches, if you prefer PR workflow).

## Result
- A clean, readable history with small commits (hundreds of lines instead of thousands), lockfile noise isolated, and no secrets in VCS.

## Confirmation
Confirm whether you want this applied to `main` directly (force‑push) or via PRs from topic branches. After confirmation, I will execute the steps and push.