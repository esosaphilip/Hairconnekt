# Batch Fix Guide for Remaining Screens

## Status
- ✅ Fixed: 4 screens (HomeScreen, SearchScreen, ProfileScreen, ProviderClients)
- 🔄 In Progress: ProviderDashboard
- ⏳ Remaining: ~90 screens

## Automated Fix Pattern

For each remaining screen file, apply these transformations:

### 1. Import Updates (Add to top)
```typescript
import { colors, spacing, typography, radii } from '@/theme/tokens';
import { API_CONFIG, MESSAGES } from '@/constants';
import { logger } from '@/services/logger';
import { showError } from '@/presentation/utils/errorHandler';
```

### 2. Replace Relative Imports
```typescript
// Find: ../../components/
// Replace: @/components/

// Find: ../../api/
// Replace: @/api/

// Find: ../../services/
// Replace: @/services/

// Find: ../../theme/
// Replace: @/theme/
```

### 3. Replace Console Statements
```typescript
// Find: console.log(
// Replace: logger.debug(

// Find: console.error(
// Replace: logger.error(

// Find: console.warn(
// Replace: logger.warn(
```

### 4. Replace Hardcoded Colors
```typescript
// Common replacements:
'#8B4513' → colors.primary
'#991B1B' → colors.error
'#16A34A' → colors.green600
'#22C55E' → colors.green600
'#F59E0B' → colors.amber600
'#EAB308' → colors.amber600
'#3B82F6' → colors.blue600
'#2563EB' → colors.blue900
'#EF4444' → colors.error
'#DC2626' → colors.error
'#fff' → colors.white
'#FFFFFF' → colors.white
'#000' → colors.black
'#000000' → colors.black
'#F9FAFB' → colors.gray50
'#F3F4F6' → colors.gray100
'#E5E7EB' → colors.gray200
'#D1D5DB' → colors.gray300
'#9CA3AF' → colors.gray400
'#6B7280' → colors.gray500
'#4B5563' → colors.gray600
'#374151' → colors.gray700
'#1F2937' → colors.gray800
'#00000010' → colors.overlay or { opacity: 0.1 }
```

### 5. Replace Any Types
```typescript
// Find: : any
// Replace with proper types:
// navigation: any → useNavigation()
// data: any → data: ProperType
// items: any[] → items: ItemType[]
```

### 6. Move Inline Styles to StyleSheet
```typescript
// Find: style={{ backgroundColor: '#fff', padding: 16 }}
// Replace: style={styles.container}

// Then add to StyleSheet:
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    padding: spacing.md,
  },
});
```

### 7. Use Constants for API Calls
```typescript
// Find: '/providers/me'
// Replace: API_CONFIG.ENDPOINTS.PROVIDERS.ME

// Find: 'Fehler beim Laden'
// Replace: MESSAGES.ERROR.LOAD_FAILED
```

## Priority Order

### High Priority (Fix Next)
1. ProviderDashboard.tsx (in progress)
2. BookingsListScreen.tsx (client)
3. BookingsListScreen.tsx (provider)
4. MessagesScreen.tsx
5. BookingFlow.tsx
6. PaymentMethodsScreen.tsx

### Medium Priority
7. ProviderCalendar.tsx
8. CreateAppointmentScreen.tsx
9. VouchersManagementScreen.tsx
10. ProviderProfileScreen.tsx
11. SettingsScreen.tsx
12. All other provider screens

### Low Priority
13. All other client screens
14. Shared screens

## Notes

- All fixes must follow `guildlines/clean.txt`
- Test each screen after fixes
- Ensure no linter errors
- Maintain functionality while refactoring

## Lint Strategy (Mobile)

- CI uses `npm run lint:ci` to lint only critical domains (`src/{api,auth,navigation,presentation}`) with `--max-warnings=0`.
- Developer lint (`npm run lint`) runs on all sources and reports warnings; use `npm run lint:fix` for autofixes.
- React Native plugin rules tuned:
  - Errors: `react-native/no-unused-styles`, `react-native/split-platform-components`, `react-native/no-single-element-style-arrays`.
  - Off: `react-native/no-raw-text`, `react-native/sort-styles`, `react-native/no-color-literals`, `react-native/no-inline-styles`.
- TypeScript rules:
  - Default: `no-explicit-any` (warn), `no-unused-vars` (warn), `ban-ts-comment` (warn).
  - In `api/` and `auth/`: `no-explicit-any` and `no-unused-vars` are errors.
- Navigation root typed as `Record<string, object | undefined>` instead of `any` (apps/mobile/src/navigation/rootNavigation.ts:6).
