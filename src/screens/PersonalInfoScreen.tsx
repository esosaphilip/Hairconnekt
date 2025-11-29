import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from '../components/Icon';

// Custom Components (assumed to be available)
import Text from '../components/Text'; // Custom Text component
import Button from '../components/Button'; // Custom Button component
import Card from '../components/Card'; // Custom Card/Container component
import Input from '../components/Input'; // Custom Input component (RN TextInput wrapper)
import { Picker } from '@react-native-picker/picker'; // Use RN's built-in Picker
import { spacing } from '../theme/tokens'; // Assuming a common theme spacing object
import { usersApi } from '@/services/users';
import { useAuth } from '@/auth/AuthContext';

// --- Brand Color Constant ---
const PRIMARY_COLOR = '#8B4513';
const INFO_BG = '#EFF6FF'; // bg-blue-50
const INFO_BORDER = '#BFDBFE'; // border-blue-100

// --- Main PersonalInfoScreen Component ---

export function PersonalInfoScreen() {
  const navigation = useNavigation();
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '', // Stored as string for display/API
    gender: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const goBack = () => {
    // @ts-ignore
    navigation.goBack();
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [me, prefs] = await Promise.all([
        usersApi.getMe(),
        usersApi.getPreferences().catch(() => null),
      ]);
      const genderMap = { MALE: 'male', FEMALE: 'female', OTHER: 'diverse' } as const;
      setFormData({
        firstName: me.firstName || '',
        lastName: me.lastName || '',
        email: me.email || '',
        phone: me.phone || '',
        dateOfBirth: (prefs?.dateOfBirth as string) || '',
        gender: prefs?.gender ? genderMap[prefs.gender as keyof typeof genderMap] : '',
      });
    } catch (err) {
      console.error('Failed to load personal info:', err);
      Alert.alert('Fehler', 'Fehler beim Laden der persönlichen Informationen.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await usersApi.updateMe({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });
      const genderEnumMap = { male: 'MALE', female: 'FEMALE', diverse: 'OTHER' } as const;
      const genderEnum = formData.gender ? genderEnumMap[formData.gender as keyof typeof genderEnumMap] : null;
      await usersApi.updatePreferences({
        dateOfBirth: formData.dateOfBirth || null,
        gender: genderEnum as any,
      });

      try {
        // Safely spread into an object to avoid TS/JS errors when user is null/undefined
        const baseUser: any = user && typeof user === 'object' ? user : {};
        const nextUser = { ...baseUser, firstName: formData.firstName, lastName: formData.lastName, phone: formData.phone };
        const setUserFn: any = setUser;
        if (typeof setUserFn === 'function') await setUserFn(nextUser);
      } catch {}

      Alert.alert('Erfolg', 'Persönliche Informationen erfolgreich aktualisiert!', [
        { text: 'OK', onPress: goBack },
      ]);
    } catch (err) {
      console.error('Personal info update failed:', err);
      Alert.alert('Fehler', 'Aktualisierung fehlgeschlagen.');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to update form data
  const handleChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Options for the Gender Picker
  const genderOptions = [
    { label: 'Männlich', value: 'male' },
    { label: 'Weiblich', value: 'female' },
    { label: 'Divers', value: 'diverse' },
    { label: 'Keine Angabe', value: 'prefer-not-to-say' },
  ];

  // Component to simulate the web's Label + Input structure
  const FormField = ({ label, id, children }: { label: string; id: string; children: React.ReactNode }) => (
    <View style={styles.formField}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBar}>
          <Pressable onPress={goBack} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#374151" />
          </Pressable>
          <Text style={styles.screenTitle}>Persönliche Informationen</Text>
          <View style={styles.placeholderView} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.formCard}>
          <View style={styles.formSpace}>
            {/* First Name */}
            <FormField label="Vorname" id="firstName">
              <Input
                id="firstName"
                value={formData.firstName}
                onChangeText={(text: string) => handleChange('firstName', text)}
                placeholder="Vorname"
                autoCapitalize="words"
              />
            </FormField>

            {/* Last Name */}
            <FormField label="Nachname" id="lastName">
              <Input
                id="lastName"
                value={formData.lastName}
                onChangeText={(text: string) => handleChange('lastName', text)}
                placeholder="Nachname"
                autoCapitalize="words"
              />
            </FormField>

            {/* Email */}
            <FormField label="E-Mail" id="email">
              <Input
                id="email"
                keyboardType="email-address"
                value={formData.email}
                onChangeText={(text: string) => handleChange('email', text)}
                placeholder="E-Mail-Adresse"
                autoCapitalize="none"
              />
            </FormField>

            {/* Phone */}
            <FormField label="Telefonnummer" id="phone">
              <Input
                id="phone"
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(text: string) => handleChange('phone', text)}
                placeholder="Telefonnummer"
              />
            </FormField>

            {/* Date of Birth (RN uses a date picker component) */}
            <FormField label="Geburtsdatum" id="dateOfBirth">
              {/* NOTE: In a real app, 'Input' would trigger a native date picker modal/view */}
              <Input
                id="dateOfBirth"
                value={formData.dateOfBirth}
                onChangeText={(text: string) => handleChange('dateOfBirth', text)}
                placeholder="JJJJ-MM-TT"
                editable={false} // Disable direct text input, require picker
                style={styles.dateInput}
              />
            </FormField>

            {/* Gender (RN uses a Picker or custom modal) */}
            <FormField label="Geschlecht" id="gender">
              {/* This replaces the web <select> tag */}
              <Picker
                style={styles.picker}
                selectedValue={formData.gender}
                onValueChange={(value: string) => handleChange('gender', value)}
              >
                {/* Optional placeholder item */}
                <Picker.Item label="Wählen Sie Ihr Geschlecht" value="" />
                {genderOptions.map((opt) => (
                  <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                ))}
              </Picker>
            </FormField>
          </View>
        </Card>

        {/* Info Card */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Datenschutz</Text>
          <Text style={styles.infoDescription}>
            Deine persönlichen Daten werden sicher gespeichert und nicht an
            Dritte weitergegeben. Sie werden nur zur Bereitstellung unserer
            Services verwendet.
          </Text>
        </Card>

        {/* Save Button */}
        <Button
          onPress={handleSave}
          disabled={isSaving}
          style={styles.saveButton}
        >
          {(isSaving || loading) ? (
            <View style={styles.saveButtonLoading}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.saveButtonText}>{loading ? 'Laden...' : 'Wird gespeichert...'}</Text>
            </View>
          ) : (
            <View style={styles.saveButtonContent}>
              <Icon name="check" size={20} color="#fff" style={styles.saveButtonIcon} />
              <Text style={styles.saveButtonText}>Änderungen speichern</Text>
            </View>
          )}
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}


