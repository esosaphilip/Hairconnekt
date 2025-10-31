import React, { useState } from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  AlertTriangle,
  Download,
  Trash2,
  ChevronRight,
} from 'lucide-react-native'; // Using RN-specific lucide icons

// Custom Components (assumed to be available)
import Text from '../components/Text'; // Custom Text component
import Button from '../components/Button'; // Custom Button component
import Card from '../components/Card'; // Custom Card/Container component
import Separator from '../components/separator'; // Custom Separator/Divider
import Switch from '../components/switch'; // Custom Switch component
import Input from '../components/Input'; // Custom Input component
// Removed import of Badge to avoid conflict with local Badge component definition below
import { spacing } from '../theme/tokens'; // Assuming a common theme spacing object

// --- Brand Color Constant ---
const PRIMARY_COLOR = '#8B4513';
const DANGER_COLOR = '#DC2626'; // text-red-600
const WARNING_BG = '#FEF3C7'; // bg-yellow-50
const INFO_BG = '#EFF6FF'; // bg-blue-50

// --- Utility Component Refactored for RN ---

/**
 * RN equivalent for the MenuItem component.
 * Uses Pressable for interaction.
 */
const MenuItem = ({ icon: Icon, label, description, onClick }: any) => (
  <Pressable
    onPress={onClick}
    style={({ pressed }) => [
      styles.menuItem,
      { backgroundColor: pressed ? '#F9FAFB' : '#fff' }, // Mimics hover:bg-gray-50
    ]}
  >
    <View style={styles.menuItemLeft}>
      <View style={styles.menuItemIconContainer}>
        <Icon size={20} color="#4B5563" /> {/* text-gray-600 */}
      </View>
      <View style={styles.menuItemTextContainer}>
        <Text style={{ fontSize: 16 }}>{label}</Text>
        {description && (
          <Text style={styles.menuItemDescription}>{description}</Text>
        )}
      </View>
    </View>
    <ChevronRight size={20} color="#9CA3AF" /> {/* text-gray-400 */}
  </Pressable>
);

// --- Main PrivacySecurityScreen Component ---

