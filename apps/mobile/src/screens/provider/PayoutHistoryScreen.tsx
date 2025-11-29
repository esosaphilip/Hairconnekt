import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

// Reusable components (assumed, based on previous refactoring)
import Text from '../../components/Text';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Badge from '../../components/badge';
import { Select } from '../../components/Select';
import Icon from '../../components/Icon';

// Mock React Navigation hook
const useNavigation = () => ({
  goBack: () => console.log('Navigating back...'),
  navigate: (screen: string) => console.log(`Navigating to ${screen}`),
});

// Mock for displaying notifications in React Native
const toast = {
  success: (message: string) => console.log(`TOAST SUCCESS: ${message}`),
  error: (message: string) => console.log(`TOAST ERROR: ${message}`),
};

// --- Types and Mock Data (can be kept largely the same) ---
const mockPayouts = [
  // ... (Mock data remains unchanged)
  {
    id: "payout-001",
    amount: 450.0,
    status: "completed",
    requestDate: "14. Nov 2025",
    completedDate: "16. Nov 2025",
    bankAccount: "Sparkasse Berlin",
    bankAccountLast4: "4532",
    reference: "PAY-5678",
    fee: 5.0,
    netAmount: 445.0,
    transactions: 8,
  },
  {
    id: "payout-002",
    amount: 320.5,
    status: "processing",
    requestDate: "07. Nov 2025",
    bankAccount: "Deutsche Bank",
    bankAccountLast4: "4532",
    reference: "PAY-5677",
    fee: 5.0,
    netAmount: 315.5,
    transactions: 6,
  },
  {
    id: "payout-003",
    amount: 580.0,
    status: "completed",
    requestDate: "31. Okt 2025",
    completedDate: "02. Nov 2025",
    bankAccount: "Sparkasse Berlin",
    bankAccountLast4: "4532",
    reference: "PAY-5676",
    fee: 5.0,
    netAmount: 575.0,
    transactions: 10,
  },
  {
    id: "payout-004",
    amount: 250.0,
    status: "failed",
    requestDate: "24. Okt 2025",
    bankAccount: "Sparkasse Berlin",
    bankAccountLast4: "4532",
    reference: "PAY-5675",
    fee: 5.0,
    netAmount: 245.0,
    transactions: 5,
  },
  {
    id: "payout-005",
    amount: 410.5,
    status: "completed",
    requestDate: "17. Okt 2025",
    completedDate: "19. Okt 2025",
    bankAccount: "Sparkasse Berlin",
    bankAccountLast4: "4532",
    reference: "PAY-5674",
    fee: 5.0,
    netAmount: 405.5,
    transactions: 7,
  },
];


// --- Config Helpers Refactored for RN Styles/Icons ---

// Icon strings (map to the Icon component)
const IconNames = {
  ArrowLeft: 'chevron-left',
  Download: 'download',
  Calendar: 'calendar',
  CheckCircle: 'check-circle',
  Clock: 'clock',
  XCircle: 'x-circle',
  DollarSign: 'dollar-sign',
  CreditCard: 'credit-card',
  FileText: 'file-text',
  Info: 'info', // For the info card
};

// Color tokens
const colors = {
  primary: '#8B4513',
  alert: '#FF6B6B',
  green: '#22C55E',
  blue: '#3B82F6',
  red: '#EF4444',
  gray: '#4B5563',
  lightGreen: '#F0FFF4',
  lightBlue: '#F5F7FF',
  lightAmber: '#FFFBEA',
  lightRed: '#FEF2F2',
  background: '#FAF9F6',
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case "completed":
      return {
        label: "Abgeschlossen",
        backgroundColor: colors.lightGreen,
        borderColor: colors.green,
        textColor: colors.green,
        icon: IconNames.CheckCircle,
      };
    case "processing":
      return {
        label: "In Bearbeitung",
        backgroundColor: colors.lightBlue,
        borderColor: colors.blue,
        textColor: colors.blue,
        icon: IconNames.Clock,
      };
    case "pending":
      return {
        label: "Ausstehend",
        backgroundColor: colors.lightAmber,
        borderColor: colors.gray,
        textColor: colors.gray,
        icon: IconNames.Clock,
      };
    case "failed":
      return {
        label: "Fehlgeschlagen",
        backgroundColor: colors.lightRed,
        borderColor: colors.red,
        textColor: colors.red,
        icon: IconNames.XCircle,
      };
  }
};

