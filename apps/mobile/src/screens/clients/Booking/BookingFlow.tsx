import React from 'react';
import {
    View,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    Switch,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '@/navigation/types';
import Text from '@/components/Text';
import Button from '@/components/Button';
import Card from '@/components/Card';
import IconButton from '@/components/IconButton';
import Calendar from '@/components/calendar.native';
import Input from '@/components/Input';
import Icon from '@/components/Icon';
import { colors, COLORS, SPACING } from '@/theme/tokens';
import { DateService } from '@/domain/services/DateService';
import { rootNavigationRef } from '@/navigation/rootNavigation';
import { styles } from './BookingFlow.styles';
import { useBookingFlow } from './hooks/useBookingFlow';

const timeSlots = {
    morning: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'],
    afternoon: ['13:00', '13:30', '14:00', '14:30', '15:00', '15:30'],
    evening: ['17:00', '17:30', '18:00', '18:30', '19:00'],
};

export type BookingRouteProp = RouteProp<RootStackParamList, 'Booking'>;

export function BookingFlow() {
    const route = useRoute<BookingRouteProp>();
    const { id, providerId } = route.params || {};
    const finalId = (id || providerId) as string;

    const {
        step,
        selectedServices,
        selectedDate,
        setSelectedDate,
        selectedTime,
        setSelectedTime,
        mobileService,
        setMobileService,
        notes,
        setNotes,
        paymentMethod,
        setPaymentMethod,
        loadingProvider,
        servicesList,
        toggleService,
        getTotalPrice,
        getTotalDuration,
        handleBack,
        handleNext,
        stepNumber,
        headerTitle,
        canProceed,
    } = useBookingFlow(finalId);

    if (loadingProvider) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    if (step === 'confirmation') {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
                <ScrollView contentContainerStyle={[styles.confirmationContainer, { flexGrow: 1 }]}>
                    <View style={styles.checkIconContainer}>
                        <Icon name="check" size={40} color={colors.white} />
                    </View>
                    <Text style={styles.confirmationTitle}>Termin bestätigt! 🎉</Text>
                    <Text style={styles.confirmationSubtitle}>Dein Termin wurde erfolgreich gebucht</Text>

                    <Card style={styles.confirmationCard}>
                        <View style={styles.centerBlock}>
                            <Text style={styles.bookingNumberLabel}>Buchungsnummer</Text>
                            <Text style={styles.bookingNumberValue}>#BK-20251028-0042</Text>
                        </View>
                        <View style={styles.separator} />
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Datum:</Text>
                            <Text>{selectedDate ? DateService.formatWeekdayDateMonth(selectedDate) : ''}</Text>
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
                            icon="calendar"
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
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <IconButton name="arrow-left" onPress={handleBack} />
                    <View style={styles.mlSm}>
                        <Text style={styles.headerTitle}>{headerTitle}</Text>
                        <Text style={styles.headerSubtitle}>Schritt {stepNumber} von 3</Text>
                    </View>
                </View>

                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressSegment, stepNumber >= 1 && styles.progressActive]} />
                    <View style={[styles.progressSegment, stepNumber >= 2 && styles.progressActive]} />
                    <View style={[styles.progressSegment, stepNumber >= 3 && styles.progressActive]} />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {step === 'services' && (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>Wähle deine Services</Text>
                        {servicesList.length === 0 ? (
                            <Text style={{ padding: 20, textAlign: 'center' }}>Keine Services verfügbar.</Text>
                        ) : (
                            servicesList.map((service, index) => (
                                <TouchableOpacity
                                    key={index}
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
                                                <Text style={styles.servicePrice}>{service.price}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                )}

                {step === 'datetime' && (
                    <View style={styles.stepContainer}>
                        <Card style={styles.card}>
                            <Text style={styles.cardTitle}>Datum wählen</Text>
                            <Calendar
                                selected={selectedDate as Date | undefined}
                                onSelect={(d: Date) => setSelectedDate(d)}
                                disabledDate={(date: Date) => date < new Date() || date.getDay() === 0}
                            />
                        </Card>

                        {selectedDate && (
                            <Card style={styles.card}>
                                <Text style={styles.cardTitle}>
                                    Verfügbare Zeiten für {DateService.formatWeekdayDateMonth(selectedDate)}
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

            <View style={styles.bottomBar}>
                {selectedServices.length > 0 && (
                    <View style={{ marginBottom: SPACING.sm }}>
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
                    style={{ backgroundColor: COLORS.primary, width: '100%' }}
                    icon="chevron-right"
                />
            </View>
        </SafeAreaView>
    );
}
