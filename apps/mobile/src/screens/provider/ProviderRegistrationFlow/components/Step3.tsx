import React from 'react';
import { View, Text } from 'react-native';
import { Checkbox } from '../../../../components/checkbox';
import Slider from '@react-native-community/slider';
import { FormData } from '../types';
import { styles } from '../ProviderRegistrationFlow.styles';
import { colors } from '../../../../theme/tokens';

interface StepProps {
    formData: FormData;
    setFormData: (data: FormData) => void;
}

export const Step3 = ({ formData, setFormData }: StepProps) => {
    return (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Deine Dienstleistungen</Text>
            <Text style={styles.stepSubtitle}>Wähle deine Spezialisierungen</Text>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Service-Kategorien *</Text>
                <View style={styles.checkboxGroup}>
                    {[
                        "Box Braids", "Knotless Braids", "Cornrows", "Senegalese Twists",
                        "Passion Twists", "Locs", "Barber Services", "Natural Hair Care",
                    ].map((service) => (
                        <View key={service} style={styles.checkboxRow}>
                            <Checkbox
                                checked={formData.serviceCategories.includes(service)}
                                onCheckedChange={(checked: boolean) => {
                                    setFormData({
                                        ...formData,
                                        serviceCategories: checked
                                            ? [...formData.serviceCategories, service]
                                            : formData.serviceCategories.filter((s) => s !== service),
                                    });
                                }}
                            />
                            <Text style={styles.checkboxLabel}>{service}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Jahre Erfahrung</Text>
                <View style={styles.sliderContainer}>
                    <Slider
                        style={{ width: '100%', height: 40 }}
                        minimumValue={0}
                        maximumValue={30}
                        step={1}
                        minimumTrackTintColor={colors.primary}
                        maximumTrackTintColor={colors.gray200}
                        thumbTintColor={colors.primary}
                        value={formData.yearsExperience}
                        onValueChange={(v: number) => setFormData({ ...formData, yearsExperience: v })}
                    />
                    <Text style={styles.hintText}>{formData.yearsExperience} Jahre</Text>
                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Sprachen *</Text>
                <View style={styles.checkboxGroup}>
                    {["Deutsch", "Englisch", "Französisch", "Spanisch", "Türkisch", "Arabisch"].map((lang) => (
                        <View key={lang} style={styles.checkboxRow}>
                            <Checkbox
                                checked={formData.languages.includes(lang)}
                                onCheckedChange={(checked: boolean) => {
                                    setFormData({
                                        ...formData,
                                        languages: checked
                                            ? [...formData.languages, lang]
                                            : formData.languages.filter((l) => l !== lang),
                                    });
                                }}
                            />
                            <Text style={styles.checkboxLabel}>{lang}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Spezialisierungen (optional)</Text>
                <View style={styles.checkboxGroup}>
                    {[
                        "Kinderfreundlich", "Lange Haare Spezialist", "Hochzeitsstyling",
                        "Natürliche Produkte", "Männer-Styling",
                    ].map((spec) => (
                        <View key={spec} style={styles.checkboxRow}>
                            <Checkbox
                                checked={formData.specializations.includes(spec)}
                                onCheckedChange={(checked: boolean) => {
                                    setFormData({
                                        ...formData,
                                        specializations: checked
                                            ? [...formData.specializations, spec]
                                            : formData.specializations.filter((s) => s !== spec),
                                    });
                                }}
                            />
                            <Text style={styles.checkboxLabel}>{spec}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
};
