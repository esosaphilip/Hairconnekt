import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Lock, CreditCard, Calendar } from 'lucide-react-native';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Input from '@/components/Input';
import { colors, spacing, radii } from '@/theme/tokens';
import type { ClientProfileStackScreenProps } from '@/navigation/types';

// --- Helper Functions (Adapted for RN TextInput) ---

const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\s/g, '');
  const chunks = cleaned.match(/.{1,4}/g);
  return chunks ? chunks.join(' ') : cleaned;
};

const formatExpiryDate = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length >= 2) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
  }
  return cleaned;
};

const detectCardType = (number: string): 'visa' | 'mastercard' | 'amex' | 'unknown' => {
  const cleaned = number.replace(/\s/g, '');
  if (/^4/.test(cleaned)) return 'visa';
  if (/^5[1-5]/.test(cleaned)) return 'mastercard';
  if (/^3[47]/.test(cleaned)) return 'amex';
  return 'unknown';
};

// Simple hook to show a mobile alert/toast-like message
const showToast = (message: string, isError = false) => {
  Alert.alert(isError ? 'Fehler' : 'Erfolg', message);
};

// --- Screen Component ---

type CardType = 'visa' | 'mastercard' | 'amex' | 'unknown';
interface FormData {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string; // MM/YY
  cvv: string;
  saveCard: boolean;
  setAsDefault: boolean;
}
type Errors = Partial<Record<keyof FormData, string>>;

type AddPaymentNav = ClientProfileStackScreenProps<'AddPaymentMethod'>['navigation'];

