import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Card from '../../../../components/Card';
import Icon from '../../../../components/Icon';
import { Checkbox } from '../../../../components/checkbox';
import { FormData, Step } from '../types';
import { styles } from '../ProviderRegistrationFlow.styles';
import { colors } from '../../../../theme/tokens';

interface StepProps {
    formData: FormData;
    setStep: (step: Step) => void;
}

export const Step5 = ({ formData, setStep }: StepProps) => {
    return (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Zusammenfassung</Text>
            <Text style={styles.stepSubtitle}>
                Bitte überprüfe deine Angaben bevor du dein Profil einreichst
            </Text>

            {/* Personal Info Summary */}
            <Card style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                    <Text style={styles.summarySectionTitle}>Persönliche Informationen</Text>
                    <TouchableOpacity onPress={() => setStep(1)}><Text style={styles.editButton}>Bearbeiten</Text></TouchableOpacity>
                </View>
                <View style={styles.summaryDetails}>
                    <Text style={styles.summaryText}>{formData.firstName} {formData.lastName}</Text>
                    <Text style={styles.summaryText}>{formData.email}</Text>
                    <Text style={styles.summaryText}>+49 {formData.phone}</Text>
                </View>
            </Card>

            {/* Business Info Summary */}
            <Card style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                    <Text style={styles.summarySectionTitle}>Geschäftsinformationen</Text>
                    <TouchableOpacity onPress={() => setStep(2)}><Text style={styles.editButton}>Bearbeiten</Text></TouchableOpacity>
                </View>
                <View style={styles.summaryDetails}>
                    {formData.businessName && <Text style={styles.summaryText}>{formData.businessName}</Text>}
                    <Text style={styles.summaryText}>{formData.businessTypes.join(", ")}</Text>
                    {formData.city && (
                        <Text style={styles.summaryText}>
                            {formData.postalCode} {formData.city}
                        </Text>
                    )}
                </View>
            </Card>

            {/* Services Summary */}
            <Card style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                    <Text style={styles.summarySectionTitle}>Services & Expertise</Text>
                    <TouchableOpacity onPress={() => setStep(3)}><Text style={styles.editButton}>Bearbeiten</Text></TouchableOpacity>
                </View>
                <View style={styles.summaryDetails}>
                    <Text style={styles.summaryText}>{formData.serviceCategories.join(", ")}</Text>
                    <Text style={styles.summaryText}>{formData.yearsExperience} Jahre Erfahrung</Text>
                    <Text style={styles.summaryText}>Sprachen: {formData.languages.join(", ")}</Text>
                </View>
            </Card>

            {/* Verification Summary */}
            <Card style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                    <Text style={styles.summarySectionTitle}>Verifizierung</Text>
                    <TouchableOpacity onPress={() => setStep(4)}><Text style={styles.editButton}>Bearbeiten</Text></TouchableOpacity>
                </View>
                <View style={styles.summaryDetails}>
                    <View style={styles.checkRow}>
                        <Icon name="check" size={16} color={colors.success} />
                        <Text style={styles.summaryText}>Identitätsnachweis hochgeladen</Text>
                    </View>
                    <View style={styles.checkRow}>
                        <Icon name="check" size={16} color={colors.success} />
                        <Text style={styles.summaryText}>Profilbild hochgeladen</Text>
                    </View>
                    <View style={styles.checkRow}>
                        <Icon name="check" size={16} color={colors.success} />
                        <Text style={styles.summaryText}>Portfolio ({formData.portfolioImages.length} Bilder)</Text>
                    </View>
                </View>
            </Card>

            {/* Next Steps Card */}
            <Card style={styles.nextStepsCard}>
                <Text style={styles.summarySectionTitle}>Was passiert jetzt?</Text>
                <View style={styles.nextStepsList}>
                    {[
                        { text: "Profil eingereicht", done: true },
                        { text: "Überprüfung (1-3 Werktage)", done: false },
                        { text: "Freischaltung", done: false },
                        { text: "Start!", done: false },
                    ].map((item, index) => (
                        <View key={index} style={styles.checkRow}>
                            <View style={item.done ? styles.checkIconBackground : styles.checkIconBorder}>
                                {item.done && <Icon name="check" size={12} color={colors.white} />}
                            </View>
                            <Text style={item.done ? styles.summaryText : styles.summaryTextSecondary}>{item.text}</Text>
                        </View>
                    ))}
                </View>
                <Text style={styles.hintText}>
                    Du erhältst eine E-Mail sobald dein Profil genehmigt wurde
                </Text>
            </Card>

            {/* Final Confirmation Checkbox */}
            <View style={styles.checkboxRow}>
                <Checkbox checked={formData.acceptTerms} onCheckedChange={() => { }} />
                <Text style={styles.checkboxLabel}>
                    Ich bestätige, dass alle Angaben korrekt sind
                </Text>
            </View>
        </View>
    );
};
