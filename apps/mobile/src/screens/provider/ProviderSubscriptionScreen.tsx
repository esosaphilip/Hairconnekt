import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Linking,
} from 'react-native';

// Replaced web imports with assumed custom/community React Native components
import { useNavigation } from '@react-navigation/native';
import Button from '../../components/Button';
import IconButton from '../../components/IconButton';
import Card from '../../components/Card';
import { Badge } from '../../components/badge';
import Icon from '../../components/Icon';
import { COLORS, SPACING, FONT_SIZES } from '../../theme/tokens';
import { providersApi } from '../../services/providers';
import { paymentsApi, centsToEuros, PLATFORM_FEE_RATE } from '../../api/payments';
import type { ProviderPayout } from '../../api/payments';

// --- Static Data ---
type Plan = {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  limitations: string[];
  popular?: boolean;
};

const plans: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 0,
    period: "Kostenlos",
    features: [
      "Bis zu 10 Termine/Monat",
      "Basisprofil",
      "Online-Buchungen",
      "E-Mail-Support",
      "15% Servicegebühr",
    ],
    limitations: [
      "Keine Portfolio-Galerie",
      "Keine Statistiken",
      "Keine Gutschein-Funktion",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 29.99,
    period: "/Monat",
    popular: true,
    features: [
      "Unbegrenzte Termine",
      "Erweitertes Profil",
      "Portfolio-Galerie",
      "Statistiken & Berichte",
      "Gutschein-Funktion",
      "Prioritäts-Support",
      "10% Servicegebühr",
      "Hervorgehobenes Profil",
    ],
    limitations: [],
  },
  {
    id: "premium",
    name: "Premium",
    price: 49.99,
    period: "/Monat",
    features: [
      "Alle Pro-Features",
      "Nur 8% Servicegebühr",
      "Premium-Badge",
      "Top-Platzierung in Suche",
      "Werbe-Tools",
      "24/7 Priority Support",
      "Erweiterte Analysen",
      "Marketing-Unterstützung",
    ],
    limitations: [],
  },
];

const currentPlan = "pro"; // Mock current plan

// --- Helper Functions ---

const handleAlert = (message: string) => {
    Alert.alert("Info", message);
};

// --- Backend wiring state ---


