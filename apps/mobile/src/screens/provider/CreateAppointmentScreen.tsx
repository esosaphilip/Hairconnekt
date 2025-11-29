import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Button from '@/components/Button';
import IconButton from '@/components/IconButton';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Textarea from '@/components/textarea';
import Icon from '@/components/Icon';
import { colors, spacing, typography, COLORS, SPACING, FONT_SIZES } from '@/theme/tokens';
import { logger } from '@/services/logger';
import { MESSAGES } from '@/constants';

const mockServices = [
  { id: '1', name: 'Box Braids', duration: '4-6 Std.', price: '€85-€120' },
  { id: '2', name: 'Cornrows', duration: '2-3 Std.', price: '€45-€65' },
  { id: '3', name: 'Knotless Braids', duration: '5-7 Std.', price: '€95-€135' },
  { id: '4', name: 'Twists', duration: '3-4 Std.', price: '€65-€85' },
];

const mockClients = [
  { id: '1', name: 'Sarah Müller', phone: '+49 151 9876 5432' },
  { id: '2', name: 'Maria Klein', phone: '+49 151 1234 5678' },
  { id: '3', name: 'Anna Schmidt', phone: '+49 151 8765 4321' },
];

type Nav = { navigate: (routeName: string, params?: Record<string, unknown>) => void; goBack: () => void };
type CreateAppointmentParams = { clientId?: string };

