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
import Icon from '../../components/Icon';

// Custom Components (assumed to be available)
import Text from '../../components/Text';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import { Picker } from '@react-native-picker/picker'; // Use RN's built-in Picker
import { colors, spacing, shadows } from '../../theme/tokens';
import { usersApi } from '@/services/users';
import { useAuth } from '@/auth/AuthContext';

// --- Brand Color Constant ---

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
    navigation.goBack();
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [me, prefs] = await Promise.all([
        usersApi.getMe(),
        usersApi.getPreferences().catch(() => null),
      ]);
      setFormData({
        firstName: me.firstName || '',
        lastName: me.lastName || '',
        email: me.email || '',
        phone: me.phone || '',
        dateOfBirth: String(prefs?.dateOfBirth || ''),
        gender: prefs?.gender ? ({ MALE: 'male', FEMALE: 'female', OTHER: 'diverse' }[String(prefs.gender)] || '') : '',
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
      const genderEnum = (() => {
        switch (formData.gender) {
          case 'male':
            return 'MALE';
          case 'female':
            return 'FEMALE';
          case 'diverse':
            return 'OTHER';
          case 'prefer-not-to-say':
            return 'PREFER_NOT_TO_SAY';
          default:
            return null;
        }
      })();
      await usersApi.updatePreferences({
        dateOfBirth: formData.dateOfBirth || null,
        gender: genderEnum,
      });

      try {
        // Safely spread into an object to avoid TS/JS errors when user is null/undefined
        if (user && typeof user === 'object' && 'id' in user) {
          const nextUser = { ...user, firstName: formData.firstName, lastName: formData.lastName, phone: formData.phone };
          await setUser(nextUser);
        }
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
  const handleChange = (key: string, value: string) => {
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
  interface FormFieldProps { label: string; children: React.ReactNode }
  const FormField = ({ label, children }: FormFieldProps) => (
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
            <Icon name="arrow-left" size={24} color={colors.gray700} />
          </Pressable>
          <Text style={styles.screenTitle}>Persönliche Informationen</Text>
          <View style={styles.placeholderView} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.formCard}>
          <View style={styles.formSpace}>
            {/* First Name */}
            <FormField label="Vorname">
              <Input
                id="firstName"
                value={formData.firstName}
                onChangeText={(text) => handleChange('firstName', text)}
                placeholder="Vorname"
                autoCapitalize="words"
              />
            </FormField>

            {/* Last Name */}
            <FormField label="Nachname">
              <Input
                id="lastName"
                value={formData.lastName}
                onChangeText={(text) => handleChange('lastName', text)}
                placeholder="Nachname"
                autoCapitalize="words"
              />
            </FormField>

            {/* Email */}
            <FormField label="E-Mail">
              <Input
                id="email"
                keyboardType="email-address"
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
                placeholder="E-Mail-Adresse"
                autoCapitalize="none"
              />
            </FormField>

            {/* Phone */}
            <FormField label="Telefonnummer">
              <Input
                id="phone"
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(text) => handleChange('phone', text)}
                placeholder="Telefonnummer"
              />
            </FormField>

            {/* Date of Birth (RN uses a date picker component) */}
            <FormField label="Geburtsdatum">
              {/* NOTE: In a real app, 'Input' would trigger a native date picker modal/view */}
              <Input
                id="dateOfBirth"
                value={formData.dateOfBirth}
                onChangeText={(text) => handleChange('dateOfBirth', text)}
                placeholder="JJJJ-MM-TT"
                editable={false} // Disable direct text input, require picker
                style={styles.dateInput}
              />
            </FormField>

            {/* Gender (RN uses a Picker or custom modal) */}
            <FormField label="Geschlecht">
              {/* This replaces the web <select> tag */}
              <Picker
                style={styles.picker}
                selectedValue={formData.gender}
                onValueChange={(value) => handleChange('gender', value)}
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
              <ActivityIndicator size="small" color={colors.white} />
              <Text style={styles.saveButtonText}>{loading ? 'Laden...' : 'Wird gespeichert...'}</Text>
            </View>
          ) : (
            <View style={styles.saveButtonContent}>
              <Icon name="check" size={20} color={colors.white} style={styles.saveButtonIcon} />
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
  backButton: {
    marginLeft: -spacing.xs,
    padding: spacing.xs,
  },
  dateInput: {
  },
  formCard: {
    padding: spacing.md,
  },
  formField: {
    marginBottom: spacing.md,
  },
  formSpace: {
  },
  header: {
    backgroundColor: colors.white,
    ...Platform.select({
      ios: {
        ...shadows.sm,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  infoCard: {
    backgroundColor: colors.infoBg,
    borderColor: colors.infoBorder,
    borderWidth: 1,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  infoDescription: {
    color: colors.infoText,
    fontSize: 14,
  },
  infoTitle: {
    color: colors.infoText,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  picker: {
    backgroundColor: colors.white,
    borderColor: colors.gray300,
    borderRadius: 6,
    borderWidth: 1,
    height: 44,
    marginTop: spacing.xs,
  },
  placeholderView: {
    width: 24,
  },
  safeArea: {
    backgroundColor: colors.gray50,
    flex: 1,
  },
  saveButton: {
    backgroundColor: colors.primary,
    marginTop: spacing.lg,
    width: '100%',
  },
  saveButtonContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  saveButtonIcon: {
    marginRight: spacing.xs,
  },
  saveButtonLoading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  screenTitle: {
    color: colors.gray800,
    fontSize: 20,
    fontWeight: '700',
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  scrollView: {
    flex: 1,
  },
});
