# Screen Fixes Summary

## Status

✅ **Completed:**
- Created centralized constants structure
- Created clean architecture foundation (domain/data/presentation)
- Created logging service (`src/services/logger.ts`)
- Created error handling utilities
- Fixed `ProviderClients.tsx` as example
- Fixed `ServicesManagementScreen.tsx` (uses clean architecture)

## Remaining Work

### Files Needing Fixes

**Console Statements (31 files):**
- Replace with `import { logger } from '@/services/logger'`
- Use `logger.debug()`, `logger.info()`, `logger.warn()`, `logger.error()`

**Hardcoded Colors (69 files):**
- Replace hex codes with `colors.*` from `@/theme/tokens`
- Common replacements:
  - `#8B4513` → `colors.primary`
  - `#991B1B` → `colors.error`
  - `#16A34A` → `colors.success`
  - `#F59E0B` → `colors.amber600`
  - `#00000010` → `colors.overlay` or use opacity

**Any Types (31 files):**
- Define proper TypeScript interfaces
- Use navigation types from `@/navigation/types`
- Type API responses properly

**Inline Styles (Most files):**
- Move all styles to `StyleSheet.create`
- Use theme tokens for spacing, colors, typography

**Relative Imports (Many files):**
- Replace `../../` with `@/` alias
- Use `@/components/*`, `@/screens/*`, `@/theme/*`, etc.

**Direct API Calls:**
- Move to hooks/use cases when clean architecture is available
- Use `API_CONFIG.ENDPOINTS.*` for all API paths
- Use `MESSAGES.*` for all user-facing messages

## Quick Fix Script Pattern

For each screen file, apply these transformations:

1. **Update imports:**
```typescript
// Add these imports
import { logger } from '@/services/logger';
import { API_CONFIG, MESSAGES } from '@/constants';
import { showError } from '@/presentation/utils/errorHandler';
import { colors, spacing, typography } from '@/theme/tokens';
import type { ... } from '@/navigation/types';

// Fix relative imports
// ../../components/Card → @/components/Card
// ../../api/http → @/api/http
```

2. **Replace console statements:**
```typescript
// console.log → logger.debug
// console.error → logger.error
// console.warn → logger.warn
```

3. **Replace hardcoded colors:**
```typescript
// '#8B4513' → colors.primary
// '#991B1B' → colors.error
// '#16A34A' → colors.success
// '#F59E0B' → colors.amber600
// '#00000010' → colors.overlay or { opacity: 0.1 }
```

4. **Replace any types:**
```typescript
// navigation: any → useNavigation<ProperType>()
// data: any → data: ProperType
// items: any[] → items: ItemType[]
```

5. **Move inline styles to StyleSheet:**
```typescript
// Create styles object
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.gray50,
    padding: spacing.md,
  },
});
```

6. **Use constants:**
```typescript
// '/providers/clients' → API_CONFIG.ENDPOINTS.PROVIDERS.CLIENTS
// 'Error loading' → MESSAGES.ERROR.LOAD_FAILED
```

## Priority Order

### Phase 1: Critical Screens (Do First)
1. ✅ ProviderClients.tsx
2. HomeScreen.tsx
3. SearchScreen.tsx
4. ProfileScreen.tsx
5. ProviderDashboard.tsx
6. MessagesScreen.tsx
7. BookingsListScreen.tsx

### Phase 2: Important Screens
8. ProviderProfileScreen.tsx
9. ClientDetailScreen.tsx
10. BookingFlow.tsx
11. SettingsScreen.tsx
12. PaymentMethodsScreen.tsx
13. CreateAppointmentScreen.tsx
14. ProviderCalendar.tsx

### Phase 3: Remaining Screens
- All other screens following the same pattern

## Example: Fixed ProviderClients.tsx

See `src/screens/provider/ProviderClients.tsx` for a complete example of:
- ✅ Proper imports with `@/` alias
- ✅ No console statements
- ✅ No hardcoded colors
- ✅ No `any` types
- ✅ All styles in `StyleSheet.create`
- ✅ Uses centralized constants
- ✅ Proper error handling
- ✅ Proper navigation typing

## Next Steps

1. Apply the same fixes to HomeScreen.tsx
2. Continue with other high-priority screens
3. Use the pattern from ProviderClients.tsx as reference
4. Test each screen after fixes

## Notes

- All fixes follow `guildlines/clean.txt`
- Domain layer remains pure (no React, no Axios)
- Constants are centralized
- Error handling is consistent
- Type safety is enforced

