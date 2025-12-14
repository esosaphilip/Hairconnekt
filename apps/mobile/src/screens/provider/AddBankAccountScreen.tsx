import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
  SafeAreaView,
} from 'react-native';

// Reusable components (assumed, based on previous refactoring)
import Text from '../../components/Text';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import { Checkbox } from '../../components/checkbox';
import Icon from '../../components/Icon';
import { providerBankingApi } from '@/api/providerBanking';
// Removed web Alert component usage in favor of inline info boxes

// Mock React Navigation hook
const useNavigation = () => ({
  goBack: () => console.log('Navigating back...'),
  navigate: (screen: string, params?: Record<string, unknown>) => console.log(`Navigating to ${screen} with params: ${JSON.stringify(params)}`),
});
const useRoute = (): { params: { id: string | null } } => ({
  params: {
    id: null,
  },
});

// Mock for displaying notifications in React Native
const toast = {
  success: (message: string) => console.log(`TOAST SUCCESS: ${message}`),
  error: (message: string) => console.log(`TOAST ERROR: ${message}`),
};

// --- Config Helpers ---
const IconNames = {
  ArrowLeft: 'chevron-left',
  Building2: 'home-office',
  CreditCard: 'credit-card',
  User: 'user',
  CheckCircle: 'check-circle',
};

const colors = {
  primary: '#8B4513',
  green: '#22C55E',
  blue: '#3B82F6',
  amber: '#F59E0B',
  lightBlue: '#F5F7FF',
  lightAmber: '#FFFBEA',
  gray: '#4B5563',
  background: '#FAF9F6',
};