// --- Plan Card Component ---
const PlanCard = ({ plan, isCurrent, onAction }: { plan: Plan; isCurrent: boolean; onAction: (planName: string) => void }) => {
  const actionText = isCurrent ? "Plan kündigen" : (plan.price > 0 ? "Upgrade" : "Downgrade");
  const actionStyle = isCurrent ? styles.cancelButton : styles.primaryButton;
  
  // Custom colors for specific plan icons
  const planIcon = plan.id === "pro" ? "crown" : plan.id === "premium" ? "star" : null;
  const planIconColor = plan.id === "pro" ? COLORS.amber : COLORS.purple;

  // Function to handle cancellation with native confirmation
  const handleCancel = () => {
      Alert.alert(
          "Plan kündigen?",
          "Möchtest du wirklich kündigen? Diese Aktion kann nicht rückgängig gemacht werden.",
          [
              { text: "Abbrechen", style: "cancel" },
              { text: "Kündigen", onPress: () => handleAlert("Kündigungsprozess - Funktion in Entwicklung"), style: "destructive" },
          ]
      );
  };

  return (
    <Card style={[styles.planCard, isCurrent && styles.currentPlanCard]}>
      {plan.popular && (
        <View style={styles.popularBadgeContainer}>
          <Badge title="Beliebteste Wahl" color="red" />
        </View>
      )}
      
      <View style={styles.planHeader}>
        <View>
          <View style={styles.planTitleRow}>
            <Text style={styles.planName}>{plan.name}</Text>
            {isCurrent && (
              <Badge title="Aktiv" color="green" />
            )}
          </View>
          <View style={styles.planPriceRow}>
            <Text style={styles.planPriceValue}>€{plan.price.toFixed(2)}</Text>
            <Text style={styles.planPricePeriod}>{plan.period}</Text>
          </View>
        </View>
        {planIcon && <Icon name={planIcon} size={24} color={planIconColor} />}
      </View>

      <View style={styles.featureList}>
        {plan.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Icon name="check" size={16} color={COLORS.success} style={styles.checkIcon} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
        {plan.limitations.map((limit, index) => (
          <View key={`limit-${index}`} style={styles.featureItem}>
            <Icon name="x" size={16} color={COLORS.danger} style={styles.checkIcon} />
            <Text style={styles.featureText}>{limit}</Text>
          </View>
        ))}
      </View>

      <Button
        title={actionText}
        onPress={isCurrent ? handleCancel : () => onAction(plan.name)}
        style={[styles.fullWidthButton, actionStyle]}
        variant={isCurrent ? "outline" : "default"}
      />
    </Card>
  );
};


// --- Main Component ---
export function ProviderSubscriptionScreen() {
  const navigation = useNavigation();

  // State for backend data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  type ProviderProfile = { id?: string; _id?: string; providerId?: string } & Record<string, unknown>;
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  type Dashboard = { weeklyBookings?: number; weeklyGrossCents?: number };
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  type PayoutItem = { id?: string; completedAt?: string; processedAt?: string; requestedAt?: string; amountCents?: number; status?: string };
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [pRes, dRes, payRes] = await Promise.all([
          providersApi.getMyProfile().catch(() => null),
          providersApi.getDashboard().catch(() => null),
          paymentsApi.listProviderPayouts().catch(() => ({ items: [] })),
        ]);
        if (!mounted) return;
        setProfile((pRes as ProviderProfile) || null);
        setDashboard((dRes as Dashboard) || null);
        const items: ProviderPayout[] = Array.isArray(payRes?.items) ? payRes.items : [];
        const normalizedItems: PayoutItem[] = items.map((it) => ({
          id: it.id,
          completedAt: it.completedAt ?? undefined,
          processedAt: it.processedAt ?? undefined,
          requestedAt: it.requestedAt ?? undefined,
          amountCents: it.amountCents,
          status: it.status,
        }));
        setPayouts(normalizedItems);
      } catch (e) {
        const msg = (e as { message?: string })?.message || 'Fehler beim Laden der Zahlungsdaten';
        setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const serviceFeeRate = PLATFORM_FEE_RATE; // default 10%

  const handleManagePayment = async () => {
    try {
        const providerId = (profile?.id as string | undefined) || (profile?._id as string | undefined) || (profile?.providerId as string | undefined);
      if (!providerId) {
        Alert.alert('Info', 'Provider-ID nicht gefunden. Bitte Profil prüfen.');
        return;
      }
      const w = typeof window !== 'undefined' ? window : null;
      const origin = w && w.location && w.location.origin
        ? w.location.origin
        : 'https://hairconnekt.app';
      const returnUrl = origin + '/stripe/return';
      const refreshUrl = origin + '/stripe/refresh';
      const linkRes = await paymentsApi.createAccountLink(String(providerId), returnUrl, refreshUrl);
      const url = linkRes?.url || linkRes?.accountLinkUrl || linkRes?.link || linkRes;
      if (typeof url === 'string') {
        if (typeof window !== 'undefined' && typeof window.open === 'function') {
          window.open(url, '_blank');
        } else {
          Linking.openURL(url);
        }
      } else {
        Alert.alert('Fehler', 'Stripe-Link konnte nicht erstellt werden.');
      }
    } catch (e) {
      const msg = (e as { message?: string })?.message || 'Unbekannter Fehler beim Öffnen des Zahlungslinks';
      Alert.alert('Fehler', msg);
    }
  };

  return (
    <SafeAreaView style={styles.flexContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <IconButton name="arrow-left" onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Abonnement & Gebühren</Text>
          <View style={styles.placeholder24} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Loading / Error States */}
        {loading && (
          <Card style={styles.loadingCard}>
            <Text>Bitte warten, Daten werden geladen…</Text>
          </Card>
        )}
        {error && (
          <Card style={styles.loadingCard}>
            <Text style={styles.errorText}>Fehler: {error}</Text>
          </Card>
        )}
        {/* Current Plan Status */}
        <Card style={styles.currentPlanCardWrapper}>
          <View style={styles.currentPlanGradient}>
            <View style={styles.currentPlanIconRow}>
              <Icon name="crown" size={20} color={COLORS.white} />
              <Text style={styles.currentPlanStatus}>Aktueller Plan</Text>
            </View>
            <Text style={styles.currentPlanName}>{currentPlan.toUpperCase()}</Text>
            <Text style={styles.currentPlanRenewal}>Verlängert sich am 15. November 2025</Text>
            
            <View style={styles.currentPlanStatsGrid}>
              <View style={styles.planStatItem}>
                <Text style={styles.planStatLabel}>Nächste Zahlung</Text>
                <Text style={styles.planStatValue}>
                  {currentPlan === 'pro' ? '€29.99' : currentPlan === 'premium' ? '€49.99' : '€0.00'}
                </Text>
              </View>
              <View style={styles.planStatItem}>
                <Text style={styles.planStatLabel}>Servicegebühr</Text>
                <Text style={styles.planStatValue}>{Math.round(serviceFeeRate * 100)}%</Text>
              </View>
            </View>

            <Button
              title="Zahlungsmethode verwalten"
              icon="credit-card"
              onPress={handleManagePayment}
              style={styles.managePaymentButton}
              textStyle={styles.managePaymentButtonText}
            />
          </View>
        </Card>

        {/* Weekly Stats from Backend (fallbacks to 0) */}
        <Card style={styles.monthlyStatsCard}>
          <Text style={styles.sectionTitle}>Diese Woche</Text>
          <View style={styles.statList}>
            <View style={styles.statListItem}>
              <Text style={styles.statListItemLabel}>Buchungen</Text>
              <Text style={styles.statListItemValue}>
                {typeof dashboard?.weeklyBookings === 'number' ? dashboard.weeklyBookings : 0} Termine
              </Text>
            </View>
            <View style={styles.statListItem}>
              <Text style={styles.statListItemLabel}>Brutto-Umsatz</Text>
              <Text style={styles.statListItemValue}>
                €{centsToEuros(typeof dashboard?.weeklyGrossCents === 'number' ? dashboard.weeklyGrossCents : 0).toFixed(2)}
              </Text>
            </View>
            <View style={styles.statListItem}>
              <Text style={styles.statListItemLabel}>Servicegebühren ({Math.round(serviceFeeRate * 100)}%)</Text>
              <Text style={[styles.statListItemValue, styles.expenseValueText]}>
                -€{(
                  centsToEuros(typeof dashboard?.weeklyGrossCents === 'number' ? dashboard.weeklyGrossCents : 0) * serviceFeeRate
                ).toFixed(2)}
              </Text>
            </View>
            <View style={styles.statListItem}>
              <Text style={styles.statListItemLabel}>Abonnement</Text>
              <Text style={[styles.statListItemValue, styles.expenseValueText]}>
                -€{currentPlan === 'pro' ? '29.99' : currentPlan === 'premium' ? '49.99' : '0.00'}
              </Text>
            </View>
            <View style={styles.statListItem}>
              <Text style={styles.statListItemTotalLabel}>Deine Einnahmen</Text>
              <Text style={styles.statListItemTotalValue}>
                €{(
                  centsToEuros(typeof dashboard?.weeklyGrossCents === 'number' ? dashboard.weeklyGrossCents : 0) * (1 - serviceFeeRate)
                ).toFixed(2)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Plans */}
        <View style={styles.plansSection}>
          <Text style={styles.sectionTitle}>Verfügbare Pläne</Text>
          <View style={styles.plansList}>
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrent={currentPlan === plan.id}
                onAction={(planName) => handleAlert(`Upgrade auf ${planName} - Funktion in Entwicklung`)}
              />
            ))}
          </View>
        </View>

        {/* Benefits */}
        <Card style={styles.benefitsCard}>
          <Text style={styles.sectionTitle}>Vorteile eines Upgrades</Text>
          <View style={styles.benefitsList}>
            {(
              [
                { icon: 'trending-up', color: COLORS.blue, title: 'Mehr Sichtbarkeit', subtitle: 'Erreiche mehr Kunden durch bessere Platzierung in Suchergebnissen' },
                { icon: 'users', color: COLORS.success, title: 'Mehr Buchungen', subtitle: 'Profis erhalten durchschnittlich 40% mehr Buchungen' },
                { icon: 'zap', color: COLORS.purple, title: 'Bessere Tools', subtitle: 'Nutze erweiterte Funktionen für besseres Business-Management' },
                { icon: 'shield', color: COLORS.amber, title: 'Niedrigere Gebühren', subtitle: 'Spare bei jeder Buchung durch reduzierte Servicegebühren' },
              ]
            ).map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <View style={styles.benefitIconCircle}>
                  <Icon name={benefit.icon} size={20} color={benefit.color} />
                </View>
                <View style={styles.benefitTextContainer}>
                  <Text style={styles.benefitTitle}>{benefit.title}</Text>
                  <Text style={styles.benefitSubtitle}>{benefit.subtitle}</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Payment History (Provider Payouts) */}
        <Card style={styles.paymentHistoryCard}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>Auszahlungen</Text>
            <TouchableOpacity onPress={() => handleAlert('Alle Auszahlungen anzeigen')}>
              <Text style={styles.viewAllText}>Alle anzeigen</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.historyList}>
            {(payouts && payouts.length > 0 ? payouts.slice(0, 3) : []).map((item, index) => {
              const date = item?.completedAt || item?.processedAt || item?.requestedAt;
              const amount = typeof item?.amountCents === 'number' ? centsToEuros(item.amountCents) : 0;
              const status = String(item?.status || '').toUpperCase();
              return (
                <View key={String(item?.id || index)} style={[styles.historyItem, index < 2 && styles.historySeparator]}>
                  <View>
                    <Text style={styles.historyItemTitle}>Auszahlung ({status})</Text>
                    <Text style={styles.historyItemDate}>{date ? new Date(date).toLocaleDateString('de-DE') : '—'}</Text>
                  </View>
                  <Text style={styles.historyItemAmount}>€{amount.toFixed(2)}</Text>
                </View>
              );
            })}
            {(!payouts || payouts.length === 0) && (
              <View style={styles.historyItem}>
                <Text style={styles.historyItemDate}>Keine Auszahlungen gefunden</Text>
              </View>
            )}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}


