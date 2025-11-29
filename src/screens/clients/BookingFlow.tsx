import React, { useState } from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Platform,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/auth/AuthContext';
import Text from '@/components/Text';
import Button from '@/components/Button';
import Card from '@/components/Card';
import IconButton from '@/components/IconButton';
import Calendar from '@/components/calendar.native';
import Input from '@/components/Input';
import Icon from '@/components/Icon';
import { colors, spacing, typography, radii, COLORS, SPACING, FONT_SIZES } from '@/theme/tokens';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { rootNavigationRef } from '@/navigation/rootNavigation';
 

const services = [
  { id: 1, name: 'Classic Box Braids', duration: '3-4 Std.', price: 55 },
  { id: 2, name: 'Knotless Box Braids', duration: '4-5 Std.', price: 65 },
  { id: 3, name: 'Simple Cornrows', duration: '2-3 Std.', price: 45 },
];

const timeSlots = {
  morning: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'],
  afternoon: ['13:00', '13:30', '14:00', '14:30', '15:00', '15:30'],
  evening: ['17:00', '17:30', '18:00', '18:30', '19:00'],
};

// --- BookingFlow Component ---

export function BookingFlow() {
  const [step, setStep] = useState<'services' | 'datetime' | 'details' | 'confirmation'>('services');
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [mobileService, setMobileService] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'paypal'>('cash');
 

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  // id from routeParams is not needed directly in this screen
  
  // Auth Context (Adaptation for React Native)
  const { tokens } = useAuth();
  const isAuthenticated = !!tokens?.accessToken;

  // Function to toggle service selection
  const toggleService = (serviceId: number) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  // Function to calculate total price
  const getTotalPrice = (): number => {
    const basePrice = selectedServices.reduce((sum, id) => {
      const service = services.find(s => s.id === id);
      return sum + (service?.price || 0);
    }, 0);
    return mobileService ? basePrice + 15 : basePrice;
  };

  // Function to get total duration string (simplified for display)
  const getTotalDuration = (): string => {
    const selected = services.filter(s => selectedServices.includes(s.id));
    if (selected.length === 0) return '0 Std.';
    // Simplification for display purposes; a real app might calculate an estimated total time range.
    return selected.map(s => s.duration.split(' ')[0]).join(' / ');
  };

  // Function to handle back/step progression
  const handleBack = () => {
    if (step === 'services') {
      navigation.goBack(); // Use navigation's built-in back functionality
    } else if (step === 'datetime') {
      setStep('services');
    } else if (step === 'details') {
      setStep('datetime');
    }
  };

  // Function to handle step progression
  const handleNext = () => {
    if (step === 'services' && selectedServices.length > 0) {
      setStep('datetime');
    } else if (step === 'datetime' && selectedDate && selectedTime) {
      setStep('details');
    } else if (step === 'details') {
      if (!isAuthenticated) {
        // Instead of a component, navigate to a separate Sign-In screen
        navigation.navigate('SignInPrompt', { returnUrl: 'BookingFlow' });
        // Alternatively, if you want to use a modal/overlay like the web version:
        // setShowSignInPrompt(true);
      } else {
        setStep('confirmation');
      }
    }
  };

  // Get current step number for header
  const stepNumber = step === 'services' ? 1 : step === 'datetime' ? 2 : 3;
  const headerTitle = step === 'services' ? 'Services auswählen' :
                      step === 'datetime' ? 'Termin wählen' : 'Buchungsdetails';
  const canProceed = (
    (step === 'services' && selectedServices.length > 0) ||
    (step === 'datetime' && !!selectedDate && !!selectedTime) ||
    (step === 'details')
  );


  // --- Confirmation Step Rendering (Replaces full-page web rendering) ---
  if (step === 'confirmation') {
    return (
      <SafeAreaView style={styles.confirmationContainer}>
          <View style={styles.checkIconContainer}>
            {/* Replaced lucide-react Check with custom/community icon component */}
            <Icon name="check" size={40} color={colors.white} />
          </View>
          <Text style={styles.confirmationTitle}>Termin bestätigt! 🎉</Text>
          <Text style={styles.confirmationSubtitle}>Dein Termin wurde erfolgreich gebucht</Text>

          <Card style={styles.confirmationCard}>
          <View style={styles.centerBlock}
          >
            <Text style={styles.bookingNumberLabel}>Buchungsnummer</Text>
            <Text style={styles.bookingNumberValue}>#BK-20251028-0042</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Datum:</Text>
            <Text>{selectedDate?.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'short' })}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Uhrzeit:</Text>
            <Text>{selectedTime} Uhr</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Dauer:</Text>
            <Text>{getTotalDuration()}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Gesamtpreis:</Text>
            <Text style={styles.totalPriceValue}>€{getTotalPrice()}</Text>
          </View>
        </Card>

        <View style={styles.buttonGroup}>
          <Button
            title="Zum Kalender hinzufügen"
            onPress={() => { /* Implement Add to Calendar logic */ }}
            style={styles.calendarButton}
            icon="calendar" // Assuming Button component supports an icon prop
          />
          <Button
            title="Zu meinen Terminen"
            variant="outline"
            onPress={() => rootNavigationRef.current?.navigate('Tabs', { screen: 'Appointments' })}
            style={styles.mtMd}
          />
          <Button
            title="Zurück zur Startseite"
            variant="ghost"
            onPress={() => rootNavigationRef.current?.navigate('Home')}
            style={styles.mtMd}
          />
        </View>
      </SafeAreaView>
    );
  }

  // --- Main Booking Flow Rendering ---
  return (
    <SafeAreaView style={styles.flexContainer}>
      {/* Header */}
      <View style={styles.header}>
          <View style={styles.headerContent}>
            <IconButton name="arrow-left" onPress={handleBack} />
            <View style={styles.mlSm}>
              <Text style={styles.headerTitle}>{headerTitle}</Text>
              <Text style={styles.headerSubtitle}>Schritt {stepNumber} von 3</Text>
            </View>
          </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressSegment, stepNumber >= 1 && styles.progressActive]} />
          <View style={[styles.progressSegment, stepNumber >= 2 && styles.progressActive]} />
          <View style={[styles.progressSegment, stepNumber >= 3 && styles.progressActive]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Step 1: Service Selection */}
        {step === 'services' && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Wähle deine Services</Text>
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                onPress={() => toggleService(service.id)}
                style={[
                  styles.serviceCard,
                  selectedServices.includes(service.id) && styles.serviceCardSelected,
                ]}
              >
                <View style={styles.serviceItem}>
                  <View style={[
                    styles.checkbox,
                    selectedServices.includes(service.id) && styles.checkboxSelected,
                  ]}>
                    {selectedServices.includes(service.id) && (
                      <Icon name="check" size={12} color={colors.white} />
                    )}
                  </View>
                  <View style={styles.serviceDetails}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <View style={styles.serviceMeta}>
                      <Icon name="clock" size={14} color={colors.gray600} />
                      <Text style={styles.serviceDuration}>{service.duration}</Text>
                      <Text style={styles.servicePrice}>€{service.price}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 2: Date & Time Selection */}
        {step === 'datetime' && (
          <View style={styles.stepContainer}>
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Datum wählen</Text>
              {/* NOTE: You need a proper React Native calendar component here */}
              <Calendar
                selected={selectedDate as Date | undefined}
                onSelect={(d: Date) => setSelectedDate(d)}
                disabledDate={(date: Date) => date < new Date() || date.getDay() === 0}
              />
            </Card>

            {selectedDate && (
              <Card style={styles.card}>
                <Text style={styles.cardTitle}>
                  Verfügbare Zeiten für {selectedDate.toLocaleDateString('de-DE', { day: '2-digit', month: 'long' })}
                </Text>

                {Object.keys(timeSlots).map((period) => (
                  <View key={period} style={styles.mtMd}>
                    <Text style={styles.timePeriod}>{period.charAt(0).toUpperCase() + period.slice(1)}</Text>
                    <View style={styles.timeGrid}>
                      {timeSlots[period as keyof typeof timeSlots].map((time: string) => (
                        <TouchableOpacity
                          key={time}
                          onPress={() => setSelectedTime(time)}
                          style={[
                            styles.timeSlot,
                            selectedTime === time && styles.timeSlotSelected,
                          ]}
                        >
                          <Text style={[
                            styles.timeText,
                            selectedTime === time && styles.timeTextSelected,
                          ]}>
                            {time}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}
              </Card>
            )}
          </View>
        )}

        {/* Step 3: Booking Details */}
        {step === 'details' && (
          <View style={styles.stepContainer}>
            <Card style={styles.card}>
              <View style={styles.detailRow}>
                <Text style={styles.cardTitle}>Mobiler Service</Text>
                <Switch
                  trackColor={{ false: colors.gray200, true: colors.primary }}
                  thumbColor={colors.white}
                  ios_backgroundColor={colors.gray200}
                  onValueChange={setMobileService}
                  value={mobileService}
                />
              </View>
              {mobileService && (
                <View style={styles.mobileServiceInfo}>
                  <Text style={styles.mobileServiceText}>
                    <Icon name="map-pin" size={14} color={colors.gray600} style={styles.mrXs} />
                    Musterstraße 123, 44137 Dortmund
                  </Text>
                  <Text style={styles.mobileServiceFee}>
                    Zusätzliche Gebühr: +€15
                  </Text>
                </View>
              )}
            </Card>

            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Notizen für den Braider</Text>
              {/* Using a custom Input component with multiline for Textarea */}
              <Input
                value={notes}
                onChangeText={setNotes}
                placeholder="Teile besondere Wünsche, Allergien, Haarzustand etc. mit..."
                multiline={true}
                numberOfLines={4}
                maxLength={500}
                style={styles.notesInput}
              />
              <Text style={styles.charCount}>{notes.length}/500</Text>
            </Card>

            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Zahlungsmethode</Text>
              <View style={styles.paymentOptions}>
                {([
                  { key: 'cash', label: '💵 Vor Ort bar zahlen' },
                  { key: 'card', label: '💳 Kreditkarte' },
                  { key: 'paypal', label: 'PayPal' },
                ] as { key: 'cash' | 'card' | 'paypal'; label: string }[]).map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    onPress={() => setPaymentMethod(option.key)}
                    style={[
                      styles.paymentButton,
                      paymentMethod === option.key && styles.paymentButtonSelected,
                    ]}
                  >
                    <Text>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>

            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Stornierungsbedingungen</Text>
              <View style={styles.cancellationList}>
                <Text style={styles.cancellationItem}>✓ Kostenlose Stornierung bis 24 Std. vorher</Text>
                <Text style={styles.cancellationItem}>• 50% Gebühr bei Stornierung {'<'} 24 Std.</Text>
                <Text style={styles.cancellationItem}>• 100% Gebühr bei No-Show</Text>
              </View>
            </Card>
          </View>
        )}
      </ScrollView>

      {/* Bottom Summary/Fixed Footer */}
      <View style={styles.footer}>
        {selectedServices.length > 0 && (
          <View style={{ marginBottom: SPACING.sm }}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Services ({selectedServices.length}):</Text>
              <Text>€{getTotalPrice() - (mobileService ? 15 : 0)}</Text>
            </View>
            {mobileService && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Mobiler Service:</Text>
                <Text>€15</Text>
              </View>
            )}
            <View style={styles.separator} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Gesamtpreis:</Text>
              <Text style={styles.summaryTotalValue}>€{getTotalPrice()}</Text>
            </View>
          </View>
        )}

        <Button
          title={step === 'details' ? 'Jetzt buchen' : 'Weiter'}
          onPress={handleNext}
          disabled={!canProceed}
          style={{ backgroundColor: COLORS.primary }}
          icon="chevron-right" // Assuming Button component supports a trailing icon
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bookingNumberLabel: {
    color: colors.gray600,
    fontSize: typography.small.fontSize,
  },
  bookingNumberValue: {
    fontSize: FONT_SIZES.h5 || 16,
    fontWeight: '600',
  },
  buttonGroup: {
    maxWidth: 400,
    width: '100%',
  },
  calendarButton: {
    backgroundColor: colors.primary,
  },
  cancellationItem: {
    color: colors.gray600,
    fontSize: typography.body.fontSize,
    marginBottom: spacing.xs,
  },
  cancellationList: {},
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    elevation: 2,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  cardTitle: {
    fontSize: FONT_SIZES.h5 || 16,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  centerBlock: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  charCount: {
    color: colors.gray600,
    fontSize: typography.small.fontSize,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  checkIconContainer: {
    alignItems: 'center',
    backgroundColor: colors.green500,
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    marginBottom: spacing.lg,
    width: 80,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: colors.gray200,
    borderRadius: radii.sm,
    borderWidth: 2,
    flexShrink: 0,
    height: 20,
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginTop: 2,
    width: 20,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  confirmationCard: {
    marginBottom: spacing.xl,
    maxWidth: 400,
    padding: spacing.lg,
    width: '100%',
  },
  confirmationContainer: {
    alignItems: 'center',
    backgroundColor: colors.gray50,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  confirmationSubtitle: {
    color: colors.gray600,
    fontSize: typography.body.fontSize,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  confirmationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  detailLabel: {
    color: colors.gray600,
    fontSize: typography.body.fontSize,
  },
  detailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  flexContainer: {
    backgroundColor: colors.gray50,
    flex: 1,
  },
  footer: {
    alignSelf: 'center',
    backgroundColor: colors.white,
    borderTopColor: colors.gray200,
    borderTopWidth: 2,
    bottom: 0,
    left: 0,
    maxWidth: 428,
    padding: spacing.md,
    position: 'absolute',
    right: 0,
    width: '100%',
  },
  header: {
    backgroundColor: colors.white,
    borderBottomColor: colors.gray200,
    borderBottomWidth: 1,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === 'android' ? spacing.md : 0,
    zIndex: 10,
  },
  headerContent: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    color: colors.gray600,
    fontSize: typography.small.fontSize,
  },
  headerTitle: {
    fontSize: FONT_SIZES.h4 || 18,
    fontWeight: '600',
  },
  mlSm: {
    marginLeft: spacing.sm,
  },
  mobileServiceFee: {
    color: colors.primary,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  mobileServiceInfo: {
    backgroundColor: colors.infoBg,
    borderRadius: radii.md,
    marginTop: spacing.sm,
    padding: spacing.sm,
  },
  mobileServiceText: {
    color: colors.gray800,
    fontSize: typography.body.fontSize,
    marginBottom: spacing.xs,
  },
  mrXs: {
    marginRight: spacing.xs,
  },
  mtMd: {
    marginTop: spacing.md,
  },
  notesInput: {
    borderColor: colors.gray200,
    borderRadius: radii.md,
    borderWidth: 1,
    minHeight: 100,
    padding: spacing.sm,
    textAlignVertical: 'top',
  },
  paymentButton: {
    borderColor: colors.gray200,
    borderRadius: radii.md,
    borderWidth: 2,
    marginBottom: spacing.sm,
    marginRight: spacing.sm,
    padding: spacing.md,
  },
  paymentButtonSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  paymentOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  progressActive: {
    backgroundColor: colors.primary,
  },
  progressBarContainer: {
    flexDirection: 'row',
  },
  progressSegment: {
    backgroundColor: colors.gray200,
    borderRadius: 2,
    flex: 1,
    height: 4,
    marginRight: spacing.xs,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 150,
  },
  separator: {
    backgroundColor: colors.gray200,
    height: 1,
    marginVertical: spacing.sm,
  },
  serviceCard: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderWidth: 0,
    elevation: 2,
    marginBottom: spacing.sm,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  serviceCardSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  serviceDetails: {
    flex: 1,
  },
  serviceDuration: {
    color: colors.gray600,
    marginLeft: spacing.xs,
    marginRight: spacing.sm,
  },
  serviceItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  serviceMeta: {
    alignItems: 'center',
    color: colors.gray600,
    flexDirection: 'row',
    fontSize: typography.body.fontSize,
  },
  serviceName: {
    fontSize: FONT_SIZES.h5 || 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  servicePrice: {
    color: colors.primary,
    fontWeight: '600',
  },
  stepContainer: {},
  stepTitle: {
    fontSize: FONT_SIZES.h4 || 18,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    color: colors.gray600,
    fontSize: typography.body.fontSize,
  },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  summaryTotalLabel: {
    fontSize: FONT_SIZES.h5 || 16,
    fontWeight: '600',
  },
  summaryTotalValue: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  timePeriod: {
    color: colors.gray600,
    fontSize: typography.body.fontSize,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  timeSlot: {
    alignItems: 'center',
    borderColor: colors.gray200,
    borderRadius: radii.md,
    borderWidth: 2,
    justifyContent: 'center',
    marginBottom: spacing.xs,
    marginRight: spacing.xs,
    minWidth: '32%',
    padding: spacing.sm,
  },
  timeSlotSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeText: {
    color: colors.gray800,
    fontSize: typography.body.fontSize,
  },
  timeTextSelected: {
    color: colors.white,
    fontWeight: 'bold',
  },
  totalPriceValue: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});
