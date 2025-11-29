import React, { useState, useMemo } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  Clipboard,
  Pressable,
} from "react-native";

// Reusable components (assumed, based on previous refactoring)
import Text from '../../components/Text';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Badge from '../../components/badge';
import Icon from '../../components/Icon'; 
import AlertModal from '../../components/AlertModal';
import ActionSheet from '../../components/ActionSheet';
// Tabs removed, using local header chips

// Mock React Navigation hook
const useNavigation = () => ({
  goBack: () => console.log('Navigating back...'),
  navigate: (screen: string, params?: any) => console.log(`Navigating to ${screen} with`, params),
});

// Mock for displaying notifications in React Native
const toast = {
  success: (message: string) => console.log(`TOAST SUCCESS: ${message}`),
  error: (message: string) => console.log(`TOAST ERROR: ${message}`),
};

// --- Config & Types ---
const IconNames = {
  ArrowLeft: 'chevron-left',
  Plus: 'plus',
  MoreVertical: 'more-vertical',
  Edit: 'edit',
  Trash2: 'trash-2',
  Copy: 'copy',
  Eye: 'eye',
  EyeOff: 'eye-off',
  TrendingUp: 'trending-up',
  Calendar: 'calendar',
  Users: 'users',
  Percent: 'percent',
  Info: 'info',
};

const colors = {
  primary: '#8B4513',
  green: '#22C55E',
  blue: '#3B82F6',
  amber: '#F59E0B',
  purple: '#9333EA',
  gray: '#6B7280',
  darkGray: '#1F2937',
  lightGray: '#E5E7EB',
  lightGreen: '#F0FFF4',
  lightBlue: '#F5F7FF',
  lightAmber: '#FFFBEA',
  lightPurple: '#FAF5FF',
  red: '#EF4444',
};

type Voucher = {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  discount: number;
  minSpend?: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  usedCount: number;
  status: "active" | "scheduled" | "expired";
  services?: string[];
  newCustomersOnly: boolean;
};

const mockVouchers: Voucher[] = [
  // ... (Mock data remains unchanged)
  {
    id: "1",
    code: "WINTER25",
    type: "percentage",
    discount: 25,
    maxDiscount: 50,
    minSpend: 80,
    validFrom: "01.12.2025",
    validUntil: "31.12.2025",
    usageLimit: 100,
    usedCount: 42,
    status: "active",
    newCustomersOnly: false,
  },
  {
    id: "2",
    code: "NEUKUNDE20",
    type: "percentage",
    discount: 20,
    minSpend: 50,
    validFrom: "01.11.2025",
    validUntil: "31.01.2026",
    usageLimit: 50,
    usedCount: 18,
    status: "active",
    newCustomersOnly: true,
  },
  {
    id: "3",
    code: "BOXBRAIDS10",
    type: "fixed",
    discount: 10,
    validFrom: "15.12.2025",
    validUntil: "15.01.2026",
    usageLimit: 30,
    usedCount: 0,
    status: "scheduled",
    services: ["Box Braids"],
    newCustomersOnly: false,
  },
  {
    id: "4",
    code: "SUMMER50",
    type: "percentage",
    discount: 50,
    maxDiscount: 100,
    validFrom: "01.06.2025",
    validUntil: "31.08.2025",
    usageLimit: 200,
    usedCount: 187,
    status: "expired",
    newCustomersOnly: false,
  },
];


// --- Helper Functions Refactored for RN Styles ---

const getStatusConfig = (status: Voucher["status"]) => {
  switch (status) {
    case "active":
      return {
        label: "Aktiv",
        backgroundColor: colors.lightGreen,
        textColor: colors.green,
        borderColor: '#B7F1C9', // green-200
      };
    case "scheduled":
      return {
        label: "Geplant",
        backgroundColor: colors.lightBlue,
        textColor: colors.blue,
        borderColor: '#BFDBFE', // blue-200
      };
    case "expired":
      return {
        label: "Abgelaufen",
        backgroundColor: colors.lightGray,
        textColor: colors.gray,
        borderColor: '#D1D5DB', // gray-200
      };
  }
};

