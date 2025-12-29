import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Alert } from 'react-native';
import { colors, spacing } from '../../theme/tokens';
import Input from '@/components/Input';
import Textarea from '@/components/textarea';
import Button from '@/components/Button';
import { Switch } from 'react-native';
import { http } from '@/api/http';

type ProviderProfile = {
  id?: string;
  businessName?: string | null;
  bio?: string | null;
  isMobileService?: boolean;
  serviceRadiusKm?: number | null;
  acceptsSameDayBooking?: boolean;
  advanceBookingDays?: number | null;
};

export function EditProfileScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [bio, setBio] = useState('');
  const [isMobileService, setIsMobileService] = useState(false);
  const [serviceRadiusKm, setServiceRadiusKm] = useState('0');
  const [acceptsSameDayBooking, setAcceptsSameDayBooking] = useState(false);
  const [advanceBookingDays, setAdvanceBookingDays] = useState('30');

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await http.get('/providers/me');
        const p = (res?.data || {}) as ProviderProfile;
        if (!mounted) return;
        setProfile(p);
        setBusinessName(String(p.businessName ?? ''));
        setBio(String(p.bio ?? ''));
        setIsMobileService(!!p.isMobileService);
        setServiceRadiusKm(String(p.serviceRadiusKm ?? 0));
        setAcceptsSameDayBooking(!!p.acceptsSameDayBooking);
        setAdvanceBookingDays(String(p.advanceBookingDays ?? 30));
      } catch (e: any) {
        const msg = e?.response?.data?.message || e?.message || 'Profil konnte nicht geladen werden';
        if (mounted) setError(String(msg));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    const payload = {
      businessName: businessName.trim() || null,
      bio: bio.trim() || null,
      isMobileService,
      serviceRadiusKm: Number(serviceRadiusKm) || 0,
      acceptsSameDayBooking,
      advanceBookingDays: Number(advanceBookingDays) || 30,
    };
    try {
      try {
        await http.patch('/providers/me', payload);
      } catch {
        await http.patch('/providers', payload);
      }
      Alert.alert('Gespeichert', 'Profil aktualisiert');
    } catch (e: any) {
      console.error('EditProfile Error:', e);
      let msg = e?.response?.data?.message || e?.message || 'Speichern fehlgeschlagen';
      if (e?.response?.status === 403) {
        msg = 'Keine Berechtigung (403). Bist du als Dienstleister eingeloggt?';
      }
      setError(String(msg));
      Alert.alert('Fehler', String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Profil bearbeiten</Text>
        {error && <Text style={styles.error}>{error}</Text>}
        <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
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
