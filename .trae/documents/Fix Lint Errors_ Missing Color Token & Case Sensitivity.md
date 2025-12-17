## Problem Analysis

1.  **Missing `gray900` in `colors` object:**
    *   The file `EditAboutMeScreen.tsx` tries to access `colors.gray900`, but `src/theme/tokens.ts` only defines `gray800` (and others), skipping `gray900`.
    *   However, `amber900`, `red900`, `blue900` exist, suggesting `gray900` was intended but omitted.
    *   **Fix:** Add `gray900: '#111827'` (standard Tailwind gray-900) to `src/theme/tokens.ts`.

2.  **Casing Mismatch for Badge Component:**
    *   The file system has `src/components/badge.tsx` (lowercase 'b').
    *   The new screens import it as `../../components/Badge` (uppercase 'B').
    *   This causes "File name differs from already included file name only in casing" errors on case-sensitive file systems (and warnings on macOS).
    *   **Fix:** Update imports in `EditLanguagesScreen.tsx` and `EditSpecializationsScreen.tsx` to use lowercase `../../components/badge`.

## Implementation Plan

1.  **Update `src/theme/tokens.ts`:**
    *   Add `gray900: '#111827',` to the `colors` object.

2.  **Fix Imports in Provider Screens:**
    *   In `EditLanguagesScreen.tsx`: Change `import Badge from '../../components/Badge';` to `import Badge from '../../components/badge';`.
    *   In `EditSpecializationsScreen.tsx`: Change `import Badge from '../../components/Badge';` to `import Badge from '../../components/badge';`.

3.  **Verify:**
    *   Ensure no other files are using Uppercase `Badge` import (the diagnostic list showed mostly lowercase usage in other files).

## Checklist

*   [ ] Add `gray900` to tokens.
*   [ ] Fix Badge import in `EditLanguagesScreen.tsx`.
*   [ ] Fix Badge import in `EditSpecializationsScreen.tsx`.
