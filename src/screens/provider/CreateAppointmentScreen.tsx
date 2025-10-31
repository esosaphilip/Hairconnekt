import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert, // Replaces web 'toast'
} from 'react-native';

// Replaced web imports with assumed custom/community React Native components
import { useNavigation, useRoute } from '@react-navigation/native';
import Button from '../../components/Button';
import IconButton from '../../components/IconButton';
import Card from '../../components/Card';
import Input from '../../components/Input'; // Custom Input component
import Textarea from '../../components/textarea'; // Custom multiline Input component
import Icon from '../../components/Icon';
import { COLORS, SPACING, FONT_SIZES } from '../../theme/tokens';

// --- Mock Data (Replicated) ---
const mockServices = [
  { id: "1", name: "Box Braids", duration: "4-6 Std.", price: "€85-€120" },
  { id: "2", name: "Cornrows", duration: "2-3 Std.", price: "€45-€65" },
  { id: "3", name: "Knotless Braids", duration: "5-7 Std.", price: "€95-€135" },
  { id: "4", name: "Twists", duration: "3-4 Std.", price: "€65-€85" },
];

const mockClients = [
  { id: "1", name: "Sarah Müller", phone: "+49 151 9876 5432" },
  { id: "2", name: "Maria Klein", phone: "+49 151 1234 5678" },
  { id: "3", name: "Anna Schmidt", phone: "+49 151 8765 4321" },
];

