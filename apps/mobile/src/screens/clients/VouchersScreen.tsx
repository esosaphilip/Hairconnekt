/* @ts-nocheck */
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import type { StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { vouchersApi, BackendActiveVoucher, BackendUsedVoucher } from '@/services/vouchers';

// --- Custom Components/Styling (Replicating UI/shadcn components) ---

const THEME_COLOR = '#8B4513';
const SPACING = 16;
const CARD_RADIUS = 8;

// Replicating 'Card' and 'Badge' styling using View and Text
const CustomCard: React.FC<{
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}> = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

const CustomButton: React.FC<{
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}> = ({ title, onPress, disabled, style }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={[styles.button, { opacity: disabled ? 0.6 : 1 }, style]}
  >
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const CustomBadge: React.FC<{
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}> = ({ children, style, textStyle }) => (
  <View style={[styles.badge, style]}>
    <Text style={[styles.badgeText, textStyle]}>{children}</Text>
  </View>
);

// --- Tabs Logic ---
const TabButton: React.FC<{
  title: string;
  active?: boolean;
  onPress?: () => void;
}> = ({ title, active = false, onPress }) => (
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

// --- Main Component ---

export function VouchersScreen() {
  const navigation = useNavigation();
  // Simple toast shim using Alert as a fallback
  type ToastParams = {
    type: string;
    text1: string;
    text2?: string;
    position?: string;
  };
  const toast = {
    show: ({ type, text1, text2, position }: ToastParams) => {
      const title = typeof text1 === 'string' ? text1 : String(text1 ?? 'Hinweis');
      const message = typeof text2 === 'string' ? text2 : String(text2 ?? '');
      Alert.alert(title, message);
    },
  };
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'active' | 'used'>('active'); // State for Tabs
  const [vouchers, setVouchers] = useState<(BackendActiveVoucher | BackendUsedVoucher)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchVouchers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await vouchersApi.list(activeTab);
        if (isMounted) {
          setVouchers(data.items);
        }
      } catch (err) {
        if (isMounted) {
          const msg = (err as Error)?.message || 'Failed to fetch vouchers';
          setError(msg);
        }
      }
      if (isMounted) {
        setLoading(false);
      }
    };

    fetchVouchers();

    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  async function copyToClipboard(text: string): Promise<boolean> {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && (navigator as any).clipboard?.writeText) {
        await (navigator as any).clipboard.writeText(text);
        return true;
      }
      // Try Expo Clipboard if available
      let ClipboardMod: any = null;
      try {
        ClipboardMod = require('expo-clipboard');
      } catch {}
      if (ClipboardMod?.setStringAsync) {
        await ClipboardMod.setStringAsync(text);
        return true;
      }
    } catch {}
    return false;
  }

  const handleCopyCode = async (code: string, id: string) => {
    try {
      const ok = await copyToClipboard(code);
      if (!ok) throw new Error('Clipboard not available');
      setCopiedId(id);
      toast.show({
        type: 'success',
        text1: 'Code kopiert!',
        text2: '',
        position: 'bottom',
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast.show({
        type: 'error',
        text1: 'Kopieren fehlgeschlagen.',
        text2: 'Bitte manuell kopieren.',
        position: 'bottom',
      });
    }
  };

  const handleRedeemCode = async () => {
    if (promoCode.trim()) {
      try {
        await vouchersApi.redeem(promoCode.trim());
        Alert.alert('Success', 'Voucher redeemed successfully');
        setPromoCode('');
        // Refresh the list of vouchers
        const data = await vouchersApi.list(activeTab);
        setVouchers(data.items);
      } catch (err) {
        const message = (err as Error)?.message || 'Failed to redeem voucher';
        Alert.alert('Error', message);
      }
    }
  };

  const ActiveVoucherItem: React.FC<{ voucher: BackendActiveVoucher }> = ({ voucher }) => (
    <CustomCard
      style={{
        padding: SPACING,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: THEME_COLOR,
        backgroundColor: '#FFF8E1', // from-amber-50 equivalent
      }}
    >
      <View style={styles.voucherHeader}>
        <View style={{ flex: 1 }}>
          <View style={styles.titleContainer}>
            <Ionicons name="gift-outline" size={20} color={THEME_COLOR} />
            <Text style={styles.voucherTitle}>{voucher.title}</Text>
          </View>
          <Text style={styles.voucherDescription}>{voucher.description}</Text>
        </View>
        <CustomBadge
          style={{ backgroundColor: THEME_COLOR, paddingHorizontal: 12 }}
          textStyle={{ fontSize: 18, fontWeight: '700' }}
        >
          {voucher.discount}
        </CustomBadge>
      </View>

      {/* Voucher Code */}
      <View style={styles.codeBox}>
        <View>
          <Text style={styles.codeLabel}>Code:</Text>
          <Text style={styles.codeText}>{voucher.code}</Text>
        </View>
        <TouchableOpacity
          style={styles.copyButton}
          onPress={() => handleCopyCode(voucher.code, voucher.id)}
        >
          {copiedId === voucher.id ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="checkmark-outline" size={18} color="#059669" />
              <Text style={styles.copiedText}>Kopiert</Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="copy-outline" size={18} color="#4B5563" />
              <Text style={styles.copyText}>Kopieren</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Details */}
      <View style={styles.detailItem}>
        <Ionicons name="pricetag-outline" size={16} color="#4B5563" />
        <Text style={styles.detailText}>
          Mindestbetrag: €{voucher.minAmount}
        </Text>
      </View>
      <View style={styles.detailItem}>
        <Ionicons name="calendar-outline" size={16} color="#4B5563" />
        <Text style={styles.detailText}>
          Gültig bis: {new Date(voucher.expiresAt).toLocaleDateString('de-DE')}
        </Text>
      </View>
      <View style={styles.detailItem}>
        <Ionicons name="gift-outline" size={16} color="#4B5563" />
        <Text style={styles.detailText}>
          Anwendbar auf: {voucher.applicableTo}
        </Text>
      </View>
    </CustomCard>
  );

  const UsedVoucherItem: React.FC<{ voucher: BackendUsedVoucher }> = ({ voucher }) => (
    <CustomCard style={{ padding: SPACING, backgroundColor: '#F9FAFB' }}>
      <View style={styles.voucherHeader}>
        <View style={{ flex: 1 }}>
          <View style={styles.titleContainer}>
            <Ionicons name="gift-outline" size={20} color="#9CA3AF" />
            <Text style={[styles.voucherTitle, { color: '#4B5563' }]}>
              {voucher.title}
            </Text>
          </View>
          <Text style={[styles.voucherDescription, { color: '#6B7280' }]}>
            {voucher.description}
          </Text>
        </View>
        <CustomBadge
          style={{ backgroundColor: '#E5E7EB' }}
          textStyle={{ color: '#4B5563', fontWeight: '600' }}
        >
          Verwendet
        </CustomBadge>
      </View>

      <View style={styles.usedDetail}>
        <Text style={styles.usedDateText}>
          Verwendet am {new Date(voucher.usedAt).toLocaleDateString('de-DE')}
        </Text>
        <Text style={styles.savedAmountText}>
          Gespart: {voucher.savedAmount}
        </Text>
      </View>
    </CustomCard>
  );

  const EmptyState: React.FC<{ title: string; text: string }> = ({ title, text }) => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyStateIconWrapper}>
        <Ionicons name="gift-outline" size={40} color="#9CA3AF" />
      </View>
      <Text style={styles.emptyStateTitle}>{title}</Text>
      <Text style={styles.emptyStateText}>{text}</Text>
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color={THEME_COLOR} style={{ marginTop: 40 }} />;
    }

    if (error) {
      return <EmptyState title="Error" text={error} />;
    }

    if (vouchers.length === 0) {
      return activeTab === 'active' ? (
        <EmptyState
          title="Keine aktiven Gutscheine"
          text="Löse einen Code ein oder warte auf neue Angebote!"
        />
      ) : (
        <EmptyState
          title="Keine verwendeten Gutscheine"
          text="Deine verwendeten Gutscheine erscheinen hier."
        />
      );
    }

    return (
      <View style={styles.tabContent}>
        {vouchers.map((voucher) =>
          activeTab === 'active' ? (
            <ActiveVoucherItem key={voucher.id} voucher={voucher as BackendActiveVoucher} />
          ) : (
            <UsedVoucherItem key={voucher.id} voucher={voucher as BackendUsedVoucher} />
          )
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back-outline" size={24} color="#4B5563" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gutscheine & Rabatte</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Add Promo Code */}
        <CustomCard style={{ padding: SPACING, marginBottom: SPACING }}>
          <View style={styles.redeemHeader}>
            <Ionicons name="pricetag-outline" size={20} color={THEME_COLOR} />
            <Text style={styles.redeemTitle}>Gutscheincode einlösen</Text>
          </View>
          <View style={styles.inputGroup}>
            <TextInput
              placeholder="Code eingeben"
              value={promoCode}
              onChangeText={(text: string) => setPromoCode(text.toUpperCase())}
              style={styles.input}
              autoCapitalize="characters"
            />
            <CustomButton
              title="Einlösen"
              onPress={handleRedeemCode}
              disabled={!promoCode.trim()}
              style={{
                backgroundColor: THEME_COLOR,
                width: 100, // Fixed width for button
              }}
            />
          </View>
        </CustomCard>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TabButton
            title={`Aktiv (${activeTab === 'active' ? vouchers.length : 0})`}
            active={activeTab === 'active'}
            onPress={() => setActiveTab('active')}
          />
          <TabButton
            title={`Verwendet (${activeTab === 'used' ? vouchers.length : 0})`}
            active={activeTab === 'used'}
            onPress={() => setActiveTab('used')}
          />
        </View>

        {/* Tabs Content */}
        <View style={{ marginTop: 0, paddingBottom: 40 }}>
          {renderContent()}
        </View>

        {/* Info */}
        <CustomCard
          style={{
            padding: SPACING,
            marginTop: SPACING,
            backgroundColor: '#EFF6FF', // bg-blue-50 equivalent
            borderColor: '#DBEAFE', // border-blue-100 equivalent
            borderWidth: 1,
          }}
        >
          <Text style={styles.infoTitle}>Gutschein-Tipps</Text>
          <View style={styles.infoList}>
            <Text style={styles.infoText}>• Gutscheine können nur einmal verwendet werden</Text>
            <Text style={styles.infoText}>• Pro Buchung kann nur ein Gutschein eingelöst werden</Text>
            <Text style={styles.infoText}>• Prüfe das Ablaufdatum vor der Verwendung</Text>
            <Text style={styles.infoText}>• Manche Gutscheine haben einen Mindestbestellwert</Text>
          </View>
        </CustomCard>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Stylesheet ---

const styles = StyleSheet.create({
  // Global Styles
  container: {
    paddingHorizontal: SPACING,
    paddingVertical: SPACING,
    flexGrow: 1,
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
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: CARD_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: 'white',
    fontSize: 14,
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

  // Redeem Code Section
  redeemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING / 2,
  },
  redeemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  inputGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: CARD_RADIUS,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB', // Background for the TabsList
    borderRadius: CARD_RADIUS,
    marginBottom: SPACING,
    height: 44, // Fixed height for visual consistency
  },
  tabButton: {
    flex: 1,
    borderRadius: CARD_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4, // To create space between the buttons
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
    fontSize: 15,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: THEME_COLOR,
  },
  tabButtonTextInactive: {
    color: '#6B7280',
  },

  // Active Voucher Item
  tabContent: {
    gap: SPACING / 2,
  },
  voucherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING / 2,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  voucherTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME_COLOR,
    marginLeft: 8,
  },
  voucherDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 28, // Align with the text, not the icon
    marginBottom: 8,
  },
  codeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderRadius: CARD_RADIUS,
    padding: SPACING / 2,
    marginBottom: SPACING / 2,
  },
  codeLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  codeText: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: '#1F2937',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', // Monospace font for code
  },
  copyButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginLeft: 4,
  },
  copiedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669', // Green for success
    marginLeft: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
  },

  // Used Voucher Item
  usedDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  usedDateText: {
    fontSize: 14,
    color: '#6B7280',
  },
  savedAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669', // text-green-600
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

  // Info Box
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF', // text-blue-900
    marginBottom: 8,
  },
  infoList: {
    paddingLeft: 4,
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#3B82F6', // text-blue-800
  },
});
