import React, { useState } from 'react';
import { View, StyleSheet, Image, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Text from '../../components/Text';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { colors, spacing, typography } from '../../theme/tokens';
import { http } from '../../api/http';
import { providersApi } from '../../services/providers';
import { useAuth } from '../../auth/AuthContext';

export function ProviderPhotoUploadScreen() {
    const navigation = useNavigation();
    const { tokens } = useAuth(); // Assuming we might need token, but http usually handles it
    const [image, setImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const pickImage = async () => {
        // Request permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Berechtigung fehlt', 'Wir benötigen Zugriff auf deine Fotos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImage(result.assets[0].uri);
        }
    };

    const uploadPhoto = async () => {
        if (!image) return;

        try {
            setUploading(true);
            const fileName = `profile-photo-${Date.now()}.jpg`;

            // 1. Upload to Firebase Storage (Client Side)
            const { getAuthBundle } = require('../../auth/tokenStorage');
            const bundle = await getAuthBundle();
            const userId = bundle?.user?.id;
            if (!userId) throw new Error('User not found');

            const path = `providers/${userId}/profile/${fileName}`;
            const { uploadImageToFirebase } = require('../../services/imageUpload');
            const downloadUrl = await uploadImageToFirebase(image, path);

            // 2. Update Backend with URL
            await providersApi.updateProfile({ profilePictureUrl: downloadUrl });

            Alert.alert(
                'Erfolg',
                'Profilbild erfolgreich aktualisiert',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (e: any) {
            console.error('Upload failed', e);
            Alert.alert('Fehler', 'Upload fehlgeschlagen: ' + (e.message || 'Unbekannter Fehler'));
        } finally {
            setUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <Ionicons
                        name="chevron-back"
                        size={24}
                        color={colors.gray700}
                        onPress={() => navigation.goBack()}
                    />
                    <Text style={[typography.h3, styles.headerTitle]}>Profilbild ändern</Text>
                    <View style={{ width: 24 }} />
                </View>
            </View>

            <View style={styles.content}>
                <Card style={styles.card}>
                    <View style={styles.previewContainer}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.previewImage} />
                        ) : (
                            <View style={styles.placeholder}>
                                <Ionicons name="person" size={64} color={colors.gray400} />
                            </View>
                        )}
                    </View>

                    <Text style={styles.instruction}>
                        Wähle ein professionelles Foto für dein Profil.
                    </Text>

                    <Button
                        title="Foto auswählen"
                        variant="secondary"
                        onPress={pickImage}
                        style={styles.button}
                        disabled={uploading}
                    />

                    {image && (
                        <Button
                            title={uploading ? 'Wird hochgeladen...' : 'Speichern'}
                            variant="primary"
                            onPress={uploadPhoto}
                            style={[styles.button, { marginTop: spacing.sm }]}
                            disabled={uploading}
                        />
                    )}
                </Card>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gray50,
    },
    header: {
        backgroundColor: colors.white,
        paddingTop: spacing.lg,
        paddingBottom: spacing.sm,
        paddingHorizontal: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
    },
    content: {
        padding: spacing.md,
        alignItems: 'center',
    },
    card: {
        padding: spacing.lg,
        width: '100%',
        alignItems: 'center',
    },
    previewContainer: {
        width: 150,
        height: 150,
        borderRadius: 75,
        overflow: 'hidden',
        backgroundColor: colors.gray100,
        marginBottom: spacing.md,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    instruction: {
        textAlign: 'center',
        color: colors.gray600,
        marginBottom: spacing.lg,
    },
    button: {
        width: '100%',
    },
});
