import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
} from 'react-native';
// Note: We use placeholders for navigation (useNavigation) 
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Bell,
  Mail,
  MessageSquare,
  Calendar,
  Star,
  CreditCard,
  TrendingUp,
  Users,
  Volume2,
  Vibrate,
  Clock, // Added Clock for quiet hours time pickers
} from 'lucide-react-native'; // Using lucide-react-native for icons
import Button from '../../components/Button';
import Card from '../../components/Card';
import CustomTimePicker from '../../components/CustomTimePicker'; // Placeholder for RN Time Picker
import { colors } from '../../theme/tokens';
import { usersApi } from '../../services/users';

// Interfaces for settings
interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  push: boolean;
  email: boolean;
  sms: boolean;
}

const PRIMARY_COLOR = colors.primary;

const showToast = (message: string, isError: boolean = false) => {
  // In RN, we use Alert for critical feedback or a dedicated toast library
  Alert.alert(isError ? 'Fehler' : 'Erfolg', message);
};

// Mock data for Select/Picker component mapping
const notificationSounds = [
  { value: 'default', label: 'Standard' },
  { value: 'chime', label: 'Glockenton' },
  { value: 'ping', label: 'Ping' },
  { value: 'bell', label: 'Glocke' },
];

// --- Component ---

export default function NotificationSettingsScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await usersApi.getMe();
      if (data.notificationPreferences) {
        setPushEnabled(data.notificationPreferences.push ?? true);
        setEmailEnabled(data.notificationPreferences.email ?? true);
        setSmsEnabled(data.notificationPreferences.sms ?? false);
      }
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  };

  // Master switches
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);

  // Sound and vibration (Note: Actual control is often system-dependent in RN)
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [notificationSound] = useState('default');

  // Quiet hours
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('08:00');

  const [settings, setSettings] = useState<NotificationSetting[]>([
    { id: 'booking_confirmed', label: 'Buchungsbestätigung', description: 'Wenn Ihre Buchung bestätigt wurde', icon: <Calendar size={20} color={colors.green600} />, push: true, email: true, sms: false },
    { id: 'booking_reminder', label: 'Terminerinnerung', description: '24 Stunden vor Ihrem Termin', icon: <Bell size={20} color={colors.blue600} />, push: true, email: true, sms: true },
    { id: 'booking_cancelled', label: 'Termin storniert', description: 'Wenn ein Termin storniert wurde', icon: <Calendar size={20} color={colors.red} />, push: true, email: true, sms: false },
    { id: 'booking_rescheduled', label: 'Termin verschoben', description: 'Wenn ein Termin verschoben wurde', icon: <Calendar size={20} color={colors.amber} />, push: true, email: true, sms: false },
    { id: 'new_message', label: 'Neue Nachrichten', description: 'Wenn Sie eine neue Nachricht erhalten', icon: <MessageSquare size={20} color={colors.primary} />, push: true, email: false, sms: false },
    { id: 'payment_confirmation', label: 'Zahlungsbestätigung', description: 'Wenn eine Zahlung verarbeitet wurde', icon: <CreditCard size={20} color={colors.green600} />, push: true, email: true, sms: false },
    { id: 'review_request', label: 'Bewertungsanfrage', description: 'Aufforderung zur Bewertung nach Service', icon: <Star size={20} color={colors.amber} />, push: true, email: false, sms: false },
    { id: 'promotions', label: 'Angebote & Rabatte', description: 'Sonderangebote von Ihren Favoriten', icon: <TrendingUp size={20} color={colors.secondary} />, push: false, email: true, sms: false },
    { id: 'new_provider', label: 'Neue Anbieter', description: 'Neue Anbieter in Ihrer Nähe', icon: <Users size={20} color={colors.purple600} />, push: false, email: true, sms: false },
  ]);

  // Update a single channel value for a setting entry
  const updateSetting = (id: string, channel: 'push' | 'email' | 'sms', value: boolean): void => {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.id === id ? { ...setting, [channel]: value } : setting
      )
    );
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      await usersApi.updateMe({
        notificationPreferences: {
          push: pushEnabled,
          email: emailEnabled,
          sms: smsEnabled,
        }
      });

      showToast('Einstellungen gespeichert');
      // In RN, you might not navigate here, but let the user stay on the settings screen
    } catch {
      showToast('Fehler beim Speichern', true);
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = () => {
    // In RN, triggering a test push notification requires a native module/service.
    // We'll use a simple alert as a placeholder for user feedback.
    Alert.alert(
      'Test-Benachrichtigung gesendet',
      'Sie sollten in Kürze eine Push-Benachrichtigung erhalten (Prüfen Sie, ob Push-Benachrichtigungen in den OS-Einstellungen erlaubt sind).',
      [{ text: 'OK' }]
    );
  };

  // Helper to find the current sound label
  const currentSoundLabel = notificationSounds.find(s => s.value === notificationSound)?.label || 'Standard';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Benachrichtigungen</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Master Controls */}
        <Card style={styles.card}>
          <Text style={styles.cardLabel}>Benachrichtigungskanäle</Text>

          <View style={styles.switchRow}>
            <View style={styles.switchRowContent}>
              <Bell size={20} color="#4B5563" />
              <View>
                <Text style={styles.switchText}>Push-Benachrichtigungen</Text>
                <Text style={styles.switchSubText}>Auf diesem Gerät</Text>
              </View>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: colors.gray500, true: PRIMARY_COLOR }}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchRowContent}>
              <Mail size={20} color="#4B5563" />
              <View>
                <Text style={styles.switchText}>E-Mail-Benachrichtigungen</Text>
                <Text style={styles.switchSubText}>An Ihre E-Mail-Adresse</Text>
              </View>
            </View>
            <Switch
              value={emailEnabled}
              onValueChange={setEmailEnabled}
              trackColor={{ false: colors.gray500, true: PRIMARY_COLOR }}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchRowContent}>
              <MessageSquare size={20} color="#4B5563" />
              <View>
                <Text style={styles.switchText}>SMS-Benachrichtigungen</Text>
                <Text style={styles.switchSubText}>Nur für wichtige Updates</Text>
              </View>
            </View>
            <Switch
              value={smsEnabled}
              onValueChange={setSmsEnabled}
              trackColor={{ false: colors.gray500, true: PRIMARY_COLOR }}
            />
          </View>
        </Card>

        {/* Sound & Vibration */}
        <Card style={styles.card}>
          <Text style={styles.cardLabel}>Ton & Vibration</Text>
          <Text style={styles.policyText}>
            **Hinweis:** Die Steuerung von Ton und Vibration kann auf einigen Geräten durch die **Betriebssystem-Einstellungen** eingeschränkt sein.
          </Text>

          <View style={styles.switchRow}>
            <View style={styles.switchRowContent}>
              <Volume2 size={20} color="#4B5563" />
              <Text style={styles.switchText}>Benachrichtigungston</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: colors.gray500, true: PRIMARY_COLOR }}
            />
          </View>

          {/* Sound Selection (Replaced Select with text/picker logic) */}
          {soundEnabled && (
            <TouchableOpacity
              style={styles.soundPickerRow}
              // In production, this onPress would open a native Picker/Modal
              onPress={() => showToast('Native Sound Picker needs implementation.')}
              activeOpacity={0.7}
            >
              <Text style={styles.soundLabel}>Ton auswählen</Text>
              <View style={styles.soundValueContainer}>
                <Text style={styles.soundValue}>{currentSoundLabel}</Text>
              </View>
            </TouchableOpacity>
          )}

          <View style={styles.switchRow}>
            <View style={styles.switchRowContent}>
              <Vibrate size={20} color="#4B5563" />
              <Text style={styles.switchText}>Vibration</Text>
            </View>
            <Switch
              value={vibrationEnabled}
              onValueChange={setVibrationEnabled}
              trackColor={{ false: colors.gray500, true: PRIMARY_COLOR }}
            />
          </View>
        </Card>

        {/* Quiet Hours */}
        <Card style={styles.card}>
          <View style={styles.flexBetween}>
            <Text style={styles.cardLabel}>Ruhezeiten</Text>
            <Switch
              value={quietHoursEnabled}
              onValueChange={setQuietHoursEnabled}
              trackColor={{ false: colors.gray500, true: PRIMARY_COLOR }}
            />
          </View>

          {quietHoursEnabled && (
            <View style={styles.quietHoursContent}>
              <Text style={styles.quietHoursText}>
                Keine Push-Benachrichtigungen während dieser Zeit
              </Text>

              {/* Time Selection (Replaced Select with CustomTimePicker placeholder) */}
              <View style={styles.timePickerContainer}>
                <CustomTimePicker
                  label="Von"
                  value={quietHoursStart}
                  onChange={setQuietHoursStart}
                  icon={<Clock size={20} color="#4B5563" />}
                  style={styles.flex1}
                />
                <CustomTimePicker
                  label="Bis"
                  value={quietHoursEnd}
                  onChange={setQuietHoursEnd}
                  icon={<Clock size={20} color="#4B5563" />}
                  style={styles.flex1}
                />
              </View>
            </View>
          )}
        </Card>

        {/* Separator - just a simple line in RN */}
        <View style={styles.separator} />

        {/* Notification Categories */}
        <View style={styles.categorySection}>
          <Text style={styles.cardLabel}>Benachrichtigungstypen</Text>

          {settings.map((setting) => (
            <Card key={setting.id} style={styles.categoryCard}>
              {/* Category Header */}
              <View style={styles.categoryHeader}>
                {setting.icon}
                <View style={styles.categoryTitleContainer}>
                  <Text style={styles.categoryTitle}>{setting.label}</Text>
                  <Text style={styles.categoryDescription}>{setting.description}</Text>
                </View>
              </View>

              {/* Channel Switches */}
              <View style={styles.channelSwitches}>
                {pushEnabled && (
                  <View style={styles.channelRow}>
                    <Text style={styles.channelLabel}>Push</Text>
                    <Switch
                      value={setting.push}
                      onValueChange={(checked) => updateSetting(setting.id, 'push', checked)}
                      trackColor={{ false: colors.gray500, true: PRIMARY_COLOR }}
                    />
                  </View>
                )}

                {emailEnabled && (
                  <View style={styles.channelRow}>
                    <Text style={styles.channelLabel}>E-Mail</Text>
                    <Switch
                      value={setting.email}
                      onValueChange={(checked) => updateSetting(setting.id, 'email', checked)}
                      trackColor={{ false: colors.gray500, true: PRIMARY_COLOR }}
                    />
                  </View>
                )}

                {smsEnabled && (
                  <View style={styles.channelRow}>
                    <Text style={styles.channelLabel}>SMS</Text>
                    <Switch
                      value={setting.sms}
                      onValueChange={(checked) => updateSetting(setting.id, 'sms', checked)}
                      trackColor={{ false: colors.gray500, true: PRIMARY_COLOR }}
                    />
                  </View>
                )}
              </View>
            </Card>
          ))}
        </View>

        {/* Test Notification */}
        <Card style={styles.card}>
          <Button
            title="Test-Benachrichtigung senden"
            onPress={handleTestNotification}
            variant="outline"
            style={styles.testButton}
            icon={<Bell size={18} color={colors.primary} />}
            textStyle={styles.testButtonText}
          />
        </Card>
      </ScrollView>

      {/* Save Button - Fixed Footer */}
      <View style={styles.footer}>
        <Button
          title="Einstellungen speichern"
          onPress={handleSave}
          loading={loading}
          disabled={loading}
          style={styles.saveButton}
        />
      </View>
    </View>
  );
}

