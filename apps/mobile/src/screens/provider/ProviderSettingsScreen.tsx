import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert, // Replaces web 'alert' and 'confirm'
  Switch as RNSwitch, // Native Switch component
} from 'react-native';

// Replaced web imports with assumed custom/community React Native components
import { useNavigation } from '@react-navigation/native';
import Card from '../../components/Card';
import IconButton from '../../components/IconButton';
import Icon from '../../components/Icon';
import { COLORS, SPACING, FONT_SIZES } from '../../theme/tokens';


// --- Helper Components for List Items ---

// Item with a Switch (Toggle Setting)
type ToggleItemProps = {
  icon: string;
  title: string;
  subtitle?: string;
  checked: boolean;
  onToggle: (value: boolean) => void;
};

const ToggleItem = ({ icon, title, subtitle, checked, onToggle }: ToggleItemProps) => (
  <View style={styles.listItem}>
    <View style={styles.itemContent}>
      <Icon name={icon} size={20} color={COLORS.textSecondary} />
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemSubtitle}>{subtitle}</Text>
      </View>
    </View>
    <RNSwitch
      trackColor={{ false: COLORS.border, true: COLORS.primary }}
      thumbColor={COLORS.white}
      ios_backgroundColor={COLORS.border}
      onValueChange={onToggle}
      value={checked}
      disabled={title.includes("Dunkler Modus")} // Mocking disabled state
    />
  </View>
);

// Item that navigates or triggers an action (Link Setting)
type LinkItemProps = {
  icon?: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  isDestructive?: boolean;
};

