Monorepo structure

This repository is organized as a monorepo:

- backend/ — NestJS API (moved from original project root)
- apps/
  - mobile/ — Kotlin Multiplatform + Compose Multiplatform mobile app (Android first, iOS next)

Getting started

- Backend
  - cd hairconnekt/backend
  - npm install
  - npm run build
  - npm run start

- Mobile (Android first)
  - Open hairconnekt/apps/mobile in Android Studio.
  - Let Android Studio import the Gradle project and download dependencies.
  - Run the androidApp configuration on an emulator/device.

Notes
- Android emulator base URL to backend: http://10.0.2.2:3000
- iOS simulator base URL to backend (when added): http://localhost:3000