// --- StyleSheet API for Styling ---

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.gray50,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderBottomColor: colors.gray200,
    borderBottomWidth: 1,
    flexDirection: 'row',
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray800,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Space for fixed footer
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 8,
    gap: 12,
    marginBottom: 16,
    padding: 16,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray800,
    marginBottom: 8,
  },
  flexBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // --- Master & Channel Switches ---
  switchRow: {
    alignItems: 'center',
    borderTopColor: colors.gray100,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -4,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  switchRowContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  switchText: {
    fontSize: 14,
    color: colors.gray800,
    fontWeight: '500',
  },
  switchSubText: {
    fontSize: 12,
    color: colors.gray600,
  },
  // --- Sound & Vibration ---
  policyText: {
    color: colors.gray600,
    fontSize: 13,
    marginBottom: 8,
  },
  soundPickerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 44, // Align with inner settings
    paddingVertical: 8,
  },
  soundLabel: {
    fontSize: 14,
    color: colors.gray600,
  },
  soundValueContainer: {
    backgroundColor: colors.gray100,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  soundValue: {
    fontSize: 14,
    color: colors.gray800,
  },
  // --- Quiet Hours ---
  quietHoursContent: {
    gap: 16,
    paddingTop: 8,
  },
  quietHoursText: {
    fontSize: 14,
    color: colors.gray600,
  },
  timePickerContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  // --- Separator ---
  separator: {
    backgroundColor: colors.gray200,
    height: 1,
    marginVertical: 16,
  },
  // --- Categories ---
  categorySection: {
    marginBottom: 16,
    gap: 16,
  },
  categoryCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    gap: 16,
    padding: 16,
  },
  categoryHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  categoryTitleContainer: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 14,
    color: colors.gray800,
    fontWeight: '500',
  },
  categoryDescription: {
    fontSize: 12,
    color: colors.gray600,
  },
  channelSwitches: {
    paddingLeft: 32, // ml-8 equivalent
    gap: 8,
  },
  channelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  channelLabel: {
    color: colors.slate,
    fontSize: 12,
  },
  // --- Footer ---
  footer: {
    backgroundColor: colors.white,
    borderTopColor: colors.gray200,
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    position: 'absolute',
    right: 0,
  },
  saveButton: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 8,
  },
  testButton: {
    borderColor: colors.primary,
    borderWidth: 1,
  },
  testButtonText: {
    color: colors.primary,
  },
  flex1: {
    flex: 1,
  },
});