// --- React Native Stylesheet ---
const styles = StyleSheet.create({
  flexContainer: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  // --- Header Styles ---
  header: {
    backgroundColor: COLORS.white,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    elevation: 2,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    zIndex: 10,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZES.h4,
    fontWeight: 'bold',
  },
  placeholder24: {
    height: 24,
    width: 24,
  },
  // --- Scroll Content & Titles ---
  loadingCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  currentPlanCardWrapper: {
    borderRadius: 8,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    padding: 0,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.h4,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  // --- Current Plan Card (Gradient Background) ---
  currentPlanGradient: {
    backgroundColor: COLORS.primary, // Fallback color
    padding: SPACING.lg,
    // NOTE: Implementing gradient (from-[#8B4513] to-[#5C2E0A]) requires a library like 'react-native-linear-gradient'
  },
  currentPlanIconRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  currentPlanStatus: {
    color: COLORS.white,
    fontSize: FONT_SIZES.body,
    opacity: 0.9,
  },
  currentPlanName: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  currentPlanRenewal: {
    color: COLORS.white,
    fontSize: FONT_SIZES.body,
    marginBottom: SPACING.md,
    opacity: 0.9,
  },
  currentPlanStatsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  planStatItem: {
    backgroundColor: COLORS.white,
    borderRadius: 6,
    flex: 1,
    padding: SPACING.sm,
  },
  planStatLabel: {
    color: COLORS.white,
    fontSize: FONT_SIZES.small,
    marginBottom: SPACING.xs / 2,
    opacity: 0.75,
  },
  planStatValue: {
    color: COLORS.white,
    fontSize: FONT_SIZES.h5,
    fontWeight: 'bold',
  },
  managePaymentButton: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.white,
    height: 40,
  },
  managePaymentButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  // --- Monthly Stats ---
  monthlyStatsCard: {
    marginBottom: SPACING.xl,
    padding: SPACING.md,
  },
  statList: {
    gap: SPACING.sm,
  },
  statListItem: {
    alignItems: 'center',
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: SPACING.xs,
  },
  statListItemLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.body,
  },
  statListItemValue: {
    fontSize: FONT_SIZES.body,
  },
  // Apply danger color to Text elements specifically
  expenseValueText: {
    color: COLORS.danger,
  },
  errorText: {
    color: COLORS.danger,
  },
  statListItemTotalLabel: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
  statListItemTotalValue: {
    color: COLORS.success,
    fontSize: FONT_SIZES.h5,
    fontWeight: 'bold',
  },
  // --- Plans ---
  plansSection: {
    marginBottom: SPACING.xl,
  },
  plansList: {
    gap: SPACING.md, // Spacing between each plan card
  },
  planCard: {
    borderColor: COLORS.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: SPACING.md,
  },
  currentPlanCard: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  popularBadgeContainer: {
    alignSelf: 'center',
    position: 'absolute',
    top: -12,
    zIndex: 1,
  },
  planHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  planTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.xs / 2,
  },
  planName: {
    fontSize: FONT_SIZES.h4,
    fontWeight: 'bold',
  },
  planPriceRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: SPACING.xs / 2,
  },
  planPriceValue: {
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  planPricePeriod: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.body,
  },
  featureList: {
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  featureItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  checkIcon: {
    flexShrink: 0,
    marginTop: 2,
  },
  featureText: {
    fontSize: FONT_SIZES.body,
  },
  fullWidthButton: {
    height: 48,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButton: {
    borderColor: COLORS.border,
  },
  // --- Benefits ---
  benefitsCard: {
    marginBottom: SPACING.xl,
    padding: SPACING.md,
  },
  benefitsList: {
    gap: SPACING.md,
  },
  benefitItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  benefitIconCircle: {
    alignItems: 'center',
    borderRadius: 20,
    flexShrink: 0,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  benefitTextContainer: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: FONT_SIZES.h5,
    fontWeight: '600',
    marginBottom: SPACING.xs / 2,
  },
  benefitSubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.body,
  },
  // --- Payment History ---
  paymentHistoryCard: {
    padding: SPACING.md,
  },
  historyHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  viewAllText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.body,
    fontWeight: '500',
  },
  historyList: {
    gap: SPACING.xs,
  },
  historyItem: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: SPACING.sm,
  },
  historySeparator: {
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
  },
  historyItemTitle: {
    fontSize: FONT_SIZES.body,
    fontWeight: '500',
  },
  historyItemDate: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.small,
  },
  historyItemAmount: {
    color: COLORS.success,
    fontWeight: '500',
  },
});
