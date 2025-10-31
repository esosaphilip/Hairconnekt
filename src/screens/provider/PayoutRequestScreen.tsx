import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert, // Replaces web 'alert'
  TextInput, // Used for the Euro input styling
} from 'react-native';

// Replaced web imports with assumed custom/community React Native components
import { useNavigation } from '@react-navigation/native';
import Button from '../../components/Button';
import IconButton from '../../components/IconButton';
import Card from '../../components/Card';
import Input from '../../components/Input'; // Custom Input for standard fields
import Icon from '../../components/Icon';
import { COLORS, SPACING, FONT_SIZES } from '../../theme/tokens';

// --- Constants ---
const availableBalance = 1245.5;
const minimumPayout = 50;
const processingFee = 2.5;

// --- Main Component ---
export function PayoutRequestScreen() {
  const navigation = useNavigation<any>();
  const [amount, setAmount] = useState(availableBalance.toFixed(2));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parsedAmount = parseFloat(amount) || 0;
  const netAmount = parsedAmount > 0 ? parsedAmount - processingFee : 0;
  
  // Validation flags
  const isAmountValid = parsedAmount >= minimumPayout;
  const isBalanceSufficient = parsedAmount <= availableBalance;
  const canSubmit = isAmountValid && isBalanceSufficient && !isSubmitting;


  const handleSubmit = () => {
    
    if (!isAmountValid) {
      Alert.alert("Fehler", `Mindestbetrag für Auszahlung: €${minimumPayout.toFixed(2)}`);
      return;
    }

    if (!isBalanceSufficient) {
      Alert.alert("Fehler", "Nicht genügend Guthaben verfügbar");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert("Erfolg", "Auszahlung beantragt! Du erhältst eine Bestätigung per E-Mail.");
      navigation.navigate("TransactionsScreen");
    }, 2000);
  };

  // --- Utility Component for Euro Input ---
  const EuroInput = () => (
    <View style={styles.euroInputContainer}>
      <Icon name="euro" size={20} color={COLORS.textSecondary} style={styles.euroIcon} />
      <TextInput
        style={styles.inputField}
        keyboardType="decimal-pad"
        placeholder="0.00"
        value={amount}
        onChangeText={(v) => {
            // Allow only numbers and one decimal point
            const cleanValue = v.replace(/[^\d.]/g, '');
            setAmount(cleanValue);
        }}
        // Using red border if invalid
        {...(!isAmountValid || !isBalanceSufficient) && { style: styles.inputInvalid }}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.flexContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <IconButton name="arrow-left" onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Auszahlung beantragen</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Available Balance (Gradient Card) */}
        <Card style={styles.balanceCardWrapper}>
            {/* Native gradient requires a library; using solid primary color as fallback */}
            <View style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>Verfügbares Guthaben</Text>
                <Text style={styles.balanceValue}>€{availableBalance.toFixed(2)}</Text>
                <Text style={styles.balanceHint}>
                    Mindestbetrag für Auszahlung: €{minimumPayout.toFixed(2)}
                </Text>
            </View>
        </Card>

        {/* Amount Input */}
        <Card style={styles.contentCard}>
          <Text style={styles.cardTitle}>Auszahlungsbetrag</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Betrag</Text>
            <EuroInput />
          </View>

          {/* Quick Select Buttons */}
          <View style={styles.buttonRow}>
            <Button
              title={`Min (€${minimumPayout})`}
              size="sm"
              variant="outline"
              onPress={() => setAmount(minimumPayout.toFixed(2))}
              style={styles.quickButton}
            />
            <Button
              title="50%"
              size="sm"
              variant="outline"
              onPress={() => setAmount((availableBalance / 2).toFixed(2))}
              style={styles.quickButton}
            />
            <Button
              title="Alles"
              size="sm"
              variant="outline"
              onPress={() => setAmount(availableBalance.toFixed(2))}
              style={styles.quickButton}
            />
          </View>
          {(!isAmountValid || !isBalanceSufficient) && (
              <Text style={styles.errorText}>
                  {!isAmountValid ? `Mindestbetrag ist €${minimumPayout}.` : `Guthaben ist nicht ausreichend.`}
              </Text>
          )}
        </Card>

        {/* Breakdown */}
        <Card style={styles.contentCard}>
          <Text style={styles.cardTitle}>Übersicht</Text>
          <View style={styles.breakdownList}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Auszahlungsbetrag</Text>
              <Text style={styles.breakdownValue}>€{parsedAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Bearbeitungsgebühr</Text>
              <Text style={[styles.breakdownValue, styles.expenseText]}>-€{processingFee.toFixed(2)}</Text>
            </View>
            <View style={styles.breakdownTotalRow}>
              <Text style={styles.breakdownTotalLabel}>Du erhältst</Text>
              <Text style={styles.breakdownTotalValue}>
                €{netAmount.toFixed(2)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Bank Account Info */}
        <Card style={styles.contentCard}>
          <View style={styles.bankInfoRow}>
            <View style={styles.bankIconCircle}>
              <Icon name="building-2" size={20} color={COLORS.infoText} />
            </View>
            <View style={styles.bankTextContainer}>
              <Text style={styles.bankTitle}>Bankkonto</Text>
              <Text style={styles.bankSubtitle}>DE89 3704 0044 0532 0130 00</Text>
            </View>
          </View>
          <Button
            title="Bankkonto ändern"
            size="sm"
            variant="outline"
            onPress={() => Alert.alert("Info", "Bankkonto ändern - Funktion in Entwicklung")}
            style={styles.fullWidthButton}
          />
        </Card>

        {/* Info Alert */}
        <View style={styles.alertContainer}>
          <Icon name="alert-circle" size={20} color={COLORS.infoText} />
          <Text style={styles.alertDescription}>
            Die Auszahlung wird innerhalb von 2-3 Werktagen auf dein hinterlegtes
            Bankkonto überwiesen. Du erhältst eine Bestätigungs-E-Mail.
          </Text>
        </View>

        {/* Payment Method */}
        <Card style={styles.contentCard}>
          <Text style={styles.cardTitle}>Auszahlungsmethode</Text>
          <TouchableOpacity style={styles.radioContainer} activeOpacity={0.8}>
            <View style={styles.radioButtonChecked} />
            <Icon name="credit-card" size={20} color={COLORS.textSecondary} />
            <View style={styles.methodTextContainer}>
              <Text style={styles.methodTitle}>Banküberweisung</Text>
              <Text style={styles.methodSubtitle}>2-3 Werktage</Text>
            </View>
          </TouchableOpacity>
        </Card>

        {/* Previous Payouts */}
        <Card style={styles.contentCard}>
          <Text style={styles.cardTitle}>Letzte Auszahlungen</Text>
          <View style={styles.payoutList}>
            {[
              { amount: 950.00, date: '15. September 2025' },
              { amount: 1120.00, date: '15. August 2025' },
              { amount: 890.00, date: '15. Juli 2025' },
            ].map((payout, index) => (
              <View key={index} style={[styles.payoutItem, index < 2 && styles.payoutSeparator]}>
                <View>
                  <Text style={styles.payoutAmount}>€{payout.amount.toFixed(2)}</Text>
                  <Text style={styles.payoutDate}>{payout.date}</Text>
                </View>
                <View style={styles.payoutStatus}>
                  <Icon name="check-circle" size={16} color={COLORS.success} />
                  <Text style={styles.payoutStatusText}>Abgeschlossen</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

      </ScrollView>

      {/* Submit Button (Fixed Footer) */}
      <View style={styles.submitFooter}>
        <Button
          title={isSubmitting ? "Wird bearbeitet..." : "Auszahlung beantragen"}
          onPress={handleSubmit}
          style={styles.submitButton}
          disabled={!canSubmit}
        />
        <Text style={styles.footerHint}>
          Durch Klicken auf "Auszahlung beantragen" bestätigst du, dass die Angaben
          korrekt sind.
        </Text>
      </View>
    </SafeAreaView>
  );
}


// --- React Native Stylesheet ---
const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: COLORS.background || '#F9FAFB',
  },
  // --- Header ---
  header: {
    backgroundColor: COLORS.white || '#FFFFFF',
    paddingHorizontal: SPACING.md || 16,
    paddingVertical: SPACING.sm || 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border || '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm || 8,
  },
  headerTitle: {
    fontSize: FONT_SIZES.h4 || 18,
    fontWeight: 'bold',
  },
  // --- Scroll Content ---
  scrollContent: {
    padding: SPACING.md || 16,
    paddingBottom: SPACING.xl * 4, // Space for the fixed footer
  },
  // --- Balance Card (Gradient Fallback) ---
  balanceCardWrapper: {
    marginBottom: SPACING.md,
    borderRadius: 8,
    overflow: 'hidden',
    padding: 0,
  },
  balanceCard: {
    padding: SPACING.lg,
    backgroundColor: COLORS.primary, // Fallback for gradient
  },
  balanceLabel: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: SPACING.xs,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  balanceHint: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.white,
    opacity: 0.75,
    marginTop: SPACING.xs,
  },
  // --- Standard Content Card ---
  contentCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: FONT_SIZES.h5 || 16,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  formGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.body || 14,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  // --- Euro Input Styling (Custom Native Implementation) ---
  euroInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    paddingLeft: SPACING.lg, // Space for the icon
    height: 48,
  },
  euroIcon: {
    position: 'absolute',
    left: SPACING.sm,
    top: 13,
    zIndex: 1,
  },
  inputField: {
    flex: 1,
    height: '100%',
    fontSize: FONT_SIZES.h4 || 18,
    color: COLORS.text,
  },
  inputInvalid: {
    borderColor: COLORS.danger,
    borderWidth: 2,
  },
  errorText: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.danger || '#EF4444',
    marginTop: SPACING.xs,
  },
  // --- Quick Select Buttons ---
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  quickButton: {
    flex: 1,
    height: 36,
  },
  // --- Breakdown ---
  breakdownList: {
    gap: SPACING.xs,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  breakdownLabel: {
    color: COLORS.textSecondary || '#6B7280',
    fontSize: FONT_SIZES.body || 14,
  },
  breakdownValue: {
    fontSize: FONT_SIZES.body || 14,
    fontWeight: '500',
  },
  expenseText: {
    color: COLORS.danger || '#EF4444',
  },
  breakdownTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.xs,
  },
  breakdownTotalLabel: {
    color: COLORS.text || '#1F2937',
    fontWeight: '500',
    fontSize: FONT_SIZES.body || 14,
  },
  breakdownTotalValue: {
    color: COLORS.success || '#10B981',
    fontSize: FONT_SIZES.h5 || 16,
    fontWeight: 'bold',
  },
  // --- Bank Info ---
  bankInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  bankIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.infoBg || '#DBEAFE', // blue-100
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankTextContainer: {
    flex: 1,
  },
  bankTitle: {
    fontSize: FONT_SIZES.body || 14,
    fontWeight: '500',
  },
  bankSubtitle: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.textSecondary,
  },
  fullWidthButton: {
    width: '100%',
    height: 36,
  },
  // --- Info Alert ---
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
    padding: SPACING.md,
    backgroundColor: COLORS.infoBg || '#EFF6FF',
    borderColor: COLORS.infoBorder || '#DBEAFE',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  alertDescription: {
    flex: 1,
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.infoTextDark || '#374151',
  },
  // --- Payment Method (Radio Button Mock) ---
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.primary || '#8B4513',
    borderRadius: 8,
  },
  radioButtonChecked: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 4,
    borderColor: COLORS.primary,
  },
  methodTextContainer: {
    flex: 1,
  },
  methodTitle: {
    fontSize: FONT_SIZES.body || 14,
    fontWeight: '500',
  },
  methodSubtitle: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.textSecondary,
  },
  // --- Previous Payouts ---
  payoutList: {
    gap: SPACING.xs,
  },
  payoutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.sm,
  },
  payoutSeparator: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  payoutAmount: {
    fontSize: FONT_SIZES.body || 14,
    fontWeight: '500',
  },
  payoutDate: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.textSecondary,
  },
  payoutStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs / 2,
  },
  payoutStatusText: {
    color: COLORS.success || '#10B981',
    fontSize: FONT_SIZES.body || 14,
  },
  // --- Submit Footer (Fixed at Bottom) ---
  submitFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: SPACING.md || 16,
    zIndex: 20,
  },
  submitButton: {
    width: '100%',
    height: 48,
    backgroundColor: COLORS.primary || '#8B4513',
  },
  footerHint: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.textSecondary || '#6B7280',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});