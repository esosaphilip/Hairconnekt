import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
} from "react-native";
import { Linking } from 'react-native';

// Reusable components (assumed, based on previous refactoring)
import Text from '@/components/Text';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Icon from '@/components/Icon'; 
import { colors } from '@/theme/tokens';
import { Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { logger } from '@/services/logger';
import { showMessage } from 'react-native-flash-message';
import { useAuth } from '@/auth/AuthContext';

// --- Config & Types ---
// Mapping Lucide icons to string names for the generic Icon component
const IconNames = {
  ArrowLeft: 'chevron-left',
  User: 'user',
  Bell: 'bell',
  Lock: 'lock',
  Globe: 'globe',
  HelpCircle: 'help-circle',
  Shield: 'shield',
  CreditCard: 'credit-card',
  MapPin: 'map-pin',
  Heart: 'heart',
  FileText: 'file-text',
  LogOut: 'log-out',
  ChevronRight: 'chevron-right',
  Moon: 'moon',
  Volume2: 'volume-2',
};

// Use centralized theme tokens

type SettingItem = {
  icon: string; // Changed to string for RN Icon component
  label: string;
  description?: string;
  route?: string;
  badge?: string;
  action?: () => void;
  switch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
};

// --- Setting Row Component Refactored ---
const SettingRow = ({ item }: { item: SettingItem }) => {
  const navigation = useNavigation();
  // Common visual container for action/navigation items
  const ItemContent = (
    <View style={styles.settingRowContent}>
      <View style={styles.iconWrapper}>
        <Icon name={item.icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <View style={styles.labelBadgeRow}>
          <Text style={styles.settingLabel}>{item.label}</Text>
          {item.badge && (
            <Text style={styles.badgeText}>
              {item.badge}
            </Text>
          )}
        </View>
        {item.description && (
          <Text style={styles.settingDescription}>{item.description}</Text>
        )}
      </View>
    </View>
  );

  if (item.switch) {
    // Switch Item (no navigation, separate touch target)
    return (
      <View style={styles.settingRowSwitch}>
        {ItemContent}
        <Switch
          value={item.switchValue}
          onValueChange={item.onSwitchChange}
          trackColor={{ false: colors.gray200, true: colors.primary }}
        />
      </View>
    );
  }

  // Navigation or Action Item (full touch target)
  return (
    <TouchableOpacity
      onPress={() => {
        if (item.action) {
          item.action();
        } else if (item.route) {
          // Use standard navigation pattern
          try {
            navigation.navigate(item.route as never);
          } catch {
            logger.debug(`Navigating to ${item.route}`);
          }
        }
      }}
      style={styles.settingRowButton}
    >
      {ItemContent}
      <Icon name={IconNames.ChevronRight} size={20} color={colors.gray400} />
    </TouchableOpacity>
  );
};


export function SettingsScreen() {
  const navigation = useNavigation();
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { logout } = useAuth();

  // --- Setting Item Lists ---
  const accountSettings: SettingItem[] = [
    {
      icon: IconNames.User,
      label: "Persönliche Informationen",
      description: "Name, E-Mail, Telefon",
      route: "PersonalInfoScreen", // Placeholder RN screen name
    },
    {
      icon: IconNames.Lock,
      label: "Sicherheit",
      description: "Passwort, 2FA, Sitzungen",
      route: "SecuritySettingsScreen",
    },
    {
      icon: IconNames.Shield,
      label: "Datenschutz",
      description: "Datenschutzeinstellungen",
      route: "PrivacySettingsScreen",
    },
    {
      icon: IconNames.Bell,
      label: "Benachrichtigungen",
      description: "Push, E-Mail, SMS",
      route: "NotificationSettingsScreen",
    },
  ];

  const appSettings: SettingItem[] = [
    {
      icon: IconNames.Globe,
      label: "Sprache",
      description: "Deutsch",
      route: "LanguageSettingsScreen",
    },
    {
      icon: IconNames.Moon,
      label: "Dunkler Modus",
      description: "Erscheinungsbild der App",
      switch: true,
      switchValue: darkMode,
      onSwitchChange: (value) => {
        setDarkMode(value);
        showMessage({ message: value ? "Dunkler Modus aktiviert" : "Heller Modus aktiviert", type: "success" });
      },
    },
    {
      icon: IconNames.Volume2,
      label: "Sounds & Vibration",
      description: "App-Sounds aktivieren",
      switch: true,
      switchValue: soundEnabled,
      onSwitchChange: (value) => {
        setSoundEnabled(value);
        showMessage({ message: value ? "Sounds aktiviert" : "Sounds deaktiviert", type: "success" });
      },
    },
  ];

  const preferencesSettings: SettingItem[] = [
    {
      icon: IconNames.Heart,
      label: "Haar-Präferenzen",
      description: "Haartyp, bevorzugte Styles",
      route: "HairPreferencesScreen",
    },
    {
      icon: IconNames.MapPin,
      label: "Adressbuch",
      description: "Gespeicherte Adressen",
      route: "AddressBookScreen",
    },
    {
      icon: IconNames.CreditCard,
      label: "Zahlungsmethoden",
      description: "Gespeicherte Karten",
      route: "PaymentMethodsScreen",
    },
  ];

  const supportSettings: SettingItem[] = [
    {
      icon: IconNames.HelpCircle,
      label: "Hilfe & Support",
      description: "FAQ, Kontakt",
      route: "HelpAndSupportScreen",
    },
    {
      icon: IconNames.FileText,
      label: "Nutzungsbedingungen",
      action: () => Linking.openURL("https://example.com/terms"),
    },
    {
      icon: IconNames.FileText,
      label: "Datenschutzerklärung",
      action: () => Linking.openURL("https://example.com/privacy-policy"),
    },
    {
      icon: IconNames.FileText,
      label: "Impressum",
      action: () => Linking.openURL("https://example.com/imprint"),
    },
  ];

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmMessage = 'Möchtest du dich wirklich abmelden?';
      if (typeof window !== 'undefined' && window.confirm(confirmMessage)) {
        Promise.resolve(logout());
      }
      return;
    }
    Alert.alert(
      'Abmelden',
      'Möchtest du dich wirklich abmelden?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        { text: 'Abmelden', style: 'destructive', onPress: () => { Promise.resolve(logout()); } },
      ],
    );
  };

  const renderSection = (title: string, data: SettingItem[]) => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionHeader}>{title}</Text>
      <Card style={styles.card}>
        {data.map((item, index) => (
          <View key={item.label}>
            <SettingRow item={item} />
            {index < data.length - 1 && (
              <View style={styles.separator} />
            )}
          </View>
        ))}
      </Card>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Button
            variant="ghost"
            size="icon"
            onPress={() => navigation.goBack()}
          >
          <Icon name={IconNames.ArrowLeft} size={20} color={colors.gray800} />
          </Button>
          <Text variant="h2" style={styles.headerTitle}>Einstellungen</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderSection("Konto", accountSettings)}
        {renderSection("App-Einstellungen", appSettings)}
        {renderSection("Präferenzen", preferencesSettings)}
        {renderSection("Hilfe & Rechtliches", supportSettings)}
        
        {/* App Info */}
        <Card style={[styles.card, styles.appInfoCard]}>
          <Text style={styles.appInfoText}>HairConnekt</Text>
          <Text style={styles.appVersionText}>Version 1.0.0</Text>
        </Card>

        {/* Logout Button */}
        <Button
          variant="outline"
          onPress={handleLogout}
          style={styles.logoutButton}
          textStyle={styles.logoutButtonText}
        >
          <Icon name={IconNames.LogOut} size={20} color={colors.error} style={styles.logoutIcon} />
          <Text>Abmelden</Text>
        </Button>

        {/* Delete Account */}
        <TouchableOpacity
          onPress={() => navigation.navigate("DeleteAccount" as never)}
          style={styles.deleteAccountButton}
        >
          <Text style={styles.deleteAccountText}>Konto löschen</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Stylesheet for React Native ---