const LinkItem = ({ icon, title, subtitle, onPress, isDestructive = false }: LinkItemProps) => (
  <TouchableOpacity 
    style={[styles.listItem, styles.linkItem, isDestructive && styles.dangerLink]} 
    onPress={onPress}
  >
    <View style={styles.itemContent}>
      {icon && <Icon name={icon} size={20} color={isDestructive ? COLORS.danger : COLORS.textSecondary} />}
      <View style={styles.itemTextContainer}>
        <Text style={[styles.itemTitle, isDestructive && styles.dangerText]}>{title}</Text>
        {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    {/* Use an icon instead of just text for better mobile UX, except for the footer */}
    {!isDestructive && <Icon name="chevron-right" size={20} color={COLORS.border} />}
  </TouchableOpacity>
);


// --- Main Component ---
export function ProviderSettingsScreen() {
  const navigation = useNavigation<any>();
  
  // --- Notification States ---
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [bookingAlerts, setBookingAlerts] = useState(true);
  const [messageAlerts, setMessageAlerts] = useState(true);
  const [reviewAlerts, setReviewAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // --- Privacy States ---
  const [showPhoneNumber, setShowPhoneNumber] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  const [profileVisible, setProfileVisible] = useState(true);

  // --- Business States ---
  const [autoAcceptBookings, setAutoAcceptBookings] = useState(false);
  const [allowWalkIns, setAllowWalkIns] = useState(true);

  // --- Functions ---
  const handleDeactivateAccount = () => {
    Alert.alert(
      "Konto deaktivieren?",
      "Möchtest du dein Konto wirklich deaktivieren? Dies ist eine einmalige Aktion.",
      [
        { text: "Abbrechen", style: "cancel" },
        { 
          text: "Deaktivieren", 
          onPress: () => Alert.alert("Erfolg", "Konto deaktivieren - Funktion in Entwicklung"),
          style: "destructive",
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.flexContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <IconButton name="arrow-left" onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Einstellungen</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Benachrichtigungen</Text>
          <Card style={styles.cardContainer}>
            <ToggleItem
              icon="bell"
              title="Push-Benachrichtigungen"
              subtitle="Erhalte wichtige Updates auf deinem Gerät"
              checked={pushNotifications}
              onToggle={setPushNotifications}
            />
            <View style={styles.divider} />
            <ToggleItem
              icon="mail"
              title="E-Mail-Benachrichtigungen"
              subtitle="Wichtige Updates per E-Mail"
              checked={emailNotifications}
              onToggle={setEmailNotifications}
            />
            <View style={styles.divider} />
            <ToggleItem
              icon="calendar"
              title="Buchungsbenachrichtigungen"
              subtitle="Bei neuen Buchungen benachrichtigen"
              checked={bookingAlerts}
              onToggle={setBookingAlerts}
            />
            <View style={styles.divider} />
            <ToggleItem
              icon="message-circle"
              title="Nachrichtenbenachrichtigungen"
              subtitle="Bei neuen Nachrichten benachrichtigen"
              checked={messageAlerts}
              onToggle={setMessageAlerts}
            />
            <View style={styles.divider} />
            <ToggleItem
              icon="star"
              title="Bewertungsbenachrichtigungen"
              subtitle="Bei neuen Bewertungen benachrichtigen"
              checked={reviewAlerts}
              onToggle={setReviewAlerts}
            />
            <View style={styles.divider} />
            <ToggleItem
              icon="mail"
              title="Marketing-E-Mails"
              subtitle="Tipps, Neuigkeiten und Angebote"
              checked={marketingEmails}
              onToggle={setMarketingEmails}
            />
          </Card>
        </View>

        {/* Privacy & Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datenschutz & Sicherheit</Text>
          <Card style={styles.cardContainer}>
            <LinkItem
              icon="lock"
              title="Passwort ändern"
              onPress={() => Alert.alert("Info", "Passwort ändern - Funktion in Entwicklung")}
            />
            <View style={styles.divider} />
            <ToggleItem
              icon="smartphone"
              title="Telefonnummer anzeigen"
              subtitle="Kunden können deine Nummer sehen"
              checked={showPhoneNumber}
              onToggle={setShowPhoneNumber}
            />
            <View style={styles.divider} />
            <ToggleItem
              icon="mail"
              title="E-Mail-Adresse anzeigen"
              subtitle="Kunden können deine E-Mail sehen"
              checked={showEmail}
              onToggle={setShowEmail}
            />
            <View style={styles.divider} />
            <ToggleItem
              icon="eye"
              title="Profil sichtbar"
              subtitle="In Suchergebnissen anzeigen"
              checked={profileVisible}
              onToggle={setProfileVisible}
            />
            <View style={styles.divider} />
            <LinkItem
              icon="shield"
              title="Datenschutzeinstellungen"
              onPress={() => Alert.alert("Info", "Datenschutzeinstellungen - Funktion in Entwicklung")}
            />
          </Card>
        </View>

        {/* Business Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Geschäftseinstellungen</Text>
          <Card style={styles.cardContainer}>
            <ToggleItem
              icon="calendar"
              title="Buchungen automatisch annehmen"
              subtitle="Neue Buchungen sofort bestätigen"
              checked={autoAcceptBookings}
              onToggle={setAutoAcceptBookings}
            />
            <View style={styles.divider} />
            <ToggleItem
              icon="users"
              title="Walk-ins erlauben"
              subtitle="Kunden ohne Termin empfangen"
              checked={allowWalkIns}
              onToggle={setAllowWalkIns}
            />
            <View style={styles.divider} />
            <LinkItem
              icon="calendar"
              title="Verfügbarkeitszeiten"
              onPress={() => navigation.navigate("ProviderAvailabilityScreen")}
            />
            <View style={styles.divider} />
            <LinkItem
              icon="credit-card"
              title="Services & Preise"
              onPress={() => navigation.navigate("ProviderServicesScreen")}
            />
          </Card>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App-Einstellungen</Text>
          <Card style={styles.cardContainer}>
            <LinkItem
              icon="globe"
              title="Sprache"
              subtitle="Deutsch"
              onPress={() => Alert.alert("Info", "Sprache ändern - Funktion in Entwicklung")}
            />
            <View style={styles.divider} />
            <ToggleItem
              icon="moon"
              title="Dunkler Modus"
              subtitle="Bald verfügbar"
              checked={false}
              onToggle={() => {}} // Disabled logic handled in the component itself via styling
            />
          </Card>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Über</Text>
          <Card style={styles.cardContainer}>
            <LinkItem
              title="Nutzungsbedingungen"
              onPress={() => Alert.alert("Info", "Nutzungsbedingungen anzeigen")}
            />
            <View style={styles.divider} />
            <LinkItem
              title="Datenschutzerklärung"
              onPress={() => Alert.alert("Info", "Datenschutzerklärung anzeigen")}
            />
            <View style={styles.divider} />
            <View style={styles.versionContainer}>
              <Text style={styles.itemSubtitle}>Version 1.0.0</Text>
            </View>
          </Card>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.dangerTitle}>Gefahrenzone</Text>
          <Card>
            <LinkItem
              title="Konto deaktivieren"
              onPress={handleDeactivateAccount}
              isDestructive={true}
            />
          </Card>
        </View>
      </ScrollView>
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
    paddingVertical: SPACING.sm || 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border || '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm || 8,
  },
  headerTitle: {
    fontSize: FONT_SIZES.h4 || 18,
    fontWeight: 'bold',
  },
  // --- Scroll Content & Sections ---
  scrollContent: {
    padding: SPACING.md || 16,
    paddingBottom: SPACING.xl * 2,
  },
  section: {
    marginBottom: SPACING.lg || 24,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.textSecondary || '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  dangerTitle: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.danger || '#EF4444',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  // --- Card Container (Simulates divide-y) ---
  cardContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    // Note: Border lines (divider) are applied manually between items
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border || '#E5E7EB',
    marginLeft: 50, // Indent the divider for visual hierarchy
  },
  // --- List Item Styles ---
  listItem: {
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  linkItem: {
    // Styles for touchable rows
    paddingVertical: SPACING.md,
  },
  dangerLink: {
    backgroundColor: COLORS.white,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm || 8,
    flex: 1,
  },
  itemTextContainer: {
    flexShrink: 1,
    // Add opacity for disabled item (Dark Mode)
    opacity: 1, 
  },
  itemTitle: {
    fontSize: FONT_SIZES.body || 14,
    fontWeight: '500',
  },
  itemSubtitle: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.textSecondary || '#6B7280',
    marginTop: SPACING.xs / 2,
  },
  dangerText: {
    color: COLORS.danger || '#EF4444',
    fontWeight: '500',
    textAlign: 'center',
    width: '100%',
  },
  versionContainer: {
    padding: SPACING.md,
  }
});