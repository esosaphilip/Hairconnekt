# Mobile App Issues Report

This document maps out all identified issues in the mobile app codebase.

## Table of Contents
1. [Duplicate Files](#duplicate-files)
2. [Missing Implementations (TODOs)](#missing-implementations-todos)
3. [Navigation Issues](#navigation-issues)
4. [Type Safety Issues](#type-safety-issues)
5. [Incomplete Screens](#incomplete-screens)
6. [API Integration Issues](#api-integration-issues)
7. [Code Quality Issues](#code-quality-issues)
8. [Export/Import Inconsistencies](#exportimport-inconsistencies)
9. [Component Issues](#component-issues)
10. [Configuration Issues](#configuration-issues)

---

## Duplicate Files

### Critical: Unused Duplicate Files
These files appear to be duplicates and should be removed:

1. **`src/screens/clients/AppointmentDetailScreen copy.tsx`**
   - Full implementation with mock data
   - Not imported anywhere (the actual file is `AppointmentDetailScreen.tsx`)
   - Contains navigation to routes that may not exist (`Appointments`, `ProviderProfile`, `Chat`)

2. **`src/components/button copy.tsx`**
   - Duplicate component file

3. **`src/components/card copy.tsx`**
   - Duplicate component file

4. **`src/components/input copy.tsx`**
   - Duplicate component file

**Action Required**: Delete these duplicate files to avoid confusion and reduce codebase size.

---

## Missing Implementations (TODOs)

### High Priority

1. **Social Authentication** (`src/screens/shared/RegisterScreen.tsx`)
   - Google signup: Line 203 - `/* TODO: implement Google signup */`
   - Apple signup: Line 214 - `/* TODO: implement Apple signup */`

2. **Service Management** (`src/screens/provider/ServicesManagementScreen.tsx`)
   - Toggle service status: Line 64 - `// TODO: Implement PATCH /services/:id to toggle isActive`
   - Delete service: Line 69 - `// TODO: Implement DELETE /services/:id`

3. **Voucher Management** (`src/screens/provider/CreateEditVoucherScreen.tsx`)
   - Line 52 - `// TODO: Wire to backend: POST /providers/vouchers or PUT /providers/vouchers/:id`

4. **Payout Settings** (`src/screens/provider/PayoutRequestScreen.tsx`)
   - Line 25 - `const minimumPayout = 50; // TODO: fetch from backend settings if available`

5. **Custom Time Picker** (`src/components/CustomTimePicker.tsx`)
   - Line 5 - `// TODO: Replace with a native time picker on iOS/Android and a modal input on Web.`
   - Currently shows an alert instead of a proper time picker

6. **Filter Modal** (`src/screens/clients/AllStylesScreen.tsx`)
   - Line 201 - `onPress={() => { /* TODO: Open filter modal/screen */ }}`

### Medium Priority

7. **Service Edit Endpoint** (`src/screens/provider/AddEditServiceScreen.tsx`)
   - Line 93 - PATCH endpoint is commented out: `// await http.patch('/services', serviceData);`
   - Only POST (create) is implemented, not PATCH (update)

---

## Navigation Issues

### Route Name Mismatches

1. **AppointmentDetailScreen copy.tsx** (if used)
   - Navigates to `'Appointments'` (line 394) - should be `'BookingsList'` or proper stack navigation
   - Navigates to `'ProviderProfile'` (line 557) - should match actual route name
   - Navigates to `'Chat'` (line 623) - should match actual route name

2. **BottomNavigation.tsx**
   - Uses route names: `"Home"`, `"Search"`, `"Appointments"`, `"Messages"`, `"Profile"`
   - These should match the actual tab navigator screen names in `App.tsx`

3. **ProviderBottomNav.tsx**
   - Uses hash-based paths (`/provider/dashboard`) instead of React Navigation routes
   - Only works on web platform, not native mobile
   - Should use proper React Navigation navigation

4. **ScreenNavigator.tsx**
   - Contains hardcoded paths that may not match actual navigation structure
   - Paths like `'Onboarding'`, `'Location'`, `'ProviderOnboarding'`, `'ProviderTutorial'` may not exist

### Missing Route Handlers

5. **ProtectedRoute.tsx**
   - Navigates to `'Login'` with params, but route definition may not accept these params
   - Uses `StackActions.replace` which may not work correctly in all navigation contexts

6. **ClientDetailScreen.tsx**
   - Uses web hash-based navigation (lines 103-104) instead of React Navigation
   - Falls back to console.log on native (line 106)

---

## Type Safety Issues

### Excessive Use of `any` Type

Found **113 matches** of `any` type usage across **54 files**. Key areas:

1. **API Response Handling**
   - `src/screens/provider/ServicesManagementScreen.tsx` - Lines 32-33: `any[]` for service list
   - `src/screens/provider/ProviderProfileScreen.tsx` - Line 73: `any` for profile state
   - `src/services/providers.ts` - Line 20: `any` in normalizeProvider function

2. **Navigation Types**
   - `src/screens/provider/ProviderBottomNav.tsx` - Line 16: `style?: any`
   - Multiple navigation prop types use `any`

3. **Component Props**
   - `src/components/Icon.tsx` - Line 60: Cast to `any` for Ionicons name prop
   - `src/components/CustomTimePicker.tsx` - Missing type definitions for props

**Impact**: Reduces type safety, makes refactoring harder, hides potential runtime errors.

---

## Incomplete Screens

### Placeholder Screens

1. **AppointmentsScreen** (`src/screens/clients/AppointmentsScreen.tsx`)
   - Line 10: Comment states "Placeholder RN screen"
   - Only shows "Die mobile Terminübersicht wird bald verfügbar sein" message
   - No actual functionality

2. **AppointmentDetailScreen** (`src/screens/clients/AppointmentDetailScreen.tsx`)
   - Very minimal implementation (only 15 lines)
   - Just displays ID and "Details view coming soon…"
   - Should use the implementation from the copy file or proper API integration

3. **EditProfileScreen** (`src/screens/shared/EditProfileScreen.tsx`)
   - Appears to be a placeholder (only 14 lines visible)

4. **DeleteAccountScreen** (`src/screens/shared/DeleteAccountScreen.tsx`)
   - Appears to be a placeholder (only 14 lines visible)

5. **TransactionHistoryScreen** (`src/screens/clients/TransactionHistoryScreen.tsx`)
   - Appears to be a placeholder (only 16 lines visible)

---

## API Integration Issues

### Missing API Endpoints

1. **Service Management**
   - `PATCH /services/:id` - Not implemented (toggle active status)
   - `DELETE /services/:id` - Not implemented
   - `PATCH /services` - Commented out in AddEditServiceScreen

2. **Voucher Management**
   - `POST /providers/vouchers` - Not wired up
   - `PUT /providers/vouchers/:id` - Not wired up

3. **Provider Settings**
   - Minimum payout amount - Hardcoded, should fetch from backend

### API Error Handling

1. **Inconsistent Error Handling**
   - Some screens have proper error handling, others don't
   - Error messages sometimes come from `err?.response?.data?.message`, sometimes from `err?.message`
   - No centralized error handling strategy

2. **Missing Loading States**
   - Some API calls don't show loading indicators
   - Some screens don't handle loading states properly

---

## Code Quality Issues

### Console Statements

Found **82 console.log/error/warn statements** across **36 files**. These should be:
- Removed in production builds
- Replaced with proper logging service
- Or at minimum, wrapped in `__DEV__` checks

Key files with console statements:
- `src/auth/AuthContext.tsx` - 10 console statements
- `src/config.ts` - Console log for API URL
- Multiple screen files with debug logs

### TypeScript Exclusions

`tsconfig.json` excludes **many component files** from type checking:
- All shadcn/ui style components (alert-dialog, breadcrumb, carousel, etc.)
- This means type errors in these files won't be caught

**Files Excluded**:
- `src/components/alert-dialog.tsx`
- `src/components/alert.tsx`
- `src/components/aspect-ratio.tsx`
- `src/components/breadcrumb.tsx`
- ... and 30+ more files

**Impact**: Type errors in these files won't be caught during build.

---

## Export/Import Inconsistencies

### Mixed Export Patterns

1. **Default vs Named Exports**
   - Some screens use `export default function`
   - Others use `export function`
   - Some use both patterns inconsistently

2. **Import Inconsistencies**
   - `AppointmentDetailScreen` - Has both default export version and named export version
   - `RegisterScreen` - Uses `export default`
   - `WriteReviewScreen` - Uses `export default`
   - `RescheduleAppointmentScreen` - Uses `export default`
   - But imported as named exports in `App.tsx`

3. **Component Imports**
   - `Button` - Sometimes imported as default, sometimes as named
   - `Card` - Same issue
   - `Text` - Same issue

---

## Component Issues

### Missing Type Definitions

1. **CustomTimePicker**
   - Props are not typed: `{ label, value, onChange, icon, style }`
   - Should have proper TypeScript interface

2. **Icon Component**
   - Uses `any` cast for Ionicons name prop (line 60)
   - Could be more type-safe

3. **Button Component**
   - Duplicate file exists (`button copy.tsx`)
   - May have inconsistent prop types

### Component Duplicates

1. **Multiple Button Implementations**
   - `src/components/Button.tsx`
   - `src/components/button copy.tsx`
   - `src/ui/Button.tsx`
   - Need to consolidate

2. **Multiple Card Implementations**
   - `src/components/Card.tsx`
   - `src/components/card copy.tsx`
   - `src/ui/Card.tsx`
   - Need to consolidate

3. **Multiple Input Implementations**
   - `src/components/Input.tsx`
   - `src/components/input copy.tsx`
   - Need to consolidate

---

## Configuration Issues

### TypeScript Configuration

1. **Excluded Files**
   - Too many files excluded from type checking
   - Should fix type errors instead of excluding files

2. **Path Aliases**
   - Uses `@/*` for `src/*`
   - Some imports may not use this consistently

### Build Configuration

1. **Missing Environment Variables**
   - `EXPO_PUBLIC_API_URL` - Optional, but should be documented
   - No validation for required env vars

2. **API Base URL Resolution**
   - Complex logic in `config.ts` to resolve dev host
   - May fail in some scenarios
   - No fallback error handling

---

## Additional Issues

### Missing Features

1. **User Manual Screen**
   - `UserManualScreen` is actually an alias for `LoginScreen` (line 229 in App.tsx)
   - Comment says "Render placeholder UserManualScreen (Login UI) with required props until a dedicated About screen exists"
   - Should have a proper About/User Manual screen

2. **About Screen**
   - Uses LoginScreen as placeholder (App.tsx line 279-294)
   - Has placeholder handlers that just console.log

3. **Filter Functionality**
   - AllStylesScreen has TODO for filter modal
   - SearchScreen may have incomplete filter implementation

### Navigation Type Safety

1. **Missing Type Definitions**
   - `navigation/types.ts` only defines `RootStackParamList` and `BookingsStackParamList`
   - Missing types for:
     - ProviderMoreStack
     - ProviderCalendarStack
     - ProviderClientsStack
     - ClientProfileStack
     - And nested navigation params

2. **Unsafe Navigation**
   - Many `navigation.navigate()` calls without proper type checking
   - Route names as strings without type safety

---

## Summary Statistics

- **Duplicate Files**: 4 files
- **TODO Items**: 7+ critical, multiple medium priority
- **Navigation Issues**: 6+ identified problems
- **Type Safety**: 113 `any` usages across 54 files
- **Incomplete Screens**: 5+ placeholder screens
- **Console Statements**: 82 across 36 files
- **Excluded TypeScript Files**: 30+ files
- **Export Inconsistencies**: Multiple files

---

## Recommended Priority Actions

### Critical (Fix Immediately)
1. Delete duplicate files
2. Fix navigation route mismatches
3. Implement missing API endpoints (service toggle/delete, voucher CRUD)
4. Replace placeholder screens with real implementations

### High Priority (Fix Soon)
1. Add proper TypeScript types (reduce `any` usage)
2. Implement social authentication
3. Fix export/import inconsistencies
4. Add proper error handling

### Medium Priority (Plan for Next Sprint)
1. Remove console statements or wrap in dev checks
2. Fix TypeScript exclusions
3. Consolidate duplicate components
4. Add missing type definitions for navigation

### Low Priority (Technical Debt)
1. Improve code documentation
2. Standardize error handling patterns
3. Add unit tests
4. Improve logging strategy

---

## Notes

- This report was generated by analyzing the codebase structure, imports, exports, and code patterns
- Some issues may require further investigation during development
- Prioritize based on user impact and development velocity
- Consider creating GitHub issues for tracking each category of problems

