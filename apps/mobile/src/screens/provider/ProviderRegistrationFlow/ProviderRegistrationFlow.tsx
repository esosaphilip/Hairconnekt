import React from 'react';
import {
    View,
    Text,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import Button from '../../../components/Button';
import { Progress } from '../../../components/progress';
import { styles } from './ProviderRegistrationFlow.styles';
import { useProviderRegistration } from './hooks/useProviderRegistration';
import { Step1 } from './components/Step1';
import { Step2 } from './components/Step2';
import { Step3 } from './components/Step3';
import { Step4 } from './components/Step4';
import { Step5 } from './components/Step5';

export function ProviderRegistrationFlow() {
    const navigation = useNavigation<any>();
    const {
        step,
        setStep,
        formData,
        setFormData,
        handleFileUpload,
        handleNext,
        handleBack,
        passwordStrength,
        scrollViewRef,
    } = useProviderRegistration();

    const progress = (step / 5) * 100;

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <Step1
                        formData={formData}
                        setFormData={setFormData}
                        passwordStrength={passwordStrength}
                    />
                );
            case 2:
                return <Step2 formData={formData} setFormData={setFormData} />;
            case 3:
                return <Step3 formData={formData} setFormData={setFormData} />;
            case 4:
                return <Step4 formData={formData} handleFileUpload={handleFileUpload} />;
            case 5:
                return <Step5 formData={formData} setStep={setStep} />;
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.flexContainer}>
            {/* Header with back button and progress info */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={handleBack}>
                        <ArrowLeft size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>Registrierung</Text>
                        <Text style={styles.headerSubtitle}>Schritt {step} von 5</Text>
                    </View>
                </View>
                <Progress value={progress} style={styles.progressBar} />
            </View>

            <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {renderStep()}
            </ScrollView>

            {/* Bottom Bar for Primary Actions */}
            <View style={styles.bottomBar}>
                <Button
                    testID="reg-next-button"
                    onPress={handleNext}
                    style={styles.nextButton}
                    title={step === 5 ? "Profil einreichen" : "Weiter"}
                />
                {step > 1 && (
                    <Button
                        testID="reg-back-button"
                        variant="ghost"
                        onPress={handleBack}
                        style={styles.backButton}
                        title="Zurück"
                    />
                )}
            </View>
        </SafeAreaView>
    );
}
