import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert, // Replaces web 'alert' and provides contextual menus
} from 'react-native';

// Replaced web imports with assumed custom/community React Native components
import { useNavigation } from '@react-navigation/native';
import Button from '../../components/Button';
import IconButton from '../../components/IconButton';
import Card from '../../components/Card';
import { Badge } from '../../components/badge';
import Icon from '../../components/Icon';
import { COLORS, SPACING, FONT_SIZES } from '../../theme/tokens';
import { providerVouchersApi } from '../../api/providerVouchers';

type Voucher = {
  id: number;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  description: string;
  validFrom: string;
  validUntil: string;
  usageLimit: number | null;
  usedCount: number;
  revenue: number;
  status: 'active' | 'expired';
  minAmount: number;
};

// --- Helpers ---
const formatDateDE = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
};

const parseDiscount = (discount: string | number | null | undefined): { type: 'percentage' | 'fixed'; value: number } => {
  if (!discount) return { type: 'fixed', value: 0 };
  const trimmed = String(discount).trim();
  if (trimmed.endsWith('%')) {
    const v = parseFloat(trimmed.replace('%', ''));
    return { type: 'percentage', value: Number.isFinite(v) ? v : 0 };
  }
  const v = parseFloat(trimmed.replace('€', '').replace(',', '.'));
  return { type: 'fixed', value: Number.isFinite(v) ? v : 0 };
};

const mapProviderVoucher = (pv: any): Voucher => {
  const { type, value } = parseDiscount(pv.discount);
  const expiresAt = pv.expiresAt ? new Date(pv.expiresAt) : undefined;
  const status = expiresAt && expiresAt.getTime() < Date.now() ? 'expired' : 'active';
  return {
    id: Number(pv.id) || 0,
    code: pv.code,
    type,
    value,
    description: pv.description || pv.title || '',
    validFrom: formatDateDE(pv.startsAt),
    validUntil: formatDateDE(pv.expiresAt),
    usageLimit: pv.usageLimit ?? null,
    usedCount: pv.usedCount ?? 0,
    revenue: (pv.revenueCents ?? 0) / 100,
    status,
    minAmount: pv.minAmount ?? 0,
  };
};

// --- Helper Components ---