export function PayoutHistoryScreen() {
  const navigation = useNavigation();
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("all");

  const filteredPayouts = mockPayouts.filter((payout) => {
    const matchesStatus = filterStatus === "all" || payout.status === filterStatus;
    return matchesStatus;
  });

  const totalPaidOut = mockPayouts
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.netAmount, 0);

  const totalPending = mockPayouts
    .filter((p) => p.status === "processing" || p.status === "pending")
    .reduce((sum, p) => sum + p.netAmount, 0);

  const handleExport = () => {
    toast.success("Auszahlungshistorie wird exportiert...");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Button
              variant="ghost"
              size="icon"
              onPress={() => navigation.goBack()}
            >
              <Icon name={IconNames.ArrowLeft} size={24} color="#000" />
            </Button>
            <Text variant="h2" style={styles.headerTitle}>Auszahlungen</Text>
          </View>
          <Button
            variant="ghost"
            size="icon"
            onPress={handleExport}
          >
            <Icon name={IconNames.Download} size={24} color="#000" />
          </Button>
        </View>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Summary Stats */}
        <View style={styles.summaryGrid}>
          {/* Ausgezahlt (Paid Out) */}
          <Card style={styles.statCard}>
            <View style={styles.statRow}>
              <Icon name={IconNames.CheckCircle} size={16} color={colors.green} />
              <Text style={[styles.statLabel, { color: colors.green }]}>Ausgezahlt</Text>
            </View>
            <Text variant="h1" style={styles.statValue}>€{totalPaidOut.toFixed(2)}</Text>
            <Text style={styles.statSubText}>
              {mockPayouts.filter((p) => p.status === "completed").length} Auszahlungen
            </Text>
          </Card>
          
          {/* In Bearbeitung (Pending/Processing) */}
          <Card style={styles.statCard}>
            <View style={styles.statRow}>
              <Icon name={IconNames.Clock} size={16} color={colors.blue} />
              <Text style={[styles.statLabel, { color: colors.blue }]}>In Bearbeitung</Text>
            </View>
            <Text variant="h1" style={styles.statValue}>€{totalPending.toFixed(2)}</Text>
            <Text style={styles.statSubText}>
              {
                mockPayouts.filter(
                  (p) => p.status === "processing" || p.status === "pending"
                ).length
              } Auszahlungen
            </Text>
          </Card>
        </View>

        {/* Request New Payout CTA */}
        <Card style={styles.ctaCard}>
          <View style={styles.ctaContent}>
            <View>
              <Text variant="h3" style={styles.ctaTitle}>Neue Auszahlung anfordern</Text>
              <Text style={styles.ctaSubText}>
                Verfügbares Guthaben: €285.50
              </Text>
            </View>
            <Button
              onPress={() => navigation.navigate("ProviderPayoutRequest")}
              style={styles.ctaButton}
              textStyle={{ color: '#fff' }}
            >
              <Icon name={IconNames.DollarSign} size={16} color="#fff" style={{ marginRight: 6 }} />
              Anfordern
            </Button>
          </View>
        </Card>

        {/* Filters */}
        <Card style={styles.filterCard}>
          <View style={styles.filterGrid}>
            <View style={{ flex: 1 }}>
              <Text style={styles.filterLabel}>Status</Text>
              <Select
                selectedValue={filterStatus}
                onValueChange={setFilterStatus}
                items={[
                  { label: "Alle", value: "all" },
                  { label: "Abgeschlossen", value: "completed" },
                  { label: "In Bearbeitung", value: "processing" },
                  { label: "Ausstehend", value: "pending" },
                  { label: "Fehlgeschlagen", value: "failed" },
                ]}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.filterLabel}>Zeitraum</Text>
              <Select
                selectedValue={filterPeriod}
                onValueChange={setFilterPeriod}
                items={[
                  { label: "Alle", value: "all" },
                  { label: "Letzte Woche", value: "week" },
                  { label: "Letzter Monat", value: "month" },
                  { label: "Letzte 3 Monate", value: "3months" },
                  { label: "Letztes Jahr", value: "year" },
                ]}
              />
            </View>
          </View>
        </Card>

        {/* Payouts List */}
        <View style={styles.listSection}>
          <Text variant="h3" style={styles.listTitle}>
            {filteredPayouts.length} Auszahlungen
          </Text>

          {filteredPayouts.map((payout) => {
            const statusConfig = getStatusConfig(payout.status) || {
              label: 'Status',
              backgroundColor: colors.lightBlue,
              borderColor: colors.blue,
              textColor: colors.blue,
            };
            
            return (
              <Card key={payout.id} style={styles.payoutCard}>
                <View style={styles.payoutHeader}>
                  <View style={styles.payoutLeft}>
                    <Badge
                      label={statusConfig.label}
                      backgroundColor={statusConfig.backgroundColor}
                      borderColor={statusConfig.borderColor}
                      textColor={statusConfig.textColor}
                      style={{ marginBottom: 8 }}
                    />
                    <Text style={styles.refText}>Ref: {payout.reference}</Text>
                  </View>
                  <View style={styles.payoutRight}>
                    <Text style={styles.netAmountText}>
                      €{payout.netAmount.toFixed(2)}
                    </Text>
                    <Text style={styles.transactionCountText}>
                      {payout.transactions} Transaktionen
                    </Text>
                  </View>
                </View>

                <View style={styles.separator} />

                {/* Details */}
                <View style={styles.detailsSection}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Bruttobetrag:</Text>
                    <Text style={styles.detailValue}>€{payout.amount.toFixed(2)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Gebühr:</Text>
                    <Text style={styles.detailValue}>-€{payout.fee.toFixed(2)}</Text>
                  </View>
                  <View style={styles.separator} />
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabelBold}>Nettobetrag:</Text>
                    <Text style={styles.detailValueBold}>€{payout.netAmount.toFixed(2)}</Text>
                  </View>
                </View>

                <View style={styles.separator} />

                {/* Bank Account */}
                <View style={styles.bankAccountRow}>
                  <Icon name={IconNames.CreditCard} size={16} color="#9CA3AF" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bankNameText}>{payout.bankAccount}</Text>
                    <Text style={styles.bankLast4Text}>
                      •••• {payout.bankAccountLast4}
                    </Text>
                  </View>
                </View>

                {/* Dates & Status Info */}
                <View style={styles.datesSection}>
                  <View style={styles.dateRow}>
                    <Icon name={IconNames.Calendar} size={12} color={colors.gray} />
                    <Text style={styles.dateText}>Angefordert: {payout.requestDate}</Text>
                  </View>
                  {payout.completedDate && (
                    <View style={styles.dateRow}>
                      <Icon name={IconNames.CheckCircle} size={12} color={colors.gray} />
                      <Text style={styles.dateText}>Abgeschlossen: {payout.completedDate}</Text>
                    </View>
                  )}
                  {payout.status === "processing" && (
                    <Text style={styles.processingInfo}>
                      Wird in 1-2 Werktagen bearbeitet
                    </Text>
                  )}
                  {payout.status === "failed" && (
                    <Text style={styles.failedInfo}>
                      Kontaktiere den Support für weitere Informationen
                    </Text>
                  )}
                </View>

                {/* Actions */}
                {payout.status === "completed" && (
                  <Button
                    variant="outline"
                    onPress={() => toast.success("Beleg wird heruntergeladen...")}
                    style={styles.downloadButton}
                  >
                    <Icon name={IconNames.FileText} size={16} color={colors.gray} style={{ marginRight: 8 }} />
                    Beleg herunterladen
                  </Button>
                )}
              </Card>
            );
          })}
        </View>

        {/* Info Card */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            <Icon name={IconNames.Info} size={14} color={colors.blue} style={{ marginRight: 6 }} />
            Auszahlungsinformationen
          </Text>
          <View style={styles.infoList}>
            <Text style={styles.infoListItem}>• Auszahlungen werden innerhalb von 1-2 Werktagen bearbeitet</Text>
            <Text style={styles.infoListItem}>• Mindestbetrag für Auszahlungen: €50</Text>
            <Text style={styles.infoListItem}>• Auszahlungsgebühr: €5 pro Transaktion</Text>
            <Text style={styles.infoListItem}>• Maximale Anzahl: 2 Auszahlungen pro Woche</Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

// --- Stylesheet for React Native ---
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  // Header styles
  header: {
    backgroundColor: '#fff',
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    zIndex: 10,
  },
  headerContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerTitle: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: '600',
  },
  // ScrollView content
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  // Summary Grid
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
  },
  statRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  statValue: {
    color: '#1F2937',
    fontSize: 20,
    fontWeight: '700',
  },
  statSubText: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
  },
  // CTA Card (Request New Payout)
  ctaCard: {
    padding: 16,
    marginBottom: 16,
    // RN gradient approximation (using primary color border/background)
    backgroundColor: `${colors.primary}0D`, // 5% opacity
    borderColor: `${colors.primary}33`, // 20% opacity
    borderWidth: 1,
  },
  ctaContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ctaTitle: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  ctaSubText: {
    color: '#4B5563',
    fontSize: 14,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 38,
    paddingHorizontal: 16,
  },
  // Filters
  filterCard: {
    marginBottom: 16,
    padding: 16,
  },
  filterGrid: {
    flexDirection: 'row',
  },
  filterLabel: {
    color: '#4B5563',
    fontSize: 12,
    marginBottom: 6,
  },
  // Payouts List
  listSection: {
    marginBottom: 16,
  },
  listTitle: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  payoutCard: {
    padding: 16,
  },
  payoutHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  payoutLeft: {
    flex: 1,
  },
  payoutRight: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  netAmountText: {
    color: '#1F2937',
    fontSize: 20,
    fontWeight: '700',
  },
  transactionCountText: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  refText: {
    color: '#6B7280',
    fontSize: 12,
  },
  separator: {
    backgroundColor: '#E5E7EB',
    height: 1,
    marginVertical: 12,
  },
  // Details Section
  detailsSection: {
  },
  detailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    color: '#4B5563',
    fontSize: 14,
  },
  detailValue: {
    color: '#1F2937',
    fontSize: 14,
  },
  detailLabelBold: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '600',
  },
  detailValueBold: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '600',
  },
  // Bank Account
  bankAccountRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  bankNameText: {
    color: '#1F2937',
    fontSize: 14,
  },
  bankLast4Text: {
    color: '#6B7280',
    fontSize: 12,
  },
  // Dates & Status Info
  datesSection: {
  },
  dateRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  dateText: {
    color: '#4B5563',
    fontSize: 12,
  },
  processingInfo: {
    color: colors.blue,
    fontSize: 12,
    marginTop: 4,
  },
  failedInfo: {
    color: colors.red,
    fontSize: 12,
    marginTop: 4,
  },
  downloadButton: {
    marginTop: 12,
    borderColor: '#D1D5DB', // border-gray-300
    height: 38,
    width: '100%',
  },
  // Info Card
  infoCard: {
    padding: 16,
    backgroundColor: colors.lightBlue,
    borderColor: '#BFDBFE', // blue-200 equivalent
    borderWidth: 1,
  },
  infoTitle: {
    alignItems: 'center',
    color: '#1F2937',
    flexDirection: 'row',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoList: {
  },
  infoListItem: {
    color: '#374151',
    fontSize: 12, // text-gray-700
  },
});