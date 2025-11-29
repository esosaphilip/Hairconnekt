import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert, // Used to replace browser 'alert'
  ActivityIndicator,
} from 'react-native';

// Replaced web imports with assumed custom/community React Native components
import { useNavigation } from '@react-navigation/native';
import Button from '@/components/Button';
import IconButton from '@/components/IconButton';
import Card from '@/components/Card';
import { Badge } from '@/components/badge';
import Icon from '@/components/Icon';
import { COLORS, SPACING, FONT_SIZES } from '@/theme/tokens';
import { useAuth } from '@/auth/AuthContext';
import { getProviderAppointments } from '@/api/appointments';
import { paymentsApi, centsToEuros, PLATFORM_FEE_RATE } from '@/api/payments';

// --- Mock Data (Remains the same for logic) ---
// --- Types ---
type BookingTransaction = {
  id: string;
  date: string;
  ts: number;
  client: string;
  service: string;
  gross: number;
  fee: number;
  net: number;
  status: 'completed' | 'pending' | 'refunded';
  type: 'booking';
};

type PayoutTransaction = {
  id: string;
  date: string;
  ts: number;
  type: 'payout';
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'refunded';
};

type SubscriptionTransaction = {
  id: string;
  date: string;
  ts: number;
  type: 'subscription';
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'refunded';
};

type Transaction = BookingTransaction | PayoutTransaction | SubscriptionTransaction;

function isBooking(t: Transaction): t is BookingTransaction {
  return t.type === 'booking';
}

const initialTransactions: Transaction[] = [];

// --- Helper Functions and Components ---

/**
 * @param {{ transaction: Transaction }} props
 */
const TransactionItem: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
    // Determine status style and text
    /**
     * @param {'completed'|'pending'|'refunded'} status
     * @returns {{ title: string, color: 'green'|'amber'|'red'|'gray' }}
     */
    const getStatusProps = (status: 'completed' | 'pending' | 'refunded'): { title: string, color: 'green' | 'amber' | 'red' | 'gray' } => {
        switch (status) {
            case "completed":
                return { title: "Abgeschlossen", color: "green" };
            case "pending":
                return { title: "Ausstehend", color: "amber" };
            case "refunded":
                return { title: "Erstattet", color: "red" };
            default:
                return { title: "Unbekannt", color: "gray" };
        }
    };

    const statusProps = getStatusProps(transaction.status);

    return (
        <Card style={styles.transactionCard}>
            {transaction.type === "booking" ? (
                // --- Booking Transaction Layout ---
                <View>
                    <View style={styles.rowHeader}>
                        <View>
                            <Text style={styles.clientName}>{transaction.client}</Text>
                            <Text style={styles.serviceName}>{transaction.service}</Text>
                        </View>
                        <Badge title={statusProps.title} color={statusProps.color} />
                    </View>

                    <View style={styles.detailsBlock}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Betrag:</Text>
                            <Text style={styles.detailValue}>€{transaction.gross?.toFixed(2)}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, styles.feeText]}>Gebühr (10%):</Text>
                            <Text style={[styles.detailValue, styles.feeText]}>-€{transaction.fee?.toFixed(2)}</Text>
                        </View>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Deine Einnahmen:</Text>
                            <Text style={[
                                styles.totalValue,
                                transaction.status === "refunded" ? styles.dangerText : styles.successText,
                            ]}>
                                {transaction.status === "refunded" ? "-" : ""}€
                                {transaction.net?.toFixed(2)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.dateRow}>
                        <Icon name="calendar" size={12} color={COLORS.textSecondary} />
                        <Text style={styles.dateText}>{transaction.date}</Text>
                    </View>
                </View>
            ) : (
                // --- Payout/Subscription Transaction Layout ---
                <View>
                    <View style={styles.rowHeader}>
                        <View>
                            <Text style={styles.clientName}>
                                {transaction.type === "payout" ? "Auszahlung" : "Abonnement"}
                            </Text>
                            <Text style={styles.serviceName}>{transaction.description}</Text>
                        </View>
                        <Badge title={statusProps.title} color={statusProps.color} />
                    </View>

                    <View style={styles.rowHeader}>
                        <Text style={styles.detailLabel}>Betrag:</Text>
                        <Text style={styles.payoutAmount}>
                            -€{Math.abs(transaction.amount || 0).toFixed(2)}
                        </Text>
                    </View>

                    <View style={styles.dateRow}>
                        <Icon name="calendar" size={12} color={COLORS.textSecondary} />
                        <Text style={styles.dateText}>{transaction.date}</Text>
                    </View>
                </View>
            )}
        </Card>
    );
};

