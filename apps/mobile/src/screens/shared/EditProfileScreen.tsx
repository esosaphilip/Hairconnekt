import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

import { colors, spacing } from '../../theme/tokens';
import Input from '@/components/Input';
import Textarea from '@/components/textarea';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import Avatar, { AvatarImage, AvatarFallback } from '@/components/avatar';
import { Switch } from 'react-native';

import { http } from '@/api/http';
import { useAuth } from '@/auth/AuthContext';
import { usersApi } from '@/services/users';

type ProfileData = {
  // Provider
  businessName?: string | null;
  bio?: string | null;
  isMobileService?: boolean;
  serviceRadiusKm?: number | null;
  acceptsSameDayBooking?: boolean;
  advanceBookingDays?: number | null;
  // User/Client
  firstName?: string;
  lastName?: string;
  phone?: string;
  profilePictureUrl?: string | null;
  avatarUrl?: string | null;
};

export function EditProfileScreen() {
  const { user, setUser } = useAuth();
  const navigation = useNavigation();
  const isProvider = user?.userType === 'PROVIDER';

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Provider State
  const [businessName, setBusinessName] = useState('');
  const [bio, setBio] = useState('');
  const [isMobileService, setIsMobileService] = useState(false);
  const [serviceRadiusKm, setServiceRadiusKm] = useState('0');
  const [acceptsSameDayBooking, setAcceptsSameDayBooking] = useState(false);
  const [advanceBookingDays, setAdvanceBookingDays] = useState('30');

  // Client State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        let p: ProfileData = {};

        if (isProvider) {
          const res = await http.get('/providers/me');
          p = (res?.data || {}) as ProfileData;
        } else {
          // Client fetch
          const res = await usersApi.getMe();
          p = (res || {}) as ProfileData;
        }

        if (!mounted) return;

        if (isProvider) {
          setBusinessName(String(p.businessName ?? ''));
          setBio(String(p.bio ?? ''));
          setIsMobileService(!!p.isMobileService);
          setServiceRadiusKm(String(p.serviceRadiusKm ?? 0));
          setAcceptsSameDayBooking(!!p.acceptsSameDayBooking);
          setAdvanceBookingDays(String(p.advanceBookingDays ?? 30));
        } else {
          setFirstName(p.firstName || '');
          setLastName(p.lastName || '');
          setPhone(p.phone || '');
        }

        // Common state
        setProfileImage(p.profilePictureUrl || p.avatarUrl || null);

      } catch (e: any) {
        const msg = e?.response?.data?.message || e?.message || 'Profil konnte nicht geladen werden';
        if (mounted) setError(String(msg));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [isProvider]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      if (isProvider) {
        const payload = {
          businessName: businessName.trim() || null,
          bio: bio.trim() || null,
          isMobileService,
          serviceRadiusKm: Number(serviceRadiusKm) || 0,
          acceptsSameDayBooking,
          advanceBookingDays: Number(advanceBookingDays) || 30,
        };
        try {
          await http.patch('/providers/me', payload);
        } catch {
          await http.patch('/providers', payload);
        }
      } else {
        await usersApi.updateMe({
          firstName,
          lastName,
          phone,
        });
      }

      Alert.alert('Gespeichert', 'Profil aktualisiert', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e: any) {
      console.error('EditProfile Error:', e);
      let msg = e?.response?.data?.message || e?.message || 'Speichern fehlgeschlagen';
      setError(String(msg));
    } finally {
      setSaving(false);
    }
  };

  // --- Avatar Upload Logic ---
  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Zugriff verweigert', 'Zugriff auf Fotos erforderlich.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setLoading(true); // Reusing loading state for upload indicator

        // Determine correct endpoint based on user type
        // Use providerFilesApi which we've already fixed to use correct endpoints
        const { providerFilesApi } = await import('@/api/providerFiles');
        
        if (isProvider) {
          const res = await providerFilesApi.uploadProviderProfilePicture({
            uri: asset.uri,
            name: asset.fileName || 'profile.jpg',
            type: asset.mimeType || 'image/jpeg',
          });
          if (res?.url || res?.profilePictureUrl) {
             setProfileImage(res.url || res.profilePictureUrl);
          }
        } else {
          const res = await providerFilesApi.uploadAvatar({
            uri: asset.uri,
            name: asset.fileName || 'avatar.jpg',
            type: asset.mimeType || 'image/jpeg',
          });
          if (res?.url || res?.profilePictureUrl) {
             setProfileImage(res.url || res.profilePictureUrl);
          }
        }
        
        Alert.alert('Erfolg', 'Profilbild aktualisiert!');
      }
    } catch (error: any) {
      console.error('Avatar upload failed:', error);
      Alert.alert('Fehler', 'Upload fehlgeschlagen: ' + (error.message || 'Unbekannter Fehler'));
    } finally {
      setLoading(false);
    }
  };


  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {error && (
            <Card style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
            </Card>
          )}

          {/* Profile Image Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Avatar size={120} style={styles.avatar}>
                {profileImage ? (
                  <AvatarImage source={{ uri: profileImage }} style={styles.avatar} />
                ) : null}
                <AvatarFallback label={
                  (firstName && lastName)
                    ? `${firstName} ${lastName}`
                    : (businessName || '?')
                }
                  style={styles.avatarFallback}
                  textStyle={styles.avatarText}
                />
              </Avatar>
              <TouchableOpacity
                testID="camera-upload-btn"
                style={styles.cameraButton}
                onPress={handlePickImage}
              >
                <Icon name="camera" size={20} color="white" />
              </TouchableOpacity>
            </View>
            <Text style={styles.avatarTypeLabel}>
              {isProvider ? 'Profilbild & Logo' : 'Profilbild'}
            </Text>
          </View>

          {isProvider ? (
            <>
              <Card style={styles.card}>
                <Text variant="h3" style={styles.sectionTitle}>Betriebsinformationen</Text>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Studio/Betriebsname</Text>
                  <Input value={businessName} onChangeText={setBusinessName} placeholder="Mein Studio" />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Beschreibung</Text>
                  <Textarea value={bio} onChangeText={setBio} placeholder="Über mich und meine Dienstleistungen" numberOfLines={4} />
                </View>
              </Card>

              <Card style={styles.card}>
                <Text variant="h3" style={styles.sectionTitle}>Service Details</Text>

                <View style={styles.switchRow}>
                  <View style={styles.switchTextContainer}>
                    <Text style={styles.switchLabel}>Mobiler Service</Text>
                    <Text style={styles.switchHelper}>Ich komme zu meinen Kunden</Text>
                  </View>
                  <Switch
                    value={isMobileService}
                    onValueChange={setIsMobileService}
                    trackColor={{ false: colors.gray300, true: colors.primary }}
                  />
                </View>

                {isMobileService && (
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Service-Radius (km)</Text>
                    <Input value={serviceRadiusKm} onChangeText={setServiceRadiusKm} keyboardType="numeric" placeholder="z. B. 10" />
                  </View>
                )}

                <View style={styles.separator} />

                <View style={styles.switchRow}>
                  <View style={styles.switchTextContainer}>
                    <Text style={styles.switchLabel}>Buchungen am selben Tag</Text>
                    <Text style={styles.switchHelper}>Erlaube kurzfristige Buchungen</Text>
                  </View>
                  <Switch
                    value={acceptsSameDayBooking}
                    onValueChange={setAcceptsSameDayBooking}
                    trackColor={{ false: colors.gray300, true: colors.primary }}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Vorlaufzeit für Buchungen (Tage)</Text>
                  <Input value={advanceBookingDays} onChangeText={setAdvanceBookingDays} keyboardType="numeric" placeholder="z. B. 30" />
                </View>
              </Card>
            </>
          ) : (
            <Card style={styles.card}>
              <Text variant="h3" style={styles.sectionTitle}>Persönliche Daten</Text>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Vorname</Text>
                <Input value={firstName} onChangeText={setFirstName} placeholder="Max" />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nachname</Text>
                <Input value={lastName} onChangeText={setLastName} placeholder="Mustermann" />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Telefonnummer</Text>
                <Input value={phone} onChangeText={setPhone} placeholder="+49 123..." keyboardType="phone-pad" />
              </View>
            </Card>
          )}

          <View style={styles.footer}>
            <Button
              title={saving ? 'Speichern…' : 'Speichern'}
              onPress={handleSave}
              disabled={saving || loading}
              style={styles.saveButton}
              loading={saving}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.gray50,
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: 100,
  },
  errorCard: {
    backgroundColor: '#FEF2F2', // red-50
    borderColor: '#FCA5A5',
    borderWidth: 1,
    padding: spacing.sm,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.xs,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarFallback: {
    backgroundColor: colors.primary + '20',
  },
  avatarText: {
    color: colors.primary,
    fontSize: 40,
  },
  avatarTypeLabel: {
    color: colors.gray500,
    fontSize: 12,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: colors.gray50,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  card: {
    padding: spacing.md,
    gap: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray800,
  },
  formGroup: {
    gap: spacing.xs,
  },
  label: {
    color: colors.gray700,
    fontSize: 14,
    fontWeight: '500',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  switchTextContainer: {
    flex: 1,
    paddingRight: spacing.md,
  },
  switchLabel: {
    fontSize: 16,
    color: colors.gray800,
    fontWeight: '500',
  },
  switchHelper: {
    color: colors.gray500,
    fontSize: 12,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: colors.gray200,
    marginVertical: spacing.xs,
  },
  footer: {
    marginTop: spacing.sm,
  },
  saveButton: {
    backgroundColor: colors.primary,
  }
});
