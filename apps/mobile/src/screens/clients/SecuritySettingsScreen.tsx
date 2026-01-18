import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
  Switch
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import { clientUserApi } from '@/api/clientUser';

// Reusable components
import Text from '../../components/Text';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Badge from '../../components/badge';
import AlertModal from '../../components/AlertModal';
import Icon from '../../components/Icon';
import { colors } from '../../theme/tokens';

// Mock for displaying notifications in React Native
const toast = {
  success: (message: string) => console.log(`TOAST SUCCESS: ${message} `),
  error: (message: string) => console.log(`TOAST ERROR: ${message} `),
};

// --- Config & Types ---
const IconNames = {
  ArrowLeft: 'chevron-left',
  Lock: 'lock',
  Smartphone: 'smartphone',
  Shield: 'shield',
  Key: 'key',
  Eye: 'eye',
  EyeOff: 'eye-off',
  CheckCircle: 'check-circle',
  AlertCircle: 'alert-triangle',
  LogOut: 'log-out',
};


type Session = {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
};

const mockSessions: Session[] = [
  // ... (Mock data remains unchanged)
  {
    id: "1",
    device: "iPhone 14 Pro • iOS 17.1",
    location: "Berlin, Deutschland",
    lastActive: "Jetzt aktiv",
    isCurrent: true,
  },
  {
    id: "2",
    device: "Chrome • Windows 11",
    location: "Berlin, Deutschland",
    lastActive: "Vor 2 Tagen",
    isCurrent: false,
  },
  {
    id: "3",
    device: "Safari • macOS",
    location: "München, Deutschland",
    lastActive: "Vor 5 Tagen",
    isCurrent: false,
  },
];