export function AddBankAccountScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;
  const isEditing = !!id;

  // Initial state based on whether we are editing or adding
  const initialState: { accountHolder: string; bankName: string; iban: string; bic: string } = {
    accountHolder: isEditing ? "Maria Schmidt" : "",
    bankName: isEditing ? "Sparkasse Berlin" : "",
    iban: isEditing ? "DE89 3704 0044 0532 0130 00" : "",
    bic: isEditing ? "COBADEFFXXX" : "",
  };

  const [formData, setFormData] = useState<typeof initialState>(initialState);
  const [isDefault, setIsDefault] = useState<boolean>(isEditing ? true : false);
  const [acceptTerms, setAcceptTerms] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // --- IBAN Formatting & Validation Logic ---

  const formatIBAN = (value: string) => {
    // Remove all whitespace and convert to uppercase
    const cleaned = value.replace(/\s/g, "").toUpperCase();
    // Insert a space every 4 characters (RN handles this display automatically)
    return cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
  };

  const validateIBAN = (iban: string) => {
    const cleaned = iban.replace(/\s/g, "");
    // Basic validation: German IBAN starts with DE and has 22 characters
    return cleaned.startsWith("DE") && cleaned.length === 22;
  };

  const validateBIC = (bic: string) => {
    // BIC is typically 8 or 11 characters
    return bic.length === 8 || bic.length === 11;
  };
  
  // Handlers adapted for React Native `onChangeText`
  const handleIBANChange = (value: string) => {
    const formatted = formatIBAN(value);
    setFormData((prev) => ({
      ...prev,
      iban: formatted,
    }));
  };

  const handleBICChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      bic: value.toUpperCase(),
    }));
  };

  const handleSubmit = async () => {
    // Local validation
    if (!formData.accountHolder.trim()) {
      toast.error("Bitte gib den Kontoinhaber an");
      return;
    }

    if (!formData.bankName.trim()) {
      toast.error("Bitte gib den Banknamen an");
      return;
    }

    if (!validateIBAN(formData.iban)) {
      toast.error("Bitte gib eine gültige deutsche IBAN ein");
      return;
    }

    if (!validateBIC(formData.bic)) {
      toast.error("Bitte gib einen gültigen BIC/SWIFT-Code ein");
      return;
    }

    if (!acceptTerms) {
      toast.error("Bitte bestätige die Richtigkeit der Angaben");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && id) {
        await providerBankingApi.updateBankAccount(String(id), { accountHolder: formData.accountHolder.trim() });
        toast.success("Bankkonto aktualisiert!");
      } else {
        await providerBankingApi.addBankAccount({ accountHolder: formData.accountHolder.trim(), iban: formData.iban.trim(), bic: formData.bic.trim() || undefined, bankName: formData.bankName.trim() || undefined });
        toast.success("Bankkonto hinzugefügt! Die Verifizierung kann 1-2 Werktage dauern.");
      }
      navigation.navigate("ProviderBankAccounts");
    } catch (e) {
      toast.error("Speichern fehlgeschlagen");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Button
            variant="ghost"
            size="icon"
            onPress={() => navigation.goBack()}
          >
            <Icon name={IconNames.ArrowLeft} size={24} color="#000" />
          </Button>
          <Text variant="h2" style={styles.headerTitle}>
            {isEditing ? "Bankkonto bearbeiten" : "Bankkonto hinzufügen"}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Info Box */}
        <View style={[styles.infoBox, { backgroundColor: colors.lightBlue, borderColor: '#BFDBFE' }]}
        >
          <View style={styles.infoBoxIcon}><Icon name={IconNames.Building2} size={18} color={colors.blue} /></View>
          <Text style={styles.alertText}>Alle Angaben werden verschlüsselt gespeichert und nur für Auszahlungen verwendet.</Text>
        </View>

        {/* Account Holder */}
        <Card style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Kontoinhaber <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Icon name={IconNames.User} size={20} color="#9CA3AF" style={styles.inputIcon} />
              <Input
                value={formData.accountHolder}
                onChangeText={(value: string) => setFormData(prev => ({ ...prev, accountHolder: value }))}
                placeholder="Max Mustermann"
                style={styles.inputField}
                autoCapitalize="words"
                required
              />
            </View>
            <Text style={styles.inputHint}>
              Muss mit deinem registrierten Namen übereinstimmen
            </Text>
          </View>
        </Card>

        {/* Bank Details */}
        <Card style={styles.card}>
          <Text variant="h3" style={styles.cardTitle}>Bankdaten</Text>
          <View style={styles.separator} />

          {/* Bank Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Bank <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Icon name={IconNames.Building2} size={20} color="#9CA3AF" style={styles.inputIcon} />
              <Input
                value={formData.bankName}
                onChangeText={(value: string) => setFormData(prev => ({ ...prev, bankName: value }))}
                placeholder="z.B. Sparkasse, Deutsche Bank"
                style={styles.inputField}
                required
              />
            </View>
          </View>

          {/* IBAN */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              IBAN <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Icon name={IconNames.CreditCard} size={20} color="#9CA3AF" style={styles.inputIcon} />
              <Input
                value={formData.iban}
                onChangeText={handleIBANChange}
                placeholder="DE89 3704 0044 0532 0130 00"
                style={[styles.inputField, styles.monoFont]}
                maxLength={27} // 22 chars + 5 spaces
                keyboardType="default" // Allow text and numbers
                required
              />
            </View>
            <Text style={styles.inputHint}>
              Nur deutsche IBANs werden akzeptiert (beginnt mit DE)
            </Text>
          </View>

          {/* BIC */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              BIC/SWIFT <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Icon name={IconNames.CreditCard} size={20} color="#9CA3AF" style={styles.inputIcon} />
              <Input
                value={formData.bic}
                onChangeText={handleBICChange}
                placeholder="z.B. COBADEFFXXX"
                style={[styles.inputField, styles.monoFont]}
                maxLength={11}
                autoCapitalize="characters"
                required
              />
            </View>
            <Text style={styles.inputHint}>
              8 oder 11 Zeichen
            </Text>
          </View>
        </Card>

        {/* Default Account Option */}
        <Card style={styles.card}>
          <View style={styles.checkboxRow}>
            <Checkbox
              checked={isDefault}
              onCheckedChange={(next: boolean) => setIsDefault(next)}
              style={styles.checkboxShrink}
            />
            <View style={styles.checkboxTextContainer}>
              <Text style={styles.checkboxLabel}>
                Als Standardkonto festlegen
              </Text>
              <Text style={styles.checkboxHint}>
                Auszahlungen werden standardmäßig auf dieses Konto überwiesen
              </Text>
            </View>
          </View>
        </Card>

        {/* Verification Info */}
        <View style={[styles.infoBox, styles.infoAlert, { backgroundColor: colors.lightAmber, borderColor: '#FDE68A' }]}
        >
          <View style={styles.infoBoxIcon}><Icon name={'search'} size={18} color={colors.amber} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>🔍 Verifizierungsprozess</Text>
            <View style={styles.infoList}>
              <Text style={styles.infoListItem}>• Dein Bankkonto wird innerhalb von 1-2 Werktagen verifiziert</Text>
              <Text style={styles.infoListItem}>• Du erhältst eine Bestätigung per E-Mail</Text>
              <Text style={styles.infoListItem}>• Nach Verifizierung kannst du Auszahlungen anfordern</Text>
              <Text style={styles.infoListItem}>• Stelle sicher, dass alle Angaben korrekt sind</Text>
            </View>
          </View>
        </View>

        {/* Terms Checkbox */}
        <Card style={styles.card}>
          <View style={styles.checkboxRow}>
            <Checkbox
              checked={acceptTerms}
              onCheckedChange={(next: boolean) => setAcceptTerms(next)}
              style={styles.checkboxShrink}
            />
            <View style={styles.checkboxTextContainer}>
              <Text style={styles.checkboxLabel}>
                Ich bestätige, dass alle Angaben korrekt sind und das Bankkonto auf
                meinen Namen läuft. <Text style={styles.required}>*</Text>
              </Text>
            </View>
          </View>
        </Card>

        {/* Submit Button */}
        <Button
          onPress={handleSubmit}
          style={styles.submitButton}
          disabled={isSubmitting || !acceptTerms}
          loading={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name={IconNames.CheckCircle} size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.submitButtonText}>
                {isEditing ? "Änderungen speichern" : "Bankkonto hinzufügen"}
              </Text>
            </>
          )}
        </Button>

        {/* Privacy Policy Link */}
        <View style={styles.privacyTextContainer}>
          <Text style={styles.privacyText}>
            Deine Daten werden gemäß unserer{" "}
            <Text
              style={styles.privacyLink}
              onPress={() => navigation.navigate("PrivacyPolicy")}
            >
              Datenschutzerklärung
            </Text>{" "}
            verarbeitet.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Stylesheet for React Native ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background, // Assuming background is defined elsewhere
  },
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  // Header styles
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 12,
  },
  // ScrollView content
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    // Use margins on child cards instead of unsupported gap
  },
  // Card styles
  card: {
    padding: 16,
    // Use margins between child elements instead of unsupported gap
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  // Input field styles
  inputGroup: {
    // Spacing handled by individual elements' marginTop
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  required: {
    color: '#EF4444', // red-500
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    marginTop: 6,
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  inputField: {
    paddingLeft: 40, // Space for the icon
    width: '100%',
  },
  inputHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
  },
  monoFont: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  // Checkbox styles
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    // Use marginLeft on the text container instead of unsupported gap
  },
  checkboxShrink: {
    flexShrink: 0,
    marginTop: 2, // Align checkbox with the top of the text
  },
  checkboxTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  checkboxHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  // Alerts / Info Cards
  alertText: {
    fontSize: 14,
    color: colors.gray,
  },
  infoAlert: {
    borderWidth: 1,
    padding: 16,
    // Use margins on child elements instead of unsupported gap
    marginTop: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  infoBox: {
    alignItems: 'flex-start',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    padding: 12,
  },
  infoBoxIcon: {
    marginRight: 8,
    paddingTop: 2,
  },
  infoList: {
    // Use margins on list items instead of unsupported gap
  },
  infoListItem: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 6,
  },
  // Submit Button
  submitButton: {
    width: '100%',
    height: 48,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Privacy Policy Text
  privacyTextContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  privacyText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  privacyLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  }
});
