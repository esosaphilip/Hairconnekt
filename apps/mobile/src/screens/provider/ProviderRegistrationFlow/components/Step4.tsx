import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Card from '../../../../components/Card';
import Icon from '../../../../components/Icon';
import Button from '../../../../components/Button';
import { FormData } from '../types';
import { styles } from '../ProviderRegistrationFlow.styles';
import { colors } from '../../../../theme/tokens';

interface StepProps {
    formData: FormData;
    handleFileUpload: (field: keyof FormData, fileType: string, isMultiple?: boolean) => void;
}

export const Step4 = ({ formData, handleFileUpload }: StepProps) => {
    return (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Verifizierung</Text>
            <Text style={styles.stepSubtitle}>
                Um die Sicherheit für alle zu gewährleisten, bitten wir um folgende Dokumente
            </Text>

            <Card style={styles.infoCard}>
                <Text style={styles.infoText}>
                    🔒 Deine Daten werden vertraulich behandelt und sicher verschlüsselt
                </Text>
            </Card>

            {/* Identity Proof */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>Identitätsnachweis *</Text>
                <TouchableOpacity testID="reg-upload-id" style={styles.uploadBox} onPress={() => handleFileUpload("idDocument", "ID", false)}>
                    <Icon name="upload" size={32} color={colors.gray500} />
                    <Text style={styles.uploadText}>Personalausweis oder Reisepass</Text>
                    <Button title="Datei auswählen" variant="ghost" />
                    {formData.idDocument && (
                        <Text style={styles.uploadedText}>✓ {formData.idDocument.name}</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Profile Picture */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>Profilbild *</Text>
                <TouchableOpacity testID="reg-upload-profile" style={styles.uploadBox} onPress={() => handleFileUpload("profilePicture", "Profile", false)}>
                    <Icon name="camera" size={32} color={colors.gray500} />
                    <Text style={styles.uploadText}>Dein öffentliches Profilbild</Text>
                    <Button title="Foto hochladen" variant="ghost" />
                    {formData.profilePicture && (
                        <Text style={styles.uploadedText}>✓ {formData.profilePicture.name}</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Portfolio Images */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>Portfolio (min. 3 Bilder) *</Text>
                <TouchableOpacity testID="reg-upload-portfolio" style={styles.uploadBox} onPress={() => handleFileUpload("portfolioImages", "Portfolio", true)}>
                    <Icon name="image" size={32} color={colors.gray500} />
                    <Text style={styles.uploadText}>Zeige deine besten Arbeiten</Text>
                    <Button title="Fotos hinzufügen" variant="ghost" />
                    {formData.portfolioImages.length > 0 && (
                        <Text style={styles.uploadedText}>
                            ✓ {formData.portfolioImages.length} Bilder ausgewählt
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};
