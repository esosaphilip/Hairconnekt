# Mobile EAS Setup and Update Flow

## Prerequisites
- Backend healthy at `https://api.hairconnekt.de/api/v1/health`
- `apps/mobile/.env` contains:
  - `EXPO_PUBLIC_API_URL=https://api.hairconnekt.de`

## Install and Login
```sh
npm i -g eas-cli
eas login
```

## Configure Updates
```sh
cd apps/mobile
eas update:configure
```
This adds the project ID and updates URL to your config for EAS Update.

## Dev Branch and Dev Client Build (Android)
```sh
npm run eas:branch:dev
npm run eas:build:dev
```
Download the APK from the EAS build page and install it on your device.

## Push JS Updates (No Rebuild)
```sh
npm run eas:update:dev
```
Open the Dev Client app on your phone; it fetches the latest update and calls the live backend.

## Production Builds
```sh
npm run eas:build:prod:android
npm run eas:build:prod:ios
```
Use these for test distributions (internal testing, TestFlight).

## Notes
- Runtime version is bound to app version; changing `version` in `app.config.ts` creates a new runtime.
- Keep secrets and environment variables in the build service (EAS/CI), not in Git.
- Update flow: iterate → `npm run eas:update:dev` → test → build production when satisfied.

