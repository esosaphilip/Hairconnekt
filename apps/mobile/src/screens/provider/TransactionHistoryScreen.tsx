import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

// Reusable components (assumed, based on previous refactoring)
import Text from '../../components/Text';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Badge from '../../components/badge';
import Input from '../../components/Input';
import Picker from '../../components/Picker'; // RN Select/Dropdown component
import Icon from '../../components/Icon'; // Component for rendering icons

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

import { providerFinanceApi } from '@/api/providerFinance';


// --- Config Helpers Refactored for RN Styles/Icons ---

// Using string names that map to a central Icon component
const IconNames = {
  ArrowLeft: 'chevron-left',
  Download: 'download',
  Filter: 'filter',
  TrendingUp: 'trending-up',
  TrendingDown: 'trending-down',
  Calendar: 'calendar',
  Search: 'search',
  CheckCircle: 'check-circle',
  Clock: 'clock',
  XCircle: 'x-circle',
};

// Color tokens for status/type (simplified for RN styling)
const colors = {
    green: '#22C55E', // text-green-600
    blue: '#3B82F6',  // text-blue-600
    red: '#EF4444',   // text-red-600
    gray: '#4B5563',  // text-gray-600
    lightGreen: '#F0FFF4', // bg-green-50
    lightAmber: '#FFFBEA', // bg-amber-50
    lightRed: '#FEF2F2',   // bg-red-50
};

