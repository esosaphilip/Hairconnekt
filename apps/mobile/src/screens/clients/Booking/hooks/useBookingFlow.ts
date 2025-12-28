import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../../../auth/AuthContext';
import { RootStackParamList } from '../../../../navigation/types';
import { clientBraiderApi } from '../../../../api/clientBraider';
import { clientBookingApi } from '../../../../api/clientBooking';
import { IBraider, IBraiderService } from '../../../../domain/models/braider';
import { DomainError } from '../../../../domain/errors/DomainError';

export type BookingStep = 'services' | 'datetime' | 'details' | 'confirmation';

export const useBookingFlow = (id: string) => {
    const [step, setStep] = useState<BookingStep>('services');
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [mobileService, setMobileService] = useState<boolean>(false);
    const [notes, setNotes] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'paypal'>('cash');

    const [provider, setProvider] = useState<IBraider | null>(null);
    const [loadingProvider, setLoadingProvider] = useState<boolean>(true);
    const [servicesList, setServicesList] = useState<IBraiderService[]>([]);
    const [error, setError] = useState<string | null>(null);

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { tokens } = useAuth();
    const isAuthenticated = !!tokens?.accessToken;

    useEffect(() => {
        if (!id) {
            setLoadingProvider(false);
            return;
        }
        async function loadProvider() {
            try {
                const data = await clientBraiderApi.getProfile(id);
                setProvider(data);
                const allServices: IBraiderService[] = [];
                (data.services || []).forEach(cat => {
                    cat.items.forEach(item => allServices.push(item));
                });
                setServicesList(allServices);
            } catch (err) {
                const domainError = err as DomainError;
                setError(domainError.message);
            } finally {
                setLoadingProvider(false);
            }
        }
        loadProvider();
    }, [id]);

    const toggleService = (serviceId: string) => {
        setSelectedServices(prev =>
            prev.includes(serviceId)
                ? prev.filter(id => id !== serviceId)
                : [...prev, serviceId]
        );
    };

    const getTotalPrice = (): number => {
        const basePrice = selectedServices.reduce((sum, serviceId) => {
            const service = servicesList.find(s => s.id === serviceId);
            if (!service) return sum;
            const match = service.price.match(/(\d+)/);
            const price = match ? parseInt(match[0], 10) : 0;
            return sum + price;
        }, 0);
        return mobileService ? basePrice + 15 : basePrice;
    };

    const getTotalDuration = (): string => {
        const selected = servicesList.filter(s => selectedServices.includes(s.id));
        if (selected.length === 0) return '0 Std.';
        return selected.map(s => s.duration.split(' ')[0]).join(' / ');
    };

    const handleBack = () => {
        if (step === 'services') {
            navigation.goBack();
        } else if (step === 'datetime') {
            setStep('services');
        } else if (step === 'details') {
            setStep('datetime');
        }
    };

    const handleNext = async () => {
        if (step === 'services' && selectedServices.length > 0) {
            setStep('datetime');
        } else if (step === 'datetime' && selectedDate && selectedTime) {
            setStep('details');
        } else if (step === 'details') {
            try {
                setLoadingProvider(true);
                const [hours, minutes] = selectedTime!.split(':').map(Number);
                const start = new Date(selectedDate!);
                start.setHours(hours, minutes, 0, 0);

                const selectedServiceObjs = servicesList.filter(s => selectedServices.includes(s.id));
                const durationMinutes = selectedServiceObjs.reduce((acc, s) => {
                    return acc + 60;
                }, 0);

                const end = new Date(start.getTime() + durationMinutes * 60000);

                await clientBookingApi.createAppointment({
                    providerId: provider!.id,
                    serviceIds: selectedServices,
                    startTime: start.toISOString(),
                    endTime: end.toISOString(),
                    notes: notes
                });

                setStep('confirmation');
            } catch (err) {
                Alert.alert("Fehler", "Buchung fehlgeschlagen: " + (err instanceof Error ? err.message : String(err)));
            } finally {
                setLoadingProvider(false);
            }
        }
    };

    const stepNumber = step === 'services' ? 1 : step === 'datetime' ? 2 : step === 'details' ? 3 : 4;
    const headerTitle = step === 'services' ? 'Services auswählen' :
        step === 'datetime' ? 'Termin wählen' : 'Buchungsdetails';
    const canProceed = (
        (step === 'services' && selectedServices.length > 0) ||
        (step === 'datetime' && !!selectedDate && !!selectedTime) ||
        (step === 'details')
    );

    return {
        step,
        setStep,
        selectedServices,
        setSelectedServices,
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
        provider,
        loadingProvider,
        servicesList,
        error,
        toggleService,
        getTotalPrice,
        getTotalDuration,
        handleBack,
        handleNext,
        stepNumber,
        headerTitle,
        canProceed,
        isAuthenticated,
    };
};
