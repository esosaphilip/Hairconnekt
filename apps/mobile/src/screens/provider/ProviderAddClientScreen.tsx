import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Input from '@/components/Input';
import { Textarea } from '@/components/textarea';
import { colors, spacing, radii, typography } from '@/theme/tokens';
import { http } from '@/api/http';
import { useNavigation } from '@react-navigation/native';
import { providerClientsApi } from '@/api/providerClients';

export function ProviderAddClientScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    notes: '',
  });
  const [error, setError] = useState<string | null>(null);

  const onBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };

  const handleSubmit = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Bitte Vor- und Nachnamen eingeben.');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Bitte eine Telefonnummer eingeben.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Assuming a generic endpoint or leveraging the user creation logic
      // Since specific "Add Client" endpoint might not exist, we often use the user creation or a specific provider-client-link endpoint.
      // Based on previous context, we might rely on "create appointment" to create a client, or we check if a "create client" endpoint exists.
      // If not, we'll assume a standard POST /providers/me/clients for now. If it fails, I'll catch it.

      await providerClientsApi.create({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email || undefined,
        notes: formData.notes || undefined,
      });

      if (navigation.canGoBack()) navigation.goBack();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Fehler beim Erstellen des Kunden.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable onPress={onBack} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.black} />
          </Pressable>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, typography.h3]}>Neuer Kunde</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Persönliche Daten</Text>

          <View style={styles.mtSm}>
            <Text style={styles.label}>Vorname *</Text>
            <Input
              value={formData.firstName}
              onChangeText={(t) => setFormData(prev => ({ ...prev, firstName: t }))}
              placeholder="z.B. Maria"
              style={styles.inputMarginTop}
            />
          </View>

          <View style={styles.mtSm}>
            <Text style={styles.label}>Nachname *</Text>
            <Input
              value={formData.lastName}
              onChangeText={(t) => setFormData(prev => ({ ...prev, lastName: t }))}
              placeholder="z.B. Musterfrau"
              style={styles.inputMarginTop}
            />
          </View>

          <View style={styles.mtSm}>
            <Text style={styles.label}>Telefon *</Text>
            <Input
              value={formData.phone}
              onChangeText={(t) => setFormData(prev => ({ ...prev, phone: t }))}
              placeholder="+49 123 4567890"
              keyboardType="phone-pad"
              style={styles.inputMarginTop}
            />
          </View>

          <View style={styles.mtSm}>
            <Text style={styles.label}>E-Mail (Optional)</Text>
            <Input
              value={formData.email}
              onChangeText={(t) => setFormData(prev => ({ ...prev, email: t }))}
              placeholder="maria@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.inputMarginTop}
            />
          </View>
        </Card>

        <Card style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Notizen</Text>
          <View style={styles.mtSm}>
            <Textarea
              value={formData.notes}
              onChangeText={(t) => setFormData(prev => ({ ...prev, notes: t }))}
              placeholder="Allergien, Vorlieben, etc."
              style={styles.textarea}
            />
          </View>
        </Card>

        {error && <Text style={styles.feedbackError}>{error}</Text>}

        <View style={styles.actionsRow}>
          <Button title="Abbrechen" variant="ghost" onPress={onBack} style={styles.flex1} />
          <View style={styles.spacerSm} />
          <Button title="Kunden anlegen" onPress={handleSubmit} style={styles.submitBtn} disabled={loading} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.gray50,
    flex: 1,
  },
  header: {
    backgroundColor: colors.white,
    borderBottomColor: colors.gray200,
    borderBottomWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.black,
  },
  iconBtn: {
    paddingRight: spacing.sm,
    paddingVertical: spacing.xs,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  cardSection: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.black,
    fontSize: 16,
    fontWeight: '600',
  },
  mtSm: {
    marginTop: spacing.sm,
  },
  label: {
    color: colors.gray700,
    fontSize: 14,
    fontWeight: '500',
  },
  inputMarginTop: {
    marginTop: 6,
  },
  textarea: {
    marginTop: 6,
    minHeight: 100,
  },
  feedbackError: {
    color: colors.error,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  flex1: {
    flex: 1,
  },
  spacerSm: {
    width: spacing.sm,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    flex: 1,
  },
});