export function PrivacySecurityScreen() {
  const navigation = useNavigation();
  const [privacySettings, setPrivacySettings] = useState({
    profileVisible: true,
    showLastSeen: true,
    showPhoneNumber: false,
    allowMessages: true,
    shareAnalytics: true,
  });
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const goBack = () => {
    // @ts-ignore
    navigation.goBack();
  };

  const handlePasswordChange = async () => {
    if (isChangingPassword) return;

    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      Alert.alert('Fehler', 'Bitte fülle alle Felder aus');
      return;
    }

    if (passwordData.new !== passwordData.confirm) {
      Alert.alert('Fehler', 'Die neuen Passwörter stimmen nicht überein');
      return;
    }

    if (passwordData.new.length < 8) {
      Alert.alert('Fehler', 'Das Passwort muss mindestens 8 Zeichen lang sein');
      return;
    }

    setIsChangingPassword(true);
    try {
      // Simulate API call - in a real app, this would be an async HTTP request
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Alert.alert('Erfolg', 'Passwort erfolgreich geändert');
      setPasswordData({ current: '', new: '', confirm: '' });
      setShowPasswordChange(false);
    } catch (error) {
      Alert.alert('Fehler', 'Passwort konnte nicht geändert werden. Bitte versuche es später erneut.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Replaces web 'toast' with native 'Alert'
  const handleDataDownload = () => {
    Alert.alert(
      'Daten anfordern',
      'Deine Daten werden vorbereitet. Du erhältst in Kürze eine E-Mail mit dem Download-Link.',
      [{ text: 'OK' }]
    );
  };

  const PasswordInputGroup = ({
    id,
    label,
    value,
    onChange,
    placeholder,
    showPassword,
    toggleShowPassword,
  }: any) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Input
          id={id}
          style={styles.input}
          secureTextEntry={!showPassword}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
        />
        <Pressable
          onPress={toggleShowPassword}
          style={styles.eyeButton}
        >
          {showPassword ? (
            <EyeOff size={18} color="#6B7280" />
          ) : (
            <Eye size={18} color="#6B7280" />
          )}
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBar}>
          <Pressable onPress={goBack} style={styles.backButton}>
            <ArrowLeft size={24} color="#374151" />
          </Pressable>
          <Text style={styles.screenTitle}>Datenschutz & Sicherheit</Text>
          <View style={styles.placeholderView} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Security Info */}
        <Card style={[styles.infoCard, { backgroundColor: INFO_BG, borderColor: '#BFDBFE' }]}>
          <View style={styles.infoContent}>
            <Shield size={20} color="#2563EB" style={styles.iconMargin} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Deine Sicherheit ist uns wichtig</Text>
              <Text style={styles.infoDescription}>
                Wir verwenden branchenübliche Verschlüsselung, um deine Daten zu schützen.
              </Text>
            </View>
          </View>
        </Card>

        {/* Privacy Settings */}
        <Card style={styles.settingsCard}>
          <View style={styles.sectionHeader}>
            <Eye size={20} color={PRIMARY_COLOR} />
            <Text style={styles.sectionTitle}>Datenschutzeinstellungen</Text>
          </View>

          <View style={styles.settingsGroup}>
            {[
              { label: 'Profil sichtbar', desc: 'Anderen Nutzern dein Profil anzeigen', key: 'profileVisible' },
              { label: 'Zuletzt online anzeigen', desc: 'Anderen zeigen, wann du zuletzt aktiv warst', key: 'showLastSeen' },
              { label: 'Telefonnummer anzeigen', desc: 'Telefonnummer in deinem Profil sichtbar machen', key: 'showPhoneNumber' },
              { label: 'Nachrichten erlauben', desc: 'Erlaube anderen Nutzern, dir zu schreiben', key: 'allowMessages' },
              { label: 'Nutzungsdaten teilen', desc: 'Hilf uns, die App zu verbessern', key: 'shareAnalytics' },
            ].map((setting, index) => (
              <React.Fragment key={setting.key}>
                <View style={styles.switchRow}>
                  <View>
                    <Text style={styles.switchLabel}>{setting.label}</Text>
                    <Text style={styles.switchDescription}>{setting.desc}</Text>
                  </View>
                  <Switch
                    value={privacySettings[setting.key as keyof typeof privacySettings]}
                    onValueChange={(checked) =>
                      setPrivacySettings({ ...privacySettings, [setting.key]: checked })
                    }
                  />
                </View>
                {index < 4 && <Separator style={styles.separator} />}
              </React.Fragment>
            ))}
          </View>
        </Card>

        {/* Password & Security */}
        <Card style={styles.settingsCard}>
          <View style={styles.sectionHeader}>
            <Lock size={20} color={PRIMARY_COLOR} />
            <Text style={styles.sectionTitle}>Passwort & Sicherheit</Text>
          </View>

          {!showPasswordChange ? (
            <Button
              title="Passwort ändern"
              variant="outline"
              style={styles.fullWidthButton}
              onPress={() => setShowPasswordChange(true)}
            />
          ) : (
            <View style={styles.passwordChangeContainer}>
              <PasswordInputGroup
                id="current-password"
                label="Aktuelles Passwort"
                value={passwordData.current}
                onChange={(text: string) => setPasswordData({ ...passwordData, current: text })}
                placeholder="Aktuelles Passwort eingeben"
                showPassword={showCurrentPassword}
                toggleShowPassword={() => setShowCurrentPassword(!showCurrentPassword)}
              />
              <PasswordInputGroup
                id="new-password"
                label="Neues Passwort"
                value={passwordData.new}
                onChange={(text: string) => setPasswordData({ ...passwordData, new: text })}
                placeholder="Neues Passwort eingeben"
                showPassword={showNewPassword}
                toggleShowPassword={() => setShowNewPassword(!showNewPassword)}
              />
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Passwort bestätigen</Text>
                <Input
                  id="confirm-password"
                  style={styles.input}
                  secureTextEntry={true}
                  value={passwordData.confirm}
                  onChangeText={(text: string) => setPasswordData({ ...passwordData, confirm: text })}
                  placeholder="Neues Passwort wiederholen"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.buttonRow}>
                <Button
                  title="Abbrechen"
                  variant="outline"
                  style={styles.flexButton}
                  onPress={() => {
                    setShowPasswordChange(false);
                    setPasswordData({ current: '', new: '', confirm: '' });
                  }}
                />
                <Button
                  title={isChangingPassword ? 'Speichere...' : 'Speichern'}
                  style={[styles.flexButton, { backgroundColor: PRIMARY_COLOR }]}
                  onPress={handlePasswordChange}
                  disabled={isChangingPassword}
                >
                  {isChangingPassword && <ActivityIndicator size="small" color="#fff" style={{ marginRight: spacing.xs }} />}
                </Button>
              </View>

              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  <Text style={{ fontWeight: '700' }}>Tipps für ein sicheres Passwort:</Text>
                  {'\n'}• Mindestens 8 Zeichen
                  {'\n'}• Groß- und Kleinbuchstaben
                  {'\n'}• Zahlen und Sonderzeichen
                </Text>
              </View>
            </View>
          )}
        </Card>

        {/* Connected Devices */}
        <Card style={styles.settingsCard}>
          <View style={styles.sectionHeader}>
            <Smartphone size={20} color={PRIMARY_COLOR} />
            <Text style={styles.sectionTitle}>Verbundene Geräte</Text>
          </View>
          <View style={styles.devicesGroup}>
            <View style={styles.deviceRow}>
              <View>
                <Text style={styles.deviceLabel}>iPhone 14 Pro</Text>
                <Text style={styles.deviceDescription}>Zuletzt aktiv: Jetzt</Text>
              </View>
              <Badge title="Aktiv" color="#10B981" textColor="#fff" />
            </View>
            <Text style={styles.deviceHint}>
              Du kannst dich von anderen Geräten aus deinem Account abmelden.
            </Text>
          </View>
        </Card>

        {/* Data Management */}
        <Card style={styles.settingsCard}>
          <View style={styles.sectionHeader}>
            <Download size={20} color={PRIMARY_COLOR} />
            <Text style={styles.sectionTitle}>Datenverwaltung</Text>
          </View>
          <View style={styles.dataGroup}>
            <Button
              title="Meine Daten herunterladen"
              variant="outline"
              icon={<Download size={16} color="#374151" />}
              style={styles.downloadButton}
              onPress={handleDataDownload}
            />
            <Text style={styles.dataHint}>
              Erhalte eine Kopie deiner Daten gemäß DSGVO
            </Text>
          </View>
        </Card>

        {/* Legal Links */}
        <Card style={styles.legalCard}>
          <MenuItem
            icon={Shield}
            label="Datenschutzerklärung"
            description="Wie wir deine Daten verwenden"
            onClick={() => navigateTo('PrivacyPolicy')}
          />
          <Separator />
          <MenuItem
            icon={Lock}
            label="Allgemeine Geschäftsbedingungen"
            description="Nutzungsbedingungen lesen"
            onClick={() => navigateTo('Terms')}
          />
        </Card>

        {/* Delete Account Warning */}
        <Card style={styles.dangerCard}>
          <View style={styles.infoContent}>
            <AlertTriangle size={20} color={DANGER_COLOR} style={styles.iconMargin} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.dangerTitle}>Gefahrenzone</Text>
              <Text style={styles.dangerDescription}>
                Das Löschen deines Accounts kann nicht rückgängig gemacht werden.
              </Text>
              <Button
                title="Account löschen"
                variant="outline"
                style={styles.deleteButton}
                textStyle={{ color: DANGER_COLOR }}
                onPress={() => navigateTo('DeleteAccount')}
              />
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper to navigate using screen names (assumed)
const navigateTo = (screen: string) => {
    const navigation = useNavigation();
    // @ts-ignore
    navigation.navigate(screen);
};

