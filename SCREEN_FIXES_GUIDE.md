# Screen Fixes Guide

This document outlines the systematic fixes needed for all screens to follow clean architecture guidelines.

## Common Issues Found

1. **Console Statements** (31 files) - Replace with `logger` from `@/services/logger`
2. **Hardcoded Colors** (69 files) - Replace with `colors.*` from `@/theme/tokens`
3. **Any Types** (31 files) - Replace with proper TypeScript types
4. **Direct API Calls** - Move to hooks/use cases
5. **Inline Styles** - Move to `StyleSheet.create`
6. **Relative Imports** - Use `@/` alias
7. **Hardcoded Strings** - Use i18n or constants
8. **Hardcoded Spacing** - Use `spacing.*` from theme

## Fix Pattern for Each Screen

### 1. Update Imports
```typescript
// ❌ OLD
import Card from '../../components/Card';
import { http } from '../../api/http';
import { colors } from '../../theme/tokens';

// ✅ NEW
import Card from '@/components/Card';
import { http } from '@/api/http';
import { colors, spacing, typography } from '@/theme/tokens';
import { API_CONFIG, MESSAGES } from '@/constants';
import { logger } from '@/services/logger';
import { showError } from '@/presentation/utils/errorHandler';
```

### 2. Replace Console Statements
```typescript
// ❌ OLD
console.log('Loading...');
console.error('Error:', err);

// ✅ NEW
import { logger } from '@/services/logger';
logger.debug('Loading...');
logger.error('Error:', err);
```

### 3. Replace Hardcoded Colors
```typescript
// ❌ OLD
<View style={{ backgroundColor: '#8B4513' }} />
<Text style={{ color: '#991B1B' }}>Error</Text>

// ✅ NEW
<View style={{ backgroundColor: colors.primary }} />
<Text style={{ color: colors.error }}>Error</Text>
```

### 4. Replace Hardcoded Spacing
```typescript
// ❌ OLD
<View style={{ padding: 16, marginTop: 8 }} />

// ✅ NEW
<View style={{ padding: spacing.md, marginTop: spacing.sm }} />
```

### 5. Use StyleSheet.create
```typescript
// ❌ OLD
<View style={{ padding: 16, backgroundColor: '#fff' }} />

// ✅ NEW
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    padding: spacing.md,
  },
});
<View style={styles.container} />
```

### 6. Replace Any Types
```typescript
// ❌ OLD
const data: any = res.data;
const items: any[] = [];

// ✅ NEW
type ResponseData = { items: Item[] };
const data: ResponseData = res.data;
const items: Item[] = [];
```

### 7. Use Centralized Constants
```typescript
// ❌ OLD
await http.get('/providers/clients');
const message = 'Error loading';

// ✅ NEW
import { API_CONFIG, MESSAGES } from '@/constants';
await http.get(API_CONFIG.ENDPOINTS.PROVIDERS.CLIENTS);
const message = MESSAGES.ERROR.LOAD_FAILED;
```

### 8. Fix Navigation
```typescript
// ❌ OLD
if (Platform.OS === 'web') {
  window.location.hash = '/provider/clients';
}

// ✅ NEW
import { useNavigation } from '@react-navigation/native';
import type { ProviderClientsStackScreenProps } from '@/navigation/types';

const navigation = useNavigation<ProviderClientsStackScreenProps<'ProviderClients'>['navigation']>();
navigation.navigate('ProviderClientDetail', { id });
```

## Files to Fix (Priority Order)

### High Priority (Commonly Used Screens)
1. ✅ ProviderClients.tsx - FIXED
2. HomeScreen.tsx
3. SearchScreen.tsx
4. ProfileScreen.tsx
5. ProviderDashboard.tsx
6. MessagesScreen.tsx
7. BookingsListScreen.tsx

### Medium Priority
8. ProviderProfileScreen.tsx
9. ClientDetailScreen.tsx
10. BookingFlow.tsx
11. SettingsScreen.tsx
12. PaymentMethodsScreen.tsx

### Lower Priority (Less Used)
- All other screens following the same pattern

## Automated Fix Script

Run this to find all violations:

```bash
# Find console statements
grep -r "console\." apps/mobile/src/screens --include="*.tsx"

# Find hardcoded colors
grep -r "#[0-9A-Fa-f]\{3,6\}" apps/mobile/src/screens --include="*.tsx"

# Find any types
grep -r ": any" apps/mobile/src/screens --include="*.tsx"

# Find relative imports
grep -r "from '\.\./\.\./" apps/mobile/src/screens --include="*.tsx"
```

## Checklist for Each Screen

- [ ] All imports use `@/` alias
- [ ] No console statements (use `logger`)
- [ ] No hardcoded colors (use `colors.*`)
- [ ] No hardcoded spacing (use `spacing.*`)
- [ ] All styles in `StyleSheet.create`
- [ ] No `any` types
- [ ] Uses centralized constants (`API_CONFIG`, `MESSAGES`)
- [ ] Proper error handling with `showError`
- [ ] Proper navigation typing
- [ ] No direct API calls (use hooks/use cases when available)

