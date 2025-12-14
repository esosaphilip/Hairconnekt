import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Linking } from 'react-native';

// Reusable components (assumed, based on previous refactoring)
import Text from '../../components/Text';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Badge from '../../components/badge';
import Icon from '../../components/Icon'; 
import ActionSheet from '../../components/ActionSheet';
import AlertModal from '../../components/AlertModal';

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
type Account = {
  id: string;
  bankName: string;
  accountHolder: string;
  iban: string;
  bic: string;
  isDefault: boolean;
  addedDate: string;
};
const mockBankAccounts: Account[] = [
  {
    id: "bank-1",
    bankName: "Sparkasse Berlin",
    accountHolder: "Maria Schmidt",
    iban: "DE89 3704 0044 0532 0130 00",
    bic: "COBADEFFXXX",
    isDefault: true,
    addedDate: "März 2024",
  },
  {
    id: "bank-2",
    bankName: "Deutsche Bank",
    accountHolder: "Maria Schmidt",
    iban: "DE89 5001 0517 4231 2345 67",
    bic: "DEUTDEFFXXX",
    isDefault: false,
    addedDate: "Januar 2024",
  },
];

// --- Config Helpers ---
const IconNames = {
  ArrowLeft: 'chevron-left',
  Plus: 'plus',
  Building2: 'home-office', // Assuming a suitable icon name for bank/building
  CheckCircle: 'check-circle',
  MoreVertical: 'more-vertical',
  Trash2: 'trash-2',
  Edit: 'edit',
  CreditCard: 'credit-card',
  Lock: 'lock',
  AlertTriangle: 'alert-triangle',
  Info: 'info',
};

const colors = {
  primary: '#8B4513',
  green: '#22C55E',
  blue: '#3B82F6',
  amber: '#F59E0B',
  lightGreen: '#F0FFF4',
  lightBlue: '#F5F7FF',
  lightAmber: '#FFFBEA',
  grayBackground: '#F3F4F6',
  // Add missing color tokens referenced in styles
  gray: '#4B5563',
  background: '#FAF9F6',
  red: '#EF4444',
};