export default function AddPaymentMethodScreen() {
  const navigation = useNavigation<AddPaymentNav>();
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
    saveCard: true,
    setAsDefault: false,
  });

  const [errors, setErrors] = useState<Errors>({});

  const setFormDataValue = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (prev[key]) {
        return { ...prev, [key]: '' } as Errors;
      }
      return prev;
    });
  };

  // The web validation logic remains mostly the same
  const validateForm = useCallback(() => {
    const newErrors: Errors = {};

    // Card number validation
    const cleanedCardNumber = formData.cardNumber.replace(/\s/g, '');
    if (!cleanedCardNumber) {
      newErrors.cardNumber = 'Kartennummer ist erforderlich';
    } else if (cleanedCardNumber.length < 13 || cleanedCardNumber.length > 19) {
      newErrors.cardNumber = 'Ungültige Kartennummer';
    } else if (!/^\d+$/.test(cleanedCardNumber)) {
      newErrors.cardNumber = 'Nur Zahlen erlaubt';
    }

    // Cardholder name validation
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Karteninhaber ist erforderlich';
    } else if (formData.cardholderName.trim().length < 3) {
      newErrors.cardholderName = 'Name zu kurz';
    }

    // Expiry date validation
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Ablaufdatum ist erforderlich';
    } else {
      const [month, year] = formData.expiryDate.split('/');
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt('20' + year, 10);
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      if (!month || !year || month.length !== 2 || year.length !== 2) {
        newErrors.expiryDate = 'Format: MM/JJ';
      } else if (monthNum < 1 || monthNum > 12) {
        newErrors.expiryDate = 'Ungültiger Monat';
      } else if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
        newErrors.expiryDate = 'Karte ist abgelaufen';
      }
    }

    // CVV validation
    if (!formData.cvv) {
      newErrors.cvv = 'CVV ist erforderlich';
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = '3-4 Ziffern erforderlich';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async () => {
    if (!validateForm()) {
      showToast('Bitte überprüfen Sie Ihre Eingaben', true);
      return;
    }

    setLoading(true);

    try {
      // Simulate API call to add payment method
      await new Promise((resolve) => setTimeout(resolve, 1500));

      showToast('Zahlungsmethode erfolgreich hinzugefügt');
      navigation.navigate('PaymentMethods'); // Assuming a 'PaymentMethods' screen exists
    } catch (error) {
      showToast('Fehler beim Hinzufügen der Zahlungsmethode', true);
    } finally {
      setLoading(false);
    }
  };

  const handleCardNumberChange = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    if (cleaned.length <= 19 && /^\d*$/.test(cleaned)) {
      setFormDataValue('cardNumber', formatCardNumber(cleaned));
    }
  };

  const handleExpiryChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 4) {
      setFormDataValue('expiryDate', formatExpiryDate(cleaned));
    }
  };

  const handleCvvChange = (value: string) => {
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setFormDataValue('cvv', value);
    }
  };

  const cardType: CardType = detectCardType(formData.cardNumber);

  return (
    <View style={styles.container}>
      {/* Header - typically handled by React Navigation, but defined here for context */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.gray700} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Zahlungsmethode hinzufügen</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Security Notice */}
          <Card style={styles.securityCard}>
            <View style={styles.flexRow}>
              <Lock size={20} color={colors.blue600} style={styles.securityIcon} />
              <View style={styles.flex1}>
                <Text style={styles.securityText}>
                  Ihre Zahlungsinformationen werden **sicher verschlüsselt** übertragen und gespeichert.
                </Text>
              </View>
            </View>
          </Card>

          {/* Card Preview */}
          <Card style={styles.cardPreview}>
            <View style={styles.cardBackgroundOverlay} />
            
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <View style={styles.cardChip} />
                {cardType === 'visa' && (
                  <Text style={styles.cardTypeLabel}>VISA</Text>
                )}
                {cardType === 'mastercard' && (
                  <View style={styles.mastercardLogos}>
                    <View style={styles.mastercardCircleRed} />
                    <View style={styles.mastercardCircleYellow} />
                  </View>
                )}
              </View>

              <View style={styles.cardNumberContainer}>
                <Text style={styles.cardNumberText}>
                  {formData.cardNumber || '•••• •••• •••• ••••'}
                </Text>
              </View>

              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.cardLabel}>Karteninhaber</Text>
                  <Text style={styles.cardValue}>
                    {formData.cardholderName || 'IHR NAME'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.cardLabel}>Gültig bis</Text>
                  <Text style={styles.cardValue}>
                    {formData.expiryDate || 'MM/JJ'}
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Card Number */}
            <Input
              label="Kartennummer *"
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChangeText={handleCardNumberChange}
              keyboardType="number-pad"
              maxLength={23}
              icon={<CreditCard size={20} color={colors.gray400} />}
              error={errors.cardNumber}
            />

            {/* Cardholder Name */}
              <Input
                label="Karteninhaber *"
                placeholder="MAX MUSTERMANN"
                value={formData.cardholderName}
                onChangeText={(text: string) => setFormDataValue('cardholderName', text.toUpperCase())}
                autoCapitalize="characters"
                error={errors.cardholderName}
              />

            {/* Expiry and CVV */}
            <View style={styles.splitInputs}>
              {/* Expiry Date */}
              <View style={styles.inputContainer}>
                <Input
                label="Ablaufdatum *"
                placeholder="MM/JJ"
                value={formData.expiryDate}
                onChangeText={handleExpiryChange}
                keyboardType="number-pad"
                maxLength={5}
                icon={<Calendar size={18} color={colors.gray400} />}
                error={errors.expiryDate}
              />
              </View>

              {/* CVV */}
              <View style={styles.inputContainer}>
                <Input
                label="CVV *"
                placeholder="•••"
                value={formData.cvv}
                onChangeText={handleCvvChange}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={4}
                icon={<Lock size={18} color={colors.gray400} />}
                error={errors.cvv}
              />
              </View>
            </View>

            {/* Options */}
            <Card style={styles.optionsCard}>
              {/* Save Card Switch */}
              <View style={styles.switchRow}>
                <View style={styles.switchTextContainer}>
                  <Text style={styles.switchLabel}>Karte speichern</Text>
                  <Text style={styles.switchDescription}>
                    Für zukünftige Buchungen
                  </Text>
                </View>
                  <Switch
                    value={formData.saveCard}
                    onValueChange={(value) =>
                      setFormDataValue('saveCard', value)
                    }
                    trackColor={{ false: colors.gray500, true: colors.primary }}
                    thumbColor={formData.saveCard ? colors.white : colors.gray100}
                  />
              </View>

              {/* Set As Default Switch */}
              {formData.saveCard && (
                <View style={styles.switchRowDefault}>
                  <View style={styles.switchTextContainer}>
                    <Text style={styles.switchLabel}>Als Standard festlegen</Text>
                    <Text style={styles.switchDescription}>
                      Standardmäßig für Zahlungen verwenden
                    </Text>
                  </View>
                  <Switch
                    value={formData.setAsDefault}
                    onValueChange={(value) =>
                      setFormDataValue('setAsDefault', value)
                    }
                    trackColor={{ false: colors.gray500, true: colors.primary }}
                    thumbColor={formData.setAsDefault ? colors.white : colors.gray100}
                  />
                </View>
              )}
            </Card>

            {/* Submit Button */}
            <Button
              title="Zahlungsmethode hinzufügen"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
              textStyle={styles.submitButtonText}
            />

            {/* Security Note */}
            <Text style={styles.securityNote}>
              Durch das Hinzufügen stimmen Sie den{' '}
              <Text
                style={styles.termsLink}
                onPress={() => navigation.navigate('Terms')}
              >
                Zahlungsbedingungen
              </Text>{' '}
              zu
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// --- StyleSheet API for Styling ---

