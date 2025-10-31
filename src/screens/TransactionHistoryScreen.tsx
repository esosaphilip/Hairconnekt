import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import type { StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
// Converted to runtime-only JavaScript: removed type-only import

// --- Constants & Theme ---
const THEME_COLOR = '#8B4513'; // Main accent color from the stats
const SPACING = 16;
const CARD_RADIUS = 8;
const GREEN_STATUS = '#059669'; // text-green-600 equivalent
const REFUND_BADGE = '#F97316'; // bg-orange-500 equivalent
const PAYMENT_BADGE = '#10B981'; // bg-green-500 equivalent

// Types
type Transaction = {
  id: number;
  type: 'payment' | 'refund';
  provider: string;
  service: string;
  amount: number;
  date: string;
  time: string;
  status: 'completed' | 'pending' | string;
  paymentMethod: string;
  transactionId: string;
  reason?: string;
  voucherApplied?: string;
  originalAmount?: number;
};

// --- Mock Data (Kept as is) ---
const transactions: { all: Transaction[] } = {
  all: [
    {
      id: 1,
      type: 'payment',
      provider: 'Aisha Mohammed',
      service: 'Box Braids',
      amount: 95,
      date: '15. Okt 2025',
      time: '14:30',
      status: 'completed',
      paymentMethod: 'Visa •••• 4242',
      transactionId: 'TXN-2025-10-15-001',
    },
    {
      id: 2,
      type: 'payment',
      provider: 'Fatima Hassan',
      service: 'Cornrows',
      amount: 65,
      date: '8. Okt 2025',
      time: '11:20',
      status: 'completed',
      paymentMethod: 'Mastercard •••• 5555',
      transactionId: 'TXN-2025-10-08-001',
    },
    {
      id: 3,
      type: 'refund',
      provider: 'Sarah Williams',
      service: 'Knotless Braids',
      amount: 105,
      date: '20. Sep 2025',
      time: '16:45',
      status: 'completed',
      paymentMethod: 'Visa •••• 4242',
      transactionId: 'TXN-2025-09-20-001',
      reason: 'Stornierung durch Kunde',
    },
    {
      id: 4,
      type: 'payment',
      provider: 'Lina Okafor',
      service: 'Senegalese Twists',
      amount: 110,
      date: '1. Okt 2025',
      time: '15:15',
      status: 'completed',
      paymentMethod: 'PayPal',
      transactionId: 'TXN-2025-10-01-001',
    },
    {
      id: 5,
      type: 'payment',
      provider: 'Amina Johnson',
      service: 'Faux Locs',
      amount: 120,
      date: '18. Sep 2025',
      time: '10:00',
      status: 'completed',
      paymentMethod: 'Visa •••• 4242',
      transactionId: 'TXN-2025-09-18-001',
      voucherApplied: 'WELCOME20',
      originalAmount: 150,
    },
  ],
};

// --- Utility Components (Replicating Shadcn/UI) ---

const CustomCard = ({ children, style }: { children?: React.ReactNode; style?: StyleProp<ViewStyle> }) => (
  <View style={[styles.card, style]}>{children}</View>
);

const CustomButton = ({ title, onPress, iconName, style, textStyle }: { title?: string; onPress?: () => void; iconName?: keyof typeof Ionicons.glyphMap; style?: StyleProp<ViewStyle>; textStyle?: StyleProp<TextStyle> }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.button, style]}
  >
    {iconName && (
      <Ionicons
        name={iconName}
        size={18}
        color={(StyleSheet.flatten(textStyle as any) as any)?.color || 'black'}
        style={{ marginRight: 8 }}
      />
    )}
    <Text style={[styles.buttonText, textStyle]}>{title}</Text>
  </TouchableOpacity>
);

const CustomBadge = ({ children, style, textStyle }: { children?: React.ReactNode | string; style?: StyleProp<ViewStyle>; textStyle?: StyleProp<TextStyle> }) => (
  <View style={[styles.badge, style]}>
    <Text style={[styles.badgeText, textStyle]}>{children}</Text>
  </View>
);