// --- Main Component ---
export function CreateAppointmentScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const preselectedClientId: string | undefined = route?.params?.clientId; // Get param from navigation state

  type ClientMode = 'existing' | 'new';
  type NewClient = { name: string; phone: string; email: string };

  const [clientMode, setClientMode] = useState<ClientMode>(
    preselectedClientId ? 'existing' : 'existing'
  );
  const [selectedClient, setSelectedClient] = useState<string>(preselectedClientId || '');
  const [newClient, setNewClient] = useState<NewClient>({
    name: '',
    phone: '',
    email: '',
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('09:00');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [location, setLocation] = useState<'salon' | 'mobile'>('salon');
  const [mobileAddress, setMobileAddress] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'invoice'>('pending');
  const [notes, setNotes] = useState<string>('');

  // --- Filtering Logic ---
  const filteredClients = mockClients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Utility Functions ---
  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleCreate = () => {
    // --- Validation Logic ---
    if (clientMode === "existing" && !selectedClient) {
      Alert.alert("Fehler", "Bitte wähle einen Kunden aus");
      return;
    }

    if (clientMode === "new" && (!newClient.name || !newClient.phone)) {
      Alert.alert("Fehler", "Bitte fülle Name und Telefonnummer aus");
      return;
    }

    if (!date || !time) {
      Alert.alert("Fehler", "Bitte wähle Datum und Uhrzeit");
      return;
    }

    if (selectedServices.length === 0) {
      Alert.alert("Fehler", "Bitte wähle mindestens einen Service");
      return;
    }

    if (location === "mobile" && !mobileAddress) {
      Alert.alert("Fehler", "Bitte gib eine Adresse für den mobilen Service ein");
      return;
    }
    // --- End Validation ---

    Alert.alert("Erfolg", "Termin erfolgreich erstellt!");
    setTimeout(() => navigation.navigate("ProviderCalendarScreen"), 1000);
  };

  return (
    <SafeAreaView style={styles.flexContainer}>
      {/* Header */}
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
        {/* Client Selection */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Kunde auswählen</Text>

          <View style={styles.buttonRow}>
            <Button
              title="Bestehender Kunde"
              variant={clientMode === "existing" ? "default" : "outline"}
              onPress={() => setClientMode("existing")}
              style={clientMode === "existing" ? styles.activeButton : styles.inactiveButton}
            />
            <Button
              title="Neuer Kunde"
              variant={clientMode === "new" ? "default" : "outline"}
              onPress={() => setClientMode("new")}
              style={clientMode === "new" ? styles.activeButton : styles.inactiveButton}
            />
          </View>

          {clientMode === "existing" ? (
            <View>
              {/* Search Input (Replaced web search input) */}
              <Input
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Kunde suchen..."
                leftIcon="search" // Assuming Input component supports an icon
                style={styles.searchInput}
              />

              {/* Client List */}
              <View style={styles.clientList}>
                {filteredClients.map((client) => (
                  <TouchableOpacity
                    key={client.id}
                    onPress={() => setSelectedClient(client.id)}
                    style={[
                      styles.clientItem,
                      selectedClient === client.id && styles.clientItemSelected,
                    ]}
                  >
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
                <Input
                  value={newClient.name}
                  onChangeText={(v) => setNewClient({ ...newClient, name: v })}
                  placeholder="Max Mustermann"
                />
              </View>
              <View style={styles.formItem}>
                <Text style={styles.label}>Telefon *</Text>
                <Input
                  keyboardType="phone-pad"
                  value={newClient.phone}
                  onChangeText={(v) => setNewClient({ ...newClient, phone: v })}
                  placeholder="+49 151 1234 5678"
                />
              </View>
              <View style={styles.formItem}>
                <Text style={styles.label}>E-Mail (optional)</Text>
                <Input
                  keyboardType="email-address"
                  value={newClient.email}
                  onChangeText={(v) => setNewClient({ ...newClient, email: v })}
                  placeholder="kunde@email.com"
                />
              </View>
            </View>
          )}
        </Card>

        {/* Date & Time */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Datum & Uhrzeit</Text>
          <View style={styles.grid2}>
            <View style={styles.formItem}>
              <Text style={styles.label}>Datum *</Text>
              {/* Note: In RN, date pickers are separate components (modals) */}
              <Input
                placeholder="YYYY-MM-DD"
                value={date}
                onChangeText={setDate}
                leftIcon="calendar"
              />
            </View>
            <View style={styles.formItem}>
              <Text style={styles.label}>Uhrzeit *</Text>
              {/* Note: In RN, time pickers are separate components (modals) */}
              <Input
                placeholder="HH:MM"
                value={time}
                onChangeText={setTime}
                leftIcon="clock"
              />
            </View>
          </View>
        </Card>

        {/* Service Selection */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Services auswählen</Text>
          <View style={styles.serviceList}>
            {mockServices.map((service) => (
              <TouchableOpacity
                key={service.id}
                onPress={() => toggleService(service.id)}
                style={[
                  styles.serviceItem,
                  selectedServices.includes(service.id) && styles.clientItemSelected,
                ]}
              >
                <View style={styles.serviceItemContent}>
                  <View style={styles.serviceTextContainer}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.serviceDetails}>
                      {service.duration} • {service.price}
                    </Text>
                  </View>
                  {/* Mock Checkbox using a simple circle/tick icon */}
                  <View style={selectedServices.includes(service.id) ? styles.checkboxChecked : styles.checkboxUnchecked}>
                      {selectedServices.includes(service.id) && <Icon name="check" size={12} color={COLORS.white} />}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Location */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Standort</Text>
          <View style={styles.grid2}>
            <TouchableOpacity
              onPress={() => setLocation("salon")}
              style={[
                styles.locationButton,
                location === "salon" && styles.clientItemSelected,
              ]}
            >
              <Text style={styles.locationText}>Im Salon</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setLocation("mobile")}
              style={[
                styles.locationButton,
                location === "mobile" && styles.clientItemSelected,
              ]}
            >
              <Text style={styles.locationText}>Mobiler Service</Text>
            </TouchableOpacity>
          </View>

          {location === "mobile" && (
            <View style={styles.formItem}>
              <Text style={styles.label}>Adresse *</Text>
              <Input
                value={mobileAddress}
                onChangeText={setMobileAddress}
                placeholder="Straße, PLZ Stadt"
              />
            </View>
          )}
        </Card>

        {/* Payment */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Zahlung</Text>
          <View style={styles.grid3}>
            {["pending", "paid", "invoice"].map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => setPaymentStatus(status as "pending" | "paid" | "invoice")}
                style={[
                  styles.paymentButton,
                  paymentStatus === status && styles.clientItemSelected,
                ]}
              >
                <Text style={styles.paymentButtonText}>
                  {status === "pending" && "Vor Ort"}
                  {status === "paid" && "Bezahlt"}
                  {status === "invoice" && "Rechnung"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Notes */}
        <Card style={styles.card}>
          <Text style={styles.label}>Interne Notizen (optional)</Text>
          <Textarea
            value={notes}
            onChangeText={setNotes}
            placeholder="Besondere Wünsche, Hinweise..."
            numberOfLines={3}
          />
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <Button
            title="Abbrechen"
            variant="outline"
            onPress={() => navigation.navigate("ProviderCalendarScreen")}
            style={styles.actionButton}
          />
          <Button
            title="Termin erstellen"
            icon="calendar"
            onPress={handleCreate}
            style={[styles.actionButton, styles.createButton]}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


// --- React Native Stylesheet ---
const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: COLORS.background || '#F9FAFB',
  },
  // --- Header Styles ---
  header: {
    backgroundColor: COLORS.white || '#FFFFFF',
    paddingHorizontal: SPACING.md || 16,
    paddingVertical: SPACING.sm || 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border || '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm || 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZES.h4 || 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.textSecondary || '#6B7280',
  },
  // --- Scroll Content & Cards ---
  scrollContent: {
    padding: SPACING.md || 16,
    paddingBottom: SPACING.xl * 2,
    gap: SPACING.md,
  },
  card: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  cardTitle: {
    fontSize: FONT_SIZES.h5 || 16,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZES.body || 14,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  formGroup: {
    gap: SPACING.sm,
  },
  formItem: {
    gap: SPACING.xs / 2,
  },
  // --- Client Mode Toggle ---
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  activeButton: {
    backgroundColor: COLORS.primary || '#8B4513',
  },
  inactiveButton: {
    borderColor: COLORS.border,
  },
  // --- Client Search/List ---
  searchInput: {
    marginBottom: SPACING.xs,
  },
  clientList: {
    maxHeight: 240, // max-h-60
    overflow: 'hidden', // Ensures scroll is contained (though FlatList is better for large lists)
    gap: SPACING.xs,
  },
  clientItem: {
    padding: SPACING.sm,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  clientItemSelected: {
    borderColor: COLORS.primary || '#8B4513',
    backgroundColor: COLORS.primary + '0D', // 5% opacity
  },
  clientName: {
    fontSize: FONT_SIZES.body || 14,
    fontWeight: '500',
  },
  clientPhone: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.textSecondary,
  },
  // --- Date/Time, Location, Payment Grids ---
  grid2: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  grid3: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  // --- Service Selection ---
  serviceList: {
    gap: SPACING.xs,
  },
  serviceItem: {
    padding: SPACING.sm,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  serviceItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serviceTextContainer: {
    flex: 1,
  },
  serviceName: {
    fontSize: FONT_SIZES.body || 14,
    fontWeight: '500',
  },
  serviceDetails: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.textSecondary,
  },
  checkboxUnchecked: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: COLORS.border,
  },
  checkboxChecked: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: COLORS.primary,
      alignItems: 'center',
      justifyContent: 'center',
  },
  // --- Location/Payment Buttons ---
  locationButton: {
    flex: 1,
    padding: SPACING.sm,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  locationText: {
    fontSize: FONT_SIZES.body || 14,
    fontWeight: '500',
  },
  paymentButton: {
    flex: 1,
    padding: SPACING.sm,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  paymentButtonText: {
    fontSize: FONT_SIZES.body || 14,
  },
  // --- Action Buttons ---
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    height: 48,
  },
  createButton: {
    backgroundColor: COLORS.primary || '#8B4513',
  },
});