// Simple Badge component definition for use in this file
const BadgeComponent = ({ title, color, textColor }: { title: string; color: string; textColor: string }) => (
  <View style={[styles.badgeContainer, { backgroundColor: color }]}>
    <Text style={[styles.badgeText, { color: textColor }]}>{title}</Text>
  </View>
);
// Rename the component to Badge so we don't need a custom import
const Badge = BadgeComponent;


// --- Stylesheet for RN ---
// Cast styles to any to temporarily allow web-only properties like `gap` in RN styles.
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB', // bg-gray-50
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  // Header
  header: {
    backgroundColor: '#fff',
    // Web's sticky top-0, z-10, shadow-sm translated to RN
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  placeholderView: {
    width: 24, // To balance the back button on the left
  },

  // Info Cards
  infoCard: {
    borderRadius: spacing.sm,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  infoContent: {
    flexDirection: 'row',
    // React Native doesn't support `gap` yet; consider margins.
    gap: spacing.sm,
  },
  iconMargin: {
    marginTop: 2,
  },
  infoTextContainer: {
    flexShrink: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E40AF', // text-blue-900
    marginBottom: spacing.xs / 2,
  },
  infoDescription: {
    fontSize: 14,
    color: '#1E40AF', // text-blue-800
  },

  // Setting Cards
  settingsCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    // React Native doesn't support `gap` yet; consider margins.
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },

  // Switch Rows
  settingsGroup: {
    // React Native doesn't support `gap` yet; consider margins.
    gap: spacing.md, // spacing-y-4
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    fontSize: 16,
  },
  switchDescription: {
    fontSize: 12,
    color: '#6B7280', // text-gray-500
  },
  separator: {
    marginVertical: spacing.xs,
  },

  // Password Change
  fullWidthButton: {
    width: '100%',
    borderColor: '#D1D5DB',
  },
  passwordChangeContainer: {
    // React Native doesn't support `gap` yet; consider margins.
    gap: spacing.md, // space-y-4
  },
  inputGroup: {
    // React Native doesn't support `gap` yet; consider margins.
    gap: spacing.xs / 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    flex: 1,
  },
  eyeButton: {
    position: 'absolute',
    right: spacing.sm,
    padding: spacing.xs,
  },
  buttonRow: {
    flexDirection: 'row',
    // React Native doesn't support `gap` yet; consider margins.
    gap: spacing.sm,
  },
  flexButton: {
    flex: 1,
    height: 44,
  },
  warningBox: {
    backgroundColor: WARNING_BG,
    borderColor: '#FDE68A',
    borderWidth: 1,
    borderRadius: spacing.sm,
    padding: spacing.md,
  },
  warningText: {
    fontSize: 12,
    color: '#92400E', // text-yellow-800
  },

  // Connected Devices
  devicesGroup: {
    // React Native doesn't support `gap` yet; consider margins.
    gap: spacing.sm,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
    backgroundColor: '#F9FAFB', // bg-gray-50
    borderRadius: spacing.xs,
  },
  deviceLabel: {
    fontSize: 16,
  },
  deviceDescription: {
    fontSize: 12,
    color: '#6B7280', // text-gray-500
  },
  deviceHint: {
    fontSize: 12,
    color: '#6B7280', // text-gray-500
    textAlign: 'center',
  },
  badgeContainer: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Data Management
  dataGroup: {
    // React Native doesn't support `gap` yet; consider margins.
    gap: spacing.xs,
  },
  downloadButton: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderColor: '#D1D5DB',
  },
  dataHint: {
    fontSize: 12,
    color: '#6B7280', // text-gray-500
  },

  // Legal Links
  legalCard: {
    padding: 0,
    marginBottom: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    width: '100%',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    // React Native doesn't support `gap` yet; consider margins.
    gap: spacing.sm,
  },
  menuItemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6', // bg-gray-100
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemTextContainer: {
    maxWidth: '85%',
  },
  menuItemDescription: {
    fontSize: 12,
    color: '#6B7280', // text-gray-500
  },

  // Danger Card
  dangerCard: {
    borderRadius: spacing.sm,
    borderWidth: 1,
    padding: spacing.md,
    backgroundColor: '#FEF2F2', // bg-red-50
    borderColor: '#FEE2E2', // border-red-200
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7F1D1D', // text-red-900
    marginBottom: spacing.xs / 2,
  },
  dangerDescription: {
    fontSize: 14,
    color: '#991B1B', // text-red-800
    marginBottom: spacing.sm,
  },
  deleteButton: {
    width: '100%',
    borderColor: '#FCA5A5', // border-red-300
    backgroundColor: '#FEF2F2', // hover:bg-red-100
    borderWidth: 1,
  },
}) as any;