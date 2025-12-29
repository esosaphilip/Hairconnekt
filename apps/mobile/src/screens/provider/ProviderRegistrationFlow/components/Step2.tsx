import React from 'react';
import { View, Text } from 'react-native';
import { Input } from '../../../../components/Input';
import { Checkbox } from '../../../../components/checkbox';
import { Picker } from '../../../../components/Picker';
import { Slider } from '../../../../components/slider';
import { FormData } from '../types';
import { styles } from '../ProviderRegistrationFlow.styles';

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
                    placeholder="z.B. 'Marias Braiding Studio'"
                    value={formData.businessName}
                    onChangeText={(v: string) => setFormData({ ...formData, businessName: v })}
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Business-Typ *</Text>
                <View style={styles.checkboxGroup}>
                    {["Freelancer", "Salon", "Barber", "Mobil"].map((type) => (
                        <View key={type} style={styles.checkboxRow}>
                            <Checkbox
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
                                {type === "Freelancer" && "Einzelperson / Freelancer"}
                                {type === "Salon" && "Salon / Barbershop"}
                                {type === "Barber" && "Barber"}
                                {type === "Mobil" && "Mobiler Service"}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            {!formData.businessTypes.includes("Mobil") && (
                <View>
                    <Text style={styles.cardSectionTitle}>Geschäftsadresse</Text>
                    <View style={styles.formGroup}>
                        <View style={styles.grid3}>
                            <View style={styles.gridCol2}>
                                <Text style={styles.label}>Straße</Text>
                                <Input value={formData.street} onChangeText={(v: string) => setFormData({ ...formData, street: v })} />
                            </View>
                            <View style={styles.gridCol1}>
                                <Text style={styles.label}>Nr.</Text>
                                <Input value={formData.houseNumber} onChangeText={(v: string) => setFormData({ ...formData, houseNumber: v })} />
                            </View>
                        </View>

                        <View style={styles.grid3}>
                            <View style={styles.gridCol1}>
                                <Text style={styles.label}>PLZ *</Text>
                                <Input
                                    keyboardType="numeric"
                                    value={formData.postalCode}
                                    onChangeText={(v: string) => setFormData({ ...formData, postalCode: v })}
                                />
                            </View>
                            <View style={styles.gridCol2}>
                                <Text style={styles.label}>Stadt *</Text>
                                <Input value={formData.city} onChangeText={(v: string) => setFormData({ ...formData, city: v })} />
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Bundesland *</Text>
                            <Picker
                                selectedValue={formData.state}
                                onValueChange={(v: string) => setFormData({ ...formData, state: v })}
                                items={GERMAN_STATES}
                            />
                        </View>

                        <View style={styles.checkboxRow}>
                            <Checkbox
                                checked={formData.showOnMap}
                                onCheckedChange={(checked: boolean) => setFormData({ ...formData, showOnMap: checked })}
                            />
                            <Text style={styles.checkboxLabel}>Meine Adresse auf Google Maps anzeigen</Text>
                        </View>
                    </View>
                </View>
            )}

            {formData.businessTypes.includes("Mobil") && (
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Service-Radius (km)</Text>
                    <View style={styles.sliderContainer}>
                        <Slider
                            value={formData.serviceRadius}
                            onValueChange={(v: number) => setFormData({ ...formData, serviceRadius: v })}
                            max={50}
                            step={5}
                        />
                        <Text style={styles.hintText}>Ich biete Service im Umkreis von {formData.serviceRadius} km an</Text>
                    </View>
                </View>
            )}
        </View>
    );
};
