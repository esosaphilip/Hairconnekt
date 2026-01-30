import React from 'react';
import { View, Text, Alert } from 'react-native';
import { Input } from '../../../../components/Input';
import { Checkbox } from '../../../../components/checkbox';
import { Progress } from '../../../../components/progress';
import { FormData } from '../types';
import { styles } from '../ProviderRegistrationFlow.styles';

interface StepProps {
    formData: FormData;
    setFormData: (data: FormData) => void;
    passwordStrength: () => number;
}

export const Step1 = ({ formData, setFormData, passwordStrength }: StepProps) => {
    return (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Willkommen!</Text>
            <Text style={styles.stepSubtitle}>Lass uns dein Konto erstellen</Text>

            {/* Name Inputs */}
            <View style={styles.grid2}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Vorname *</Text>
                    <Input
                        placeholder="Max"
                        value={formData.firstName}
                        onChangeText={(v: string) => setFormData({ ...formData, firstName: v })}
                    />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Nachname *</Text>
                    <Input
                        placeholder="Mustermann"
                        value={formData.lastName}
                        onChangeText={(v: string) => setFormData({ ...formData, lastName: v })}
                    />
                </View>
            </View>

            {/* Email */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>E-Mail *</Text>
                <Input
                    keyboardType="email-address"
                    placeholder="max.mueller@email.com"
                    value={formData.email}
                    onChangeText={(v: string) => setFormData({ ...formData, email: v })}
                />
                <Text style={styles.hintText}>Wird zur Anmeldung verwendet</Text>
            </View>

            {/* Phone */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>Telefonnummer *</Text>
                <View style={styles.phoneInputRow}>
                    <Input value="+49" style={styles.countryCodeInput} editable={false} />
                    <Input
                        keyboardType="phone-pad"
                        placeholder="151 1234 5678"
                        value={formData.phone}
                        onChangeText={(v: string) => setFormData({ ...formData, phone: v })}
                        style={styles.phoneInput}
                    />
                </View>
            </View>

            {/* Password */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>Passwort *</Text>
                <Input
                    secureTextEntry
                    value={formData.password}
                    onChangeText={(v: string) => setFormData({ ...formData, password: v })}
                />
                {formData.password.length > 0 && (
                    <>
                        <Progress value={passwordStrength()} style={styles.progress} />
                        <View style={styles.passwordRules}>
                            <Text style={formData.password.length >= 8 ? styles.ruleValid : styles.ruleInvalid}>
                                ✓ Min. 8 Zeichen
                            </Text>
                            <Text style={/[A-Z]/.test(formData.password) ? styles.ruleValid : styles.ruleInvalid}>
                                ✓ 1 Großbuchstabe
                            </Text>
                            <Text style={/[0-9]/.test(formData.password) ? styles.ruleValid : styles.ruleInvalid}>
                                ✓ 1 Zahl
                            </Text>
                        </View>
                    </>
                )}
            </View>

            {/* Confirm Password */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>Passwort wiederholen *</Text>
                <Input
                    secureTextEntry
                    value={formData.confirmPassword}
                    onChangeText={(v: string) => setFormData({ ...formData, confirmPassword: v })}
                />
                {formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword && (
                    <Text style={styles.errorText}>Passwörter stimmen nicht überein</Text>
                )}
            </View>

            {/* Terms Checkboxes */}
            <View style={styles.checkboxGroup}>
                <View style={styles.checkboxRow}>
                    <Checkbox
                        checked={formData.acceptTerms}
                        onCheckedChange={(checked: boolean) => setFormData({ ...formData, acceptTerms: checked })}
                    />
                    <Text style={styles.checkboxLabel}>
                        Ich akzeptiere die{" "}
                        <Text style={styles.linkText} onPress={() => Alert.alert("AGB", "AGB für Anbieter")}>
                            AGB für Anbieter
                        </Text>{" "}
                        *
                    </Text>
                </View>
                <View style={styles.checkboxRow}>
                    <Checkbox
                        checked={formData.acceptPrivacy}
                        onCheckedChange={(checked: boolean) => setFormData({ ...formData, acceptPrivacy: checked })}
                    />
                    <Text style={styles.checkboxLabel}>
                        Ich akzeptiere die{" "}
                        <Text style={styles.linkText} onPress={() => Alert.alert("Datenschutz", "Datenschutzerklärung")}>
                            Datenschutzerklärung
                        </Text>{" "}
                        *
                    </Text>
                </View>
                <View style={styles.checkboxRow}>
                    <Checkbox
                        checked={formData.marketingEmails}
                        onCheckedChange={(checked: boolean) => setFormData({ ...formData, marketingEmails: checked })}
                    />
                    <Text style={styles.checkboxLabel}>
                        Ich möchte Marketing-E-Mails erhalten (optional)
                    </Text>
                </View>
            </View>
        </View>
    );
};
