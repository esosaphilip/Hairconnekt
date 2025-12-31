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
import { Ionicons } from '@expo/vector-icons';

// Shared Components
import Text from '../../components/Text';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Picker from '../../components/Picker'; // Use shared Picker
import { colors, spacing, typography } from '../../theme/tokens';
import { usersApi } from '@/services/users';
import { useAuth } from '@/auth/AuthContext';

export function PersonalInfoScreen() {
  const navigation = useNavigation();
  const { user, setUser } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // Gender options mapping
  const genderOptions = [
    { label: 'Männlich', value: 'male' },
    { label: 'Weiblich', value: 'female' },
    { label: 'Divers', value: 'diverse' },
    { label: 'Keine Angabe', value: 'prefer-not-to-say' },
  ];

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

      const genderValue = prefs?.gender
        ? ({ MALE: 'male', FEMALE: 'female', OTHER: 'diverse', PREFER_NOT_TO_SAY: 'prefer-not-to-say' }[String(prefs.gender)] || '')
        : '';

      setFormData({
        firstName: me.firstName || '',
        lastName: me.lastName || '',
        email: me.email || '',
        phone: me.phone || '',
        dateOfBirth: String(prefs?.dateOfBirth || ''),
        gender: genderValue,
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
      // 1. Update basic user info
      await usersApi.updateMe({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });

      // 2. Map gender back to Enum
      const genderEnum = (() => {
        switch (formData.gender) {
          case 'male': return 'MALE';
          case 'female': return 'FEMALE';
          case 'diverse': return 'OTHER';
          case 'prefer-not-to-say': return 'PREFER_NOT_TO_SAY';
          default: return null;
        }
      })();

      // 3. Update preferences
      await usersApi.updatePreferences({
        dateOfBirth: formData.dateOfBirth || null,
        gender: genderEnum,
      });

      // 4. Update Auth Context
      try {
        if (user && typeof user === 'object' && 'id' in user) {
          const nextUser = { ...user, firstName: formData.firstName, lastName: formData.lastName, phone: formData.phone };
          await setUser(nextUser);
        }
      } catch { }

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

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBar}>
          <Pressable onPress={goBack} style={styles.backButton} accessibilityRole="button">
            <Ionicons name="arrow-back" size={24} color={colors.gray800} />
          </Pressable>
          <Text style={styles.screenTitle}>Profil bearbeiten</Text>
          <View style={styles.placeholderView} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}

        {!loading && (
          <>
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Persönliche Daten</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Vorname *</Text>
                <Input
                  value={formData.firstName}
                  onChangeText={(text) => handleChange('firstName', text)}
                  placeholder="Dein Vorname"
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nachname *</Text>
                <Input
                  value={formData.lastName}
                  onChangeText={(text) => handleChange('lastName', text)}
                  placeholder="Dein Nachname"
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>E-Mail Adresse *</Text>
                <Input
                  value={formData.email}
                  onChangeText={(text) => handleChange('email', text)}
                  placeholder="max.mustermann@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={false} // Often email changes require separate flow, keeping uneditable for now as per typical patterns or check if API allows
                  style={{ backgroundColor: colors.gray100, color: colors.gray500 }}
                />
                <Text style={styles.helperText}>E-Mail-Adresse wird zur Anmeldung verwendet</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Telefonnummer</Text>
                <Input
                  value={formData.phone}
                  onChangeText={(text) => handleChange('phone', text)}
                  placeholder="+49 123 4567890"
                  keyboardType="phone-pad"
                />
              </View>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Weitere Informationen</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Geburtsdatum</Text>
                <Input
                  value={formData.dateOfBirth}
                  onChangeText={(text) => handleChange('dateOfBirth', text)}
                  placeholder="YYYY-MM-DD"
                />
                {/* Note: Ideally this should use a DatePicker modal, but sticking to text input for now matching previous implementation unless requested */}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Geschlecht</Text>
                <Picker
                  selectedValue={formData.gender}
                  onValueChange={(val) => handleChange('gender', val)}
                  items={[{ label: 'Bitte wählen', value: '' }, ...genderOptions]}
                  placeholder="Bitte wählen"
                />
              </View>
            </Card>

            {/* Info Card */}
            <Card style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.infoText} style={styles.infoIcon} />
                <Text style={styles.infoText}>
                  Deine Daten werden sicher übertragen und vertraulich behandelt.
                </Text>
              </View>
            </Card>

            {/* Save Button */}
            <Button
              onPress={handleSave}
              disabled={isSaving}
              style={styles.saveButton}
              title={isSaving ? 'Speichert...' : 'Speichern'}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  header: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },
  screenTitle: {
    ...typography.h3,
    color: colors.gray900,
  },
  placeholderView: {
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  sectionCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.h3, // Corrected from h4
    color: colors.gray900,
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray700,
    marginBottom: spacing.xs,
  },
  helperText: {
    fontSize: 12,
    color: colors.gray500,
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: colors.infoBg,
    borderColor: colors.infoBorder,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  infoText: {
    fontSize: 13,
    color: colors.infoText,
    flex: 1,
    lineHeight: 18,
  },
  saveButton: {
    marginBottom: spacing.xl,
  },
});