// --- Stylesheet for RN ---
// Cast styles to any to temporarily allow web-only properties like `gap`.
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB', // bg-gray-50
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  // Header (Copied from previous screens for consistency)
  header: {
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  placeholderView: {
    width: 24,
  },

  // Form
  formCard: {
    padding: spacing.md,
  },
  formSpace: {
    // React Native doesn't support `gap` yet; consider using margin spacing between children.
    gap: spacing.md, // space-y-4 (non-standard in RN)
  },
  formField: {
    // React Native doesn't support `gap` yet; consider using margin spacing.
    gap: spacing.xs, // equivalent to Label + Input separation (non-standard in RN)
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateInput: {
    // Styling may differ based on how the date picker is implemented
  },

  // Info Card
  infoCard: {
    padding: spacing.md,
    marginTop: spacing.md,
    backgroundColor: INFO_BG,
    borderColor: INFO_BORDER,
    borderWidth: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E40AF', // text-blue-900
    marginBottom: spacing.xs,
  },
  infoDescription: {
    fontSize: 14,
    color: '#1E40AF', // text-blue-800
  },
  // Add missing picker style used by @react-native-picker/picker
  picker: {
    height: 44,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    backgroundColor: '#fff',
    marginTop: spacing.xs,
  },

  // Save Button
  saveButton: {
    width: '100%',
    marginTop: spacing.lg,
    backgroundColor: PRIMARY_COLOR, // bg-[#8B4513]
    // The Button component should handle the hover/pressed state
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  saveButtonIcon: {
    marginRight: spacing.xs,
  },
}) as any;