const styles = StyleSheet.create({
  appInfoCard: {
    alignItems: 'center',
    padding: 16,
  },
  appInfoText: {
    color: colors.gray600,
    fontSize: 14,
    marginBottom: 4,
  },
  appVersionText: {
    color: colors.gray400,
    fontSize: 12,
  },
  badgeText: {
    backgroundColor: colors.secondary,
    borderRadius: 10,
    color: colors.white,
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  card: {
    padding: 16,
  },
  deleteAccountButton: {
    alignItems: 'center',
    paddingVertical: 8,
    width: '100%',
  },
  deleteAccountText: {
    color: colors.gray600,
    fontSize: 14,
  },
  header: {
    backgroundColor: colors.white,
    borderBottomColor: colors.gray200,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  headerContent: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    color: colors.gray800,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  iconWrapper: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 20,
    flexShrink: 0,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  labelBadgeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.red200,
    borderWidth: 1,
    flexDirection: 'row',
    height: 48,
    justifyContent: 'center',
    width: '100%',
  },
  logoutButtonText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
  logoutIcon: {
    marginRight: 8,
  },
  safeArea: {
    backgroundColor: colors.gray50,
    flex: 1,
  },
  scrollContent: {
    gap: 24,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  sectionContainer: {
    gap: 12,
  },
  sectionHeader: {
    color: colors.gray600,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    paddingHorizontal: 16,
    textTransform: 'uppercase',
  },
  separator: {
    backgroundColor: colors.gray200,
    height: 1,
    marginVertical: 4,
  },
  settingDescription: {
    color: colors.gray600,
    fontSize: 14,
    marginTop: 2,
  },
  settingLabel: {
    color: colors.gray800,
    fontSize: 16,
    fontWeight: '500',
  },
  settingRowButton: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingRowContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    minWidth: 0,
  },
  settingRowSwitch: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
});
