import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Alert } from 'react-native';
import { colors, spacing } from '../../theme/tokens';
import Input from '@/components/Input';
import Textarea from '@/components/textarea';
import Button from '@/components/Button';
import { Switch } from 'react-native';
import { http } from '@/api/http';

import { useAuth } from '@/auth/AuthContext';
import { usersApi } from '@/services/users';
import Avatar, { AvatarImage, AvatarFallback } from '@/components/avatar';
import Icon from '@/components/Icon';
import { TouchableOpacity, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

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
  const isProvider = user?.userType === 'PROVIDER';

  const [loading, setLoading] = useState(false);
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
    setLoading(true);
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

      Alert.alert('Gespeichert', 'Profil aktualisiert');
    } catch (e: any) {
      console.error('EditProfile Error:', e);
      let msg = e?.response?.data?.message || e?.message || 'Speichern fehlgeschlagen';
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        const uri = result.assets[0].uri;

        // Optimistic update
        setProfileImage(uri);

        // Upload in background
        try {
          const uploaded = await usersApi.uploadAvatar(uri);
          const profilePictureUrl = uploaded.url;

          // Update auth context with new image URL
          if (user && profilePictureUrl) {
            await setUser({ ...user, profilePictureUrl });
          }
        } catch (e) {
          console.error('Upload failed', e);
          Alert.alert('Fehler', 'Bild konnte nicht hochgeladen werden.');
          // Revert on failure
          setProfileImage(null);
        }
      }
    } catch (e) {
      console.error('Picker failed', e);
      Alert.alert('Fehler', 'Galerie konnte nicht geöffnet werden.');
    }
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Profil bearbeiten</Text>
        {error && <Text style={styles.error}>{error}</Text>}
        <View style={{ gap: spacing.sm, marginTop: spacing.md }}>


          {/* Profile Image Section */}
          <View style={{ alignItems: 'center', marginBottom: spacing.md }}>
            <View style={{ position: 'relative' }}>
              <Avatar size={100} style={{ width: 100, height: 100, borderRadius: 50 }}>
                {profileImage ? (
                  <AvatarImage source={{ uri: profileImage }} style={{ width: 100, height: 100, borderRadius: 50 }} />
                ) : null}
                <AvatarFallback label={
                  (firstName && lastName)
                    ? `${firstName} ${lastName}`
                    : (businessName || '?')
                }
                  style={{ backgroundColor: colors.primary + '20' }}
                  textStyle={{ color: colors.primary, fontSize: 32 }}
                />
              </Avatar>
              <TouchableOpacity
                testID="camera-upload-btn"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: colors.primary,
                  padding: 8,
                  borderRadius: 20,
                  borderWidth: 2,
                  borderColor: colors.white,
                }}
                onPress={handlePickImage}
              >
                <Icon name="camera" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {isProvider ? (
            <>
              <View>
                <Text style={styles.label}>Studio/Betriebsname</Text>
                <Input value={businessName} onChangeText={setBusinessName} placeholder="Mein Studio" />
              </View>
              <View>
                <Text style={styles.label}>Beschreibung</Text>
                <Textarea value={bio} onChangeText={setBio} placeholder="Über mich und meine Dienstleistungen" numberOfLines={4} />
              </View>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.label}>Mobiler Service</Text>
                  <Text style={styles.helper}>Ich komme zu meinen Kunden</Text>
                </View>
                <Switch value={isMobileService} onValueChange={setIsMobileService} />
              </View>
              <View>
                <Text style={styles.label}>Service-Radius (km)</Text>
                <Input value={serviceRadiusKm} onChangeText={setServiceRadiusKm} keyboardType="numeric" placeholder="z. B. 10" />
              </View>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.label}>Buchungen am selben Tag</Text>
                  <Text style={styles.helper}>Erlaube Buchungen für heute</Text>
                </View>
                <Switch value={acceptsSameDayBooking} onValueChange={setAcceptsSameDayBooking} />
              </View>
              <View>
                <Text style={styles.label}>Vorlaufzeit für Buchungen (Tage)</Text>
                <Input value={advanceBookingDays} onChangeText={setAdvanceBookingDays} keyboardType="numeric" placeholder="z. B. 30" />
              </View>
            </>
          ) : (
            <>
              {/* Client Fields */}
              <View>
                <Text style={styles.label}>Vorname</Text>
                <Input value={firstName} onChangeText={setFirstName} placeholder="Max" />
              </View>
              <View>
                <Text style={styles.label}>Nachname</Text>
                <Input value={lastName} onChangeText={setLastName} placeholder="Mustermann" />
              </View>
              <View>
                <Text style={styles.label}>Telefonnummer</Text>
                <Input value={phone} onChangeText={setPhone} placeholder="+49 123..." keyboardType="phone-pad" />
              </View>
            </>
          )}

          <Button title={loading ? 'Speichern…' : 'Speichern'} onPress={handleSave} disabled={loading} style={{ backgroundColor: colors.primary }} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  safeArea: {
    backgroundColor: colors.gray50,
    flex: 1,
  },
  error: {
    color: colors.error,
    marginTop: spacing.sm,
  },
  text: {
    color: colors.gray600,
    fontSize: 14,
    marginTop: spacing.sm,
  },
  title: {
    color: colors.gray800,
    fontSize: 20,
    fontWeight: '600',
  },
  label: {
    color: colors.gray700,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  helper: {
    color: colors.gray600,
    fontSize: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