// --- Main Component ---
export function TransactionsScreen() {
  // Loosen navigation typing to avoid TS 'never' route errors until stack types are defined
  const navigation = useNavigation<any>();
  const [filter, setFilter] = useState<'all' | 'bookings' | 'payouts' | 'fees'>("all");
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>("month");
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      Alert.alert('Hinweis', error);
    }
  }, [error]);

  const authCtx = useAuth();
  const user = (authCtx?.user ?? null);
  const tokens = (authCtx?.tokens ?? null);
  const authLoading = !!authCtx?.loading;
  const isAuthenticated = !!(tokens && tokens.accessToken);
  const isProviderRole = (user?.userType === 'PROVIDER' || user?.userType === 'BOTH');

  /**
   * @param {string} isoDate
   * @param {string=} time
   * @returns {{ label: string, ts: number }}
   */
  const formatDateLabel = (isoDate: string, time?: string) => {
    try {
      const d = new Date((isoDate || '').trim() + 'T' + ((time || '').trim() || '00:00:00'));
      const ts = d.getTime();
      const label = d.toLocaleString('de-DE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
      return { label, ts: Number.isNaN(ts) ? Date.now() : ts };
    } catch {
      const now = Date.now();
      return { label: new Date(now).toLocaleString('de-DE'), ts: now };
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [apptsRes, payoutsRes] = await Promise.all([
        getProviderAppointments('completed'),
        paymentsApi.listProviderPayouts(),
      ]);
      const apptTxs = (apptsRes?.items || []).map((a) => {
        const { label, ts } = formatDateLabel(a.appointmentDate, a.startTime);
        const gross = (a.totalPriceCents || 0) / 100;
        const fee = Math.round(gross * PLATFORM_FEE_RATE * 100) / 100;
        const net = Math.round((gross - fee) * 100) / 100;
        const clientName = a.client?.name || 'Kunde';
        const serviceName = (a.services || []).map((s) => s.name).join(' + ');
        const status = ((a.status === 'COMPLETED') ? 'completed' : (a.status === 'CANCELLED' ? 'refunded' : 'pending')) as BookingTransaction['status'];
        /** @type {BookingTransaction} */
        const tx: BookingTransaction = {
          id: String(a.id),
          date: label,
          ts,
          client: clientName,
          service: serviceName || 'Dienstleistung',
          gross,
          fee,
          net,
          status,
          type: 'booking',
        };
        return tx;
      });
      const payoutTxs = (payoutsRes?.items || []).map((p) => {
        const baseDate = p.completedAt || p.processedAt || p.requestedAt || new Date().toISOString();
        const { label, ts } = formatDateLabel(baseDate);
        const amount = -centsToEuros(p.amountCents || 0);
        const status = ((p.status || '').toLowerCase() as PayoutTransaction['status']);
        const desc = p.failureReason ? `Auszahlung fehlgeschlagen: ${p.failureReason}` : 'Auszahlung auf Bankkonto';
        const tx: PayoutTransaction = {
          id: p.id,
          date: label,
          ts,
          type: 'payout',
          description: desc,
          amount,
          status,
        };
        return tx;
      });
      setTransactions([...apptTxs, ...payoutTxs].sort((a, b) => b.ts - a.ts));
    } catch (err) {
      const status = (err as any)?.response?.status;
      let msg = 'Fehler beim Laden der Transaktionen';
      if (status === 401) msg = 'Bitte melde dich als Anbieter an';
      else if (status === 403) msg = 'Keine Berechtigung: Anbieterrolle erforderlich';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    if (!isAuthenticated || !isProviderRole) {
      setTransactions(initialTransactions);
      setError(null);
      setLoading(false);
      return () => { cancelled = true; };
    }
    loadData();
    return () => { cancelled = true; };
  }, [isAuthenticated, isProviderRole]);

  // Filter logic with period and type
  const periodRange = useMemo(() => {
    const now = Date.now();
    if (period === 'week') return now - 7 * 24 * 60 * 60 * 1000;
    if (period === 'month') return now - 30 * 24 * 60 * 60 * 1000;
    return 0; // all
  }, [period]);

  const filteredTransactions = transactions.filter((t) => {
    if (filter === "bookings") return t.type === "booking";
    if (filter === "payouts") return t.type === "payout";
    if (filter === "fees") return t.type === "subscription";
    const withinRange = periodRange ? (t && t.ts) >= periodRange : true;
    return withinRange;
  });

  // Summary calculations (same as web logic)
  const totalIncome = transactions
    .filter(isBooking)
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + (t.net || 0), 0);

  const totalPayouts = transactions
    .filter((t) => t.type === "payout")
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
    
  // Empty State Component
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
        <Icon name="euro" size={64} color={COLORS.border} style={styles.emptyIcon} />
        <Text style={styles.emptyTitle}>Keine Transaktionen gefunden</Text>
        <Text style={styles.emptySubtitle}>
            {filter === "all"
                ? "Noch keine Transaktionen vorhanden"
                : `Keine ${
                    filter === "bookings"
                      ? "Buchungen"
                      : filter === "payouts"
                      ? "Auszahlungen"
                      : "Gebühren"
                  } in diesem Zeitraum`}
        </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.flexContainer}>
      {authLoading ? (
        <View style={{ padding: SPACING.lg }}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      ) : !isAuthenticated ? (
        <View style={{ padding: SPACING.lg }}>
          <Text style={{ marginBottom: SPACING.sm, color: COLORS.text }}>Bitte melde dich an, um deine Transaktionen zu sehen.</Text>
          <TouchableOpacity style={styles.exportButton} onPress={() => navigation.navigate('Login')}>
            <Icon name="log-in" size={18} color={COLORS.white} />
            <Text style={styles.exportButtonText}>Zum Login</Text>
          </TouchableOpacity>
        </View>
      ) : !isProviderRole ? (
        <View style={{ padding: SPACING.lg }}>
          <Text style={{ marginBottom: SPACING.sm, color: COLORS.text }}>Diese Ansicht ist nur für Anbieter verfügbar.</Text>
          <TouchableOpacity style={styles.exportButton} onPress={() => navigation.navigate('ProviderRegistration')}>
            <Icon name="user-plus" size={18} color={COLORS.white} />
            <Text style={styles.exportButtonText}>Zur Anbieter-Registrierung</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <IconButton name="arrow-left" onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Alle Transaktionen</Text>
          <IconButton name="download" onPress={() => Alert.alert("Export", "CSV-Export - Funktion in Entwicklung")} />
        </View>

        {/* Period Filter */}
        <View style={styles.filterContainer}>
          {([
            { label: 'Woche', key: 'week' },
            { label: 'Monat', key: 'month' },
            { label: 'Alle', key: 'all' },
          ] as { label: string; key: 'week' | 'month' | 'all' }[]).map((p) => (
            <Button
              key={p.key}
              title={p.label}
              size="sm"
              variant={period === p.key ? 'default' : 'outline'}
              onPress={() => setPeriod(p.key)}
              style={period === p.key ? styles.activeButton : styles.inactiveButton}
            />
          ))}
        </View>

        {/* Type Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
          {([
            { key: 'all', title: 'Alle' },
            { key: 'bookings', title: 'Buchungen' },
            { key: 'payouts', title: 'Auszahlungen' },
            { key: 'fees', title: 'Gebühren' },
          ] as { key: 'all' | 'bookings' | 'payouts' | 'fees'; title: string }[]).map((f) => (
            <Button
              key={f.key}
              title={f.title}
              size="sm"
              variant={filter === f.key ? "default" : "outline"}
              onPress={() => setFilter(f.key)}
              style={filter === f.key ? styles.activeButton : styles.inactiveButton}
            />
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={{ padding: SPACING.lg }}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          renderItem={({ item }) => <TransactionItem transaction={item} />}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={() => (
            <View style={{ paddingHorizontal: SPACING.md }}>
              {/* Summary Cards */}
              <View style={styles.summaryGrid}>
                <Card style={styles.summaryCard}>
                  <View style={styles.summaryIconRow}>
                    <Icon name="trending-up" size={20} color={COLORS.success} />
                    <Text style={styles.summaryLabel}>Einnahmen</Text>
                  </View>
                  <Text style={styles.incomeValue}>€{totalIncome.toFixed(2)}</Text>
                  <Text style={styles.summaryHint}>Dieser Monat</Text>
                </Card>

                <Card style={styles.summaryCard}>
                  <View style={styles.summaryIconRow}>
                    <Icon name="trending-down" size={20} color={COLORS.danger} />
                    <Text style={styles.summaryLabel}>Auszahlungen</Text>
                  </View>
                  <Text style={styles.payoutValue}>€{totalPayouts.toFixed(2)}</Text>
                  <Text style={styles.summaryHint}>Dieser Monat</Text>
                </Card>
              </View>
            </View>
          )}
          ListEmptyComponent={EmptyState}
          contentContainerStyle={styles.listContent}
        />
      )}
      
      {/* Export Button Card (Fixed at the bottom of the screen or as the list footer) */}
      <View style={styles.exportFooter}>
        <Card style={styles.exportCard}>
            <Text style={styles.exportTitle}>Transaktionen exportieren</Text>
            <Text style={styles.exportSubtitle}>
                Lade deine Transaktionshistorie als CSV für deine Buchhaltung herunter.
            </Text>
            <Button
                title="Als CSV exportieren"
                icon="download"
                onPress={() => Alert.alert("Export", "CSV-Export - Funktion in Entwicklung")}
                style={{ backgroundColor: COLORS.primary }}
            />
        </Card>
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
  // --- Header Styles ---
  header: {
    backgroundColor: COLORS.white || '#FFFFFF',
    paddingHorizontal: SPACING.md || 16,
    paddingTop: SPACING.md || 16,
    paddingBottom: SPACING.sm || 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border || '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2,
    zIndex: 10,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.h4 || 18,
    fontWeight: 'bold',
  },
  // --- Filter Styles ---
  filterContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  activeButton: {
    backgroundColor: COLORS.primary || '#8B4513',
    borderColor: COLORS.primary || '#8B4513',
  },
  inactiveButton: {
    borderColor: COLORS.border || '#E5E7EB',
    backgroundColor: COLORS.white,
  },
  // --- List & Summary Styles ---
  listContent: {
    paddingTop: 0,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  summaryCard: {
    flex: 1,
    padding: SPACING.md,
  },
  summaryIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.textSecondary || '#6B7280',
  },
  summaryHint: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.textSecondary || '#6B7280',
  },
  incomeValue: {
    fontSize: 24,
    color: COLORS.success || '#10B981',
    fontWeight: 'bold',
    marginBottom: SPACING.xs / 2,
  },
  payoutValue: {
    fontSize: 24,
    color: COLORS.danger || '#EF4444',
    fontWeight: 'bold',
    marginBottom: SPACING.xs / 2,
  },
  // --- Transaction Item Styles ---
  transactionCard: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  clientName: {
    fontSize: FONT_SIZES.h5 || 16,
    fontWeight: '600',
  },
  serviceName: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.textSecondary || '#6B7280',
  },
  detailsBlock: {
    marginBottom: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    color: COLORS.textSecondary || '#6B7280',
  },
  detailValue: {
    color: COLORS.text,
  },
  feeText: {
    color: COLORS.danger || '#EF4444',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.xs,
    marginTop: SPACING.xs,
  },
  totalLabel: {
    color: COLORS.text || '#1F2937',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: FONT_SIZES.body || 14,
    fontWeight: '600',
  },
  successText: {
    color: COLORS.success || '#10B981',
  },
  dangerText: {
    color: COLORS.danger || '#EF4444',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
      fontSize: FONT_SIZES.small || 12,
      color: COLORS.textSecondary || '#6B7280',
      marginLeft: SPACING.xs / 2,
  },
  payoutAmount: {
    fontSize: 18,
    color: COLORS.danger || '#EF4444',
    fontWeight: 'bold',
  },
  // --- Empty State Styles ---
  emptyContainer: {
      paddingVertical: SPACING.xl * 2,
      paddingHorizontal: SPACING.md,
      alignItems: 'center',
  },
  emptyIcon: {
      color: COLORS.border || '#D1D5DB',
      marginBottom: SPACING.md,
  },
  emptyTitle: {
      fontSize: FONT_SIZES.h4 || 18,
      fontWeight: 'bold',
      marginBottom: SPACING.xs,
  },
  emptySubtitle: {
      fontSize: FONT_SIZES.body || 14,
      color: COLORS.textSecondary || '#6B7280',
      textAlign: 'center',
  },
  // --- Export Footer Styles (Simulating fixed position at the bottom of the scroll view) ---
  exportFooter: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.md,
      borderTopWidth: 1,
      borderTopColor: COLORS.border,
      backgroundColor: COLORS.white,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 5,
  },
  exportCard: {
      padding: 0, // Card is used as a simple container here
  },
  exportTitle: {
      fontSize: FONT_SIZES.h5 || 16,
      fontWeight: '600',
      marginBottom: SPACING.xs,
  },
  exportSubtitle: {
      fontSize: FONT_SIZES.body || 14,
      color: COLORS.textSecondary || '#6B7280',
      marginBottom: SPACING.sm,
  },
  // Added button styles used in auth/role gating actions
  exportButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.primary || '#8B4513',
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: 8,
      alignSelf: 'flex-start',
  },
  exportButtonText: {
      color: COLORS.white || '#FFFFFF',
      fontWeight: '600',
      fontSize: FONT_SIZES.body || 14,
      marginLeft: SPACING.xs,
  },
});
