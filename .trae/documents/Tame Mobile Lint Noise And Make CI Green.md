## Goals

- Keep CI green without weakening important code-quality guarantees.
- Reduce high-noise RN style warnings, but keep genuinely risky issues as errors.
- Make progress on typing where it matters first (API, auth, navigation).

## Key Improvements Over Previous Plan

- Split linting into two tracks:
  - `lint` for developers: shows warnings, doesn’t fail.
  - `lint:ci` for CI: fails on errors and on warnings only in critical directories.
- Narrow React Native rules to a selected set that catches real problems and disable noisy cosmetic ones.
- Enforce strict typing in core domains while relaxing in UI screens temporarily.

## CI And Scripts

- Add scripts in `apps/mobile/package.json`:
  - `lint`: `eslint "src/**/*.{ts,tsx}" --cache`
  - `lint:fix`: `eslint "src/**/*.{ts,tsx}" --fix --cache`
  - `lint:ci`: `eslint "src/{api,auth,navigation,presentation}/**/*.{ts,tsx}" --max-warnings=0`
- Update workflow to run `npm run lint:ci` instead of `lint` (/.github/workflows/mobile-ci.yml:33–34).

## ESLint Config Tuning (apps/mobile/.eslintrc.cjs)

- Replace `plugin:react-native/all` with `plugin:react-native/recommended`.
- Rules:
  - Keep as error: `react-native/no-unused-styles`, `react-native/split-platform-components`, `react-native/no-single-element-style-arrays`.
  - Turn off: `react-native/sort-styles`, `react-native/no-color-literals`, `react-native/no-inline-styles` (can revisit later).
  - Types:
    - Set `@typescript-eslint/no-explicit-any`: `error` in `src/api/**` and `src/auth/**`, `warn` elsewhere.
    - Add `@typescript-eslint/no-misused-promises` and `no-floating-promises` equivalents via TS-ESLint to catch async mistakes in logic-heavy code.
- Ignore:
  - Add `.eslintignore` for `assets/`, `docs/`, `guildlines/`, and `*.md`.

## Autofix + Targeted Changes

- Run `lint:fix` to apply safe autofixes.
- Make small, high-value type fixes:
  - Replace `any` in `src/api/http.ts`, `appointments.ts`, `providerVouchers.ts` with DTO types.
  - Tighten props in `src/components/Icon.tsx` (file_path:line_number examples: apps/mobile/src/components/Icon.tsx:60) and `Card.tsx` (apps/mobile/src/components/Card.tsx:14,53,61).
  - Remove blanket `/* eslint-disable */` in screens like `PersonalInfoScreen.tsx:1` after adding basic prop/state types.

## Verification

- Run `npm run lint` locally to confirm near-zero errors.
- Confirm `npm run lint:ci` passes and Mobile CI turns green.
- Capture top remaining warnings and schedule incremental fixes (BATCH_FIX_GUIDE.md).

## Why This Is Better

- CI enforces quality where it matters most (domain logic) without being blocked by UI styling opinions.
- Maintains a clear path to gradually re-enable stricter RN rules once styles are standardized.
- Raises the bar on async and typing safety in critical modules without boiling the ocean.

## Optional Enhancements (later)

- Adopt `eslint-config-expo` to align with Expo defaults (adds a few sensible RN/TS/React settings).
- Add `eslint-plugin-react-hooks` with `plugin:react-hooks/recommended` for robust hooks usage checks.
- Introduce a root `lint:report` that outputs JSON to identify and track top rule offenders over time.