export function SecuritySettingsScreen() {
  const navigation = useNavigation();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [sessionToLogout, setSessionToLogout] = useState<string | null>(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });


  const handlePasswordChange = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Bitte fülle alle Felder aus");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error("Passwort muss mindestens 8 Zeichen lang sein");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwörter stimmen nicht überein");
      return;
    }

    try {
      await clientUserApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setShowPasswordDialog(false);
      toast.success("Passwort erfolgreich geändert");
      // Clear form
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error(error);
      toast.error("Fehler beim Ändern des Passworts. Bitte überprüfe dein aktuelles Passwort.");
    }
  };

  const handleEnable2FA = () => {
    setTwoFactorEnabled(true);
    setShow2FADialog(false);
    toast.success("Zwei-Faktor-Authentifizierung aktiviert");
  };

  const handleDisable2FA = () => {
    setTwoFactorEnabled(false);
    toast.success("Zwei-Faktor-Authentifizierung deaktiviert");
  };

  const handleLogoutSession = () => {
    // API call to log out specific session
    toast.success("Sitzung erfolgreich beendet");
    setShowLogoutDialog(false);
    setSessionToLogout(null);
    // In a real app, update mockSessions state here
  };

  const handleLogoutAllSessions = () => {
    // API call to log out all sessions (except current)
    toast.success("Alle anderen Sitzungen wurden beendet");
    // In a real app, update mockSessions state here
  };

  // Custom component for Password Input inside the modal
  type PasswordField = 'currentPassword' | 'newPassword' | 'confirmPassword';
  type PasswordInputProps = { label: string; field: PasswordField; isVisible: boolean; toggleVisibility: () => void };
  const PasswordInput = ({ label, field, isVisible, toggleVisibility }: PasswordInputProps) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Input
          value={passwordForm[field]}
          onChangeText={(value) => setPasswordForm(prev => ({ ...prev, [field]: value }))}
          secureTextEntry={!isVisible}
          style={styles.inputField}
        />
        <TouchableOpacity
          onPress={toggleVisibility}
          style={styles.visibilityToggle}
        >
          <Icon name={isVisible ? IconNames.EyeOff : IconNames.Eye} size={20} color={colors.gray400} />
        </TouchableOpacity>
      </View>
      {field === 'newPassword' && (
        <Text style={styles.inputHint}>Mindestens 8 Zeichen</Text>
      )}
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
            <Icon name={IconNames.ArrowLeft} size={20} color={colors.darkGray} />
          </Button>
          <Text variant="h2" style={styles.headerTitle}>Sicherheit</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Password */}
        <View>
          <Text style={styles.sectionHeader}>Passwort</Text>
          <Card style={styles.card}>
            <View style={styles.settingRowButton}>
              <View style={styles.settingRowContent}>
                <View style={styles.iconWrapper}>
                  <Icon name={IconNames.Lock} size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Passwort ändern</Text>
                  <Text style={styles.settingDescription}>
                    Zuletzt geändert: vor 3 Monaten
                  </Text>
                </View>
              </View>
              <Button
                title="Ändern"
                variant="outline"
                size="sm"
                onPress={() => setShowPasswordDialog(true)}
              />
            </View>
          </Card>
        </View>

        {/* Two-Factor Authentication */}
        <View>
          <Text style={styles.sectionHeader}>Zwei-Faktor-Authentifizierung</Text>
          <Card style={styles.card}>
            <View style={styles.settingRowSwitch}>
              <View style={styles.settingRowContent}>
                <View style={styles.iconWrapper}>
                  <Icon name={IconNames.Shield} size={20} color={colors.primary} />
                </View>
                <View style={styles.textContainer}>
                  <View style={styles.labelBadgeRow}>
                    <Text style={styles.settingLabel}>2FA</Text>
                    {twoFactorEnabled && (
                      <Badge
                        label="Aktiv"
                        backgroundColor={colors.lightGreen}
                        textColor={colors.green}
                        borderColor={colors.green}
                      />
                    )}
                  </View>
                  <Text style={styles.settingDescription}>
                    {twoFactorEnabled
                      ? "Zusätzlicher Schutz aktiviert"
                      : "Schütze dein Konto mit 2FA"}
                  </Text>
                </View>
              </View>
              <Switch
                value={twoFactorEnabled}
                onValueChange={(checked) => {
                  if (checked) {
                    setShow2FADialog(true);
                  } else {
                    handleDisable2FA();
                  }
                }}
                trackColor={{ false: colors.gray200, true: colors.primary }}
              />
            </View>

            {twoFactorEnabled && (
              <>
                <View style={styles.separator} />
                <View style={styles.twoFADetails}>
                  <Text style={styles.authAppText}>Authentifizierungs-App</Text>
                  <View style={styles.authAppRow}>
                    <Icon name={IconNames.CheckCircle} size={16} color={colors.green} />
                    <Text style={styles.authAppDetailText}>Google Authenticator</Text>
                  </View>
                  <Button variant="outline" size="sm" style={styles.fullWidthButton}>
                    <Icon name={IconNames.Key} size={16} color={colors.gray} style={styles.mr8} />
                    <Text>Backup-Codes anzeigen</Text>
                  </Button>
                </View>
              </>
            )}
          </Card>
        </View>

        {/* Biometric Authentication */}
        <View>
          <Text style={styles.sectionHeader}>Biometrische Authentifizierung</Text>
          <Card style={styles.card}>
            <View style={styles.settingRowSwitch}>
              <View style={styles.settingRowContent}>
                <View style={styles.iconWrapper}>
                  <Icon name={IconNames.Smartphone} size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.settingLabel}>{Platform.OS === 'ios' ? 'Face ID / Touch ID' : 'Biometrie'}</Text>
                  <Text style={styles.settingDescription}>
                    Schnelle Anmeldung mit Biometrie
                  </Text>
                </View>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={(checked) => {
                  setBiometricEnabled(checked);
                  toast.success(
                    checked
                      ? "Biometrische Anmeldung aktiviert"
                      : "Biometrische Anmeldung deaktiviert"
                  );
                }}
                trackColor={{ false: colors.gray200, true: colors.primary }}
              />
            </View>
          </Card>
        </View>

        {/* Active Sessions */}
        <View>
          <View style={styles.sessionHeader}>
            <Text style={styles.sectionHeader}>Aktive Sitzungen</Text>
            <Button
              title="Alle beenden"
              variant="ghost"
              size="sm"
              onPress={handleLogoutAllSessions}
              style={styles.logoutAllButton}
              textStyle={styles.logoutAllButtonText}
            />
          </View>
          <Card style={styles.card}>
            {mockSessions.map((session, index) => (
              <View key={session.id}>
                <View style={styles.sessionRow}>
                  <View style={styles.sessionDetails}>
                    <View style={styles.sessionDeviceRow}>
                      <Text style={styles.sessionDeviceText}>{session.device}</Text>
                      {session.isCurrent && (
                        <Badge
                          label="Aktuell"
                          backgroundColor={colors.lightGreen}
                          textColor={colors.green}
                          borderColor={colors.green}
                        />
                      )}
                    </View>
                    <Text style={styles.sessionLocationText}>{session.location}</Text>
                    <Text style={styles.sessionLastActiveText}>
                      {session.lastActive}
                    </Text>
                  </View>
                  {!session.isCurrent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={() => {
                        setSessionToLogout(session.id);
                        setShowLogoutDialog(true);
                      }}
                      style={styles.sessionLogoutButton}
                    >
                      <Icon name={IconNames.LogOut} size={16} color={colors.red} />
                    </Button>
                  )}
                </View>
                {index < mockSessions.length - 1 && <View style={styles.separator} />}
              </View>
            ))}
          </Card>
        </View>

        {/* Security Tips */}
        <Card style={styles.securityTipsCard}>
          <View style={styles.securityTipsContent}>
            <Icon name={IconNames.AlertCircle} size={20} color={colors.blue} style={styles.alertIcon} />
            <View>
              <Text style={styles.securityTipsTitle}>
                Sicherheitstipps
              </Text>
              <View style={styles.securityTipsList}>
                <Text style={styles.securityTipsListItem}>• Verwende ein starkes, einzigartiges Passwort</Text>
                <Text style={styles.securityTipsListItem}>• Aktiviere die Zwei-Faktor-Authentifizierung</Text>
                <Text style={styles.securityTipsListItem}>• Überprüfe regelmäßig deine aktiven Sitzungen</Text>
                <Text style={styles.securityTipsListItem}>• Teile dein Passwort niemals mit anderen</Text>
              </View>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* --- Modals --- */}

      {/* Change Password Dialog */}
      <AlertModal
        isVisible={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        title="Passwort ändern"
        description="Gib dein aktuelles Passwort ein und wähle ein neues."
        customContent={
          <View style={styles.modalContent}>
            <PasswordInput
              label="Aktuelles Passwort"
              field="currentPassword"
              isVisible={showPasswords.current}
              toggleVisibility={() => setShowPasswords(p => ({ ...p, current: !p.current }))}
            />
            <PasswordInput
              label="Neues Passwort"
              field="newPassword"
              isVisible={showPasswords.new}
              toggleVisibility={() => setShowPasswords(p => ({ ...p, new: !p.new }))}
            />
            <PasswordInput
              label="Neues Passwort bestätigen"
              field="confirmPassword"
              isVisible={showPasswords.confirm}
              toggleVisibility={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))}
            />
          </View>
        }
        buttons={[
          { title: "Abbrechen", onPress: () => setShowPasswordDialog(false), variant: 'outline' },
          { title: "Passwort ändern", onPress: handlePasswordChange, style: { backgroundColor: colors.primary } },
        ]}
      />

      {/* Enable 2FA Dialog */}
      <AlertModal
        isVisible={show2FADialog}
        onClose={() => setShow2FADialog(false)}
        title="2FA aktivieren"
        description="Scanne diesen QR-Code mit deiner Authentifizierungs-App."
        customContent={
          <View style={styles.modalContent}>
            {/* Mock QR Code */}
            <View style={styles.qrCodeContainer}>
              <Text style={styles.qrCodeText}>

                [Image of QR Code]
              </Text>
            </View>
            <View style={styles.backupCodeSection}>
              <Text style={styles.backupCodeLabel}>Backup-Code</Text>
              <Text style={styles.backupCodeValue}>
                XXXX-XXXX-XXXX-XXXX
              </Text>
              <Text style={styles.inputHint}>
                Bewahre diesen Code sicher auf
              </Text>
            </View>
          </View>
        }
        buttons={[
          { title: "Abbrechen", onPress: () => setShow2FADialog(false), variant: 'outline' },
          { title: "2FA aktivieren", onPress: handleEnable2FA, style: { backgroundColor: colors.primary } },
        ]}
      />

      {/* Logout Session Dialog */}
      <AlertModal
        isVisible={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        title="Sitzung beenden?"
        description="Bist du sicher, dass du diese Sitzung beenden möchtest?"
        buttons={[
          { title: "Abbrechen", onPress: () => setShowLogoutDialog(false), variant: 'outline' },
          {
            title: "Sitzung beenden",
            onPress: () => sessionToLogout && handleLogoutSession(),
            style: { backgroundColor: colors.red },
          },
        ]}
      />
    </SafeAreaView>
  );
}

