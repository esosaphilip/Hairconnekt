import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert, // Used to replace browser 'alert'
} from 'react-native';

// Replaced web imports with assumed custom/community React Native components
import { useNavigation } from '@react-navigation/native';
import Button from '../../components/Button';
import IconButton from '../../components/IconButton';
import Card from '../../components/Card';
import { Badge } from '../../components/badge';
import Icon from '../../components/Icon';
import { COLORS, SPACING, FONT_SIZES } from '../../theme/tokens';

// --- Mock Data (Remains the same for logic) ---
type BookingTransaction = {
  id: number;
  date: string;
  client: string;
  service: string;
  gross: number;
  fee: number;
  net: number;
  status: 'completed' | 'pending' | 'refunded';
  type: 'booking';
};

type PayoutTransaction = {
  id: number;
  date: string;
  type: 'payout';
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'refunded';
};

type SubscriptionTransaction = {
  id: number;
  date: string;
  type: 'subscription';
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'refunded';
};

type Transaction = BookingTransaction | PayoutTransaction | SubscriptionTransaction;

function isBooking(t: Transaction): t is BookingTransaction {
  return t.type === 'booking';
}

const transactions: Transaction[] = [
  // ... (Your transaction data goes here)
  { id: 1, date: "28. Okt. 14:30", client: "Sarah Müller", service: "Box Braids + Styling", gross: 95, fee: 9.5, net: 85.5, status: "completed", type: "booking" },
  { id: 2, date: "27. Okt. 18:00", client: "Lisa Werner", service: "Cornrows", gross: 65, fee: 6.5, net: 58.5, status: "completed", type: "booking" },
  { id: 3, date: "27. Okt. 14:00", client: "Maria König", service: "Senegalese Twists", gross: 115, fee: 11.5, net: 103.5, status: "pending", type: "booking" },
  { id: 4, date: "26. Okt. 16:45", client: "Anna Schmidt", service: "Knotless Braids", gross: 105, fee: 10.5, net: 94.5, status: "completed", type: "booking" },
  { id: 5, date: "25. Okt. 15:00", type: "payout", description: "Auszahlung auf Bankkonto", amount: -950, status: "completed" },
  { id: 6, date: "25. Okt. 11:30", client: "Eva Müller", service: "Passion Twists", gross: 95, fee: 9.5, net: 85.5, status: "completed", type: "booking" },
  { id: 7, date: "24. Okt. 17:00", client: "Sophie Wagner", service: "Box Braids", gross: 85, fee: 8.5, net: 76.5, status: "completed", type: "booking" },
  { id: 8, date: "24. Okt. 13:00", client: "Laura Klein", service: "Cornrows + Styling", gross: 75, fee: 7.5, net: 67.5, status: "refunded", type: "booking" },
  { id: 9, date: "23. Okt. 16:00", client: "Nina Hoffmann", service: "Senegalese Twists", gross: 115, fee: 11.5, net: 103.5, status: "completed", type: "booking" },
  { id: 10, date: "23. Okt. 10:00", client: "Julia Becker", service: "Faux Locs", gross: 125, fee: 12.5, net: 112.5, status: "completed", type: "booking" },
  { id: 11, date: "15. Okt. 09:00", type: "subscription", description: "Pro Abonnement", amount: -29.99, status: "completed" },
];

// --- Helper Functions and Components ---

const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
    // Determine status style and text
    const getStatusProps = (status: Transaction['status']) => {
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
  const navigation = useNavigation<any>();
  const [filter, setFilter] = useState("all"); // "all" | "bookings" | "payouts" | "fees"
  const [period, setPeriod] = useState("month"); // "week" | "month" | "all"

  // Filter logic (simplified, as date filtering based on 'period' requires more data manipulation)
  const filteredTransactions = transactions.filter((t) => {
    if (filter === "bookings") return t.type === "booking";
    if (filter === "payouts") return t.type === "payout";
    if (filter === "fees") return t.type === "subscription";
    return true;
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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <IconButton name="arrow-left" onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Alle Transaktionen</Text>
          <IconButton name="download" onPress={() => Alert.alert("Export", "CSV-Export - Funktion in Entwicklung")} />
        </View>

        {/* Period Filter */}
        <View style={styles.filterContainer}>
          {["Woche", "Monat", "Alle"].map((p) => (
            <Button
              key={p}
              title={p}
              size="sm"
              variant={period === p.toLowerCase() ? "default" : "outline"}
              onPress={() => setPeriod(p.toLowerCase())}
              style={period === p.toLowerCase() ? styles.activeButton : styles.inactiveButton}
            />
          ))}
        </View>

        {/* Type Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
          {[
            { key: "all", title: "Alle" },
            { key: "bookings", title: "Buchungen" },
            { key: "payouts", title: "Auszahlungen" },
            { key: "fees", title: "Gebühren" },
          ].map((f) => (
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

      <FlatList
        data={filteredTransactions}
        renderItem={({ item }: { item: Transaction }) => <TransactionItem transaction={item} />}
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
    gap: SPACING.xs,
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
    gap: SPACING.sm,
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
    gap: SPACING.xs,
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
    gap: SPACING.xs / 2,
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
    gap: SPACING.xs / 2,
  },
  dateText: {
      fontSize: FONT_SIZES.small || 12,
      color: COLORS.textSecondary || '#6B7280',
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
});