const styles = StyleSheet.create({
  backButton: {
    marginRight: spacing.md,
    padding: spacing.sm,
  },
  cardBackgroundOverlay: {
    backgroundColor: colors.white,
    borderRadius: 50,
    height: 100,
    opacity: 0.05,
    position: 'absolute',
    right: -40,
    top: -40,
    width: 100,
  },
  cardChip: {
    backgroundColor: colors.amber600,
    borderRadius: 4,
    height: 40,
    opacity: 0.3,
    width: 48,
  },
  cardContent: {
    position: 'relative',
    zIndex: 1,
  },
  cardFooter: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  cardLabel: {
    color: colors.gray400,
    fontSize: 12,
    marginBottom: 4,
  },
  cardNumberContainer: {
    marginBottom: spacing.lg,
  },
  cardNumberText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 2,
  },
  cardPreview: {
    backgroundColor: colors.gray700,
    borderRadius: radii.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    padding: spacing.lg,
  },
  cardTypeLabel: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1,
  },
  cardValue: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  container: {
    backgroundColor: colors.gray50,
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  flexRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  formContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderBottomColor: colors.gray200,
    borderBottomWidth: 1,
    flexDirection: 'row',
    padding: spacing.md,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
  },
  headerTitle: {
    color: colors.gray800,
    fontSize: 20,
    fontWeight: '600',
  },
  inputContainer: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  mastercardCircleRed: {
    backgroundColor: colors.red,
    borderRadius: 16,
    height: 32,
    opacity: 0.8,
    width: 32,
  },
  mastercardCircleYellow: {
    backgroundColor: colors.amber,
    borderRadius: 16,
    height: 32,
    marginLeft: -16,
    opacity: 0.8,
    width: 32,
  },
  mastercardLogos: {
    flexDirection: 'row',
  },
  optionsCard: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  scrollContent: {
    padding: spacing.md,
  },
  securityCard: {
    backgroundColor: colors.infoBg,
    borderColor: colors.infoBorder,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  securityIcon: {
    marginRight: spacing.sm,
    marginTop: spacing.xs,
  },
  securityNote: {
    color: colors.gray600,
    fontSize: 12,
    paddingBottom: spacing.md,
    textAlign: 'center',
  },
  securityText: {
    color: colors.blue900,
    fontSize: 14,
  },
  splitInputs: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    height: 48,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  switchDescription: {
    color: colors.gray600,
    fontSize: 12,
  },
  switchLabel: {
    color: colors.gray800,
    fontSize: 16,
    fontWeight: '500',
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  switchRowDefault: {
    alignItems: 'center',
    borderTopColor: colors.gray200,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    paddingVertical: 4,
  },
  switchTextContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  termsLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});