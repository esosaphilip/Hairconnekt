import React, { useEffect, useState } from 'react';
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
import Button from '@/components/Button';
import IconButton from '@/components/IconButton';
import Card from '@/components/Card';
// Removed unused Input import
import Icon from '@/components/Icon';
import { COLORS, SPACING, FONT_SIZES } from '@/theme/tokens';
import { paymentsApi, centsToEuros, PLATFORM_FEE_RATE } from '@/api/payments';
import { getProviderAppointments } from '@/api/appointments';

// --- Constants ---
const minimumPayout = 50; // TODO: fetch from backend settings if available
const processingFee = 2.5; // temporary flat processing fee
const defaultIban = 'DE89 3704 0044 0532 0130 00';

// --- Main Component ---
type Nav = { navigate: (routeName: string, params?: Record<string, unknown>) => void; goBack: () => void };

export function PayoutRequestScreen() {
  const navigation = useNavigation<Nav>();
  const [amount, setAmount] = useState('0.00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [payouts, setPayouts] = useState<import('@/api/payments').ProviderPayout[]>([]);
  const [iban] = useState(defaultIban);

  // Load payouts and compute available balance from completed appointments
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [completed, payoutsRes] = await Promise.all([
          // Backend expects lowercase status group values: 'completed' | 'upcoming' | 'cancelled'
          getProviderAppointments('completed'),
          paymentsApi.listProviderPayouts(),
        ]);

        if (!mounted) return;

        const completedNetCents = (completed.items || []).reduce((sum, a) => sum + (a.totalPriceCents || 0), 0) * (1 - PLATFORM_FEE_RATE);
        const reservedOrPaidOutCents = (payoutsRes.items || []).reduce((sum, p) => sum + (p.amountCents || 0), 0);
        const computedAvailable = Math.max(0, centsToEuros(completedNetCents - reservedOrPaidOutCents));
        setAvailableBalance(computedAvailable);
        setAmount(computedAvailable.toFixed(2));
        setPayouts(payoutsRes.items || []);
      } catch (err) {
        console.warn('Failed to load payouts/appointments', err);
      }
    }
    loadData();
    return () => { mounted = false; };
  }, []);

  const parsedAmount = parseFloat(amount) || 0;
  const netAmount = parsedAmount > 0 ? parsedAmount - processingFee : 0;
  
  // Validation flags
  const isAmountValid = parsedAmount >= minimumPayout;
  const isBalanceSufficient = parsedAmount <= availableBalance;
  const canSubmit = isAmountValid && isBalanceSufficient && !isSubmitting;

  const handleSubmit = async () => {
    if (!isAmountValid) {
      Alert.alert('Fehler', `Mindestbetrag für Auszahlung: €${minimumPayout.toFixed(2)}`);
      return;
    }
    if (!isBalanceSufficient) {
      Alert.alert('Fehler', 'Nicht genügend Guthaben verfügbar');
      return;
    }
    setIsSubmitting(true);
    try {
      await paymentsApi.requestPayout({ amount: parsedAmount, currency: 'eur', iban });
      Alert.alert('Erfolg', 'Auszahlung beantragt! Du erhältst eine Bestätigung per E-Mail.');
      const payoutsRes = await paymentsApi.listProviderPayouts();
      setPayouts(payoutsRes.items || []);
      navigation.navigate('TransactionsScreen');
    } catch (err) {
      const anyErr = err as unknown as { response?: { data?: { message?: string } } };
      const message = anyErr?.response?.data?.message || 'Fehler beim Beantragen der Auszahlung';
      Alert.alert('Fehler', String(message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Utility Component for Euro Input ---
  const EuroInput = () => (
    <View style={styles.euroInputContainer}>
      <Icon name="euro" size={20} color={COLORS.textSecondary} style={styles.euroIcon} />
      <TextInput
        style={[
          styles.inputField,
          (!isAmountValid || !isBalanceSufficient) ? styles.inputInvalid : undefined,
        ]}
        keyboardType="decimal-pad"
        placeholder="0.00"
        value={amount}
        onChangeText={(v) => {
            // Allow only numbers and one decimal point
            const cleanValue = v.replace(/[^\d.]/g, '');
            setAmount(cleanValue);
        }}
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
              style={[styles.quickButton, { marginRight: SPACING.xs }]}
            />
            <Button
              title="50%"
              size="sm"
              variant="outline"
              onPress={() => setAmount((availableBalance / 2).toFixed(2))}
              style={[styles.quickButton, { marginRight: SPACING.xs }]}
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
            <View style={[styles.bankTextContainer, { marginLeft: SPACING.sm }] }>
              <Text style={styles.bankTitle}>Bankkonto</Text>
              <Text style={styles.bankSubtitle}>{iban}</Text>
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
          <Text style={[styles.alertDescription, { marginLeft: SPACING.xs }] }>
            Die Auszahlung wird innerhalb von 2-3 Werktagen auf dein hinterlegtes
            Bankkonto überwiesen. Du erhältst eine Bestätigungs-E-Mail.
          </Text>
        </View>

        {/* Payment Method */}
        <Card style={styles.contentCard}>
          <Text style={styles.cardTitle}>Auszahlungsmethode</Text>
          <TouchableOpacity style={styles.radioContainer} activeOpacity={0.8}>
            <View style={styles.radioButtonChecked} />
            <Icon name="credit-card" size={20} color={COLORS.textSecondary} style={{ marginLeft: SPACING.sm }} />
            <View style={[styles.methodTextContainer, { marginLeft: SPACING.sm }] }>
              <Text style={styles.methodTitle}>Banküberweisung</Text>
              <Text style={styles.methodSubtitle}>2-3 Werktage</Text>
            </View>
          </TouchableOpacity>
        </Card>

        {/* Previous Payouts */}
        <Card style={styles.contentCard}>
          <Text style={styles.cardTitle}>Letzte Auszahlungen</Text>
          <View style={styles.payoutList}>
            {payouts
              .slice()
              .sort((a, b) => new Date(b.requestedAt || b.completedAt || '').getTime() - new Date(a.requestedAt || a.completedAt || '').getTime())
              .slice(0, 3)
              .map((payout, index) => {
                const statusUpper = (payout.status || '').toUpperCase();
                const isCompleted = statusUpper === 'COMPLETED';
                const dateStr = payout.requestedAt || payout.completedAt || '';
                return (
                  <View key={payout.id || index} style={[styles.payoutItem, index < 2 && styles.payoutSeparator, index > 0 && { marginTop: SPACING.xs }]}>
                    <View>
                      <Text style={styles.payoutAmount}>€{centsToEuros(payout.amountCents).toFixed(2)}</Text>
                      <Text style={styles.payoutDate}>{dateStr ? new Date(dateStr).toLocaleDateString('de-DE') : ''}</Text>
                    </View>
                    <View style={styles.payoutStatus}>
                      <Icon name={isCompleted ? 'check-circle' : 'clock'} size={16} color={isCompleted ? COLORS.success : COLORS.textSecondary} />
                      <Text style={[styles.payoutStatusText, { marginLeft: SPACING.xs / 2 }]}>{isCompleted ? 'Abgeschlossen' : 'Ausstehend'}</Text>
                    </View>
                  </View>
                );
              })}
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
          Durch Klicken auf &quot;Auszahlung beantragen&quot; bestätigst du, dass die Angaben
          korrekt sind.
        </Text>
      </View>
    </SafeAreaView>
  );
}


// --- React Native Stylesheet ---
const styles = StyleSheet.create({
  alertContainer: {
    alignItems: 'flex-start',
    backgroundColor: COLORS.infoBg || '#EFF6FF',
    borderColor: COLORS.infoBorder || '#DBEAFE',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  alertDescription: {
    color: COLORS.infoTextDark || '#374151',
    flex: 1,
    fontSize: FONT_SIZES.body || 14,
  },
  balanceCard: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
  },
  balanceCardWrapper: {
    borderRadius: 8,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    padding: 0,
  },
  balanceHint: {
    color: COLORS.white,
    fontSize: FONT_SIZES.small || 12,
    marginTop: SPACING.xs,
    opacity: 0.75,
  },
  balanceLabel: {
    color: COLORS.white,
    fontSize: FONT_SIZES.body || 14,
    marginBottom: SPACING.xs,
    opacity: 0.9,
  },
  balanceValue: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: 'bold',
  },
  bankIconCircle: {
    alignItems: 'center',
    backgroundColor: COLORS.infoBg || '#DBEAFE',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  bankInfoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  bankSubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.small || 12,
  },
  bankTextContainer: {
    flex: 1,
  },
  bankTitle: {
    fontSize: FONT_SIZES.body || 14,
    fontWeight: '500',
  },
  breakdownLabel: {
    color: COLORS.textSecondary || '#6B7280',
    fontSize: FONT_SIZES.body || 14,
  },
  breakdownList: {},
  breakdownRow: {
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: SPACING.xs,
  },
  breakdownTotalLabel: {
    color: COLORS.text || '#1F2937',
    fontSize: FONT_SIZES.body || 14,
    fontWeight: '500',
  },
  breakdownTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.xs,
  },
  breakdownTotalValue: {
    color: COLORS.success || '#10B981',
    fontSize: FONT_SIZES.h5 || 16,
    fontWeight: 'bold',
  },
  breakdownValue: {
    fontSize: FONT_SIZES.body || 14,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: FONT_SIZES.h5 || 16,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  contentCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  errorText: {
    color: COLORS.danger || '#EF4444',
    fontSize: FONT_SIZES.small || 12,
    marginTop: SPACING.xs,
  },
  euroIcon: {
    left: SPACING.sm,
    position: 'absolute',
    top: 13,
    zIndex: 1,
  },
  euroInputContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    height: 48,
    paddingLeft: SPACING.lg,
  },
  expenseText: {
    color: COLORS.danger || '#EF4444',
  },
  flexContainer: {
    backgroundColor: COLORS.background || '#F9FAFB',
    flex: 1,
  },
  footerHint: {
    color: COLORS.textSecondary || '#6B7280',
    fontSize: FONT_SIZES.small || 12,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: SPACING.md,
  },
  fullWidthButton: {
    height: 36,
    width: '100%',
  },
  header: {
    backgroundColor: COLORS.white || '#FFFFFF',
    borderBottomColor: COLORS.border || '#E5E7EB',
    borderBottomWidth: 1,
    elevation: 2,
    paddingHorizontal: SPACING.md || 16,
    paddingVertical: SPACING.sm || 8,
    shadowColor: COLORS.black || '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    zIndex: 10,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerTitle: {
    fontSize: FONT_SIZES.h4 || 18,
    fontWeight: 'bold',
    marginLeft: SPACING.sm || 8,
  },
  inputField: {
    color: COLORS.text,
    flex: 1,
    fontSize: FONT_SIZES.h4 || 18,
    height: '100%',
  },
  inputInvalid: {
    borderColor: COLORS.danger,
    borderWidth: 2,
  },
  label: {
    fontSize: FONT_SIZES.body || 14,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  methodSubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.small || 12,
  },
  methodTextContainer: {
    flex: 1,
  },
  methodTitle: {
    fontSize: FONT_SIZES.body || 14,
    fontWeight: '500',
  },
  payoutAmount: {
    fontSize: FONT_SIZES.body || 14,
    fontWeight: '500',
  },
  payoutDate: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.small || 12,
  },
  payoutItem: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: SPACING.sm,
  },
  payoutList: {},
  payoutSeparator: {
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
  },
  payoutStatus: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  payoutStatusText: {
    color: COLORS.success || '#10B981',
    fontSize: FONT_SIZES.body || 14,
  },
  quickButton: {
    flex: 1,
    height: 36,
  },
  radioButtonChecked: {
    borderColor: COLORS.primary,
    borderRadius: 8,
    borderWidth: 4,
    height: 16,
    width: 16,
  },
  radioContainer: {
    alignItems: 'center',
    borderColor: COLORS.primary || '#8B4513',
    borderRadius: 8,
    borderWidth: 2,
    flexDirection: 'row',
    padding: SPACING.sm,
  },
  scrollContent: {
    padding: SPACING.md || 16,
    paddingBottom: SPACING.xl * 4,
  },
  submitButton: {
    backgroundColor: COLORS.primary || '#8B4513',
    height: 48,
    width: '100%',
  },
  submitFooter: {
    backgroundColor: COLORS.white,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    padding: SPACING.md || 16,
    position: 'absolute',
    right: 0,
    zIndex: 20,
  },
});
