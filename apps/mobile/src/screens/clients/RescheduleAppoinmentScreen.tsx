import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
// Note: We use placeholders for navigation (useNavigation, useRoute) 
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  CheckCircle,
} from 'lucide-react-native'; // Using lucide-react-native for icons
import Button from '../../components/Button';
import Card from '../../components/Card';
import Avatar, { AvatarImage } from '../../components/avatar';
import Textarea from '../../components/textarea';

// --- Constants & Utilities ---

const PRIMARY_COLOR = '#8B4513';

const showToast = (message: string, isError: boolean = false): void => {
  Alert.alert(isError ? 'Fehler' : 'Erfolg', message);
};

// Format a date as a localized German string
const formatDate = (date: Date | undefined): string => {
  if (!date) return '';
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

// Minimal inline calendar to avoid missing component errors
type CustomCalendarProps = {
  selectedDate?: Date;
  onSelectDate: (date: Date) => void;
  isDateDisabled: (date: Date) => boolean;
};

const CustomCalendar: React.FC<CustomCalendarProps> = ({ selectedDate, onSelectDate, isDateDisabled }) => {
  const days: Date[] = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {days.map((d) => {
        const disabled = isDateDisabled(d);
        const isActive = selectedDate && d.toDateString() === selectedDate.toDateString();
        return (
          <TouchableOpacity
            key={d.toISOString()}
            disabled={disabled}
            onPress={() => onSelectDate(d)}
            style={[
              styles.timeSlotButton,
              isActive && styles.timeSlotButtonActive,
              disabled && { opacity: 0.5 },
            ]}
            activeOpacity={0.7}
         >
            <CalendarIcon size={16} color={isActive ? PRIMARY_COLOR : '#4B5563'} />
            <Text style={styles.timeSlotText}>
              {new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit' }).format(d)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// --- Screen Component ---

export default function RescheduleAppointmentScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id } = route.params || {};

  /**
   * @typedef {'date'|'time'|'confirm'} Step
   * @type {[Step, (next: Step) => void]}
   */
  const [step, setStep] = useState('date');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock current appointment data
  const currentAppointment = {
    id: id || 'mock_id_123',
    provider: {
      name: 'Amara Styles',
      image: '',
      businessName: 'Braids & Beauty Berlin',
    },
    service: {
      name: 'Box Braids',
      duration: '4 Std.',
      price: '120€',
    },
    currentDate: new Date(2024, 10, 25), // Nov 25, 2024
    currentTime: '14:00',
  };

  // Mock available time slots - replace with real data from API
  const availableSlots = [
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
  ];

  // Determine whether a date is disabled in the calendar
  const isDateDisabled = useCallback((date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Disable past dates
    if (date < today) return true;
    
    // Disable dates more than 60 days in future
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 60);
    if (date > maxDate) return true;
    
    // Disable Sundays (example)
    if (date.getDay() === 0) return true;
    
    return false;
  }, []);

  // Handle selection of a date
  const handleDateSelect = (date: Date | undefined): void => {
    setSelectedDate(date);
    setSelectedTime(''); // Reset time selection when date changes
    if (date && !isDateDisabled(date)) {
      setStep('time');
    }
  };

  // Handle selection of a time string (HH:mm)
  const handleTimeSelect = (time: string): void => {
    setSelectedTime(time);
  };

  const handleContinueToConfirm = () => {
    if (!selectedTime) {
      showToast('Bitte wählen Sie eine Uhrzeit', true);
      return;
    }
    setStep('confirm');
  };

  const handleConfirmReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      showToast('Bitte wählen Sie Datum und Uhrzeit', true);
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      showToast('Termin erfolgreich verschoben');
      navigation.navigate('AppointmentDetails', { id: currentAppointment.id });
    } catch (error) {
      showToast('Fehler beim Verschieben des Termins', true);
    } finally {
      setLoading(false);
    }
  };
  
  // Logic for the back button in the header
  const handleBack = () => {
    if (step === 'time') {
      setStep('date');
    } else if (step === 'confirm') {
      setStep('time');
    } else {
      navigation.goBack(); // or navigate to specific screen
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'date':
        return 'Datum wählen';
      case 'time':
        return 'Uhrzeit wählen';
      case 'confirm':
        return 'Bestätigen';
      default:
        return 'Termin verschieben';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Termin verschieben</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Progress Steps */}
        <View style={styles.progressBarContainer}>
          {['date', 'time', 'confirm'].map((s, index) => {
            const isCurrent = step === s;
            const isCompleted = ['date', 'time', 'confirm'].indexOf(step) > index;
            
            return (
              <React.Fragment key={s}>
                <View
                  style={[
                    styles.stepCircle,
                    isCurrent && styles.stepCircleActive,
                    isCompleted && styles.stepCircleCompleted,
                  ]}
                >
                  {isCompleted ? (
                    <CheckCircle size={20} color="white" />
                  ) : (
                    <Text style={isCurrent ? styles.stepTextActive : styles.stepTextInactive}>
                      {index + 1}
                    </Text>
                  )}
                </View>
                {index < 2 && (
                  <View
                    style={[
                      styles.stepLine,
                      isCompleted && styles.stepLineCompleted,
                    ]}
                  />
                )}
              </React.Fragment>
            );
          })}
        </View>

        {/* Current Appointment Info */}
        <Card style={styles.appointmentCard}>
          <View style={styles.flexRow}>
            <Avatar style={styles.avatar} size={64}>
              {currentAppointment.provider.image ? (
                <AvatarImage uri={currentAppointment.provider.image} />
              ) : (
                currentAppointment.provider.name.charAt(0)
              )}
            </Avatar>
            <View style={styles.appointmentDetails}>
              <Text style={styles.providerName}>{currentAppointment.provider.name}</Text>
              <Text style={styles.businessName}>
                {currentAppointment.provider.businessName}
              </Text>
              <Text style={styles.serviceName}>
                {currentAppointment.service.name}
              </Text>
            </View>
          </View>

          <View style={styles.currentInfo}>
            <View style={styles.flexRowSmall}>
              <Text style={styles.currentInfoLabel}>Aktueller Termin:</Text>
              <Text style={styles.currentInfoText}>{formatDate(currentAppointment.currentDate)}</Text>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.currentInfoText}>{currentAppointment.currentTime} Uhr</Text>
            </View>
          </View>
        </Card>

        {/* Reschedule Policy */}
        <Card style={styles.policyCard}>
          <View style={styles.flexRow}>
            <AlertCircle size={20} color="#D97706" style={{ marginRight: 12, marginTop: 2 }} />
            <View style={{ flex: 1, gap: 8 }}>
              <Text style={styles.policyTitle}>
                <Text style={{ fontWeight: '600' }}>Umbuchungsrichtlinie:</Text>
              </Text>
              <View style={styles.policyList}>
                <Text style={styles.policyItem}>• Kostenlose Umbuchung bis 48 Std. vorher</Text>
                <Text style={styles.policyItem}>• 24-48 Std. vorher: 25% Gebühr</Text>
                <Text style={styles.policyItem}>• Weniger als 24 Std.: 50% Gebühr</Text>
              </View>
            </View>
          </View>
        </Card>

        <Text style={styles.stepTitle}>{getStepTitle()}</Text>

        {/* Step 1: Date Selection */}
        {step === 'date' && (
          <View style={styles.stepContent}>
            <Card style={styles.calendarCard}>
              <CustomCalendar
                selectedDate={selectedDate}
                onSelectDate={handleDateSelect}
                isDateDisabled={isDateDisabled}
                // Placeholder for RN Calendar properties
              />
            </Card>
            <Button
                title="Weiter"
                onPress={() => selectedDate && handleDateSelect(selectedDate)}
                disabled={!selectedDate || isDateDisabled(selectedDate)}
                style={styles.continueButton}
            />
          </View>
        )}

        {/* Step 2: Time Selection */}
        {step === 'time' && selectedDate && (
          <View style={styles.stepContent}>
            <Text style={styles.timeDateText}>
              {formatDate(selectedDate)}
            </Text>
            
            <View style={styles.timeSlotGrid}>
              {availableSlots.map((time) => (
                <TouchableOpacity
                  key={time}
                  onPress={() => handleTimeSelect(time)}
                  style={[
                    styles.timeSlotButton,
                    selectedTime === time && styles.timeSlotButtonActive,
                  ]}
                  activeOpacity={0.7}
                >
                  <Clock size={20} color={selectedTime === time ? PRIMARY_COLOR : '#4B5563'} />
                  <Text style={styles.timeSlotText}>{time}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title="Weiter zur Bestätigung"
              onPress={handleContinueToConfirm}
              disabled={!selectedTime}
              style={styles.continueButton}
            />
          </View>
        )}

        {/* Step 3: Confirmation */}
        {step === 'confirm' && selectedDate && selectedTime && (
          <View style={styles.stepContent}>
            <Card style={styles.confirmationCard}>
              <Text style={styles.confirmationTitle}>Neuer Termin</Text>
              
              <View style={styles.confirmationDetail}>
                <CalendarIcon size={20} color={PRIMARY_COLOR} style={{ marginTop: 2 }} />
                <View>
                  <Text style={styles.confirmationLabel}>Datum</Text>
                  <Text style={styles.confirmationValue}>{formatDate(selectedDate)}</Text>
                </View>
              </View>

              <View style={styles.confirmationDetail}>
                <Clock size={20} color={PRIMARY_COLOR} style={{ marginTop: 2 }} />
                <View>
                  <Text style={styles.confirmationLabel}>Uhrzeit</Text>
                  <Text style={styles.confirmationValue}>{selectedTime} Uhr</Text>
                </View>
              </View>
            </Card>

            <View style={styles.reasonSection}>
              <Text style={styles.reasonLabel}>Grund für die Umbuchung (optional)</Text>
              <Textarea
                placeholder="Teilen Sie dem Anbieter mit, warum Sie den Termin verschieben möchten..."
                value={reason}
                onChangeText={setReason}
                maxLength={500}
                style={{ minHeight: 100 }}
              />
              <Text style={styles.reasonCount}>
                {reason.length}/500
              </Text>
            </View>

            <View style={styles.submitSection}>
              <Button
                title="Termin bestätigen"
                onPress={handleConfirmReschedule}
                loading={loading}
                disabled={loading}
                style={styles.submitButton}
              />

              <Button
                title="Zurück"
                onPress={() => setStep('time')}
                variant="ghost"
                style={styles.cancelButton}
                disabled={loading}
              />
            </View>
            
            <Text style={styles.privacyNote}>
              Der Anbieter wird über die Änderung benachrichtigt und muss diese bestätigen
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// --- StyleSheet API for Styling ---

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    flexDirection: 'row',
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerTitle: {
    color: '#1F2937',
    fontSize: 20,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  flexRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  flexRowSmall: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  // --- Progress Steps ---
  progressBarContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  stepCircle: {
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32, // bg-gray-200
  },
  stepCircleActive: {
    backgroundColor: PRIMARY_COLOR, // bg-[#8B4513]
  },
  stepCircleCompleted: {
    backgroundColor: '#10B981', // bg-green-500
  },
  stepTextActive: {
    color: 'white',
    fontSize: 14,
  },
  stepTextInactive: {
    color: '#4B5563', // text-gray-600
    fontSize: 14,
  },
  stepLine: {
    width: 48, // w-12
    height: 4, // h-1
    marginHorizontal: 4, // mx-1
    backgroundColor: '#E5E7EB', // bg-gray-200
    borderRadius: 2,
  },
  stepLineCompleted: {
    backgroundColor: '#10B981', // bg-green-500
  },
  stepTitle: {
    color: '#1F2937',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  // --- Appointment Info ---
  appointmentCard: {
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
  },
  avatar: {
    borderRadius: 32,
    height: 64,
    marginRight: 16,
    width: 64,
  },
  appointmentDetails: {
    flex: 1,
  },
  providerName: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: '600',
  },
  businessName: {
    color: '#4B5563',
    fontSize: 14,
    marginBottom: 4,
  },
  serviceName: {
    color: '#1F2937',
    fontSize: 14,
    marginTop: 4,
  },
  currentInfo: {
    borderTopColor: '#E5E7EB',
    borderTopWidth: 1,
    marginTop: 16,
    paddingTop: 16,
  },
  currentInfoLabel: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '500',
  },
  currentInfoText: {
    color: '#4B5563',
    fontSize: 14,
  },
  separator: {
    color: '#D1D5DB',
    fontSize: 14,
  },
  // --- Policy Card ---
  policyCard: {
    padding: 16,
    backgroundColor: '#FFFBEB', // bg-amber-50
    borderColor: '#FDE68A', // border-amber-200
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  policyTitle: {
    color: '#78350F',
    fontSize: 14, // text-amber-900
  },
  policyList: {
    gap: 4,
  },
  policyItem: {
    color: '#92400E',
    fontSize: 14, // text-amber-800
  },
  // --- Step Content ---
  stepContent: {
    gap: 16,
  },
  calendarCard: {
    borderRadius: 8,
    padding: 8,
  },
  timeDateText: {
    color: '#4B5563',
    fontSize: 16,
    textAlign: 'center',
  },
  timeSlotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between', // Adjust gap for spacing between items
  },
  timeSlotButton: {
    width: '32%', // Approximate 1/3 width (grid-cols-3)
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
  },
  timeSlotButtonActive: {
    backgroundColor: `${PRIMARY_COLOR}0D`,
    borderColor: PRIMARY_COLOR, // 0D is approx 5% opacity for #8B4513
  },
  timeSlotText: {
    color: '#1F2937',
    fontSize: 14,
  },
  continueButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 8,
    height: 48,
  },
  // --- Confirmation ---
  confirmationCard: {
    borderRadius: 8,
    gap: 16,
    padding: 16,
  },
  confirmationTitle: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmationDetail: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  confirmationLabel: {
    color: '#4B5563',
    fontSize: 14,
  },
  confirmationValue: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '500',
  },
  reasonSection: {
    gap: 8,
  },
  reasonLabel: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
  },
  reasonCount: {
    color: '#6B7280',
    fontSize: 12,
    textAlign: 'right',
  },
  submitSection: {
    gap: 12,
  },
  submitButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 8,
    height: 48,
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    borderWidth: 1,
  },
  privacyNote: {
    color: '#4B5563',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});