const TabButton = ({ title, active, onPress }: { title: string; active?: boolean; onPress?: () => void }) => (
  <TouchableOpacity
    style={[
      styles.tabButton,
      active ? styles.tabButtonActive : styles.tabButtonInactive,
    ]}
    onPress={onPress}
  >
    <Text
      style={[
        styles.tabButtonText,
        active ? styles.tabButtonTextActive : styles.tabButtonTextInactive,
      ]}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

// --- Transaction List Item ---

const TransactionCard = ({ transaction }: { transaction: Transaction }) => {
  const isRefund = transaction.type === 'refund';
  const amountColor = isRefund ? GREEN_STATUS : '#1F2937'; // text-gray-900

  return (
    <CustomCard style={styles.transactionCard}>
      {/* Top Section: Provider, Badge, Amount */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          {/* Provider Name and Badge */}
          <View style={styles.providerRow}>
            <Text style={styles.providerName}>{transaction.provider}</Text>
            <CustomBadge
              style={{
                backgroundColor: isRefund ? REFUND_BADGE : PAYMENT_BADGE,
                paddingHorizontal: 6,
                paddingVertical: 2,
              }}
              textStyle={{ fontSize: 11, fontWeight: '600' }}
            >
              {isRefund ? 'Rückerstattung' : 'Zahlung'}
            </CustomBadge>
          </View>
          {/* Service and Date */}
          <Text style={styles.serviceText}>{transaction.service}</Text>
          <Text style={styles.dateTimeText}>
            {transaction.date} um {transaction.time} Uhr
          </Text>
        </View>

        <View style={styles.cardHeaderRight}>
          <Text style={[styles.amountText, { color: amountColor }]}>
            {isRefund ? '+' : '-'}€{transaction.amount}
          </Text>
          {transaction.voucherApplied && (
            <Text style={styles.originalAmountText}>
              €{transaction.originalAmount}
            </Text>
          )}
        </View>
      </View>

      {/* Voucher Badge (Conditional) */}
      {transaction.voucherApplied && (
        <View style={{ marginBottom: 8 }}>
          <CustomBadge
            style={styles.voucherBadge}
            textStyle={{ color: '#4B5563', fontSize: 12 }}
          >
            Gutschein: {transaction.voucherApplied}
          </CustomBadge>
        </View>
      )}

      {/* Details Section */}
      <View style={styles.detailSection}>
        {/* Payment Method */}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Zahlungsmethode:</Text>
          <Text style={styles.detailValue}>{transaction.paymentMethod}</Text>
        </View>
        {/* Transaction ID */}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Transaktions-ID:</Text>
          <Text style={styles.detailValueSmall}>{transaction.transactionId}</Text>
        </View>
        {/* Reason (Conditional) */}
        {transaction.reason && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Grund:</Text>
            <Text style={styles.detailValue}>{transaction.reason}</Text>
          </View>
        )}
        {/* Status */}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status:</Text>
          <View style={styles.statusRow}>
            <Ionicons name="checkmark-circle" size={16} color={GREEN_STATUS} style={{ marginRight: 6 }} />
            <Text style={[styles.detailValue, { color: GREEN_STATUS }]}>
              Abgeschlossen
            </Text>
          </View>
        </View>
      </View>
    </CustomCard>
  );
};

// --- Empty State Component ---

const EmptyState = ({ title, text }: { title: string; text: string }) => (
  <View style={styles.emptyStateContainer}>
    <View style={styles.emptyStateIconWrapper}>
      <Ionicons name="close-outline" size={40} color="#9CA3AF" />
    </View>
    <Text style={styles.emptyStateTitle}>{title}</Text>
    <Text style={styles.emptyStateText}>{text}</Text>
  </View>
);

// --- Main Screen Component ---

export function TransactionHistoryScreen() {
  const navigation: any = useNavigation();
  const [activeTab, setActiveTab] = useState('all');

  const payments = transactions.all.filter((t) => t.type === 'payment');
  const refunds = transactions.all.filter((t) => t.type === 'refund');

  const totalSpent = payments.reduce((sum, t) => sum + t.amount, 0);
  const totalRefunded = refunds.reduce((sum, t) => sum + t.amount, 0);

  const handleFilter = () => {
    Alert.alert('Filter', 'Filter-Optionen werden implementiert', [{ text: 'OK' }]);
  };

  const handleTimeframe = () => {
    Alert.alert('Zeitraum', 'Kalenderfilter wird implementiert', [{ text: 'OK' }]);
  };

  const handleDownload = () => {
    Alert.alert('Download', 'Transaktionen herunterladen wird implementiert', [{ text: 'OK' }]);
  };

  const renderContent = () => {
    let listData: Transaction[] = [];
    let Empty: React.ReactNode | null = null;

    if (activeTab === 'all') {
      listData = transactions.all;
    } else if (activeTab === 'payments') {
      listData = payments;
    } else if (activeTab === 'refunds') {
      listData = refunds;
      Empty = (
        <EmptyState
          title="Keine Rückerstattungen"
          text="Du hast bisher keine Rückerstattungen erhalten."
        />
      );
    }

    if (listData.length === 0 && Empty) {
      return Empty;
    }

    return (
      <View style={styles.tabContent}>
        {listData.map((transaction: Transaction) => (
          <TransactionCard key={transaction.id} transaction={transaction} />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back-outline" size={24} color="#4B5563" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaktionshistorie</Text>
        <CustomButton
            onPress={handleDownload}
            iconName="cloud-download-outline"
            style={styles.downloadButton}
            textStyle={{ color: '#4B5563' }}
            title="" // Title is empty, icon only
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statAmountPrimary}>€{totalSpent}</Text>
            <Text style={styles.statLabel}>Gesamt ausgegeben</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statAmountSecondary}>€{totalRefunded}</Text>
            <Text style={styles.statLabel}>Rückerstattet</Text>
          </View>
        </View>

        <View style={styles.contentPadding}>
          {/* Filter Row */}
          <View style={styles.filterRow}>
            <CustomButton
              onPress={handleFilter}
              iconName="filter-outline"
              title="Filter"
              style={styles.filterButton}
              textStyle={styles.filterButtonText}
            />
            <CustomButton
              onPress={handleTimeframe}
              iconName="calendar-outline"
              title="Zeitraum"
              style={styles.filterButton}
              textStyle={styles.filterButtonText}
            />
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TabButton
              title={`Alle (${transactions.all.length})`}
              active={activeTab === 'all'}
              onPress={() => setActiveTab('all')}
            />
            <TabButton
              title={`Zahlungen (${payments.length})`}
              active={activeTab === 'payments'}
              onPress={() => setActiveTab('payments')}
            />
            <TabButton
              title={`Rückerstattungen (${refunds.length})`}
              active={activeTab === 'refunds'}
              onPress={() => setActiveTab('refunds')}
            />
          </View>

          {/* Tabs Content */}
          <View style={{ marginBottom: 40 }}>
            {renderContent()}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Stylesheet ---

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20,
    backgroundColor: '#F3F4F6', // bg-gray-50
  },
  contentPadding: {
    paddingHorizontal: SPACING,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: CARD_RADIUS,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: CARD_RADIUS,
    backgroundColor: 'white', // Default background for ghost/outline styles
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  downloadButton: {
    backgroundColor: 'transparent',
    padding: 0,
    width: 24,
    height: 24,
  },

  // Stats
  statsContainer: {
    backgroundColor: 'white',
    paddingVertical: SPACING,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#E5E7EB',
  },
  statAmountPrimary: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME_COLOR,
    marginBottom: 4,
  },
  statAmountSecondary: {
    fontSize: 24,
    fontWeight: '700',
    color: GREEN_STATUS,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#4B5563',
  },

  // Filter Row
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING,
    marginTop: SPACING,
  },
  filterButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  filterButtonText: {
    color: '#4B5563',
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: CARD_RADIUS,
    marginBottom: SPACING,
    height: 44,
  },
  tabButton: {
    flex: 1,
    borderRadius: CARD_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
  },
  tabButtonActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tabButtonInactive: {
    backgroundColor: 'transparent',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: THEME_COLOR,
  },
  tabButtonTextInactive: {
    color: '#6B7280',
  },
  tabContent: {
    // spacing between cards handled by transactionCard marginBottom
  },

  // Transaction Card Styles
  transactionCard: {
    padding: SPACING,
    marginBottom: SPACING,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flex: 1,
    paddingRight: 8,
  },
  cardHeaderRight: {
    alignItems: 'flex-end',
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 8,
  },
  serviceText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 2,
  },
  dateTimeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  amountText: {
    fontSize: 20,
    fontWeight: '700',
  },
  originalAmountText: {
    fontSize: 12,
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  voucherBadge: {
    backgroundColor: '#F3F4F6', // secondary badge color
    borderColor: '#E5E7EB',
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },

  // Details Section
  detailSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    fontSize: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'right',
  },
  detailValueSmall: {
    fontSize: 12,
    color: '#4B5563',
    textAlign: 'right',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Empty State
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateIconWrapper: {
    width: 80,
    height: 80,
    backgroundColor: '#F3F4F6',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});
