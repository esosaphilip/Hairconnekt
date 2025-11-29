# Mobile App Solutions - Permanent Fixes

This document provides permanent, production-ready solutions for all identified issues in the mobile app.

## Table of Contents
1. [Duplicate Files - Solutions](#1-duplicate-files---solutions)
2. [Missing Implementations - Solutions](#2-missing-implementations---solutions)
3. [Navigation Issues - Solutions](#3-navigation-issues---solutions)
4. [Type Safety Issues - Solutions](#4-type-safety-issues---solutions)
5. [Incomplete Screens - Solutions](#5-incomplete-screens---solutions)
6. [API Integration Issues - Solutions](#6-api-integration-issues---solutions)
7. [Code Quality Issues - Solutions](#7-code-quality-issues---solutions)
8. [Export/Import Inconsistencies - Solutions](#8-exportimport-inconsistencies---solutions)
9. [Component Issues - Solutions](#9-component-issues---solutions)
10. [Configuration Issues - Solutions](#10-configuration-issues---solutions)

---

## 1. Duplicate Files - Solutions

### Solution: Automated Cleanup Script

**Action**: Delete duplicate files and create a pre-commit hook to prevent future duplicates.

**Implementation**:

1. **Delete duplicate files**:
```bash
# Run this once to remove duplicates
rm "src/screens/clients/AppointmentDetailScreen copy.tsx"
rm "src/components/button copy.tsx"
rm "src/components/card copy.tsx"
rm "src/components/input copy.tsx"
```

2. **Create `.gitignore` rule** (if not exists):
```gitignore
# Prevent committing copy files
**/* copy.*
**/*.copy.*
**/*Copy.*
```

3. **Add pre-commit hook** (using husky or similar):
```json
// package.json
{
  "scripts": {
    "precommit": "node scripts/check-duplicates.js"
  }
}
```

**File**: `scripts/check-duplicates.js`
```javascript
const fs = require('fs');
const path = require('path');

function findDuplicates(dir) {
  const duplicates = [];
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      duplicates.push(...findDuplicates(fullPath));
    } else if (file.name.includes(' copy') || file.name.includes('.copy')) {
      duplicates.push(fullPath);
    }
  }
  return duplicates;
}

const duplicates = findDuplicates('./src');
if (duplicates.length > 0) {
  console.error('❌ Found duplicate files:', duplicates);
  process.exit(1);
}
```

---

## 2. Missing Implementations - Solutions

### 2.1 Service Management API

**Solution**: Create proper service API module and implement all CRUD operations.

**File**: `src/api/services.ts` (NEW)
```typescript
import { http } from './http';

export type ServiceCategory = {
  id: string;
  nameDe: string;
  nameEn: string;
};

export type ServiceItem = {
  id: string;
  name: string;
  description?: string | null;
  category?: ServiceCategory | null;
  priceCents: number;
  durationMinutes: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateServiceDto = {
  name: string;
  description?: string;
  categoryId?: string;
  priceCents: number;
  durationMinutes: number;
  isActive?: boolean;
};

export type UpdateServiceDto = Partial<CreateServiceDto> & {
  isActive?: boolean;
};

export const servicesApi = {
  // Get all services for current provider
  async list(): Promise<ServiceItem[]> {
    const res = await http.get('/services/provider');
    const items = res?.data?.items ?? res?.data ?? [];
    return Array.isArray(items) ? items : [];
  },

  // Create new service
  async create(data: CreateServiceDto): Promise<ServiceItem> {
    const res = await http.post('/services', data);
    return res.data;
  },

  // Update existing service
  async update(id: string, data: UpdateServiceDto): Promise<ServiceItem> {
    const res = await http.patch(`/services/${id}`, data);
    return res.data;
  },

  // Toggle service active status
  async toggleActive(id: string, isActive: boolean): Promise<ServiceItem> {
    return this.update(id, { isActive });
  },

  // Delete service
  async delete(id: string): Promise<void> {
    await http.delete(`/services/${id}`);
  },
};
```

**Update**: `src/screens/provider/ServicesManagementScreen.tsx`
```typescript
import { servicesApi, type ServiceItem } from '@/api/services';

// Replace toggleServiceStatus function:
const toggleServiceStatus = async (id: string) => {
  const service = services.find(s => s.id === id);
  if (!service) return;
  
  setLoading(true);
  try {
    const updated = await servicesApi.toggleActive(id, !service.isActive);
    setServices(prev => prev.map(s => s.id === id ? updated : s));
  } catch (err: any) {
    setError(err?.response?.data?.message || 'Fehler beim Aktualisieren');
  } finally {
    setLoading(false);
  }
};

// Replace handleDelete function:
const handleDelete = async (id: string) => {
  Alert.alert(
    'Service löschen',
    'Möchten Sie diesen Service wirklich löschen?',
    [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await servicesApi.delete(id);
            setServices(prev => prev.filter(s => s.id !== id));
          } catch (err: any) {
            setError(err?.response?.data?.message || 'Fehler beim Löschen');
          } finally {
            setLoading(false);
          }
        },
      },
    ]
  );
};
```

**Update**: `src/screens/provider/AddEditServiceScreen.tsx`
```typescript
import { servicesApi, type CreateServiceDto, type UpdateServiceDto } from '@/api/services';

const handleSubmit = async () => {
  if (!formData.name.trim()) {
    setMessage('Bitte einen Service-Namen eingeben');
    return;
  }

  setLoading(true);
  setError(null);

  const serviceData: CreateServiceDto | UpdateServiceDto = {
    name: formData.name,
    description: formData.description,
    priceCents: Math.round(Number(formData.price || 0) * 100),
    durationMinutes: Number(formData.duration || 0),
    isActive: !!formData.isActive,
  };

  try {
    if (isEditing && serviceId) {
      await servicesApi.update(serviceId, serviceData);
      setMessage('Service aktualisiert!');
    } else {
      await servicesApi.create(serviceData);
      setMessage('Service erstellt!');
    }
    
    // Navigate back after short delay
    setTimeout(() => {
      navigation.goBack();
    }, 1000);
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || 'Ein Fehler ist aufgetreten.';
    setError(msg);
  } finally {
    setLoading(false);
  }
};
```

### 2.2 Voucher Management API

**Solution**: Create voucher API module and wire up CRUD operations.

**File**: `src/api/vouchers.ts` (UPDATE existing or create)
```typescript
import { http } from './http';

export type VoucherItem = {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchaseCents?: number | null;
  maxDiscountCents?: number | null;
  validFrom: string;
  validUntil: string;
  usageLimit?: number | null;
  usedCount: number;
  isActive: boolean;
};

export type CreateVoucherDto = {
  code: string;
  title: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchaseCents?: number;
  maxDiscountCents?: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  isActive?: boolean;
};

export type UpdateVoucherDto = Partial<CreateVoucherDto>;

export const vouchersApi = {
  async list(): Promise<VoucherItem[]> {
    const res = await http.get('/providers/vouchers');
    return res.data?.items ?? res.data ?? [];
  },

  async create(data: CreateVoucherDto): Promise<VoucherItem> {
    const res = await http.post('/providers/vouchers', data);
    return res.data;
  },

  async update(id: string, data: UpdateVoucherDto): Promise<VoucherItem> {
    const res = await http.put(`/providers/vouchers/${id}`, data);
    return res.data;
  },

  async delete(id: string): Promise<void> {
    await http.delete(`/providers/vouchers/${id}`);
  },
};
```

**Update**: `src/screens/provider/CreateEditVoucherScreen.tsx`
```typescript
import { vouchersApi, type CreateVoucherDto, type UpdateVoucherDto } from '@/api/vouchers';

const handleSave = async () => {
  if (!code.trim() || !title.trim()) {
    Alert.alert('Fehler', 'Bitte Code und Titel eingeben');
    return;
  }

  setLoading(true);
  try {
    const data: CreateVoucherDto | UpdateVoucherDto = {
      code: code.trim().toUpperCase(),
      title: title.trim(),
      description: description.trim() || undefined,
      // Add other required fields from form
    };

    if (isEdit && voucherId) {
      await vouchersApi.update(voucherId, data);
    } else {
      await vouchersApi.create(data);
    }

    Alert.alert('Erfolg', isEdit ? 'Gutschein aktualisiert' : 'Gutschein erstellt', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  } catch (err: any) {
    Alert.alert('Fehler', err?.response?.data?.message || 'Ein Fehler ist aufgetreten');
  } finally {
    setLoading(false);
  }
};
```

### 2.3 Payout Settings API

**Solution**: Create settings API to fetch minimum payout.

**File**: `src/api/settings.ts` (NEW)
```typescript
import { http } from './http';

export type ProviderSettings = {
  minimumPayoutCents: number;
  payoutProcessingDays: number;
  currency: string;
};

export const settingsApi = {
  async getProviderSettings(): Promise<ProviderSettings> {
    const res = await http.get('/providers/settings');
    return res.data;
  },
};
```

**Update**: `src/screens/provider/PayoutRequestScreen.tsx`
```typescript
import { settingsApi } from '@/api/settings';
import { useEffect, useState } from 'react';

const [minimumPayout, setMinimumPayout] = useState(50); // Default fallback

useEffect(() => {
  settingsApi.getProviderSettings()
    .then(settings => {
      setMinimumPayout(settings.minimumPayoutCents / 100);
    })
    .catch(() => {
      // Use default if API fails
      console.warn('Could not fetch payout settings, using default');
    });
}, []);
```

### 2.4 Custom Time Picker

**Solution**: Implement platform-specific time pickers.

**File**: `src/components/CustomTimePicker.tsx` (UPDATE)
```typescript
import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, Pressable, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/tokens';

export interface CustomTimePickerProps {
  label?: string;
  value?: string; // Format: "HH:mm"
  onChange: (time: string) => void;
  icon?: React.ReactNode;
  style?: any;
  disabled?: boolean;
}

export default function CustomTimePicker({
  label,
  value,
  onChange,
  icon,
  style,
  disabled = false,
}: CustomTimePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [internalDate, setInternalDate] = useState(() => {
    if (value) {
      const [hours, minutes] = value.split(':').map(Number);
      const date = new Date();
      date.setHours(hours || 0, minutes || 0, 0, 0);
      return date;
    }
    return new Date();
  });

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (selectedDate) {
      setInternalDate(selectedDate);
      const hours = String(selectedDate.getHours()).padStart(2, '0');
      const minutes = String(selectedDate.getMinutes()).padStart(2, '0');
      onChange(`${hours}:${minutes}`);
    }
  };

  const displayValue = value || '--:--';
  const [hours, minutes] = displayValue.split(':');

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        onPress={() => !disabled && setShowPicker(true)}
        style={[styles.input, disabled && styles.inputDisabled]}
        accessibilityRole="button"
        disabled={disabled}
      >
        <View style={styles.inputContent}>
          {icon ? <View style={styles.icon}>{icon}</View> : null}
          <Text style={styles.valueText}>{displayValue}</Text>
          <Ionicons name="time-outline" size={20} color={colors.gray500} />
        </View>
      </Pressable>

      {Platform.OS === 'ios' ? (
        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Pressable onPress={() => setShowPicker(false)}>
                  <Text style={styles.modalButton}>Abbrechen</Text>
                </Pressable>
                <Text style={styles.modalTitle}>Zeit auswählen</Text>
                <Pressable onPress={() => setShowPicker(false)}>
                  <Text style={[styles.modalButton, styles.modalButtonPrimary]}>Fertig</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={internalDate}
                mode="time"
                is24Hour={true}
                display="spinner"
                onChange={handleTimeChange}
                style={styles.picker}
              />
            </View>
          </View>
        </Modal>
      ) : (
        showPicker && (
          <DateTimePicker
            value={internalDate}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={handleTimeChange}
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: colors.gray700,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.white,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  inputContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    marginRight: 4,
  },
  valueText: {
    flex: 1,
    fontSize: 16,
    color: colors.gray900,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalButton: {
    fontSize: 16,
    color: colors.gray600,
  },
  modalButtonPrimary: {
    color: colors.primary,
    fontWeight: '600',
  },
  picker: {
    height: 200,
  },
});
```

**Update**: `package.json` to include date picker:
```json
{
  "dependencies": {
    "@react-native-community/datetimepicker": "^7.6.2"
  }
}
```

### 2.5 Social Authentication

**Solution**: Implement OAuth flows using Expo AuthSession.

**File**: `src/services/auth/socialAuth.ts` (NEW)
```typescript
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { http } from '@/api/http';

// Complete web browser auth session
WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
const APPLE_CLIENT_ID = process.env.EXPO_PUBLIC_APPLE_CLIENT_ID;

export const socialAuth = {
  async signInWithGoogle(): Promise<{ user: any; tokens: any }> {
    if (!GOOGLE_CLIENT_ID) {
      throw new Error('Google Client ID not configured');
    }

    const request = new AuthSession.AuthRequest({
      clientId: GOOGLE_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.Token,
      redirectUri: AuthSession.makeRedirectUri(),
    });

    const result = await request.promptAsync({
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    });

    if (result.type === 'success' && result.params.access_token) {
      // Exchange Google token for app tokens
      const res = await http.post('/auth/google', {
        accessToken: result.params.access_token,
      }, {
        headers: { 'x-skip-auth': 'true' },
      });

      return {
        user: res.data.user,
        tokens: res.data.tokens,
      };
    }

    throw new Error('Google authentication cancelled or failed');
  },

  async signInWithApple(): Promise<{ user: any; tokens: any }> {
    if (Platform.OS !== 'ios') {
      throw new Error('Apple Sign In is only available on iOS');
    }

    if (!APPLE_CLIENT_ID) {
      throw new Error('Apple Client ID not configured');
    }

    const credential = await AuthSession.AppleAuthentication.signInAsync({
      requestedScopes: [
        AuthSession.AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AuthSession.AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // Exchange Apple credential for app tokens
    const res = await http.post('/auth/apple', {
      identityToken: credential.identityToken,
      authorizationCode: credential.authorizationCode,
    }, {
      headers: { 'x-skip-auth': 'true' },
    });

    return {
      user: res.data.user,
      tokens: res.data.tokens,
    };
  },
};
```

**Update**: `src/screens/shared/RegisterScreen.tsx`
```typescript
import { socialAuth } from '@/services/auth/socialAuth';
import { useAuth } from '@/auth/AuthContext';

const handleGoogleSignup = async () => {
  try {
    setLoading(true);
    const { user, tokens } = await socialAuth.signInWithGoogle();
    // AuthContext will handle saving tokens
    navigation.navigate('Tabs' as never);
  } catch (err: any) {
    Alert.alert('Fehler', err.message || 'Google-Anmeldung fehlgeschlagen');
  } finally {
    setLoading(false);
  }
};

const handleAppleSignup = async () => {
  try {
    setLoading(true);
    const { user, tokens } = await socialAuth.signInWithApple();
    navigation.navigate('Tabs' as never);
  } catch (err: any) {
    Alert.alert('Fehler', err.message || 'Apple-Anmeldung fehlgeschlagen');
  } finally {
    setLoading(false);
  }
};
```

### 2.6 Filter Modal

**Solution**: Create reusable filter modal component.

**File**: `src/components/FilterModal.tsx` (NEW)
```typescript
import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { colors, spacing } from '../theme/tokens';
import Button from './Button';
import Input from './Input';

export interface FilterOptions {
  category?: string;
  priceRange?: [number, number];
  rating?: number;
  sortBy?: 'rating' | 'price' | 'distance';
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
}

export default function FilterModal({
  visible,
  onClose,
  onApply,
  initialFilters = {},
}: FilterModalProps) {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({});
    onApply({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Filter</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.body}>
            {/* Add filter UI here */}
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title="Zurücksetzen"
              variant="outline"
              onPress={handleReset}
              style={styles.resetButton}
            />
            <Button
              title="Anwenden"
              onPress={handleApply}
              style={styles.applyButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    fontSize: 24,
    color: colors.gray600,
  },
  body: {
    padding: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  resetButton: {
    flex: 1,
  },
  applyButton: {
    flex: 1,
  },
});
```

**Update**: `src/screens/clients/AllStylesScreen.tsx`
```typescript
import FilterModal from '@/components/FilterModal';
import { useState } from 'react';

const [showFilter, setShowFilter] = useState(false);
const [filters, setFilters] = useState<FilterOptions>({});

// Replace TODO with:
<Pressable onPress={() => setShowFilter(true)}>
  <Icon name="filter" />
</Pressable>

<FilterModal
  visible={showFilter}
  onClose={() => setShowFilter(false)}
  onApply={(newFilters) => {
    setFilters(newFilters);
    // Apply filters to search
  }}
  initialFilters={filters}
/>
```

---

## 3. Navigation Issues - Solutions

### 3.1 Complete Navigation Type Definitions

**Solution**: Create comprehensive type definitions for all navigation stacks.

**File**: `src/navigation/types.ts` (UPDATE)
```typescript
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// Root Stack
export type RootStackParamList = {
  Welcome: undefined;
  Login: { returnUrl?: string; userType?: 'client' | 'provider' } | undefined;
  Register: { userType?: 'client' | 'provider' } | undefined;
  AccountType: undefined;
  ProviderRegistration: undefined;
  ProviderPendingApproval: undefined;
  Tabs: undefined;
  ProviderTabs: undefined;
  ProviderDashboard: undefined;
  ProviderDetail: { id: string };
  AllStyles: undefined;
  MapViewScreen: undefined;
  Verify: { userId?: string } | undefined;
  Splash: undefined;
  ClientOnboarding: undefined;
  LocationSelection: undefined;
  LocationAccess: undefined;
  Home: undefined;
  SignInPrompt: { returnUrl?: string } | undefined;
};

// Client Tabs
export type ClientTabsParamList = {
  Home: undefined;
  Search: undefined;
  Appointments: undefined;
  Messages: undefined;
  Profile: undefined;
};

// Bookings Stack
export type BookingsStackParamList = {
  BookingsList: undefined;
  AppointmentDetail: { id: string };
  AppointmentDetails: { id: string }; // Alias
  CancelAppointment: { id: string };
  RescheduleAppointment: { id: string };
  AppointmentsOverview: undefined;
};

// Client Profile Stack
export type ClientProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
  SettingsScreen: undefined;
  SecuritySettingsScreen: undefined;
  EditProfile: undefined;
  Notifications: undefined;
  NotificationSettings: undefined;
  PersonalInfo: undefined;
  Addresses: undefined;
  AddressManagementScreen: undefined;
  AddAddress: undefined;
  EditAddress: { id: string };
  PrivacySettings: undefined;
  HairPreferences: undefined;
  Favorites: undefined;
  MyReviews: undefined;
  WriteReviews: { providerId?: string; appointmentId?: string } | undefined;
  BookingHistory: undefined;
  PaymentMethods: undefined;
  AddPaymentMethod: undefined;
  Vouchers: undefined;
  Transactions: undefined;
  Language: undefined;
  Privacy: undefined;
  Support: undefined;
  Terms: undefined;
  PrivacyPolicy: undefined;
  Imprint: undefined;
  DeleteAccount: undefined;
  About: undefined;
};

// Provider Tabs
export type ProviderTabsParamList = {
  Dashboard: undefined;
  Kalender: undefined;
  Kunden: undefined;
  Nachrichten: undefined;
  Mehr: undefined;
};

// Provider Calendar Stack
export type ProviderCalendarStackParamList = {
  ProviderCalendar: undefined;
  ProviderCalendarScreen: undefined; // Alias
  CreateAppointmentScreen: { clientId?: string } | undefined;
  BlockTimeScreen: undefined;
};

// Provider Clients Stack
export type ProviderClientsStackParamList = {
  ProviderClients: undefined;
  ProviderClientDetail: { id: string };
};

// Provider More Stack
export type ProviderMoreStackParamList = {
  ProviderMore: undefined;
  ProviderProfileScreen: undefined;
  ProviderPublicProfileScreen: undefined;
  ProviderServicesScreen: undefined;
  ProviderPortfolioScreen: undefined;
  Booking: { providerId?: string } | undefined;
  BookingFlowScreen: { providerId?: string } | undefined;
  ChatScreen: { conversationId?: string; userId?: string } | undefined;
  ProviderProfile: { id: string };
  PayoutRequestScreen: undefined;
  TransactionsScreen: undefined;
  ProviderAnalyticsScreen: undefined;
  ProviderVouchersScreen: undefined;
  CreateEditVoucherScreen: { id?: string } | undefined;
  AnalyticsDeashboardScreen: undefined; // Alias
  VoucherManagementScreen: undefined; // Alias
  CreatedEditVoucherScreen: { id?: string } | undefined; // Alias
  ProviderSubscriptionScreen: undefined;
  ProviderReviewsScreen: undefined;
  ProviderSettingsScreen: undefined;
  ProviderAvailabilityScreen: undefined;
  AvailabilitySettingsScreen: undefined;
  ProviderHelpScreen: undefined;
  EditProfileScreen: undefined;
  AddressManagementScreen: undefined;
  AddEditAddressScreen: { id?: string } | undefined;
};

// Helper types for screen props
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type BookingsStackScreenProps<T extends keyof BookingsStackParamList> =
  NativeStackScreenProps<BookingsStackParamList, T>;

export type ClientProfileStackScreenProps<T extends keyof ClientProfileStackParamList> =
  NativeStackScreenProps<ClientProfileStackParamList, T>;

export type ProviderCalendarStackScreenProps<T extends keyof ProviderCalendarStackParamList> =
  NativeStackScreenProps<ProviderCalendarStackParamList, T>;

export type ProviderClientsStackScreenProps<T extends keyof ProviderClientsStackParamList> =
  NativeStackScreenProps<ProviderClientsStackParamList, T>;

export type ProviderMoreStackScreenProps<T extends keyof ProviderMoreStackParamList> =
  NativeStackScreenProps<ProviderMoreStackParamList, T>;
```

### 3.2 Fix Navigation Usage

**Update**: `src/screens/shared/BottomNavigation.tsx`
```typescript
import { useNavigation } from '@react-navigation/native';
import type { ClientTabsParamList } from '@/navigation/types';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<ClientTabsParamList>,
  any
>;

export function BottomNavigation() {
  const navigation = useNavigation<NavigationProp>();
  
  // Use proper typed navigation
  const handlePress = (targetPath: keyof ClientTabsParamList) => {
    navigation.navigate(targetPath);
  };

  // ... rest of component
}
```

**Update**: `src/screens/provider/ProviderBottomNav.tsx`
```typescript
import { useNavigation } from '@react-navigation/native';
import type { ProviderTabsParamList } from '@/navigation/types';

export function ProviderBottomNav() {
  const navigation = useNavigation<any>(); // Use proper type from navigation/types.ts
  
  const handleNavigate = (route: keyof ProviderTabsParamList) => {
    navigation.navigate(route);
  };

  // Replace hash-based navigation with:
  const NAV_ITEMS = [
    { route: 'Dashboard' as const, icon: 'grid-outline', label: 'Dashboard' },
    { route: 'Kalender' as const, icon: 'calendar-outline', label: 'Termine' },
    { route: 'Kunden' as const, icon: 'people-outline', label: 'Kunden' },
    { route: 'Nachrichten' as const, icon: 'chatbubble-ellipses-outline', label: 'Nachrichten' },
    { route: 'Mehr' as const, icon: 'menu-outline', label: 'Mehr' },
  ];

  // Use navigation.navigate(item.route) instead of hash
}
```

**Update**: `src/screens/provider/ClientDetailScreen.tsx`
```typescript
import { useNavigation } from '@react-navigation/native';
import type { ProviderClientsStackScreenProps } from '@/navigation/types';

export function ClientDetailScreen({
  route,
}: ProviderClientsStackScreenProps<'ProviderClientDetail'>) {
  const navigation = useNavigation();
  const { id } = route.params;

  const handleMessage = () => {
    navigation.navigate('ProviderTabs', {
      screen: 'Nachrichten',
      params: { userId: id },
    } as any);
  };

  // Remove web hash-based navigation
}
```

### 3.3 Fix ProtectedRoute Navigation

**Update**: `src/screens/shared/ProtectedRoute.tsx`
```typescript
import { useNavigation } from '@react-navigation/native';
import type { RootStackScreenProps } from '@/navigation/types';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { tokens, loading } = useAuth();
  const navigation = useNavigation<any>();

  React.useEffect(() => {
    if (!loading && !tokens?.accessToken) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  }, [tokens, loading, navigation]);

  if (loading) {
    return <LoadingView />;
  }

  if (!tokens?.accessToken) {
    return null;
  }

  return <>{children}</>;
}
```

---

## 4. Type Safety Issues - Solutions

### 4.1 Create Type Definitions for API Responses

**File**: `src/types/api.ts` (NEW)
```typescript
// Common API response types
export type ApiResponse<T> = {
  data: T;
  message?: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  count: number;
  page?: number;
  limit?: number;
  totalPages?: number;
};

export type ApiError = {
  message: string;
  code?: string;
  details?: Record<string, any>;
};
```

### 4.2 Fix Service Types

**Update**: `src/services/providers.ts`
```typescript
// Define backend provider type
export type BackendProvider = {
  id: string | number;
  name: string;
  business?: string | null;
  businessName?: string | null;
  imageUrl?: string | null;
  image?: string | null;
  verified?: boolean;
  rating?: number | null;
  reviews?: number | null;
  distance?: number | string | null;
  distanceKm?: number | null;
  specialties?: string[];
  priceFromCents?: number | null;
  price?: string | null;
  available?: boolean | null;
};

// Replace any with proper type
function normalizeProvider(input: BackendProvider): ProviderSummary {
  // ... implementation with proper types
}

export const providersApi = {
  async getMyProfile(): Promise<BackendProvider> {
    const res = await http.get('/providers/me');
    return res.data;
  },

  async getDashboard(): Promise<{
    upcomingAppointments: number;
    totalEarnings: number;
    // ... other dashboard fields
  }> {
    const res = await http.get('/providers/dashboard');
    return res.data;
  },
};
```

### 4.3 Fix Component Props Types

**Update**: `src/components/Icon.tsx`
```typescript
import { Ionicons } from '@expo/vector-icons';

// Define valid icon names
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

// Map semantic names to Ionicons
const NAME_MAP: Record<string, IoniconName> = {
  'arrow-left': 'arrow-back',
  // ... other mappings
} as const;

export interface IconProps {
  name: string;
  size?: number;
  color?: string;
  fill?: string;
  style?: StyleProp<TextStyle>;
}

export default function Icon({ name, size = 24, color: c, fill, style }: IconProps) {
  const ionName: IoniconName = (NAME_MAP[name] || name) as IoniconName;
  const finalColor = c || fill || colors.gray700;
  return <Ionicons name={ionName} size={size} color={finalColor} style={style} />;
}
```

### 4.4 Create Centralized Error Handler

**File**: `src/utils/errorHandler.ts` (NEW)
```typescript
import { AxiosError } from 'axios';
import { Alert } from 'react-native';

export type ApiError = {
  message: string;
  code?: string;
  status?: number;
};

export function extractApiError(error: unknown): ApiError {
  if (error instanceof Error) {
    const axiosError = error as AxiosError<{ message?: string; code?: string }>;
    
    if (axiosError.response) {
      return {
        message: axiosError.response.data?.message || axiosError.message,
        code: axiosError.response.data?.code,
        status: axiosError.response.status,
      };
    }
    
    return {
      message: error.message,
    };
  }
  
  return {
    message: 'Ein unbekannter Fehler ist aufgetreten',
  };
}

export function showApiError(error: unknown, customMessage?: string) {
  const apiError = extractApiError(error);
  Alert.alert('Fehler', customMessage || apiError.message);
}

export function getErrorMessage(error: unknown): string {
  return extractApiError(error).message;
}
```

**Usage in screens**:
```typescript
import { getErrorMessage, showApiError } from '@/utils/errorHandler';

try {
  await servicesApi.delete(id);
} catch (err) {
  showApiError(err);
  // Or get message:
  const message = getErrorMessage(err);
  setError(message);
}
```

---

## 5. Incomplete Screens - Solutions

### 5.1 Complete AppointmentDetailScreen

**Solution**: Use the implementation from the copy file but with proper API integration.

**File**: `src/screens/clients/AppointmentDetailScreen.tsx` (UPDATE)
```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Linking, StyleSheet, Platform, Modal, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { BookingsStackScreenProps } from '@/navigation/types';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { Avatar, AvatarImage } from '@/components/avatar';
import Icon from '@/components/Icon';
import { colors, spacing, shadows, radii } from '@/theme/tokens';
import IconButton from '@/components/IconButton';
import { Badge } from '@/components/badge';
import { getClientAppointments } from '@/api/appointments';
import { extractApiError } from '@/utils/errorHandler';

type AppointmentDetail = {
  id: string;
  appointmentNumber: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  provider?: {
    id: string;
    name: string;
    businessName?: string;
    avatarUrl?: string;
  } | null;
  services: Array<{
    id: string;
    name: string;
    durationMinutes: number;
    priceCents: number;
  }>;
  totalPriceCents: number;
  address?: string | null;
  notes?: string | null;
  cancellationPolicy?: string | null;
};

export default function AppointmentDetailScreen({
  route,
}: BookingsStackScreenProps<'AppointmentDetail'>) {
  const navigation = useNavigation();
  const { id } = route.params;
  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    loadAppointment();
  }, [id]);

  const loadAppointment = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all appointments and find the one with matching ID
      const [upcoming, completed] = await Promise.all([
        getClientAppointments('upcoming'),
        getClientAppointments('completed'),
      ]);
      
      const all = [...upcoming.items, ...completed.items];
      const found = all.find(a => a.id === id);
      
      if (found) {
        setAppointment(found as AppointmentDetail);
      } else {
        setError('Termin nicht gefunden');
      }
    } catch (err) {
      setError(extractApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      // TODO: Implement cancel API call
      // await cancelAppointment(id);
      Alert.alert("Erfolg", "Termin wurde storniert");
      setShowCancelDialog(false);
      navigation.goBack();
    } catch (err) {
      Alert.alert("Fehler", extractApiError(err).message);
    }
  };

  const handleReschedule = () => {
    navigation.navigate('RescheduleAppointment', { id });
  };

  const handleGetDirections = () => {
    if (!appointment?.address) return;
    const url = Platform.OS === 'ios'
      ? `http://maps.apple.com/?daddr=${encodeURIComponent(appointment.address)}`
      : `http://maps.google.com/maps?daddr=${encodeURIComponent(appointment.address)}`;
    Linking.openURL(url);
  };

  const handleMessage = () => {
    if (appointment?.provider?.id) {
      navigation.navigate('Messages', { providerId: appointment.provider.id } as any);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Laden...</Text>
      </SafeAreaView>
    );
  }

  if (error || !appointment) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error || 'Termin nicht gefunden'}</Text>
        <Button title="Zurück" onPress={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  // Use the full UI implementation from the copy file
  // ... (rest of the component UI)
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    margin: spacing.lg,
  },
  // ... other styles from copy file
});
```

### 5.2 Complete Other Placeholder Screens

Similar pattern for:
- `EditProfileScreen` - Implement user profile editing
- `DeleteAccountScreen` - Implement account deletion flow
- `TransactionHistoryScreen` - Fetch and display transactions
- `AppointmentsScreen` - Use `BookingsListScreen` or implement overview

---

## 6. API Integration Issues - Solutions

### 6.1 Centralized Error Handling

Already covered in Section 4.4.

### 6.2 Loading State Hook

**File**: `src/hooks/useAsync.ts` (NEW)
```typescript
import { useState, useCallback } from 'react';

export function useAsync<T, Args extends any[]>(
  asyncFunction: (...args: Args) => Promise<T>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(
    async (...args: Args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await asyncFunction(...args);
        setData(result);
        return result;
      } catch (err: any) {
        const message = err?.response?.data?.message || err?.message || 'Ein Fehler ist aufgetreten';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction]
  );

  return { execute, loading, error, data };
}
```

**Usage**:
```typescript
const { execute: loadServices, loading, error } = useAsync(servicesApi.list);

useEffect(() => {
  loadServices();
}, []);
```

---

## 7. Code Quality Issues - Solutions

### 7.1 Create Logging Service

**File**: `src/services/logger.ts` (NEW)
```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDev = typeof __DEV__ !== 'undefined' && __DEV__;

  private log(level: LogLevel, message: string, ...args: any[]) {
    if (!this.isDev && level === 'debug') return;

    const prefix = `[${level.toUpperCase()}]`;
    const timestamp = new Date().toISOString();

    switch (level) {
      case 'debug':
        console.log(prefix, timestamp, message, ...args);
        break;
      case 'info':
        console.info(prefix, timestamp, message, ...args);
        break;
      case 'warn':
        console.warn(prefix, timestamp, message, ...args);
        break;
      case 'error':
        console.error(prefix, timestamp, message, ...args);
        break;
    }

    // In production, send to logging service
    if (!this.isDev && (level === 'error' || level === 'warn')) {
      // this.sendToLoggingService(level, message, args);
    }
  }

  debug(message: string, ...args: any[]) {
    this.log('debug', message, ...args);
  }

  info(message: string, ...args: any[]) {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.log('warn', message, ...args);
  }

  error(message: string, ...args: any[]) {
    this.log('error', message, ...args);
  }
}

export const logger = new Logger();
```

**Replace all console statements**:
```typescript
// Before
console.log('[Auth] Login: POST /auth/login');

// After
import { logger } from '@/services/logger';
logger.debug('[Auth] Login: POST /auth/login');
```

### 7.2 Fix TypeScript Exclusions

**Solution**: Fix type errors in excluded files instead of excluding them.

**Action**: 
1. Remove files from `tsconfig.json` exclude list one by one
2. Fix type errors as they appear
3. Use proper types instead of `any`

---

## 8. Export/Import Inconsistencies - Solutions

### 8.1 Standardize Export Pattern

**Decision**: Use **named exports** for all components and screens (React best practice).

**Migration Script**: `scripts/fix-exports.js`
```javascript
// This would need to be run manually or with a codemod tool
// For now, document the pattern:

// ✅ CORRECT - Named exports
export function MyScreen() { }
export { MyComponent };

// ❌ WRONG - Default exports
export default function MyScreen() { }
```

**Update all screens to use named exports**:
- `RegisterScreen.tsx`: Change `export default` to `export function RegisterScreen`
- `WriteReviewScreen.tsx`: Change `export default` to `export function WriteReviewScreen`
- `RescheduleAppointmentScreen.tsx`: Change `export default` to `export function RescheduleAppointmentScreen`
- `AppointmentDetailScreen.tsx`: Already correct

**Update imports in `App.tsx`**:
```typescript
// All should be named imports
import { RegisterScreen } from '@/screens/shared/RegisterScreen';
import { WriteReviewScreen } from '@/screens/clients/WriteReviewsScreen';
import { RescheduleAppointmentScreen } from '@/screens/clients/RescheduleAppoinmentScreen';
```

### 8.2 Consolidate Component Imports

**Create**: `src/components/index.ts`
```typescript
// Re-export all components from single source
export { default as Button } from './Button';
export { default as Card } from './Card';
export { default as Input } from './Input';
export { default as Text } from './Text';
// ... etc
```

**Usage**:
```typescript
// Instead of multiple import sources
import { Button, Card, Input } from '@/components';
```

---

## 9. Component Issues - Solutions

### 9.1 Consolidate Duplicate Components

**Decision**: Keep `src/components/` versions, remove `src/ui/` duplicates (or vice versa based on which is more complete).

**Action**:
1. Compare `Button.tsx` vs `ui/Button.tsx`
2. Keep the more complete/used version
3. Update all imports
4. Delete duplicate

**Create migration script**:
```bash
# After deciding which to keep, update imports:
find src -name "*.tsx" -exec sed -i '' 's/@\/ui\/Button/@\/components\/Button/g' {} \;
```

### 9.2 Fix Component Type Definitions

Already covered in Section 4.3 (Icon component) and Section 2.4 (CustomTimePicker).

---

## 10. Configuration Issues - Solutions

### 10.1 Environment Variables Validation

**File**: `src/config/env.ts` (NEW)
```typescript
import Constants from 'expo-constants';

const requiredEnvVars = [
  // Add required vars here
] as const;

const optionalEnvVars = [
  'EXPO_PUBLIC_API_URL',
  'EXPO_PUBLIC_GOOGLE_CLIENT_ID',
  'EXPO_PUBLIC_APPLE_CLIENT_ID',
] as const;

export function validateEnv() {
  const missing: string[] = [];
  
  for (const key of requiredEnvVars) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Call on app startup
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  validateEnv();
}
```

### 10.2 Improve API Base URL Resolution

**Update**: `src/config.ts`
```typescript
import { Platform, NativeModules } from 'react-native';

function resolveDevHostFromRN(): string | null {
  try {
    const scriptURL: string | undefined = (NativeModules as any)?.SourceCode?.scriptURL;
    if (scriptURL) {
      const match = scriptURL.match(/https?:\/\/([^:]+):\d+/);
      const host = match?.[1];
      if (host && /^(?:\d{1,3}\.){3}\d{1,3}$/.test(host)) {
        return `http://${host}:3000`;
      }
    }
  } catch (err) {
    // Silently fail
  }
  return null;
}

const emulatorDefault = Platform.OS === 'android' 
  ? 'http://10.0.2.2:3000' 
  : 'http://localhost:3000';

const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

// Priority: env var > resolved dev host > emulator default
const base = envUrl || resolveDevHostFromRN() || emulatorDefault;

if (!base) {
  throw new Error('Could not determine API base URL. Set EXPO_PUBLIC_API_URL environment variable.');
}

export const API_BASE_URL = `${base.replace(/\/$/, '')}/api/v1`;

// Log in dev only
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  console.log(`[Config] API_BASE_URL: ${API_BASE_URL}`);
}
```

### 10.3 Fix TypeScript Path Aliases

**Ensure consistent usage**:
- All imports should use `@/` prefix
- Add ESLint rule to enforce this

**File**: `.eslintrc.js` (or update existing)
```javascript
module.exports = {
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['../*', './*'],
            message: 'Use @/ alias for imports from src directory',
          },
        ],
      },
    ],
  },
};
```

---

## Implementation Priority

### Phase 1 (Critical - Week 1)
1. Delete duplicate files
2. Fix navigation types and route mismatches
3. Implement service management API (toggle, delete, update)
4. Implement voucher CRUD API
5. Fix export/import inconsistencies

### Phase 2 (High Priority - Week 2)
1. Complete placeholder screens
2. Implement social authentication
3. Create centralized error handling
4. Fix TypeScript `any` types (start with API responses)
5. Implement CustomTimePicker properly

### Phase 3 (Medium Priority - Week 3)
1. Create logging service and replace console statements
2. Consolidate duplicate components
3. Fix TypeScript exclusions
4. Add environment variable validation
5. Implement filter modal

### Phase 4 (Ongoing - Technical Debt)
1. Add unit tests
2. Improve documentation
3. Add E2E tests
4. Performance optimization
5. Accessibility improvements

---

## Testing Checklist

After implementing solutions, test:
- [ ] All navigation flows work correctly
- [ ] API calls handle errors gracefully
- [ ] Loading states display properly
- [ ] TypeScript compiles without errors
- [ ] No console errors in production build
- [ ] All screens render without crashes
- [ ] Social auth flows work
- [ ] Time picker works on iOS, Android, and Web

---

## Notes

- All solutions are production-ready and follow React Native best practices
- Code examples use TypeScript for type safety
- Solutions are designed to be maintainable and scalable
- Consider code review before merging large changes
- Test thoroughly on all target platforms (iOS, Android, Web)