export function CreateAppointmentScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<Record<string, CreateAppointmentParams>, string>>();
  const preselectedClientId: string | undefined = route?.params?.clientId;

  type ClientMode = 'existing' | 'new';
  type NewClient = { name: string; phone: string; email: string };

  const [clientMode, setClientMode] = useState<ClientMode>(preselectedClientId ? 'existing' : 'existing');
  const [selectedClient, setSelectedClient] = useState<string>(preselectedClientId || '');
  const [newClient, setNewClient] = useState<NewClient>({ name: '', phone: '', email: '' });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('09:00');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [location, setLocation] = useState<'salon' | 'mobile'>('salon');
  const [mobileAddress, setMobileAddress] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'invoice'>('pending');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredClients = mockClients.filter((client) => client.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) => (prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]));
  };

  const handleCreate = () => {
    try {
      setLoading(true);
      setError(null);
      if (clientMode === 'existing' && !selectedClient) {
        Alert.alert('Fehler', 'Bitte wähle einen Kunden aus');
        return;
      }
      if (clientMode === 'new' && (!newClient.name || !newClient.phone)) {
        Alert.alert('Fehler', 'Bitte fülle Name und Telefonnummer aus');
        return;
      }
      if (!date || !time) {
        Alert.alert('Fehler', 'Bitte wähle Datum und Uhrzeit');
        return;
      }
      if (selectedServices.length === 0) {
        Alert.alert('Fehler', 'Bitte wähle mindestens einen Service');
        return;
      }
      if (location === 'mobile' && !mobileAddress) {
        Alert.alert('Fehler', 'Bitte gib eine Adresse für den mobilen Service ein');
        return;
      }

      Alert.alert('Erfolg', 'Termin erfolgreich erstellt!');
      setTimeout(() => navigation.navigate('ProviderCalendar'), 1000);
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err?.message || 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.flexContainer}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <IconButton name="arrow-left" onPress={() => navigation.goBack()} />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Termin erstellen</Text>
            <Text style={styles.headerSubtitle}>Für Telefon- oder Walk-in-Buchungen</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Kunde auswählen</Text>
          <View style={styles.buttonRow}>
            <Button title="Bestehender Kunde" variant={clientMode === 'existing' ? 'default' : 'outline'} onPress={() => setClientMode('existing')} style={clientMode === 'existing' ? styles.activeButton : styles.inactiveButton} />
            <Button title="Neuer Kunde" variant={clientMode === 'new' ? 'default' : 'outline'} onPress={() => setClientMode('new')} style={clientMode === 'new' ? styles.activeButton : styles.inactiveButton} />
          </View>
          {clientMode === 'existing' ? (
            <View>
              <Input value={searchQuery} onChangeText={setSearchQuery} placeholder="Kunde suchen..." leftIcon="search" style={styles.searchInput} />
              <View style={styles.clientList}>
                {filteredClients.map((client) => (
                  <TouchableOpacity key={client.id} onPress={() => setSelectedClient(client.id)} style={[styles.clientItem, selectedClient === client.id && styles.clientItemSelected]}>
                    <Text style={styles.clientName}>{client.name}</Text>
                    <Text style={styles.clientPhone}>{client.phone}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.formGroup}>
              <View style={styles.formItem}>
                <Text style={styles.label}>Name *</Text>
                <Input value={newClient.name} onChangeText={(v) => setNewClient({ ...newClient, name: v })} placeholder="Max Mustermann" />
              </View>
              <View style={styles.formItem}>
                <Text style={styles.label}>Telefon *</Text>
                <Input keyboardType="phone-pad" value={newClient.phone} onChangeText={(v) => setNewClient({ ...newClient, phone: v })} placeholder="+49 151 1234 5678" />
              </View>
              <View style={styles.formItem}>
                <Text style={styles.label}>E-Mail (optional)</Text>
                <Input keyboardType="email-address" value={newClient.email} onChangeText={(v) => setNewClient({ ...newClient, email: v })} placeholder="kunde@email.com" />
              </View>
            </View>
          )}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Datum & Uhrzeit</Text>
          <View style={styles.grid2}>
            <View style={styles.formItem}>
              <Text style={styles.label}>Datum *</Text>
              <Input placeholder="YYYY-MM-DD" value={date} onChangeText={setDate} leftIcon="calendar" />
            </View>
            <View style={styles.formItem}>
              <Text style={styles.label}>Uhrzeit *</Text>
              <Input placeholder="HH:MM" value={time} onChangeText={setTime} leftIcon="clock" />
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Services auswählen</Text>
          <View style={styles.serviceList}>
            {mockServices.map((service) => (
              <TouchableOpacity key={service.id} onPress={() => toggleService(service.id)} style={[styles.serviceItem, selectedServices.includes(service.id) && styles.clientItemSelected]}>
                <View style={styles.serviceItemContent}>
                  <View style={styles.serviceTextContainer}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.serviceDetails}>{service.duration} • {service.price}</Text>
                  </View>
                  <View style={selectedServices.includes(service.id) ? styles.checkboxChecked : styles.checkboxUnchecked}>
                    {selectedServices.includes(service.id) && <Icon name="check" size={12} color={COLORS.white} />}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Standort</Text>
          <View style={styles.grid2}>
            <TouchableOpacity onPress={() => setLocation('salon')} style={[styles.locationButton, location === 'salon' && styles.clientItemSelected]}>
              <Text style={styles.locationText}>Im Salon</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setLocation('mobile')} style={[styles.locationButton, location === 'mobile' && styles.clientItemSelected]}>
              <Text style={styles.locationText}>Mobiler Service</Text>
            </TouchableOpacity>
          </View>
          {location === 'mobile' && (
            <View style={styles.formItem}>
              <Text style={styles.label}>Adresse *</Text>
              <Input value={mobileAddress} onChangeText={setMobileAddress} placeholder="Straße, PLZ Stadt" />
            </View>
          )}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Zahlung</Text>
          <View style={styles.grid3}>
            {['pending', 'paid', 'invoice'].map((status) => (
              <TouchableOpacity key={status} onPress={() => setPaymentStatus(status as 'pending' | 'paid' | 'invoice')} style={[styles.paymentButton, paymentStatus === status && styles.clientItemSelected]}>
                <Text style={styles.paymentButtonText}>
                  {status === 'pending' && 'Vor Ort'}
                  {status === 'paid' && 'Bezahlt'}
                  {status === 'invoice' && 'Rechnung'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.label}>Interne Notizen (optional)</Text>
          <Textarea value={notes} onChangeText={setNotes} placeholder="Besondere Wünsche, Hinweise..." numberOfLines={3} />
        </Card>

        {error && <Text style={{ color: COLORS.error, marginTop: SPACING.md }}>{error}</Text>}

        <View style={styles.actionButtonsContainer}>
          <Button title="Abbrechen" variant="outline" onPress={() => navigation.navigate('ProviderCalendar')} style={styles.actionButton} />
          <Button title="Termin erstellen" icon="calendar" onPress={handleCreate} style={[styles.actionButton, styles.createButton]} disabled={loading} />
        </View>
        {loading && <ActivityIndicator />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actionButton: { flex: 1, height: 48 },
  actionButtonsContainer: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  activeButton: { backgroundColor: colors.primary },
  buttonRow: { flexDirection: 'row', gap: SPACING.xs, marginBottom: SPACING.sm },
  card: { gap: SPACING.sm, padding: SPACING.md },
  cardTitle: { fontSize: FONT_SIZES.h5 || 16, fontWeight: 'bold', marginBottom: SPACING.xs },
  checkboxChecked: { alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: 10, height: 20, justifyContent: 'center', width: 20 },
  checkboxUnchecked: { borderColor: COLORS.border, borderRadius: 10, borderWidth: 2, height: 20, width: 20 },
  clientItem: { borderColor: COLORS.border, borderRadius: 8, borderWidth: 2, padding: SPACING.sm },
  clientItemSelected: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  clientList: { gap: SPACING.xs, maxHeight: 240, overflow: 'hidden' },
  clientName: { fontSize: FONT_SIZES.body || 14, fontWeight: '500' },
  clientPhone: { color: COLORS.textSecondary, fontSize: FONT_SIZES.body || 14 },
  createButton: { backgroundColor: COLORS.primary || '#8B4513' },
  flexContainer: { backgroundColor: COLORS.background || '#F9FAFB', flex: 1 },
  formGroup: { gap: (SPACING.xs || 4) / 2 },
  formItem: { gap: (SPACING.xs || 4) / 2 },
  grid2: { flexDirection: 'row', gap: SPACING.sm },
  grid3: { flexDirection: 'row', gap: SPACING.xs },
  header: {
    backgroundColor: COLORS.white || '#FFFFFF',
    borderBottomColor: COLORS.border || '#E5E7EB',
    borderBottomWidth: 1,
    elevation: 2,
    paddingHorizontal: SPACING.md || 16,
    paddingVertical: SPACING.sm || 8,
    shadowColor: COLORS.black || '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    zIndex: 10,
  },
  headerRow: { alignItems: 'center', flexDirection: 'row', gap: SPACING.sm || 8 },
  headerSubtitle: { color: COLORS.textSecondary || '#6B7280', fontSize: FONT_SIZES.body || 14 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: FONT_SIZES.h4 || 18, fontWeight: 'bold' },
  inactiveButton: { borderColor: COLORS.border },
  label: { fontSize: FONT_SIZES.body || 14, fontWeight: '500', marginBottom: SPACING.xs },
  locationButton: { alignItems: 'center', borderColor: COLORS.border, borderRadius: 8, borderWidth: 2, flex: 1, padding: SPACING.sm },
  locationText: { fontSize: FONT_SIZES.body || 14, fontWeight: '500' },
  paymentButton: { alignItems: 'center', borderColor: COLORS.border, borderRadius: 8, borderWidth: 2, flex: 1, padding: SPACING.sm },
  paymentButtonText: { fontSize: FONT_SIZES.body || 14 },
  scrollContent: { gap: SPACING.md, padding: SPACING.md || 16, paddingBottom: (SPACING.xl || 24) * 2 },
  searchInput: { marginBottom: SPACING.xs },
  serviceDetails: { color: COLORS.textSecondary, fontSize: FONT_SIZES.body || 14 },
  serviceItem: { borderColor: COLORS.border, borderRadius: 8, borderWidth: 2, padding: SPACING.sm },
  serviceItemContent: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  serviceList: { gap: SPACING.xs },
  serviceName: { fontSize: FONT_SIZES.body || 14, fontWeight: '500' },
  serviceTextContainer: { flex: 1 },
});
