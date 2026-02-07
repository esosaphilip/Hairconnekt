import React from 'react';
import { View, Text } from 'react-native';
import { Input } from '../../../../components/Input';
import { Checkbox } from '../../../../components/checkbox';
import Picker from '../../../../components/Picker';
import Slider from '@react-native-community/slider';
import { FormData } from '../types';
import { styles } from '../ProviderRegistrationFlow.styles';
import { colors } from '../../../../theme/tokens';

const GERMAN_STATES = [
    { label: "Nordrhein-Westfalen", value: "NRW" },
    { label: "Bayern", value: "BY" },
    { label: "Baden-Württemberg", value: "BW" },
    { label: "Berlin", value: "BE" },
    { label: "Hamburg", value: "HH" },
];

interface StepProps {
    formData: FormData;
    setFormData: (data: FormData) => void;
}

export const Step2 = ({ formData, setFormData }: StepProps) => {
    return (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Über dein Business</Text>
            <Text style={styles.stepSubtitle}>Geschäftsinformationen</Text>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Business-Name (optional)</Text>
                <Input
                    testID="reg-business-name"
                    placeholder="z.B. 'Marias Braiding Studio'"
                    value={formData.businessName}
                    onChangeText={(v: string) => setFormData({ ...formData, businessName: v })}
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Business-Typ *</Text>
                <View style={styles.checkboxGroup}>
                    {["INDIVIDUAL", "SALON", "MOBILE"].map((type) => (
                        <View key={type} style={styles.checkboxRow}>
                            <Checkbox
                                testID={`reg-bus-type-${type}`}
                                checked={formData.businessTypes.includes(type)}
                                onCheckedChange={(checked: boolean) => {
                                    setFormData({
                                        ...formData,
                                        businessTypes: checked
                                            ? [...formData.businessTypes, type]
                                            : formData.businessTypes.filter((t) => t !== type),
                                    });
                                }}
                            />
                            <Text style={styles.checkboxLabel}>
                                {type === "INDIVIDUAL" && "Einzelperson / Freelancer"}
                                {type === "SALON" && "Salon / Barbershop"}
                                {type === "MOBILE" && "Mobiler Service"}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            {!formData.businessTypes.includes("MOBILE") && (
                <View>
                    <Text style={styles.cardSectionTitle}>Geschäftsadresse</Text>
                    <View style={styles.formGroup}>
                        <View style={styles.grid3}>
                            <View style={styles.gridCol2}>
                                <Text style={styles.label}>Straße</Text>
                                <Input
                                    testID="reg-street"
                                    placeholder="Musterstraße"
                                    value={formData.street}
                                    onChangeText={(v: string) => setFormData({ ...formData, street: v })}
                                />
                            </View>
                            <View style={styles.gridCol1}>
                                <Text style={styles.label}>Nr.</Text>
                                <Input
                                    testID="reg-house-number"
                                    placeholder="123"
                                    value={formData.houseNumber}
                                    onChangeText={(v: string) => setFormData({ ...formData, houseNumber: v })}
                                />
                            </View>
                        </View>

                        <View style={styles.grid3}>
                            <View style={styles.gridCol1}>
                                <Text style={styles.label}>PLZ *</Text>
                                <Input
                                    testID="reg-zip"
                                    keyboardType="numeric"
                                    placeholder="44139"
                                    value={formData.postalCode}
                                    onChangeText={(v: string) => setFormData({ ...formData, postalCode: v })}
                                />
                            </View>
                            <View style={styles.gridCol2}>
                                <Text style={styles.label}>Stadt *</Text>
                                <Input
                                    testID="reg-city"
                                    placeholder="Dortmund"
                                    value={formData.city}
                                    onChangeText={(v: string) => setFormData({ ...formData, city: v })}
                                />
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Bundesland *</Text>
                            <Picker
                                testID="reg-state-picker"
                                selectedValue={formData.state}
                                onValueChange={(v: string) => setFormData({ ...formData, state: v })}
                                items={GERMAN_STATES}
                            />
                        </View>

                        <View style={styles.checkboxRow}>
                            <Checkbox
                                testID="reg-map-checkbox"
                                checked={formData.showOnMap}
                                onCheckedChange={(checked: boolean) => setFormData({ ...formData, showOnMap: checked })}
                            />
                            <Text style={styles.checkboxLabel}>Meine Adresse auf Google Maps anzeigen</Text>
                        </View>
                    </View>
                </View>
            )}

            {formData.businessTypes.includes("MOBILE") && (
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Service-Radius (km)</Text>
                    <View style={styles.sliderContainer}>
                        <Slider
                            testID="reg-radius-slider"
                            style={{ width: '100%', height: 40 }}
                            minimumValue={0}
                            maximumValue={50}
                            step={5}
                            minimumTrackTintColor={colors.primary}
                            maximumTrackTintColor={colors.gray200}
                            thumbTintColor={colors.primary}
                            value={formData.serviceRadius}
                            onValueChange={(v: number) => setFormData({ ...formData, serviceRadius: v })}
                        />
                        <Text style={styles.hintText}>Ich biete Service im Umkreis von {formData.serviceRadius} km an</Text>
                    </View>
                </View>
            )}
        </View>
    );
};
