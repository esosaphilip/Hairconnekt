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
// Replaced web imports with React Native core components and custom components
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext'; // Assuming this context is adapted for RN
import Text from '../components/Text'; // Custom Text component for consistent styles
import Button from '../components/Button'; // Custom Button component
import Card from '../components/Card'; // Custom Card/Container component
import IconButton from '../components/IconButton'; // Custom component for icon-only buttons
import { Calendar } from '../components/Calendar'; // Assuming a custom/community Calendar component
import Input from '../components/Input'; // Used for Textarea replacement
import Icon from '../components/Icon'; // Assuming a component to handle icons (e.g., using react-native-vector-icons or similar)

// Helper data remains the same
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

// --- Custom Styles and Tokens (Simulating Tailwind/Shadcn-like structure) ---
const COLORS = {
  primary: '#8B4513', // HairConnekt Brown
  secondary: '#5C2E0A',
  background: '#F9FAFB', // gray-50
  white: '#FFFFFF',
  text: '#1F2937', // gray-800
  textSecondary: '#6B7280', // gray-600
  border: '#E5E7EB', // gray-200
  success: '#10B981', // green-500
  infoBg: '#EFF6FF', // blue-50
};

const SPACING = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32,
};

const FONT_SIZES = {
  h4: 18, h5: 16, body: 14, small: 12,
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
  const [showSignInPrompt, setShowSignInPrompt] = useState<boolean>(false);

  // React Navigation Hooks (Replaces react-router-dom hooks)
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id } = (route.params || {}) as { id?: string };
  
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
        navigation.navigate('SignInPrompt', {
          returnUrl: `BookingFlow`, // Pass current screen name to return to
          params: { id, selectedServices, selectedDate, selectedTime, mobileService, notes, paymentMethod }
        });
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
          <Icon name="check" size={40} color={COLORS.white} />
        </View>
        <Text style={styles.confirmationTitle}>Termin bestätigt! 🎉</Text>
        <Text style={styles.confirmationSubtitle}>Dein Termin wurde erfolgreich gebucht</Text>

        <Card style={styles.confirmationCard}>
          <View style={{ alignItems: 'center', marginBottom: SPACING.md }}>
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
            style={{ backgroundColor: COLORS.primary }}
            icon="calendar" // Assuming Button component supports an icon prop
          />
          <Button
            title="Zu meinen Terminen"
            variant="outline"
            onPress={() => navigation.navigate('Appointments')}
            style={{ marginTop: SPACING.md }}
          />
          <Button
            title="Zurück zur Startseite"
            variant="ghost"
            onPress={() => navigation.navigate('Home')}
            style={{ marginTop: SPACING.md }}
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
          <View style={{ marginLeft: SPACING.sm }}>
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
                      <Icon name="check" size={12} color={COLORS.white} />
                    )}
                  </View>
                  <View style={styles.serviceDetails}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <View style={styles.serviceMeta}>
                      <Icon name="clock" size={14} color={COLORS.textSecondary} />
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
                  <View key={period} style={{ marginTop: SPACING.md }}>
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
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                  thumbColor={COLORS.white}
                  ios_backgroundColor={COLORS.border}
                  onValueChange={setMobileService}
                  value={mobileService}
                />
              </View>
              {mobileService && (
                <View style={styles.mobileServiceInfo}>
                  <Text style={styles.mobileServiceText}>
                    <Icon name="map-pin" size={14} color={COLORS.textSecondary} style={{ marginRight: SPACING.xs }} />
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

// --- React Native Stylesheet ---
const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === 'android' ? SPACING.md : 0, // Better handling for Android status bar
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.h4,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
  },
  progressBarContainer: {
    flexDirection: 'row',
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    marginRight: SPACING.xs,
  },
  progressActive: {
    backgroundColor: COLORS.primary,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 150, // To ensure content above the fixed footer is visible
  },
  stepContainer: {
    // spacing handled by margins on child elements
  },
  stepTitle: {
    fontSize: FONT_SIZES.h4,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  // --- Service Card Styles ---
  serviceCard: {
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
    marginBottom: SPACING.sm,
  },
  serviceCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '0D', // 5% opacity
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
    marginRight: SPACING.sm,
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  serviceDetails: {
    flex: 1,
  },
  serviceName: {
    fontSize: FONT_SIZES.h5,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
  },
  serviceDuration: {
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    marginRight: SPACING.sm,
  },
  servicePrice: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  // --- Date/Time Styles ---
  card: {
    padding: SPACING.md,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  cardTitle: {
    fontSize: FONT_SIZES.h5,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  timePeriod: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  timeSlot: {
    padding: SPACING.sm,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
    minWidth: '32%',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  timeSlotSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  timeText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
  },
  timeTextSelected: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  // --- Details Styles ---
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  mobileServiceInfo: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.infoBg,
    borderRadius: 8,
  },
  mobileServiceText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  mobileServiceFee: {
    fontSize: FONT_SIZES.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  notesInput: {
    minHeight: 100,
    textAlignVertical: 'top', // Crucial for Android multiline input
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
  },
  charCount: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'right',
  },
  paymentOptions: {
    // spacing handled by margins on payment buttons
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  paymentButton: {
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  paymentButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '0D',
  },
  cancellationList: {
    // spacing handled by margins on items
  },
  cancellationItem: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  // --- Footer/Summary Styles ---
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 2,
    borderTopColor: COLORS.border,
    padding: SPACING.md,
    // Max width styling for web-like behavior in a mobile view (optional)
    alignSelf: 'center',
    width: '100%',
    maxWidth: 428,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  summaryTotalLabel: {
    fontSize: FONT_SIZES.h5,
    fontWeight: '600',
  },
  summaryTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  // --- Confirmation Styles ---
  confirmationContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  checkIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.success,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    // Note: React Native needs a custom animation implementation, no simple 'animate-bounce' class
  },
  confirmationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  confirmationSubtitle: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  confirmationCard: {
    width: '100%',
    maxWidth: 400,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  bookingNumberLabel: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
  },
  bookingNumberValue: {
    fontSize: FONT_SIZES.h5,
    fontWeight: '600',
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  detailLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.body,
  },
  totalPriceValue: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  buttonGroup: {
    width: '100%',
    maxWidth: 400,
  },
});