const VoucherItem = ({ voucher, onCopy, onEdit, onDelete }: { voucher: Voucher; onCopy: (code: string) => void; onEdit: () => void; onDelete: () => void }) => {
  // Determine usage percentage for the progress bar
  const usagePercentage = voucher.usageLimit
    ? Math.min((voucher.usedCount / voucher.usageLimit) * 100, 100)
    : 0;
    
  // Replaces DropdownMenu with native Alert API for actions
  const showActionMenu = () => {
      Alert.alert(
          'Aktionen für Gutschein',
          `Code: ${voucher.code}`,
          [
              { text: 'Code kopieren', onPress: () => onCopy(voucher.code) },
              { text: 'Bearbeiten', onPress: onEdit },
              { text: 'Löschen', onPress: onDelete, style: 'destructive' },
              { text: 'Abbrechen', style: 'cancel' },
          ]
      );
  };

  return (
    <Card style={styles.voucherCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.voucherCode}>{voucher.code}</Text>
            <Badge
              title={voucher.status === "active" ? "Aktiv" : "Abgelaufen"}
              color={voucher.status === "active" ? "green" : "gray"}
            />
          </View>
          <Text style={styles.voucherDescription}>{voucher.description}</Text>

          {/* Discount Badge (Replicated styling) */}
          <View style={styles.discountBadge}>
            <Icon name="tag" size={16} color={COLORS.red} />
            <Text style={styles.discountText}>
              {voucher.type === "percentage"
                ? `${voucher.value}% Rabatt`
                : `€${voucher.value} Rabatt`}
            </Text>
          </View>
        </View>

        {/* More Options Button (Replaces DropdownMenuTrigger) */}
        <IconButton name="more-vertical" onPress={showActionMenu} style={{ marginTop: -SPACING.sm }} />
      </View>

      {/* Details */}
      <View style={styles.detailGrid}>
        <View>
          <Text style={styles.detailLabel}>Gültigkeitszeitraum</Text>
          <View style={styles.detailRow}>
            <Icon name="calendar" size={12} color={COLORS.textSecondary} />
            <Text style={styles.detailValue}>
              {voucher.validFrom} - {voucher.validUntil}
            </Text>
          </View>
        </View>
        <View>
          <Text style={styles.detailLabel}>Min. Bestellwert</Text>
          <Text style={styles.detailValue}>€{voucher.minAmount}</Text>
        </View>
      </View>

      {/* Usage Progress */}
      <View style={styles.usageContainer}>
        <View style={styles.usageTextRow}>
          <Text style={styles.usageLabel}>Verwendung</Text>
          <Text style={styles.usageCount}>
            {voucher.usedCount}
            {voucher.usageLimit && ` / ${voucher.usageLimit}`} mal
          </Text>
        </View>
        {voucher.usageLimit && (
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${usagePercentage}%` },
              ]}
            />
          </View>
        )}
      </View>

      {/* Revenue */}
      <View style={styles.revenueRow}>
        <Text style={styles.revenueLabel}>Generierter Umsatz</Text>
        <Text style={styles.revenueValue}>
          €{voucher.revenue.toLocaleString('de-DE')}
        </Text>
      </View>

      {/* Copy Button (Redundancy, consistent with web) */}
      <Button
        title="Code kopieren"
        variant="outline"
        icon="copy"
        onPress={() => onCopy(voucher.code)}
        style={styles.copyButton}
      />
    </Card>
  );
};

// --- Main Component ---
export function ProviderVouchersScreen() {
  const navigation = useNavigation<any>();
  const [filter, setFilter] = useState("active");
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchVouchers = async () => {
      setLoading(true);
      setError(null);
      try {
        const { items } = await providerVouchersApi.list();
        const mapped = items.map(mapProviderVoucher);
        if (!cancelled) setVouchers(mapped);
      } catch (e) {
        if (!cancelled) setError((e as any)?.message ?? 'Fehler beim Laden der Gutscheine');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchVouchers();
    return () => { cancelled = true; };
  }, []);

  const filteredVouchers = useMemo(() => {
    if (filter === 'active') return vouchers.filter(v => v.status === 'active');
    if (filter === 'expired') return vouchers.filter(v => v.status === 'expired');
    return vouchers;
  }, [filter, vouchers]);

  const activeVouchers = useMemo(() => vouchers.filter(v => v.status === 'active').length, [vouchers]);
  const totalUsage = useMemo(() => vouchers.reduce((sum, v) => sum + v.usedCount, 0), [vouchers]);
  const totalRevenue = useMemo(() => vouchers.reduce((sum, v) => sum + v.revenue, 0), [vouchers]);

  // Replaces web clipboard and alert
  const handleCopyCode = (code: string) => {
    // Clipboard.setString(code); // Implement with '@react-native-clipboard/clipboard' if available
    Alert.alert("Kopiert", `Code "${code}" kopiert!`);
  };
  
  const handleEdit = (id: number) => {
      navigation.navigate("CreateEditVoucherScreen", { id });
  };
  
  const handleDelete = (id: number) => {
      (async () => {
        try {
          setLoading(true);
          await providerVouchersApi.remove(String(id));
          const { items } = await providerVouchersApi.list();
          const mapped = items.map(mapProviderVoucher);
          setVouchers(mapped);
        } catch (e) {
          const msg = (e as any)?.response?.data?.message || (e as any)?.message || 'Löschen fehlgeschlagen';
          Alert.alert('Fehler', String(msg));
        } finally {
          setLoading(false);
        }
      })();
  };

  const renderVoucherItem = ({ item }: { item: Voucher }) => (
    <VoucherItem
      voucher={item}
      onCopy={handleCopyCode}
      onEdit={() => handleEdit(item.id)}
      onDelete={() => handleDelete(item.id)}
    />
  );
  
  // Header component for the FlatList (including stats and filters)
  const ListHeader = () => (
      <View style={{ paddingHorizontal: SPACING.md }}>
          {/* Stats */}
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <View style={styles.statRow}>
                <Icon name="gift" size={16} color={COLORS.primary} />
                <Text style={styles.statLabel}>Aktiv</Text>
              </View>
              <Text style={styles.statValue}>{activeVouchers}</Text>
            </Card>

            <Card style={styles.statCard}>
              <View style={styles.statRow}>
                <Icon name="users" size={16} color={COLORS.infoText} />
                <Text style={styles.statLabel}>Verwendet</Text>
              </View>
              <Text style={styles.statValue}>{totalUsage}</Text>
            </Card>

            <Card style={styles.statCard}>
              <View style={styles.statRow}>
                <Icon name="trending-up" size={16} color={COLORS.success} />
                <Text style={styles.statLabel}>Umsatz</Text>
              </View>
              <Text style={styles.statValue}>€{totalRevenue.toLocaleString('de-DE')}</Text>
            </Card>
          </View>

          {/* Filter */}
          <View style={styles.filterContainer}>
            <Button
              title="Alle"
              size="sm"
              variant={filter === "all" ? "default" : "outline"}
              onPress={() => setFilter("all")}
              style={filter === "all" ? styles.activeButton : styles.inactiveButton}
            />
            <Button
              title={`Aktiv (${activeVouchers})`}
              size="sm"
              variant={filter === "active" ? "default" : "outline"}
              onPress={() => setFilter("active")}
              style={filter === "active" ? styles.activeButton : styles.inactiveButton}
            />
            <Button
              title="Abgelaufen"
              size="sm"
              variant={filter === "expired" ? "default" : "outline"}
              onPress={() => setFilter("expired")}
              style={filter === "expired" ? styles.activeButton : styles.inactiveButton}
            />
          </View>
      </View>
  );

  // Empty State Component
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
        <Icon name="gift" size={64} color={COLORS.border} style={styles.emptyIcon} />
        <Text style={styles.emptyTitle}>Keine Gutscheine gefunden</Text>
        <Text style={styles.emptySubtitle}>
            {filter === "all"
                ? "Erstelle deinen ersten Gutschein"
                : `Keine ${filter === "active" ? "aktiven" : "abgelaufenen"} Gutscheine`}
        </Text>
        <Button
          title="Gutschein erstellen"
          icon="plus"
          onPress={() => navigation.navigate("CreateEditVoucherScreen")}
          style={{ backgroundColor: COLORS.primary, marginTop: SPACING.md }}
        />
    </View>
  );

  // List Footer Component (Info Card)
  const ListFooter = () => null;

  return (
    <SafeAreaView style={styles.flexContainer}>
      {/* Header (Always Visible) */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <IconButton name="arrow-left" onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Gutscheine & Angebote</Text>
          <Button
            title="Neu"
            size="sm"
            icon="plus"
            onPress={() => navigation.navigate("CreateEditVoucherScreen")}
            style={{ backgroundColor: COLORS.primary }}
          />
        </View>
        {error && (
          <Text style={{ color: COLORS.red, marginTop: SPACING.xs }}>{error}</Text>
        )}
      </View>

      <FlatList
        data={filteredVouchers}
        renderItem={renderVoucherItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={EmptyState}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={() => {
          // Manual refresh
          (async () => {
            setLoading(true);
            setError(null);
            try {
              const { items } = await providerVouchersApi.list();
              const mapped = items.map(mapProviderVoucher);
              setVouchers(mapped);
            } catch (e) {
              setError((e as any)?.message ?? 'Fehler beim Laden der Gutscheine');
            } finally {
              setLoading(false);
            }
          })();
        }}
      />
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
    paddingTop: SPACING.sm || 8,
    paddingBottom: SPACING.xs, // Reduced padding as filters are now in ListHeader
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
  // --- List Content & Structure ---
  listContent: {
    paddingBottom: SPACING.lg || 24,
    paddingHorizontal: SPACING.md,
  },
  // --- Stats Grid ---
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginVertical: SPACING.md,
  },
  statCard: {
    flex: 1,
    padding: SPACING.sm,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs / 2,
  },
  statLabel: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.textSecondary || '#6B7280',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  // --- Filter Buttons ---
  filterContainer: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  activeButton: {
    backgroundColor: COLORS.primary || '#8B4513',
    borderColor: COLORS.primary || '#8B4513',
  },
  inactiveButton: {
    borderColor: COLORS.border || '#E5E7EB',
  },
  // --- Voucher Card Styles ---
  voucherCard: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  cardInfo: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  voucherCode: {
    fontSize: FONT_SIZES.h5 || 16,
    fontWeight: 'bold',
  },
  voucherDescription: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.textSecondary || '#6B7280',
    marginBottom: SPACING.sm,
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    backgroundColor: COLORS.red + '1A', // #FF6B6B with 10% opacity
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
  },
  discountText: {
    color: COLORS.red || '#FF6B6B',
    fontSize: FONT_SIZES.body,
    fontWeight: '500',
  },
  // --- Details ---
  detailGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
    marginBottom: SPACING.md,
    fontSize: FONT_SIZES.body,
  },
  detailLabel: {
    color: COLORS.textSecondary || '#6B7280',
    fontSize: FONT_SIZES.small || 12,
    marginBottom: SPACING.xs / 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs / 2,
  },
  detailValue: {
    fontSize: FONT_SIZES.body || 14,
    fontWeight: '500',
  },
  // --- Usage Progress ---
  usageContainer: {
    marginBottom: SPACING.md,
  },
  usageTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: FONT_SIZES.small || 12,
    marginBottom: SPACING.xs / 2,
  },
  usageLabel: {
    color: COLORS.textSecondary || '#6B7280',
    fontSize: FONT_SIZES.small || 12,
  },
  usageCount: {
    fontSize: FONT_SIZES.small || 12,
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.border || '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary || '#8B4513',
  },
  // --- Revenue & Footer Button ---
  revenueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  revenueLabel: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.textSecondary || '#6B7280',
  },
  revenueValue: {
    fontSize: FONT_SIZES.body || 14,
    fontWeight: '600',
    color: COLORS.success || '#10B981',
  },
  copyButton: {
    width: '100%',
    height: 36,
    marginTop: SPACING.xs,
  },
  // --- Info Card ---
  infoCard: {
    padding: SPACING.md,
    marginTop: SPACING.md,
    backgroundColor: COLORS.infoBg || '#EFF6FF', // blue-50
    borderColor: COLORS.infoBorder || '#DBEAFE', // blue-200
    borderWidth: 1,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: FONT_SIZES.h5 || 16,
    fontWeight: '600',
    color: COLORS.infoText || '#1E40AF', // blue-900
    marginBottom: SPACING.xs,
  },
  infoText: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.infoTextDark || '#374151', // blue-800
  },
  // --- Empty State ---
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
});