export function BankAccountsScreen() {
  const navigation = useNavigation();
  const [accounts, setAccounts] = useState<Account[]>(mockBankAccounts);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionSheetAccount, setActionSheetAccount] = useState<Account | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);

  const handleSetDefault = (accountId: string) => {
    setAccounts((prev) =>
      prev.map((acc) => ({
        ...acc,
        isDefault: acc.id === accountId,
      }))
    );
    toast.success("Standardkonto aktualisiert");
    setActionSheetAccount(null);
  };

  const handleDeleteAccount = () => {
    if (accountToDelete) {
      const account = accounts.find((acc) => acc.id === accountToDelete);
      if (account?.isDefault && accounts.length > 1) {
        toast.error("Standardkonto kann nicht gelöscht werden. Wähle zuerst ein neues Standardkonto.");
        setDeleteDialogOpen(false);
        setAccountToDelete(null);
        return;
      }
      setAccounts((prev) => prev.filter((acc) => acc.id !== accountToDelete));
      toast.success("Bankkonto entfernt");
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
    }
  };

  const handleDeleteClick = (accountId: string) => {
    setAccountToDelete(accountId);
    setDeleteDialogOpen(true);
    setActionSheetAccount(null);
  };

  // Masking logic uses non-breaking space (U+00A0) for visual spacing
  const maskIBAN = (iban: string) => {
    const cleaned = iban.replace(/\s/g, "");
    if (cleaned.length <= 8) return iban;
    const visible = cleaned.slice(-4);
    return `\u2022\u2022\u2022\u2022\u00A0 \u2022\u2022\u2022\u2022\u00A0 \u2022\u2022\u2022\u2022\u00A0 ${visible}`;
  };

  const actionSheetOptions = useMemo(() => {
    if (!actionSheetAccount) return [];

    const options = [];

    if (!actionSheetAccount.isDefault) {
      options.push({
        label: "Als Standard setzen",
        icon: IconNames.CheckCircle,
        onPress: () => handleSetDefault(actionSheetAccount.id),
      });
    }

    options.push(
      {
        label: "Bearbeiten",
        icon: IconNames.Edit,
        onPress: () => navigation.navigate(`ProviderBankEdit`), // Simplified navigation
      },
      {
        label: "Entfernen",
        icon: IconNames.Trash2,
        isDestructive: true,
        onPress: () => handleDeleteClick(actionSheetAccount.id),
      }
    );
    return options;
  }, [actionSheetAccount, accounts.length]);


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
            <Text variant="h2" style={styles.headerTitle}>Bankkonten</Text>
          </View>
        </View>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Add Account Button */}
        <Button
          onPress={() => navigation.navigate("ProviderBankAdd")}
          style={styles.addButton}
        >
          <Icon name={IconNames.Plus} size={20} color="#fff" style={{ marginRight: 8 }} />
          Bankkonto hinzufügen
        </Button>

        {/* Bank Accounts List */}
        {accounts.length === 0 ? (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyIconContainer}>
              <Icon name={IconNames.Building2} size={32} color="#9CA3AF" />
            </View>
            <Text variant="h3" style={styles.emptyTitle}>Kein Bankkonto hinterlegt</Text>
            <Text style={styles.emptySubtitle}>
              Füge ein Bankkonto hinzu, um Auszahlungen zu erhalten
            </Text>
            <Button
              onPress={() => navigation.navigate("ProviderBankAdd")}
              style={styles.emptyCtaButton}
            >
              <Icon name={IconNames.Plus} size={16} color="#fff" style={{ marginRight: 8 }} />
              Konto hinzufügen
            </Button>
          </Card>
        ) : (
          <View style={styles.listSection}>
            <Text variant="h3" style={styles.listTitle}>Gespeicherte Konten</Text>

            {accounts.map((account) => (
              <Card key={account.id} style={styles.accountCard}>
                <View style={styles.accountHeaderRow}>
                  <View style={styles.accountDetailsLeft}>
                    <View style={styles.bankIconContainer}>
                      <Icon name={IconNames.Building2} size={24} color={colors.primary} />
                    </View>
                    <View style={styles.bankTextDetails}>
                      <View style={styles.bankNameRow}>
                        <Text variant="h3" numberOfLines={1} style={styles.bankNameText}>
                          {account.bankName}
                        </Text>
                        {account.isDefault && (
                          <Badge
                            label="Standard"
                            backgroundColor={colors.lightGreen}
                            textColor={colors.green}
                            borderColor={colors.green}
                          />
                        )}
                      </View>
                      <Text style={styles.accountHolderText}>
                        {account.accountHolder}
                      </Text>
                      <Text style={styles.ibanText}>
                        {maskIBAN(account.iban)}
                      </Text>
                      <Text style={styles.addedDateText}>
                        Hinzugefügt: {account.addedDate}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => setActionSheetAccount(account)}
                    style={styles.moreButton}
                  >
                    <Icon name={IconNames.MoreVertical} size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                {/* BIC/SWIFT Info */}
                <View style={styles.bicInfoRow}>
                  <Icon name={IconNames.CreditCard} size={16} color="#9CA3AF" style={{ marginTop: 2 }} />
                  <View style={styles.bicTextDetails}>
                    <Text style={styles.bicLabel}>BIC/SWIFT</Text>
                    <Text style={styles.bicValue}>{account.bic}</Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Info Card - Security */}
        <Card style={[styles.infoCard, styles.securityCard]}>
          <View style={styles.infoTitleRow}>
            <Icon name={IconNames.Lock} size={16} color={colors.blue} />
            <Text style={styles.infoTitleText}>Sicherheitshinweis</Text>
          </View>
          <View style={styles.infoList}>
            <Text style={styles.infoListItem}>• Alle Bankdaten werden verschlüsselt gespeichert</Text>
            <Text style={styles.infoListItem}>• Auszahlungen erfolgen nur auf verifizierte Konten</Text>
            <Text style={styles.infoListItem}>• Änderungen am Standardkonto können bis zu 24h dauern</Text>
            <Text style={styles.infoListItem}>• Bei Problemen kontaktiere unseren Support</Text>
          </View>
        </Card>

        {/* Requirements Card - Important Info */}
        <Card style={[styles.infoCard, styles.warningCard]}>
          <View style={styles.infoTitleRow}>
            <Icon name={IconNames.AlertTriangle} size={16} color={colors.amber} />
            <Text style={styles.infoTitleText}>Wichtige Informationen</Text>
          </View>
          <View style={styles.infoList}>
            <Text style={styles.infoListItem}>• Der Kontoinhaber muss mit dem registrierten Namen übereinstimmen</Text>
            <Text style={styles.infoListItem}>• Nur deutsche Bankkonten (IBAN beginnend mit DE) werden akzeptiert</Text>
            <Text style={styles.infoListItem}>• Verifizierung kann 1-2 Werktage dauern</Text>
          </View>
        </Card>
      </ScrollView>

      {/* Action Sheet (DropdownMenu equivalent) */}
      {actionSheetAccount && (
        <ActionSheet
          isVisible={!!actionSheetAccount}
          onClose={() => setActionSheetAccount(null)}
          options={actionSheetOptions}
          title={actionSheetAccount.bankName}
        />
      )}

      {/* Delete Confirmation Dialog (AlertDialog equivalent) */}
      <AlertModal
        isVisible={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Bankkonto entfernen?"
        description="Bist du sicher, dass du dieses Bankkonto entfernen möchtest? Diese Aktion kann nicht rückgängig gemacht werden."
        buttons={[
          { title: "Abbrechen", onPress: () => setDeleteDialogOpen(false), variant: 'outline' },
          { title: "Entfernen", onPress: handleDeleteAccount, style: { backgroundColor: colors.red } },
        ]}
      />
    </View>
  );
}

// --- Stylesheet for React Native ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Header styles
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop: Platform.OS === 'ios' ? 0 : 16, // Adjust for iOS Safe Area if not using one globally
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  // ScrollView content
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  // Add Account Button
  addButton: {
    width: '100%',
    height: 48,
    backgroundColor: colors.primary,
  },
  // Empty State
  emptyCard: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.grayBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyCtaButton: {
    backgroundColor: colors.primary,
  },
  // List Section
  listSection: {
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  // Account Card
  accountCard: {
    padding: 16,
  },
  accountHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  accountDetailsLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  bankIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}1A`, // 10% opacity
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  bankTextDetails: {
    flex: 1,
    minWidth: 0,
  },
  bankNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  bankNameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flexShrink: 1, // Allows truncation
  },
  accountHolderText: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 2,
  },
  ibanText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', // Mono font simulation
  },
  addedDateText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  moreButton: {
    padding: 8,
    marginRight: -8, // Pulls the button slightly off the edge for better touch area
  },
  // BIC Info Row
  bicInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#F9FAFB', // gray-50
    borderRadius: 8,
  },
  bicTextDetails: {
    flex: 1,
    minWidth: 0,
  },
  bicLabel: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 2,
  },
  bicValue: {
    fontSize: 14,
    color: '#1F2937',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', // Mono font simulation
  },
  // Info Cards
  infoCard: {
    padding: 16,
  },
  infoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoTitleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  infoList: {
  },
  infoListItem: {
    fontSize: 12,
    color: '#4B5563',
  },
  securityCard: {
    backgroundColor: colors.lightBlue,
    borderColor: '#BFDBFE', // blue-200
    borderWidth: 1,
  },
  warningCard: {
    backgroundColor: colors.lightAmber,
    borderColor: '#FDE68A', // amber-200
    borderWidth: 1,
  }
});
