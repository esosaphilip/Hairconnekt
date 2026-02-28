import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Pressable,
} from 'react-native';
// Note: We use placeholders for navigation (useNavigation, useRoute) 
// and custom/library components (Card, Avatar, RadioButton, CustomAlert)
// which you would implement or import from a library like 'react-native-paper' or a custom component folder.
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ArrowLeft,
  AlertTriangle,
  Calendar,
  Clock,
  Euro,
  X,
  ChevronRight, // Good for radio buttons or list items
} from 'lucide-react-native'; // Using lucide-react-native for icons
import Button from '../../components/Button';
import Card from '../../components/Card';
import Avatar, { AvatarImage } from '../../components/avatar';
import Textarea from '../../components/textarea';
import { colors, COLORS } from '../../theme/tokens';

// --- Mock Data and Utilities ---

const cancellationReasons = [
  { value: 'schedule_conflict', label: 'Terminkonflikt' },
  { value: 'found_alternative', label: 'Alternative gefunden' },
  { value: 'personal_reasons', label: 'Persönliche Gründe' },
  { value: 'price_too_high', label: 'Preis zu hoch' },
  { value: 'changed_mind', label: 'Habe es mir anders überlegt' },
  { value: 'emergency', label: 'Notfall' },
  { value: 'other', label: 'Anderer Grund' },
];

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

// Simple hook to show a mobile alert/toast-like message
const showToast = (message: string, isError: boolean = false): void => {
  // In a real app, you'd use 'react-native-toast-message' or a similar library.
  Alert.alert(isError ? 'Fehler' : 'Erfolg', message);
};

// --- Screen Component ---