// --- Stylesheet for React Native ---
const styles = StyleSheet.create({
  alertIcon: { marginTop: 4 },
  authAppDetailText: { color: colors.slate, fontSize: 14 },
  authAppRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  authAppText: { color: colors.darkGray, fontSize: 14, fontWeight: '500' },
  backupCodeLabel: { color: colors.gray, fontSize: 14 },
  backupCodeSection: { alignItems: 'center', gap: 6 },
  backupCodeValue: { backgroundColor: colors.gray50, borderRadius: 8, color: colors.darkGray, fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', fontSize: 14, padding: 12, textAlign: 'center', width: '100%' },
  card: { padding: 16 },
  fullWidthButton: { height: 36, width: '100%' },
  header: { backgroundColor: colors.white, borderBottomColor: colors.gray200, borderBottomWidth: 1, zIndex: 10 },
  headerContent: { alignItems: 'center', flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { color: colors.darkGray, fontSize: 18, fontWeight: '600', marginLeft: 12 },
  iconWrapper: { alignItems: 'center', backgroundColor: colors.primaryLight, borderRadius: 20, flexShrink: 0, height: 40, justifyContent: 'center', width: 40 },
  inputField: { height: 44, paddingRight: 40, width: '100%' },
  inputGroup: { gap: 6 },
  inputHint: { color: colors.gray, fontSize: 12, marginTop: 4 },
  inputWrapper: { justifyContent: 'center', position: 'relative' },
  label: { color: colors.darkGray, fontSize: 14, fontWeight: '500', marginBottom: 4 },
  labelBadgeRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  logoutAllButton: { height: 24, padding: 0 },
  logoutAllButtonText: { color: colors.red, fontSize: 14 },
  modalContent: { gap: 16, paddingVertical: 16 },
  mr8: { marginRight: 8 },
  qrCodeContainer: { alignItems: 'center', alignSelf: 'center', backgroundColor: colors.lightGray, borderRadius: 8, height: 192, justifyContent: 'center', marginBottom: 8, width: 192 },
  qrCodeText: { color: colors.gray400, fontSize: 14 },
  safeArea: { backgroundColor: colors.cream, flex: 1 },
  scrollContent: { gap: 24, paddingHorizontal: 16, paddingVertical: 24 },
  sectionHeader: { color: colors.gray, fontSize: 12, fontWeight: '600', letterSpacing: 1, marginBottom: 12, paddingHorizontal: 16, textTransform: 'uppercase' },
  securityTipsCard: { backgroundColor: colors.lightBlue, borderColor: colors.blue200, borderWidth: 1, padding: 16 },
  securityTipsContent: { alignItems: 'flex-start', flexDirection: 'row', gap: 12 },
  securityTipsList: { gap: 6 },
  securityTipsListItem: { color: colors.slate, fontSize: 12 },
  securityTipsTitle: { color: colors.darkGray, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  separator: { backgroundColor: colors.gray200, height: 1, marginVertical: 16 },
  sessionDetails: { flex: 1 },
  sessionDeviceRow: { alignItems: 'center', flexDirection: 'row', gap: 8, marginBottom: 4 },
  sessionDeviceText: { color: colors.darkGray, fontSize: 16 },
  sessionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: 16 },
  sessionLastActiveText: { color: colors.gray, fontSize: 12, marginTop: 4 },
  sessionLocationText: { color: colors.slate, fontSize: 14 },
  sessionLogoutButton: { alignItems: 'center', height: 36, justifyContent: 'center', marginLeft: 12, width: 36 },
  sessionRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  settingDescription: { color: colors.gray, fontSize: 14, marginTop: 2 },
  settingLabel: { color: colors.darkGray, fontSize: 16, fontWeight: '500' },
  settingRowButton: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  settingRowContent: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 12, minWidth: 0 },
  settingRowSwitch: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  textContainer: { flex: 1, minWidth: 0 },
  twoFADetails: { gap: 12 },
  visibilityToggle: { padding: 4, position: 'absolute', right: 12 },
});