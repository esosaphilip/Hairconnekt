import { useState, useRef } from 'react';
import { Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../navigation/types';
import { http } from '../../../../api/http';
import { FormData, Step, RNFile } from '../types';
import { useAuth } from '../../../../auth/AuthContext';

const initialFormData: FormData = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    acceptPrivacy: false,
    marketingEmails: false,

    businessName: "",
    businessTypes: [],
    street: "",
    houseNumber: "",
    postalCode: "",
    city: "",
    state: "",
    showOnMap: true,
    serviceRadius: 10,
    businessLicense: "",
    taxId: "",

    serviceCategories: [],
    yearsExperience: 0,
    languages: [],
    specializations: [],

    idDocument: null,
    businessDocument: null,
    certificates: [],
    profilePicture: null,
    portfolioImages: [],
};

// Mock File Picker Functionality
const mockSelectFile = (name: string, isMultiple: boolean = false) => {
    // Returns a mock RNFile object or array
    const file = { uri: `file://mock/${name}.pdf`, name: `${name}_file.pdf` };
    if (isMultiple) {
        return [{ uri: `file://mock/${name}_1.jpg`, name: `${name}_1.jpg` }, { uri: `file://mock/${name}_2.jpg`, name: `${name}_2.jpg` }];
    }
    return file;
};

export const useProviderRegistration = () => {
    const { setSession } = useAuth();
    const [step, setStep] = useState<Step>(1);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const scrollViewRef = useRef<ScrollView | null>(null);

    const passwordStrength = () => {
        const password = formData.password;
        let strength = 0;
        if (password.length >= 8) strength += 33;
        if (/[A-Z]/.test(password)) strength += 33;
        if (/[0-9]/.test(password)) strength += 34;
        return strength;
    };

    const canProceedStep1 = () => {
        return (
            formData.firstName.trim() !== "" &&
            formData.lastName.trim() !== "" &&
            formData.email.includes("@") &&
            formData.phone.trim() !== "" &&
            formData.password.length >= 8 &&
            formData.password === formData.confirmPassword &&
            formData.acceptTerms &&
            formData.acceptPrivacy
        );
    };

    const canProceedStep2 = () => {
        return (
            formData.businessTypes.length > 0 &&
            formData.postalCode.trim() !== "" &&
            formData.city.trim() !== "" &&
            formData.state.trim() !== ""
        );
    };

    const canProceedStep3 = () => {
        return formData.serviceCategories.length > 0 && formData.languages.length > 0;
    };

    const canProceedStep4 = () => {
        return (
            formData.idDocument !== null &&
            formData.profilePicture !== null &&
            formData.portfolioImages.length >= 3
        );
    };

    const handleFileUpload = (field: keyof FormData, fileType: string, isMultiple: boolean = false) => {
        const result = mockSelectFile(fileType, isMultiple) as RNFile | RNFile[];

        if (isMultiple) {
            const files = result as RNFile[];
            const newImages = [...formData.portfolioImages, ...files];
            setFormData({ ...formData, [field]: newImages });
            Alert.alert("Erfolg", `${files.length} Bilder ausgewählt`);
        } else {
            const file = result as RNFile;
            setFormData({ ...formData, [field]: file });
            Alert.alert("Erfolg", `${file.name} hochgeladen`);
        }
    };

    const handleSubmit = async () => {
        try {
            const payload = {
                password: formData.password,
                profile: {
                    businessName: formData.businessName || null,
                    businessType: formData.businessTypes[0] || null,
                    yearsOfExperience: formData.yearsExperience,
                    isMobileService: formData.businessTypes.includes('MOBILE'),
                    serviceRadiusKm: formData.serviceRadius,
                },
                contact: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                },
                address: {
                    street: formData.street,
                    houseNumber: formData.houseNumber,
                    postalCode: formData.postalCode,
                    city: formData.city,
                    state: formData.state,
                    showOnMap: formData.showOnMap,
                },
                services: formData.serviceCategories,
                languages: formData.languages,
                specializations: formData.specializations,
            };
            const { data } = await http.post('/providers', payload);
            if (data?.user && data?.tokens) {
                await setSession(data.user, data.tokens);
                // Auth flow handles navigation to ProviderTabs
            } else {
                navigation.navigate('ProviderPendingApproval');
            }
        } catch (e: any) {
            const msg = e?.response?.data?.message || e?.message || 'Einreichen fehlgeschlagen';
            Alert.alert('Fehler', String(msg));
        }
    };

    const handleNext = () => {
        let canProceed = false;
        if (step === 1) canProceed = canProceedStep1();
        else if (step === 2) canProceed = canProceedStep2();
        else if (step === 3) canProceed = canProceedStep3();
        else if (step === 4) canProceed = canProceedStep4();
        else if (step === 5) canProceed = true;

        if (canProceed) {
            if (step < 5) {
                setStep((step + 1) as Step);
                scrollViewRef.current?.scrollTo({ y: 0, animated: true });
            } else {
                handleSubmit();
            }
        } else {
            Alert.alert("Fehler", "Bitte fülle alle Pflichtfelder aus");
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep((step - 1) as Step);
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        } else {
            navigation.goBack();
        }
    };

    return {
        step,
        setStep,
        formData,
        setFormData,
        handleFileUpload,
        handleNext,
        handleBack,
        passwordStrength,
        scrollViewRef,
    };
};