export default function CancelAppointmentScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id } = route.params || {}; // Get 'id' from route params

  const [selectedReason, setSelectedReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock appointment data (using current date for dynamic cancellation fee calculation)
  const appointment = {
    id: id || '123',
    provider: {
      name: 'Amara Styles',
      image: '',
      businessName: 'Braids & Beauty Berlin',
    },
    service: {
      name: 'Box Braids',
      duration: '4 Std.',
      price: 120,
    },
    // Set appointment date 2 days and 1 hour from now for testing fee calculation
    date: new Date(Date.now() + 49 * 60 * 60 * 1000),
    time: '14:00',
    bookedDate: new Date(),
  };

  // Calculate cancellation fee based on time until appointment
  const calculateCancellationFee = () => {
    const now = new Date();
    const [hours, minutes] = appointment.time.split(':').map(Number);
    const appointmentDateTime = new Date(appointment.date);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    const hoursUntil = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntil > 48) {
      return { percentage: 0, amount: 0, timeframe: 'Mehr als 48 Stunden' };
    } else if (hoursUntil > 24) {
      return {
        percentage: 25,
        amount: appointment.service.price * 0.25,
        timeframe: '24-48 Stunden',
      };
    } else if (hoursUntil > 0) {
      return {
        percentage: 50,
        amount: appointment.service.price * 0.5,
        timeframe: 'Weniger als 24 Stunden',
      };
    } else {
      return {
        percentage: 100,
        amount: appointment.service.price,
        timeframe: 'Nach Terminbeginn',
      };
    }
  };

  // Use useMemo to avoid recalculating the fee on every render
  const cancellationFee = useMemo(calculateCancellationFee, [appointment.date, appointment.time, appointment.service.price]);

  const handleCancel = () => {
    if (!selectedReason) {
      showToast('Bitte wählen Sie einen Grund aus', true);
      return;
    }

    if (selectedReason === 'other' && !otherReason.trim()) {
      showToast('Bitte geben Sie einen Grund an', true);
      return;
    }

    // Use React Native's built-in Alert for confirmation
    Alert.alert(
      'Stornierung bestätigen',
      `Sind Sie sicher, dass Sie diesen Termin stornieren möchten? ${cancellationFee.amount > 0
        ? `\n\nEs fällt eine Stornierungsgebühr von ${cancellationFee.amount.toFixed(2)}€ an.`
        : ''
      }`,
      [
        { text: 'Zurück', style: 'cancel' },
        { text: 'Ja, stornieren', style: 'destructive', onPress: confirmCancellation },
      ],
      { cancelable: false }
    );
  };

  const confirmCancellation = async () => {
    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      showToast('Termin erfolgreich storniert');
      // Navigate to the list of appointments
      navigation.navigate('Appointments');
    } catch (error) {
      showToast('Fehler beim Stornieren des Termins', true);
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = selectedReason && (selectedReason !== 'other' || otherReason.trim());

  return (
    <View style={styles.container}>
      {/* Header - typically handled by React Navigation, but defined here for context */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()} // Use goBack for standard mobile navigation
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={colors.gray700} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Termin stornieren</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Warning */}
        <Card style={styles.warningCard}>
          <View style={styles.flexRow}>
            <AlertTriangle size={24} color={colors.error} style={styles.alertIcon} />
            <View style={styles.flexOne}>
              <Text style={styles.warningTitle}>
                Möchten Sie diesen Termin wirklich stornieren?
              </Text>
              <Text style={styles.warningText}>
                Diese Aktion kann nicht rückgängig gemacht werden.
              </Text>
            </View>
          </View>
        </Card>

        {/* Appointment Details */}
        <Card style={styles.detailCard}>
          {/* Provider Info */}
          <View style={styles.providerInfo}>
            <Avatar>
              {appointment.provider.image ? (
                <AvatarImage uri={appointment.provider.image} />
              ) : (
                appointment.provider.name.charAt(0)
              )}
            </Avatar>
            <View style={styles.flexOne}>
              <Text style={styles.providerName}>{appointment.provider.name}</Text>
              <Text style={styles.businessName}>
                {appointment.provider.businessName}
              </Text>
            </View>
          </View>

          {/* Details List */}
          <View style={styles.detailsList}>
            {[
              { icon: Calendar, label: 'Termin', value: formatDate(appointment.date) },
              { icon: Clock, label: 'Uhrzeit', value: `${appointment.time} Uhr (${appointment.service.duration})` },
              { icon: Euro, label: 'Service', value: `${appointment.service.name} - ${appointment.service.price}€` },
            ].map((item, index) => (
              <View key={index} style={styles.detailItem}>
                <View style={styles.iconContainer}>
                  <item.icon size={20} color={colors.gray600} />
                </View>
                <View>
                  <Text style={styles.detailLabel}>{item.label}</Text>
                  <Text style={styles.detailValue}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Cancellation Policy */}
        <Card style={styles.policyCard}>
          <View style={styles.feeHeader}>
            <Text style={styles.label}>Stornierungsgebühr</Text>
            <Text style={styles.timeframe}>{cancellationFee.timeframe}</Text>
          </View>

          <View style={styles.feeBox}>
            <View style={styles.flexBetween}>
              <Text style={styles.feeText}>
                Gebühr ({cancellationFee.percentage}%)
              </Text>
              <Text style={styles.feeText}>
                {cancellationFee.amount.toFixed(2)}€
              </Text>
            </View>
            <View style={[styles.flexBetween, styles.refundDivider]}>
              <Text style={styles.feeText}>Rückerstattung</Text>
              <Text style={styles.feeText}>
                {(appointment.service.price - cancellationFee.amount).toFixed(2)}€
              </Text>
            </View>
          </View>

          <View style={styles.policyTextContainer}>
            <Text style={styles.policyLabel}>Stornierungsrichtlinien:</Text>
            <Text style={styles.policyListItem}>• Mehr als 48 Std. vorher: Kostenlos</Text>
            <Text style={styles.policyListItem}>• 24-48 Std. vorher: 25% Gebühr</Text>
            <Text style={styles.policyListItem}>• Weniger als 24 Std.: 50% Gebühr</Text>
            <Text style={styles.policyListItem}>• Nach Terminbeginn: 100% Gebühr</Text>
          </View>
        </Card>

        {/* Cancellation Reason (Radio Group) */}
        <View style={styles.reasonSection}>
          <Text style={styles.reasonLabel}>
            Grund für die Stornierung <Text style={styles.required}>*</Text>
          </Text>

          {cancellationReasons.map((reason) => {
            const selected = selectedReason === reason.value;
            return (
              <Pressable
                key={reason.value}
                onPress={() => setSelectedReason(reason.value)}
                style={[
                  styles.radioButtonItem,
                  { borderColor: selected ? colors.primary : colors.gray200 },
                ]}
              >
                <View style={styles.radioItemRow}>
                  <Text style={styles.radioItemLabel}>{reason.label}</Text>
                  {selected ? <ChevronRight size={18} color={colors.primary} /> : null}
                </View>
              </Pressable>
            );
          })}

          {selectedReason === 'other' && (
            <Textarea
              placeholder="Bitte beschreiben Sie Ihren Grund..."
              value={otherReason}
              onChangeText={setOtherReason}
              maxLength={500}
              style={styles.textareaMargin}
            />
          )}
        </View>

        {/* Alternative Options */}
        {/* [MVP-CUT] Reason: Feature disabled for MVP, hidden from UI | Restore in: v2 */}
        {/* <Card style={styles.alternativeCard}>
          <Text style={styles.alternativeTitle}>
            <Text style={styles.alternativeTitleBold}>Alternativen zur Stornierung:</Text>
          </Text>
          <Button
            title="Termin verschieben"
            icon={<Calendar size={20} color={colors.info} />}
            onPress={() => navigation.navigate('RescheduleAppointment', { id })}
            variant="outline"
            style={styles.rescheduleButton}
          />
        </Card> */}
      </ScrollView>

      {/* Action Buttons (Fixed Footer is common in RN) */}
      <View style={styles.footer}>
        <Button
          title="Termin stornieren"
          icon={<X size={20} color={colors.white} />}
          onPress={handleCancel}
          disabled={!canSubmit || loading}
          loading={loading}
          style={styles.cancelButton}
        />

        <Button
          title="Abbrechen"
          onPress={() => navigation.goBack()}
          variant="ghost"
          style={styles.cancelLinkButton}
        />
      </View>
    </View>
  );
}

// --- StyleSheet API for Styling ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    paddingTop: Platform.OS === 'android' ? 40 : 16, // Simple SafeArea
  },
  backButton: {
    padding: 8,
    marginRight: 16,
    // Add a circular ripple effect for Android/iOS with platform-specific code if needed
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray800,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Make space for the fixed footer
  },
  // --- Warning Card ---
  warningCard: {
    backgroundColor: colors.red50,
    borderColor: colors.red200,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warningTitle: {
    color: colors.red900,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  warningText: {
    color: colors.red800,
    fontSize: 14,
  },
  // --- Detail Card ---
  detailCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  providerName: {
    color: colors.gray800,
    fontSize: 18,
    fontWeight: '600',
  },
  businessName: {
    color: colors.gray600,
    fontSize: 14,
  },
  detailsList: {
    borderTopColor: colors.gray200,
    borderTopWidth: 1,
    paddingTop: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    width: 36,
    marginRight: 12,
  },
  detailLabel: {
    color: colors.gray600,
    fontSize: 12,
  },
  detailValue: {
    color: colors.gray800,
    fontSize: 16,
    fontWeight: '500',
  },
  // --- Policy Card ---
  policyCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
  },
  feeHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  label: {
    color: colors.gray800,
    fontSize: 16,
    fontWeight: '600',
  },
  timeframe: {
    color: colors.gray600,
    fontSize: 14,
  },
  feeBox: {
    backgroundColor: colors.amber50,
    borderColor: colors.amber200,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
  },
  flexBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  feeText: {
    color: colors.amber900,
    fontSize: 16,
  },
  refundDivider: {
    borderTopColor: colors.amber300,
    borderTopWidth: 1,
    marginTop: 8,
    paddingTop: 8,
  },
  policyTextContainer: {
    // Container styles for the policy text block
    marginTop: 8,
  },
  policyLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  policyListItem: {
    fontSize: 14,
    color: colors.gray600,
    marginLeft: 8,
    // React Native StyleSheet doesn't support `gap`; use marginTop for spacing between items
    marginTop: 4,
  },
  // --- Reason Section ---
  reasonSection: {
    marginBottom: 16,
  },
  reasonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray800,
    marginBottom: 12,
  },
  required: {
    color: colors.error,
  },
  radioButtonItem: {
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  // --- Alternative Card ---
  alternativeCard: {
    padding: 16,
    backgroundColor: COLORS.infoBg,
    borderColor: COLORS.infoBorder,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
  },
  alternativeTitle: {
    fontSize: 14,
    color: COLORS.infoText,
    marginBottom: 12,
  },
  alternativeTitleBold: {
    fontWeight: '600',
  },
  rescheduleButton: {
    borderColor: colors.blue200,
    backgroundColor: 'transparent',
    // The button component would handle hover/press state for hover:bg-blue-100
  },
  // --- Fixed Footer ---
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16, // Add padding for iPhone safe area
  },
  cancelButton: {
    backgroundColor: colors.error,
    marginBottom: 12,
  },
  cancelLinkButton: {
    // Styling for the "Abbrechen" button as an outline/ghost style
    backgroundColor: 'transparent',
    borderColor: colors.gray300,
  },
  alertIcon: { marginRight: 12, marginTop: 2 },
  flexOne: { flex: 1 },
  radioItemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  radioItemLabel: { color: colors.gray800 },
  textareaMargin: { marginTop: 12 },
});
