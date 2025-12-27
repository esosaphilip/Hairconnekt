import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';

// Design System Imports
import Text from '../components/Text';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import Checkbox from '../components/Checkbox';
import { spacing, colors } from '../theme/tokens';
import { providersApi } from '../../services/providers';

export default function EditAddressScreen() {
    const navigation = useNavigation();

    // States
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [errors, setErrors] = useState<any>({});
    const [hasChanges, setHasChanges] = useState(false);

    const [formData, setFormData] = useState({
        street: "",
        houseNumber: "",
        postalCode: "",
        city: "",
        state: "",
        showOnMap: true,
    });

    const [originalData, setOriginalData] = useState<any>(null);

    // 1. Initial Load
    useEffect(() => {
        const loadData = async () => {
            try {
                const profile: any = await providersApi.getMyProfile();
                const address = profile?.address;

                let street = "";
                let houseNumber = "";

                if (address?.streetAddress) {
                    // Simple split logic: assumes last part is number if it's digit-like
                    const match = address.streetAddress.match(/^(.+?)\s+(\d+(\w)?(\s?[-/]\s?\d+\w?)?)$/);
                    if (match) {
                        street = match[1];
                        houseNumber = match[2];
                    } else {
                        street = address.streetAddress;
                        houseNumber = ""; // User might need to fix manually
                    }
                }

                const data = {
                    street: street,
                    houseNumber: houseNumber,
                    postalCode: address?.postalCode || "",
                    city: address?.city || "",
                    state: address?.state || "",
                    showOnMap: true, // Not currently persisted in address entity
                };

                setFormData(data);
                setOriginalData(data);
            } catch (e) {
                console.error("Failed to load address", e);
                Alert.alert("Fehler", "Adresse konnte nicht geladen werden.");
            } finally {
                setIsFetching(false);
            }
        };
        loadData();
    }, []);

    // 2. Change Tracking
    useEffect(() => {
        if (!originalData) return;
        const isDirty = JSON.stringify(formData) !== JSON.stringify(originalData);
        setHasChanges(isDirty);
    }, [formData, originalData]);

    // 3. Validation Logic
    const validate = () => {
        let tempErrors: any = {};
        if (!formData.street.trim()) tempErrors.street = "Erforderlich";
        if (!formData.houseNumber.trim()) tempErrors.houseNumber = "Erforderlich";
        if (!/^\d{5}$/.test(formData.postalCode)) tempErrors.postalCode = "5 Ziffern erforderlich";
        if (!formData.city.trim()) tempErrors.city = "Erforderlich";

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    // 4. Save Handler
    const handleSave = async () => {
        if (!validate()) return;

        setIsLoading(true);
        try {
            await providersApi.updateAddress(formData);
            setOriginalData(formData);
            Alert.alert("Erfolg", "Adresse wurde aktualisiert");
            navigation.goBack();
        } catch (e) {
            console.error("Failed to save address", e);
            setErrors({ general: "Speichern fehlgeschlagen" });
            Alert.alert("Fehler", "Speichern fehlgeschlagen");
        } finally {
            setIsLoading(false);
        }
    };

    // 5. Back Handler with Confirmation
    const handleBack = useCallback(() => {
        if (hasChanges) {
            Alert.alert(
                "Ungespeicherte Änderungen",
                "Möchtest du wirklich abbrechen?",
                [
                    { text: "Weiter bearbeiten", style: "cancel" },
                    { text: "Abbrechen", style: "destructive", onPress: () => navigation.goBack() }
                ]
            );
        } else {
            navigation.goBack();
        }
    }, [hasChanges, navigation]);

    if (isFetching) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Mobile Header with Save Action */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack}>
                    <Ionicons name="arrow-back" size={24} color={colors.gray800} />
                </TouchableOpacity>
                <Text variant="h3">Adresse bearbeiten</Text>
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={isLoading || !hasChanges}
                    style={{ opacity: (isLoading || !hasChanges) ? 0.4 : 1 }}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                        <Ionicons name="save-outline" size={24} color={colors.primary} />
                    )}
                </TouchableOpacity>
            </View>

            <KeyboardAwareScrollView contentContainerStyle={styles.scrollBody}>
                <Card style={styles.card}>
                    <View style={styles.sectionTitle}>
                        <View style={styles.iconBox}>
                            <Ionicons name="location" size={18} color={colors.primary} />
                        </View>
                        <Text variant="h4">Geschäftsadresse</Text>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 2, marginRight: spacing.sm }}>
                            <Input
                                label="Straße *"
                                value={formData.street}
                                onChangeText={(text: string) => setFormData({ ...formData, street: text })}
                                error={errors.street}
                                disabled={isLoading}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Input
                                label="Nr. *"
                                value={formData.houseNumber}
                                onChangeText={(text: string) => setFormData({ ...formData, houseNumber: text })}
                                error={errors.houseNumber}
                                disabled={isLoading}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: spacing.sm }}>
                            <Input
                                label="PLZ *"
                                value={formData.postalCode}
                                keyboardType="number-pad"
                                maxLength={5}
                                onChangeText={(text: string) => setFormData({ ...formData, postalCode: text.replace(/\D/g, '') })}
                                error={errors.postalCode}
                                disabled={isLoading}
                            />
                        </View>
                        <View style={{ flex: 2 }}>
                            <Input
                                label="Stadt *"
                                value={formData.city}
                                onChangeText={(text: string) => setFormData({ ...formData, city: text })}
                                error={errors.city}
                                disabled={isLoading}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Input
                                label="Bundesland *"
                                value={formData.state}
                                onChangeText={(text: string) => setFormData({ ...formData, state: text })}
                                error={errors.state}
                                disabled={isLoading}
                                placeholder="z.B. Bayern"
                            />
                        </View>
                    </View>

                    <View style={styles.checkboxContainer}>
                        <Checkbox
                            checked={formData.showOnMap}
                            onChange={(val) => setFormData({ ...formData, showOnMap: val })}
                        />
                        <Text variant="small" style={styles.checkboxLabel}>
                            Adresse auf der Karte anzeigen
                        </Text>
                    </View>
                </Card>

                {/* Changes Indicator */}
                {hasChanges && (
                    <View style={styles.alertBar}>
                        <Ionicons name="alert-circle" size={14} color={colors.amber600} />
                        <Text style={styles.alertText}>Ungespeicherte Änderungen</Text>
                    </View>
                )}

                <View style={styles.footer}>
                    <Button
                        title="Änderungen speichern"
                        onPress={handleSave}
                        loading={isLoading}
                        disabled={!hasChanges}
                    />
                    <Button
                        variant="outline"
                        title="Abbrechen"
                        onPress={handleBack}
                        style={{ marginTop: 12 }}
                    />
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 }, android: { elevation: 2 } })
    },
    scrollBody: { padding: 16 },
    card: { padding: 16, marginBottom: 16 },
    sectionTitle: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    iconBox: { backgroundColor: 'rgba(139, 69, 19, 0.1)', padding: 6, borderRadius: 6, marginRight: 10 },
    row: { flexDirection: 'row', marginBottom: 12 },
    checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    checkboxLabel: { marginLeft: 8, flex: 1, color: colors.gray600 },
    alertBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 10 },
    alertText: { fontSize: 12, color: colors.amber600, marginLeft: 6 },
    footer: { marginTop: 20, marginBottom: 40 }
});