import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';

// Replaced web imports with assumed custom/community React Native components
import { useNavigation } from '@react-navigation/native';
import Button from '../../components/Button';
import IconButton from '../../components/IconButton';
import Card from '../../components/Card';
import { Badge } from '../../components/badge';
import Icon from '../../components/Icon';
import { COLORS, SPACING, FONT_SIZES } from '../../theme/tokens';

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

// --- Plan Card Component ---
type PlanCardProps = {
  plan: Plan;
  isCurrent: boolean;
  onAction: (planName: string) => void;
};

const PlanCard: React.FC<PlanCardProps> = ({ plan, isCurrent, onAction }) => {
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
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.flexContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <IconButton name="arrow-left" onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Abonnement & Gebühren</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
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
                <Text style={styles.planStatValue}>€29.99</Text>
              </View>
              <View style={styles.planStatItem}>
                <Text style={styles.planStatLabel}>Servicegebühr</Text>
                <Text style={styles.planStatValue}>10%</Text>
              </View>
            </View>

            <Button
              title="Zahlungsmethode verwalten"
              icon="credit-card"
              onPress={() => handleAlert("Zahlungsmethode verwalten")}
              style={styles.managePaymentButton}
              textStyle={styles.managePaymentButtonText}
            />
          </View>
        </Card>

        {/* This Month's Stats */}
        <Card style={styles.monthlyStatsCard}>
          <Text style={styles.sectionTitle}>Dieser Monat</Text>
          <View style={styles.statList}>
            <View style={styles.statListItem}>
              <Text style={styles.statListItemLabel}>Buchungen</Text>
              <Text style={styles.statListItemValue}>52 Termine</Text>
            </View>
            <View style={styles.statListItem}>
              <Text style={styles.statListItemLabel}>Brutto-Umsatz</Text>
              <Text style={styles.statListItemValue}>€4,100</Text>
            </View>
            <View style={styles.statListItem}>
              <Text style={styles.statListItemLabel}>Servicegebühren (10%)</Text>
              <Text style={[styles.statListItemValue, styles.expenseValueText]}>-€410</Text>
            </View>
            <View style={styles.statListItem}>
              <Text style={styles.statListItemLabel}>Abonnement</Text>
              <Text style={[styles.statListItemValue, styles.expenseValueText]}>-€29.99</Text>
            </View>
            <View style={styles.statListItem}>
              <Text style={styles.statListItemTotalLabel}>Deine Einnahmen</Text>
              <Text style={styles.statListItemTotalValue}>€3,660.01</Text>
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
              ] as Array<{ icon: string; color: string; title: string; subtitle: string }>
            ).map((benefit, index: number) => (
              <View key={index} style={styles.benefitItem}>
                <View style={[styles.benefitIconCircle, { backgroundColor: benefit.color + '1A' }]}>
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

        {/* Payment History */}
        <Card style={styles.paymentHistoryCard}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>Zahlungshistorie</Text>
            <TouchableOpacity onPress={() => handleAlert("Alle Zahlungen anzeigen")}>
              <Text style={styles.viewAllText}>Alle anzeigen</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.historyList}>
            {(
              [
                { date: '15. Oktober 2025', amount: 29.99 },
                { date: '15. September 2025', amount: 29.99 },
                { date: '15. August 2025', amount: 29.99 },
              ] as Array<{ date: string; amount: number }>
            ).map((item, index: number) => (
              <View key={index} style={[styles.historyItem, index < 2 && styles.historySeparator]}>
                <View>
                  <Text style={styles.historyItemTitle}>Pro Abonnement</Text>
                  <Text style={styles.historyItemDate}>{item.date}</Text>
                </View>
                <Text style={styles.historyItemAmount}>€{item.amount.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}


// --- React Native Stylesheet ---
const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: COLORS.background || '#F9FAFB',
  },
  // --- Header Styles ---
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
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: FONT_SIZES.h4 || 18,
    fontWeight: 'bold',
  },
  // --- Scroll Content & Titles ---
  scrollContent: {
    padding: SPACING.md || 16,
    paddingBottom: SPACING.xl * 2,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.h4 || 18,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  // --- Current Plan Card (Gradient Background) ---
  currentPlanCardWrapper: {
    marginBottom: SPACING.md,
    overflow: 'hidden',
    borderRadius: 8,
    padding: 0, // Card wrapper handles rounding
  },
  currentPlanGradient: {
    padding: SPACING.lg,
    backgroundColor: COLORS.primary, // Fallback color
    // NOTE: Implementing gradient (from-[#8B4513] to-[#5C2E0A]) requires a library like 'react-native-linear-gradient'
  },
  currentPlanIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  currentPlanStatus: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.white,
    opacity: 0.9,
  },
  currentPlanName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  currentPlanRenewal: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: SPACING.md,
  },
  currentPlanStatsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  planStatItem: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // white bg-opacity-20
    borderRadius: 6,
    padding: SPACING.sm,
  },
  planStatLabel: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.white,
    opacity: 0.75,
    marginBottom: SPACING.xs / 2,
  },
  planStatValue: {
    fontSize: FONT_SIZES.h5 || 16,
    fontWeight: 'bold',
    color: COLORS.white,
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
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  statList: {
    gap: SPACING.sm,
  },
  statListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statListItemLabel: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.textSecondary || '#6B7280',
  },
  statListItemValue: {
    fontSize: FONT_SIZES.body || 14,
  },
  // Apply danger color to Text elements specifically
  expenseValueText: {
    color: COLORS.danger || '#EF4444',
  },
  statListItemTotalLabel: {
    fontWeight: 'bold',
    color: COLORS.text || '#1F2937',
  },
  statListItemTotalValue: {
    color: COLORS.success || '#10B981',
    fontSize: FONT_SIZES.h5 || 16,
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
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  currentPlanCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  popularBadgeContainer: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    zIndex: 1,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs / 2,
  },
  planName: {
    fontSize: FONT_SIZES.h4 || 18,
    fontWeight: 'bold',
  },
  planPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.xs / 2,
  },
  planPriceValue: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  planPricePeriod: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.textSecondary,
  },
  featureList: {
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
  },
  checkIcon: {
    flexShrink: 0,
    marginTop: 2,
  },
  featureText: {
    fontSize: FONT_SIZES.body || 14,
  },
  fullWidthButton: {
    width: '100%',
    height: 48,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButton: {
    borderColor: COLORS.border,
  },
  // --- Benefits ---
  benefitsCard: {
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  benefitsList: {
    gap: SPACING.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  benefitIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  benefitTextContainer: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: FONT_SIZES.h5 || 16,
    fontWeight: '600',
    marginBottom: SPACING.xs / 2,
  },
  benefitSubtitle: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.textSecondary || '#6B7280',
  },
  // --- Payment History ---
  paymentHistoryCard: {
    padding: SPACING.md,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  viewAllText: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  historyList: {
    gap: SPACING.xs,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.sm,
  },
  historySeparator: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  historyItemTitle: {
    fontSize: FONT_SIZES.body || 14,
    fontWeight: '500',
  },
  historyItemDate: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.textSecondary || '#6B7280',
  },
  historyItemAmount: {
    color: COLORS.success || '#10B981',
    fontWeight: '500',
  },
});