export function VouchersManagementScreen() {
  const navigation = useNavigation();
  const [vouchers] = useState<Voucher[]>(mockVouchers);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [voucherToDelete, setVoucherToDelete] = useState<Voucher | null>(null);
  const [activeTab, setActiveTab] = useState("active");
  const [actionSheetVoucher, setActionSheetVoucher] = useState<Voucher | null>(null);

  // --- Filtering Logic ---
  const filteredVouchers = useMemo(() => {
    return vouchers.filter((v) => {
      if (activeTab === "active") return v.status === "active";
      if (activeTab === "scheduled") return v.status === "scheduled";
      if (activeTab === "expired") return v.status === "expired";
      return false;
    });
  }, [vouchers, activeTab]);

  // --- Stats Calculation (Can remain the same) ---
  const stats = useMemo(() => ({
    totalVouchers: vouchers.length,
    activeVouchers: vouchers.filter((v) => v.status === "active").length,
    totalRedemptions: vouchers.reduce((sum, v) => sum + v.usedCount, 0),
    // Simplified average discount calculation
    avgDiscount: Math.round(
      vouchers.reduce((sum, v) => sum + (v.type === "percentage" ? v.discount : 0), 0) /
        (vouchers.filter((v) => v.type === "percentage").length || 1)
    ),
  }), [vouchers]);

  // --- Handlers ---
  const handleCopyCode = async (code: string) => {
    // Use RN Clipboard API
    Clipboard.setString(code);
    toast.success("Code kopiert!");
  };

  const handleDelete = () => {
    // Logic to delete voucher
    toast.success("Gutschein gelöscht");
    setDeleteDialogOpen(false);
    setVoucherToDelete(null);
    // Note: In a real app, you'd update the `vouchers` state here.
  };

  const handleToggleStatus = (voucherId: string, currentStatus: Voucher["status"]) => {
    // Logic to toggle status (e.g., active <-> scheduled/inactive)
    const newStatus = currentStatus === "active" ? "expired" : "active";
    toast.success(`Gutscheinstatus auf ${newStatus} aktualisiert`);
    setActionSheetVoucher(null);
    // Note: In a real app, you'd update the `vouchers` state here.
  };

  // --- Action Sheet Options ---
  const actionSheetOptions: { label: string; icon: string; onPress: () => void; isDestructive?: boolean }[] = useMemo(() => {
    if (!actionSheetVoucher) return [];
    const voucher = actionSheetVoucher;

    const options: { label: string; icon: string; onPress: () => void; isDestructive?: boolean }[] = [
      {
        label: "Bearbeiten",
        icon: IconNames.Edit,
        onPress: () => navigation.navigate("VoucherEdit", { id: voucher.id }),
      },
      {
        label: "Code kopieren",
        icon: IconNames.Copy,
        onPress: () => handleCopyCode(voucher.code),
      },
    ];
    
    // Conditional Status Toggle
    if (voucher.status === "active") {
      options.push({
        label: "Deaktivieren",
        icon: IconNames.EyeOff,
        onPress: () => handleToggleStatus(voucher.id, voucher.status),
      });
    } else if (voucher.status === "scheduled") {
      options.push({
        label: "Jetzt aktivieren",
        icon: IconNames.Eye,
        onPress: () => handleToggleStatus(voucher.id, voucher.status),
      });
    }

    // Delete Option (always available but destructive)
    options.push({
      label: "Löschen",
      icon: IconNames.Trash2,
      isDestructive: true,
      onPress: () => {
        setVoucherToDelete(voucher);
        setDeleteDialogOpen(true);
      },
    });

    return options;
  }, [actionSheetVoucher]);


  const tabData = [
    { value: "active", label: `Aktiv (${vouchers.filter((v) => v.status === "active").length})` },
    { value: "scheduled", label: `Geplant (${vouchers.filter((v) => v.status === "scheduled").length})` },
    { value: "expired", label: `Abgelaufen (${vouchers.filter((v) => v.status === "expired").length})` },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTitleRow}>
            <Button
              variant="ghost"
              size="icon"
              onPress={() => navigation.goBack()}
            >
              <Icon name={IconNames.ArrowLeft} size={20} color="#1F2937" />
            </Button>
            <Text variant="h2" style={styles.headerTitle}>Gutscheine</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Stats */}
        <View style={styles.statsGrid}>
          {/* Active Codes */}
          <Card style={styles.statCard}>
            <View style={styles.statRow}>
              <Icon name={IconNames.Percent} size={16} color={colors.primary} />
              <Text style={[styles.statLabel, { color: colors.primary }]}>Aktive Codes</Text>
            </View>
            <Text style={styles.statValue}>{stats.activeVouchers}</Text>
          </Card>
          
          {/* Redemptions */}
          <Card style={styles.statCard}>
            <View style={styles.statRow}>
              <Icon name={IconNames.Users} size={16} color={colors.green} />
              <Text style={[styles.statLabel, { color: colors.green }]}>Einlösungen</Text>
            </View>
            <Text style={styles.statValue}>{stats.totalRedemptions}</Text>
          </Card>
        </View>

        {/* Create Button */}
        <Button
          onPress={() => navigation.navigate("VoucherCreate")}
          style={styles.createButton}
        >
          <Icon name={IconNames.Plus} size={20} color="#fff" style={{ marginRight: 8 }} />
          Neuen Gutschein erstellen
        </Button>

        {/* Tabs */}
        <View style={styles.tabs}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {tabData.map((t) => (
              <Pressable
                key={t.value}
                onPress={() => setActiveTab(t.value)}
                style={[styles.tabChip, activeTab === t.value ? styles.tabChipActive : null]}
              >
                <Text style={[styles.tabChipLabel, activeTab === t.value ? styles.tabChipLabelActive : null]}>{t.label}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.tabContent}>
            {filteredVouchers.length === 0 ? (
              <Card style={styles.emptyCard}>
                <View style={styles.emptyIconContainer}>
                  <Icon name={IconNames.Percent} size={32} color="#9CA3AF" />
                </View>
                <Text style={styles.emptyTitle}>Keine Gutscheine</Text>
                <Text style={styles.emptySubtitle}>
                  {activeTab === "active" && "Du hast keine aktiven Gutscheine."}
                  {activeTab === "scheduled" && "Du hast keine geplanten Gutscheine."}
                  {activeTab === "expired" && "Du hast keine abgelaufenen Gutscheine."}
                </Text>
              </Card>
            ) : (
              <View style={styles.voucherList}>
                {filteredVouchers.map((voucher) => {
                  const usagePercentage = (voucher.usedCount / voucher.usageLimit) * 100;
                  const { label, backgroundColor, textColor, borderColor } = getStatusConfig(voucher.status);
                  
                  // Check if expiring soon (Web's Date logic ported to JS Date objects)
                  const today = new Date();
                  const validUntilDate = new Date(voucher.validUntil.split(".").reverse().join("-"));
                  const isExpiringSoon = 
                    voucher.status === "active" &&
                    validUntilDate.getTime() < today.getTime() + 7 * 24 * 60 * 60 * 1000;

                  return (
                    <Card key={voucher.id} style={styles.voucherCard}>
                      <View style={styles.voucherHeader}>
                        <View style={styles.voucherCodeSection}>
                          <View style={styles.codeCopyRow}>
                            <Text style={styles.voucherCodeText}>{voucher.code}</Text>
                            <TouchableOpacity onPress={() => handleCopyCode(voucher.code)} style={styles.copyButton}>
                              <Icon name={IconNames.Copy} size={16} color="#9CA3AF" />
                            </TouchableOpacity>
                          </View>
                          
                          <View style={styles.voucherBadgeRow}>
                            <Badge
                              label={label}
                              backgroundColor={backgroundColor}
                              textColor={textColor}
                              borderColor={borderColor}
                            />
                            {voucher.newCustomersOnly && (
                              <Badge
                                label="Nur Neukunden"
                                backgroundColor={colors.lightPurple}
                                textColor={colors.purple}
                                borderColor={'#DDA0DD'} // purple-200
                              />
                            )}
                            {isExpiringSoon && (
                              <Badge
                                label="Läuft bald ab"
                                backgroundColor={colors.lightAmber}
                                textColor={colors.amber}
                                borderColor={'#FDE68A'} // amber-200
                              />
                            )}
                          </View>

                          <Text style={styles.discountText}>
                            {voucher.type === "percentage"
                              ? `${voucher.discount}% Rabatt`
                              : `€${voucher.discount} Rabatt`}
                            {voucher.maxDiscount &&
                              ` (max. €${voucher.maxDiscount})`}
                          </Text>

                          {voucher.minSpend && (
                            <Text style={styles.voucherDetailText}>
                              Mindestbestellwert: €{voucher.minSpend}
                            </Text>
                          )}
                          {voucher.services && (
                            <Text style={styles.voucherDetailText}>
                              Nur für: {voucher.services.join(", ")}
                            </Text>
                          )}

                          <View style={styles.dateRow}>
                            <Icon name={IconNames.Calendar} size={12} color={colors.gray} />
                            <Text style={styles.dateText}>
                              {voucher.validFrom} - {voucher.validUntil}
                            </Text>
                          </View>
                        </View>
                        
                        {/* Dropdown Menu Trigger */}
                        <TouchableOpacity 
                          onPress={() => setActionSheetVoucher(voucher)} 
                          style={styles.moreButton}
                        >
                          <Icon name={IconNames.MoreVertical} size={20} color="#1F2937" />
                        </TouchableOpacity>
                      </View>

                      {/* Usage Progress */}
                      <View style={styles.usageSection}>
                        <View style={styles.usageRow}>
                          <Text style={styles.usageLabel}>Verwendung</Text>
                          <Text style={styles.usageCount}>
                            {voucher.usedCount} / {voucher.usageLimit}
                          </Text>
                        </View>
                        <View style={styles.progressBarBackground}>
                          <View 
                            style={[
                              styles.progressBarForeground, 
                              { width: `${usagePercentage}%` }
                            ]} 
                          />
                        </View>
                      </View>
                    </Card>
                  );
                })}
              </View>
            )}
          </View>
        </View>

        {/* Tips Card */}
        <Card style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>
            <Icon name={IconNames.Info} size={14} color={colors.blue} style={{ marginRight: 6 }} />
            Tipps für erfolgreiche Gutscheine
          </Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipsListItem}>• Verwende einprägsame Codes (z.B. SOMMER20, NEUKUNDE15)</Text>
            <Text style={styles.tipsListItem}>• Setze ein Mindestbestellwert für höhere Buchungen</Text>
            <Text style={styles.tipsListItem}>• Limitiere die Anzahl für Exklusivität</Text>
            <Text style={styles.tipsListItem}>• Nutze zeitlich begrenzte Angebote für Dringlichkeit</Text>
          </View>
        </Card>
      </ScrollView>

      {/* --- Modals --- */}
      
      {/* Action Sheet (DropdownMenu equivalent) */}
      {actionSheetVoucher && (
        <ActionSheet
          isVisible={!!actionSheetVoucher}
          onClose={() => setActionSheetVoucher(null)}
          options={actionSheetOptions}
          title={actionSheetVoucher.code}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertModal
        isVisible={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Gutschein löschen?"
        description="Bist du sicher, dass du diesen Gutschein löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden."
        buttons={[
          { title: "Abbrechen", onPress: () => setDeleteDialogOpen(false), variant: 'outline' },
          { title: "Löschen", onPress: handleDelete, style: { backgroundColor: colors.red } },
        ]}
      />
    </SafeAreaView>
  );
}

// --- Stylesheet for React Native ---
const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FAF9F6',
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  headerTitle: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: '600',
  },
  // ScrollView content
  scrollContent: {
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  // Stats
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    padding: 12,
  },
  statRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
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
  // Create Button
  createButton: {
    backgroundColor: colors.primary,
    height: 48,
    width: '100%',
  },
  // Tabs
  tabs: {
    marginBottom: 0,
  },
  tabChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tabChipActive: {
    backgroundColor: '#fff',
    borderColor: '#E5E7EB',
    borderWidth: 1,
  },
  tabChipLabel: {
    color: '#6B7280',
    fontSize: 12,
  },
  tabChipLabelActive: {
    color: '#1F2937',
    fontWeight: '600',
  },
  tabContent: {
    gap: 12,
    marginTop: 16,
  },
  // Empty State
  emptyCard: {
    alignItems: 'center',
    gap: 16,
    justifyContent: 'center',
    padding: 32,
  },
  emptyIconContainer: {
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    marginBottom: 8,
    width: 64,
  },
  emptyTitle: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: colors.gray,
    fontSize: 14,
    textAlign: 'center',
  },
  // Voucher List Items
  voucherList: {
    gap: 12,
  },
  voucherCard: {
    padding: 16,
  },
  voucherHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  voucherCodeSection: {
    flex: 1,
    gap: 8,
  },
  codeCopyRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  voucherCodeText: {
    color: '#1F2937',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 18,
    fontWeight: '600',
  },
  copyButton: {
    padding: 4,
  },
  voucherBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  discountText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  voucherDetailText: {
    color: '#4B5563',
    fontSize: 12,
  },
  dateRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginTop: 8,
  },
  dateText: {
    color: colors.gray,
    fontSize: 12,
  },
  moreButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    padding: 4,
    width: 32,
  },
  // Usage Progress
  usageSection: {
    marginTop: 8,
  },
  usageRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  usageLabel: {
    color: '#4B5563',
    fontSize: 12,
  },
  usageCount: {
    color: '#4B5563',
    fontSize: 12,
    fontWeight: '500',
  },
  progressBarBackground: {
    width: '100%',
    backgroundColor: '#E5E7EB', // gray-200
    borderRadius: 8,
    height: 8,
    overflow: 'hidden',
  },
  progressBarForeground: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: '100%',
  },
  // Tips Card
  tipsCard: {
    backgroundColor: colors.lightBlue,
    borderColor: '#BFDBFE',
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  tipsTitle: {
    alignItems: 'center',
    color: '#1F2937',
    flexDirection: 'row',
    fontSize: 14,
    fontWeight: '600',
  },
  tipsList: {
    gap: 6,
  },
  tipsListItem: {
    color: '#4B5563',
    fontSize: 12,
  }
});
