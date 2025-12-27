import React, { useState } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// Components
import Text from '../../components/Text';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { Checkbox } from '../../components/checkbox';
import { spacing, colors } from '../../theme/tokens';
import { providersApi } from '../../services/providers';

export default function ProviderOnboardingAddressScreen() {
    const navigation = useNavigation<any>();
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<any>({});
    const [formData, setFormData] = useState({
        street: "",
        houseNumber: "",
        postalCode: "",
        city: "",
        state: "",
        showOnMap: true,
    });

    const validateForm = () => {
        const newErrors: any = {};
        if (!formData.street.trim()) newErrors.street = "Straße ist erforderlich";
        if (!formData.houseNumber.trim()) newErrors.houseNumber = "Hausnummer ist erforderlich";
        if (!/^\d{5}$/.test(formData.postalCode)) newErrors.postalCode = "Ungültige PLZ";
        if (!formData.city.trim()) newErrors.city = "Stadt ist erforderlich";
        if (!formData.state.trim()) newErrors.state = "Bundesland ist erforderlich";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            await providersApi.updateAddress(formData);

            // Navigate to next step or dashboard
            // If this is part of a flow, navigate to next. 
            // If standalone, maybe go back or to service setup.
            // Assuming next step is Services for now based on previous code.
            navigation.navigate('ProviderOnboardingServices');
        } catch (error) {
            console.error(error);
            setErrors({ general: "Fehler beim Speichern der Adresse" });
            Alert.alert("Fehler", "Speichern fehlgeschlagen.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={colors.gray700} />
                    </TouchableOpacity>
                    <Text variant="h3">Geschäftsadresse</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Progress Bar (Mocked to match previous look) */}
                <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, styles.progressActive]} />
                    <View style={[styles.progressBar, styles.progressActive]} />
                    <View style={styles.progressBar} />
                    <View style={styles.progressBar} />
                </View>
                <Text style={styles.stepText}>Schritt 2 von 4</Text>
            </View>

            <KeyboardAwareScrollView
                extraScrollHeight={20}
                enableOnAndroid={true}
                contentContainerStyle={styles.scrollContent}
            >
                <Card style={styles.card}>
                    <View style={styles.infoRow}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="location" size={20} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text variant="h3">Wo können Kunden dich finden?</Text>
                            <Text variant="small" color={colors.gray600}>
                                Deine Geschäftsadresse wird in deinem öffentlichen Profil angezeigt.
                            </Text>
                        </View>
                    </View>

                    {/* Form Fields */}
                    <View style={styles.formGrid}>
                        <View style={{ flex: 2, marginRight: 8 }}>
                            <Input
                                label="Straße *"
                                value={formData.street}
                                onChangeText={(val: string) => setFormData({ ...formData, street: val })}
                                error={errors.street}
                                placeholder="Leopoldstraße"
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Input
                                label="Nr. *"
                                value={formData.houseNumber}
                                onChangeText={(val: string) => setFormData({ ...formData, houseNumber: val })}
                                error={errors.houseNumber}
                                placeholder="123"
                            />
                        </View>
                    </View>

                    <View style={styles.formGrid}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Input
                                label="PLZ *"
                                value={formData.postalCode}
                                onChangeText={(val: string) => setFormData({ ...formData, postalCode: val.replace(/\D/g, "") })}
                                error={errors.postalCode}
                                keyboardType="numeric"
                                maxLength={5}
                                placeholder="80331"
                            />
                        </View>
                        <View style={{ flex: 2 }}>
                            <Input
                                label="Stadt *"
                                value={formData.city}
                                onChangeText={(val: string) => setFormData({ ...formData, city: val })}
                                error={errors.city}
                                placeholder="München"
                            />
                        </View>
                    </View>

                    <Input
                        label="Bundesland *"
                        value={formData.state}
                        placeholder="z.B. Bayern"
                        onChangeText={(val: string) => setFormData({ ...formData, state: val })}
                        error={errors.state}
                    />

                    <View style={styles.checkboxRow}>
                        <Checkbox
                            checked={formData.showOnMap}
                            onCheckedChange={(val: boolean) => setFormData({ ...formData, showOnMap: val })}
                        />
                        <Text variant="small" style={{ flex: 1, marginLeft: 8 }}>
                            Meine Adresse auf der Karte anzeigen
                        </Text>
                    </View>
                </Card>

                {/* Privacy Note */}
                <View style={styles.privacyCard}>
                    <View style={styles.privacyHeader}>
                        <Ionicons name="shield-checkmark" size={16} color={colors.blue600} />
                        <Text style={styles.privacyTitle}>Deine Privatsphäre ist geschützt</Text>
                    </View>
                    <Text style={styles.privacyText}>• Adresse wird nur bestätigten Kunden angezeigt</Text>
                    <Text style={styles.privacyText}>• In der Suche sehen Kunden nur Stadt/Entfernung</Text>
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title={isLoading ? "Speichern..." : "Weiter"}
                        onPress={handleSave}
                        disabled={isLoading}
                    />
                    <Button
                        variant="outline"
                        title="Überspringen"
                        onPress={() => navigation.navigate('ProviderOnboardingServices')}
                        style={{ marginTop: 12 }}
                    />
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        backgroundColor: '#FFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    progressContainer: {
        flexDirection: 'row',
        gap: 4,
    },
    progressBar: {
        height: 4,
        flex: 1,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
    },
    progressActive: {
        backgroundColor: '#8B4513',
    },
    stepText: {
        fontSize: 10,
        textAlign: 'center',
        marginTop: 8,
        color: '#6B7280',
    },
    scrollContent: {
        padding: 16,
    },
    card: {
        padding: 16,
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    iconContainer: {
        backgroundColor: 'rgba(139, 69, 19, 0.1)',
        padding: 8,
        borderRadius: 8,
    },
    formGrid: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },
    privacyCard: {
        backgroundColor: '#EFF6FF',
        borderWidth: 1,
        borderColor: '#DBEAFE',
        borderRadius: 12,
        padding: 12,
        marginBottom: 24,
    },
    privacyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    privacyTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1E40AF',
    },
    privacyText: {
        fontSize: 12,
        color: '#4B5563',
        lineHeight: 18,
    },
    buttonContainer: {
        marginBottom: 40,
    }
});