type TxnStatus = 'completed' | 'pending' | 'failed';
const getStatusConfig = (status: TxnStatus) => {
  switch (status) {
    case "completed":
      return {
        label: "Abgeschlossen",
        backgroundColor: colors.lightGreen,
        borderColor: colors.green,
        textColor: colors.green,
        icon: IconNames.CheckCircle,
      };
    case "pending":
      return {
        label: "Ausstehend",
        backgroundColor: colors.lightAmber,
        borderColor: colors.gray, // Using gray border for lack of specific amber border color
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
  return { label: 'Unbekannt', backgroundColor: '#F3F4F6', borderColor: '#D1D5DB', textColor: '#4B5563', icon: IconNames.Clock };
};

type TxnType = 'payment' | 'payout' | 'refund' | 'fee';
const getTypeConfig = (type: TxnType) => {
  switch (type) {
    case "payment":
      return { label: "Zahlung", color: colors.green };
    case "payout":
      return { label: "Auszahlung", color: colors.blue };
    case "refund":
      return { label: "Rückerstattung", color: colors.red };
    case "fee":
      return { label: "Gebühr", color: colors.gray };
  }
  return { label: 'Sonstige', color: colors.gray };
};

type Txn = { id: string; type: 'payment' | 'payout' | 'refund' | 'fee'; amount: number; status: 'completed' | 'pending' | 'failed'; date: string; time?: string; description: string; client?: string; reference?: string };

export function TransactionHistoryScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPeriod, setFilterPeriod] = useState<string>("all"); // Period filter is not used in logic but kept for UI
  const [transactionsData, setTransactionsData] = useState<Txn[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await providerFinanceApi.transactions({ page: 1, limit: 50 });
        const items: any[] = Array.isArray(data?.transactions) ? data.transactions : [];
        const mapped: Txn[] = items.map((t: any) => ({
          id: String(t.id),
          type: (t.status === 'paid' ? 'payment' : (t.status === 'refunded' ? 'refund' : (t.amount < 0 ? 'payout' : 'payment'))),
          amount: Number(t.amount || 0),
          status: (t.status === 'paid' ? 'completed' : (t.status === 'pending' ? 'pending' : 'failed')),
          date: new Date(t.date).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' }),
          time: new Date(t.date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
          description: (t.services || []).join(', '),
          client: t.client?.name,
          reference: t.referenceNumber,
        }));
        if (!cancelled) setTransactionsData(mapped);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredTransactions = transactionsData.filter((txn: Txn) => {
    const matchesSearch =
      txn.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.client?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.reference?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === "all" || txn.type === filterType;
    const matchesStatus = filterStatus === "all" || txn.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const totalIncome = transactionsData
    .filter((t: Txn) => t.type === "payment" && t.status === "completed" && t.amount > 0)
    .reduce((sum: number, t: Txn) => sum + t.amount, 0);

  const totalPayout = transactionsData
    .filter((t: Txn) => t.type === "payout" && t.amount < 0)
    .reduce((sum: number, t: Txn) => sum + Math.abs(t.amount), 0);

  const totalFees = transactionsData
    .filter((t: Txn) => t.type === "fee" && t.amount < 0)
    .reduce((sum: number, t: Txn) => sum + Math.abs(t.amount), 0);

  const handleExport = () => {
    // In React Native, this would trigger a Share/Export dialog
    toast.success("Transaktionen werden exportiert...");
  };

  return (
    <View style={styles.container}>
      {/* Header (Sticky behavior via zIndex in RN View or Safe Area wrapper) */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Button onPress={() => navigation.goBack()}>
              <Icon name={IconNames.ArrowLeft} size={24} color="#000" />
            </Button>
            <Text variant="h2" style={styles.headerTitle}>Transaktionsverlauf</Text>
          </View>
          <Button onPress={handleExport}>
            <Icon name={IconNames.Download} size={24} color="#000" />
          </Button>
        </View>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Summary Stats */}
        <View style={styles.summaryGrid}>
          {/* Einnahmen (Income) */}
          <Card style={styles.statCard}>
            <View style={styles.statRow}>
              <Icon name={IconNames.TrendingUp} size={16} color={colors.green} />
              <Text style={[styles.statLabel, { color: colors.green }]}>Einnahmen</Text>
            </View>
            <Text variant="h3" style={styles.statValue}>€{totalIncome.toFixed(2)}</Text>
          </Card>
          
          {/* Auszahlungen (Payout) */}
          <Card style={styles.statCard}>
            <View style={styles.statRow}>
              <Icon name={IconNames.TrendingDown} size={16} color={colors.blue} />
              <Text style={[styles.statLabel, { color: colors.blue }]}>Auszahlungen</Text>
            </View>
            <Text variant="h3" style={styles.statValue}>€{totalPayout.toFixed(2)}</Text>
          </Card>
          
          {/* Gebühren (Fees) */}
          <Card style={styles.statCard}>
            <View style={styles.statRow}>
              <Icon name={IconNames.TrendingDown} size={16} color={colors.gray} />
              <Text style={[styles.statLabel, { color: colors.gray }]}>Gebühren</Text>
            </View>
            <Text variant="h3" style={styles.statValue}>€{totalFees.toFixed(2)}</Text>
          </Card>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Icon name={IconNames.Search} size={20} color="#9CA3AF" style={styles.searchIcon} />
          <Input
            placeholder="Suche nach Transaktionen..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>

        {/* Filters */}
        <Card style={styles.filterCard}>
            <View style={styles.filterHeader}>
            <Icon name={IconNames.Filter} size={16} color={colors.gray} />
            <Text variant="h3" style={{ marginLeft: 8 }}>Filter</Text>
          </View>
          <View style={styles.filterGrid}>
            <View>
              <Text style={styles.filterLabel}>Typ</Text>
              <Picker
                selectedValue={filterType}
                onValueChange={setFilterType}
                items={[
                  { label: "Alle", value: "all" },
                  { label: "Zahlungen", value: "payment" },
                  { label: "Auszahlungen", value: "payout" },
                  { label: "Rückerstattungen", value: "refund" },
                  { label: "Gebühren", value: "fee" },
                ]}
              />
            </View>
            <View>
              <Text style={styles.filterLabel}>Status</Text>
              <Picker
                selectedValue={filterStatus}
                onValueChange={setFilterStatus}
                items={[
                  { label: "Alle", value: "all" },
                  { label: "Abgeschlossen", value: "completed" },
                  { label: "Ausstehend", value: "pending" },
                  { label: "Fehlgeschlagen", value: "failed" },
                ]}
              />
            </View>
          </View>
        </Card>

        {/* Transactions List */}
        <View style={styles.listSection}>
          <Text variant="h3" style={styles.listTitle}>
            {filteredTransactions.length} Transaktionen
          </Text>

          {filteredTransactions.length === 0 ? (
            <Card style={styles.noResultsCard}>
              <View style={styles.noResultsIconContainer}>
                <Icon name={IconNames.Search} size={24} color="#9CA3AF" />
              </View>
              <Text style={styles.noResultsText}>Keine Transaktionen gefunden</Text>
            </Card>
          ) : (
            filteredTransactions.map((transaction: Txn) => {
              const statusConfig = getStatusConfig(transaction.status as TxnStatus);
              const typeConfig = getTypeConfig(transaction.type as TxnType);
              
              return (
                <Card key={transaction.id} style={styles.transactionCard}>
                  <View style={styles.transactionRow}>
                    <View style={styles.transactionDetails}>
                      <Text variant="h3" numberOfLines={1} style={styles.descriptionText}>
                        {transaction.description}
                      </Text>

                      {transaction.client && (
                        <Text style={styles.clientText}>
                          {transaction.client}
                        </Text>
                      )}

                      <View style={styles.dateRow}>
                        <Icon name={IconNames.Calendar} size={12} color="#6B7280" />
                        <Text style={[styles.dateTimeText, { marginLeft: 6 }]}>
                          {transaction.date} • {transaction.time}
                        </Text>
                      </View>

                      <View style={styles.statusTypeRow}>
                        <Badge
                          style={{
                            backgroundColor: statusConfig.backgroundColor,
                            borderColor: statusConfig.borderColor,
                            borderWidth: 1,
                          }}
                          textStyle={{ color: statusConfig.textColor }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Icon name={statusConfig.icon} size={12} color={statusConfig.textColor} />
                            <Text style={{ marginLeft: 4, color: statusConfig.textColor }}>{statusConfig.label}</Text>
                          </View>
                        </Badge>
                        <Text style={[styles.typeText, { color: typeConfig.color }]}>
                          {typeConfig.label}
                        </Text>
                      </View>

                      {transaction.reference && (
                        <Text style={styles.refText}>
                          Ref: {transaction.reference}
                        </Text>
                      )}
                    </View>

                    <View style={styles.amountContainer}>
                      <Text
                        variant="h3"
                        style={[
                          styles.amountText,
                          {
                            color:
                              transaction.amount >= 0
                                ? colors.green
                                : '#1F2937', // text-gray-900 for negative/neutral
                          },
                        ]}
                      >
                        {transaction.amount >= 0 ? "+" : ""}€
                        {Math.abs(transaction.amount).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </Card>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// --- Stylesheet for React Native ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  // Header styles
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop: 16, // Use Safe Area View padding or custom offset if needed
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    // gap not supported in RN types; use margins on children instead
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
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
    padding: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  // Search
  searchContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 1,
  },
  searchInput: {
    paddingLeft: 40, // Ensure text starts after the icon
  },
  // Filters
  filterCard: {
    padding: 16,
    marginBottom: 16,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterGrid: {
    flexDirection: 'row',
  },
  filterLabel: {
    fontSize: 12,
    color: '#4B5563',
    marginBottom: 6,
  },
  // Transactions List
  listSection: {
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  transactionCard: {
    padding: 16,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  transactionDetails: {
    flex: 1,
    minWidth: 0,
  },
  descriptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  clientText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dateTimeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  refText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  amountContainer: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  amountText: {
    fontSize: 18,
    fontWeight: '700',
  },
  // No Results
  noResultsCard: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  noResultsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  noResultsText: {
    color: '#6B7280',
    fontSize: 16,
  }
});
