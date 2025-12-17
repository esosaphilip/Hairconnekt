import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
// Reusable components (assumed, based on LoginScreen example)
import Text from '../../components/Text';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Avatar, { AvatarImage, AvatarFallback } from '../../components/avatar';
import Badge from '../../components/badge'; // RN Badge component
import Input from '../../components/Input';
import Icon from '../../components/Icon'; // Component for rendering icons (e.g., Ionicons-based)
import { Modal } from 'react-native';

// Navigation Hook equivalent for React Native (using React Navigation)
// Note: In a real app, 'useNavigation' and 'useRoute' from '@react-navigation/native' 
// would be used instead of react-router-dom's 'useNavigate' and 'useParams'.
// For simplicity, I'll define mock navigation/route logic.
const useNavigation = () => ({
  goBack: () => console.log('Navigating back...'),
  navigate: (screen: string, params?: Record<string, unknown>) => console.log(`Navigating to ${screen} with params: ${JSON.stringify(params)}`),
});
const useRoute = (): { params: { id: string } } => ({ params: { id: 'req-123' } });

// Mock for displaying notifications in React Native
const toast = {
  success: (message: string) => console.log(`TOAST SUCCESS: ${message}`),
  error: (message: string) => console.log(`TOAST ERROR: ${message}`),
};

// --- Icons Replacement (using a generic Icon component) ---
// In a real project, you'd use a library like 'react-native-vector-icons'
const IconNames = {
  ArrowLeft: 'chevron-left',
  Calendar: 'calendar',
  Clock: 'clock',
  User: 'user',
  MapPin: 'map-pin',
  CheckCircle2: 'check-circle',
  XCircle: 'x-circle',
  AlertCircle: 'alert-triangle',
  MessageSquare: 'message-square',
  Phone: 'phone',
};

import { IAppointmentRequest } from '@/domain/models/appointment';
import { providerAppointmentsApi } from '@/api/providerAppointments';

// Styles for visual consistency and tokens (assuming tokens like spacing.md)
const primaryColor = '#8B4513';
const alertColor = '#FF6B6B';
const backgroundColor = '#FAF9F6';
const spacing = { sm: 8, md: 16, lg: 24, xl: 32 };

// Helper to get initials for AvatarFallback
const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("");

function AlertModal({ isVisible, onClose, title, description, customContent, buttons }: { isVisible: boolean; onClose: () => void; title: string; description?: string; customContent?: React.ReactNode; buttons: { title: string; onPress: () => void; variant?: 'outline' | 'primary'; style?: any }[] }) {
  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <View style={{ width: '100%', maxWidth: 420, backgroundColor: '#fff', borderRadius: 12, padding: 16 }}>
          <Text variant="h3" style={{ marginBottom: 8 }}>{title}</Text>
          {!!description && <Text style={{ marginBottom: 12 }}>{description}</Text>}
          {!!customContent && <View style={{ marginBottom: 12 }}>{customContent}</View>}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            {buttons.map((b, i) => (
              <Button
                key={`${b.title}-${i}`}
                title={b.title}
                onPress={b.onPress}
                variant={b.variant === 'outline' ? 'outline' : 'primary'}
                style={[b.style, { marginLeft: i > 0 ? 8 : 0 }]}
              />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Mock data (temporary, typed)
const mockRequest: IAppointmentRequest = {
  id: "req-123",
  client: {
    id: "client-1",
    name: "Sarah Müller",
    avatar: "",
    phone: "+4915198765432", 
    email: "sarah.mueller@email.de",
    totalBookings: 12,
    joinedDate: "März 2024",
  },
  service: {
    name: "Box Braids - Medium",
    duration: "5 Std.",
    price: "€95",
    priceCents: 9500,
  },
  requestedDate: "Montag, 15. Nov 2025",
  requestedTime: "10:00",
  alternativeDates: [
    { date: "Dienstag, 16. Nov 2025", time: "14:00" },
    { date: "Mittwoch, 17. Nov 2025", time: "10:00" },
  ],
  location: "Ihr Salon",
  address: "Hauptstraße 45, 10115 Berlin",
  notes: "Ich hätte gerne eine Beratung zur Haarfarbe und würde auch Extensions in Betracht ziehen.",
  requestedAt: "Vor 2 Stunden",
  status: "pending",
};

export function AppointmentRequestScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params; 
  // Initialize with null or loading state in real app, but here we use mock or fetched data
  // The screen currently uses `mockRequest`. We should ideally fetch it.
  // For the purpose of this refactor, let's type the state.
  const [request, setRequest] = useState<IAppointmentRequest>(mockRequest as unknown as IAppointmentRequest); 
  // Note: `mockRequest` structure matches `IAppointmentRequest` closely but might need adjustment.
  // Let's assume for this task we are focusing on the TYPE usage.
  
  // ... rest of code

  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [declineReason, setDeclineReason] = useState<string | null>(null);
  const [selectedAlternative, setSelectedAlternative] = useState<number | null>(null);
  const [customMessage, setCustomMessage] = useState<string>("");

  const handleAccept = async () => {
    try {
      const res = await providerAppointmentsApi.accept(String(id));
      const msg = res?.message || 'Termin bestätigt';
      toast.success(msg);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Bestätigung fehlgeschlagen';
      toast.error(msg);
    } finally {
      setShowAcceptDialog(false);
      setTimeout(() => navigation.navigate('ProviderCalendar'), 1500);
    }
  };

  const handleDecline = async () => {
    if (!declineReason && !customMessage) {
      toast.error('Bitte gib einen Grund für die Ablehnung an');
      return;
    }
    try {
      const res = await providerAppointmentsApi.decline(String(id), { reason: (declineReason || 'other') as any, messageToClient: customMessage || undefined });
      const msg = res?.message || 'Anfrage abgelehnt';
      toast.success(msg);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Ablehnung fehlgeschlagen';
      toast.error(msg);
    } finally {
      setShowDeclineDialog(false);
      setTimeout(() => navigation.navigate('ProviderDashboard'), 1500);
    }
  };

  const handleProposeAlternative = () => {
    if (selectedAlternative === null) {
      toast.error("Bitte wähle einen alternativen Termin aus");
      return;
    }
    // Logic to propose alternative...
    toast.success("Alternative vorgeschlagen!");
    setTimeout(() => navigation.navigate("ProviderCalendar"), 1500);
  };

  // Function to open phone dialer
  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  return (
    <View style={styles.container}>
      {/* Header (replaces sticky div) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name={IconNames.ArrowLeft} size={24} color="#000" />
        </TouchableOpacity>
        <View>
          <Text variant="h3" style={{ color: '#000' }}>Buchungsanfrage</Text>
          <Text style={styles.headerSubtitle}>{request.requestedAt}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Badge */}
        <View style={styles.statusRow}>
          <Badge color="#FFF0D5" textColor="#9A6600">
            <Icon name={IconNames.AlertCircle} size={14} color="#9A6600" style={{ marginRight: 4 }} />
            Ausstehend
          </Badge>
          <Text style={styles.statusText}>Reagiere innerhalb von 24 Std.</Text>
        </View>

        {/* Client Info */}
        <Card style={styles.card}>
          <View style={styles.clientInfo}>
            <Avatar size={50} style={{ backgroundColor: primaryColor }}>
              <AvatarImage source={{ uri: request.client.avatar }} />
              <AvatarFallback label={getInitials(request.client.name)} />
            </Avatar>
            <View style={styles.clientDetails}>
              <Text variant="h3">{request.client.name}</Text>
              <Text style={styles.clientStats}>
                {request.client.totalBookings} Buchungen • Mitglied seit {request.client.joinedDate}
              </Text>
              <View style={styles.clientActions}>
                <Button
                  title="Profil"
                  variant="outline"
                  icon={IconNames.User}
                  onPress={() => navigation.navigate('ClientProfile', { clientId: request.client.id })}
                  style={styles.actionButton}
                />
                <Button
                  title="Anrufen"
                  variant="outline"
                  icon={IconNames.Phone}
                  onPress={() => handleCall(request.client.phone)}
                  style={styles.actionButton}
                />
                <Button
                  title="Nachricht"
                  variant="outline"
                  icon={IconNames.MessageSquare}
                  onPress={() => navigation.navigate('ChatScreen', { clientId: request.client.id })}
                  style={styles.actionButton}
                />
              </View>
            </View>
          </View>
        </Card>

        {/* Service Details */}
        <Card style={styles.card}>
          <Text variant="h3" style={{ marginBottom: spacing.sm }}>Termindetails</Text>
          {/* Separator is just a thin line in RN */}
          <View style={styles.separator} />

          {/* Detail Rows */}
          {[
            { icon: IconNames.Calendar, title: 'Gewünschtes Datum', value: request.requestedDate, detail: null },
            { icon: IconNames.Clock, title: 'Uhrzeit', value: `${request.requestedTime} (${request.service.duration})`, detail: null },
            { icon: IconNames.User, title: 'Service', value: request.service.name, detail: request.service.price },
            { icon: IconNames.MapPin, title: 'Standort', value: request.location, detail: request.address },
          ].map((item, index) => (
            <View key={index} style={styles.detailRow}>
              <View style={[styles.detailIcon, { backgroundColor: `${alertColor}1A` }]}>
                <Icon name={item.icon} size={20} color={alertColor} />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailTitle}>{item.title}</Text>
                <Text style={styles.detailValue}>{item.value}</Text>
                {item.detail && <Text style={styles.detailSubValue}>{item.detail}</Text>}
              </View>
            </View>
          ))}
        </Card>

        {/* Alternative Dates */}
        {request.alternativeDates.length > 0 && (
          <Card style={styles.card}>
            <Text variant="h3" style={{ marginBottom: spacing.sm }}>Alternative Termine</Text>
            <Text style={styles.subtitle}>Der Kunde ist auch an diesen Terminen verfügbar</Text>
            <View style={styles.separator} />

            <View style={styles.alternativeDatesList}>
              {request.alternativeDates.map((alt, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.alternativeDateItem,
                    selectedAlternative === index && styles.alternativeDateItemSelected,
                  ]}
                  onPress={() => setSelectedAlternative(index)}
                >
                  <View>
                    <Text style={styles.alternativeDateText}>{alt.date}</Text>
                    <Text style={styles.alternativeDateSubText}>{alt.time}</Text>
                  </View>
                  {selectedAlternative === index && (
                    <Icon name={IconNames.CheckCircle2} size={20} color={primaryColor} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        )}

        {/* Client Notes */}
        {request.notes && (
          <Card style={styles.card}>
            <Text variant="h3" style={{ marginBottom: spacing.sm }}>Notizen vom Kunden</Text>
            <Text style={styles.notesText}>{request.notes}</Text>
          </Card>
        )}
      </ScrollView>
      
      {/* Fixed Action Buttons */}
      <View style={styles.actionsContainer}>
        <Button
          title="Anfrage annehmen"
          onPress={() => setShowAcceptDialog(true)}
          style={[styles.fullWidthButton, { backgroundColor: primaryColor }]}
          textStyle={{ color: '#fff' }}
          icon={IconNames.CheckCircle2}
        />
        
        {selectedAlternative !== null && (
          <Button
            title="Alternative vorschlagen"
            onPress={handleProposeAlternative}
            style={[styles.fullWidthButton, { backgroundColor: alertColor }]}
            textStyle={{ color: '#fff' }}
            icon={IconNames.Calendar}
          />
        )}
        
        <Button
          title="Ablehnen"
          variant="outline"
          onPress={() => setShowDeclineDialog(true)}
          style={styles.fullWidthButton}
          textStyle={{ color: '#333' }}
          icon={IconNames.XCircle}
        />
      </View>


      {/* --- Modals (AlertDialog equivalent) --- */}

      {/* Accept Dialog */}
      <AlertModal
        isVisible={showAcceptDialog}
        onClose={() => setShowAcceptDialog(false)}
        title="Anfrage annehmen?"
        description="Der Termin wird in deinem Kalender eingetragen und der Kunde erhält eine Bestätigung."
        buttons={[
          { title: "Abbrechen", onPress: () => setShowAcceptDialog(false), variant: 'outline' },
          { title: "Bestätigen", onPress: handleAccept, style: { backgroundColor: primaryColor } },
        ]}
      />

      {/* Decline Dialog */}
      <AlertModal
        isVisible={showDeclineDialog}
        onClose={() => setShowDeclineDialog(false)}
        title="Anfrage ablehnen"
        description="Bitte gib einen Grund an, damit der Kunde besser verstehen kann."
        customContent={
          <View style={{ width: '100%', paddingVertical: spacing.md }}>
            <View style={{ marginBottom: spacing.md }}>
              {[
                "Termin nicht verfügbar",
                "Service nicht angeboten",
                "Standort zu weit entfernt",
                "Anderer Grund",
              ].map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[
                    styles.declineReasonItem,
                    declineReason === reason && styles.declineReasonItemSelected,
                  ]}
                  onPress={() => setDeclineReason(reason)}
                >
                  <Text style={styles.declineReasonText}>{reason}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Nachricht (optional)</Text>
            <Input
              placeholder="Füge eine persönliche Nachricht hinzu..."
              value={customMessage}
              onChangeText={setCustomMessage}
              multiline
              numberOfLines={4}
              style={{ minHeight: 80, marginTop: spacing.sm }}
            />
          </View>
        }
        buttons={[
          { title: "Abbrechen", onPress: () => setShowDeclineDialog(false), variant: 'outline' },
          { title: "Ablehnen", onPress: handleDecline, style: { backgroundColor: alertColor } },
        ]}
      />
    </View>
  );
}

// --- Stylesheet for React Native ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgroundColor,
  },
  // Header styles (replaces sticky header div)
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    paddingRight: spacing.sm,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6b7280', // text-gray-500
  },
  // ScrollView content
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    paddingBottom: 150, // Space for fixed action buttons
  },
  // Card styles
  card: {
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  // Status Badge row
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: spacing.sm,
  },
  // Client Info
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  clientDetails: {
    flex: 1,
  },
  clientStats: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  clientActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  actionButton: {
    height: 32, // Equivalent to h-8
    paddingHorizontal: spacing.sm,
  },
  // Separator
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb', // border-gray-200
    marginVertical: spacing.sm,
  },
  // Detail Row
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#1f2937', // text-gray-900
    fontWeight: '500',
  },
  detailSubValue: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  // Alternative Dates
  alternativeDatesList: {
    marginTop: spacing.sm,
  },
  alternativeDateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    marginBottom: spacing.sm / 2,
  },
  alternativeDateItemSelected: {
    borderColor: primaryColor,
    backgroundColor: `${primaryColor}0D`, // 5% opacity
  },
  alternativeDateText: {
    fontSize: 14,
    color: '#1f2937',
  },
  alternativeDateSubText: {
    fontSize: 12,
    color: '#6b7280',
  },
  // Notes
  notesText: {
    fontSize: 14,
    color: '#4b5563', // text-gray-600
    lineHeight: 20,
  },
  // Fixed Action Buttons Container
  actionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: '#fff', // White background for the action bar
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  fullWidthButton: {
    width: '100%',
    height: 48,
  },
  // Decline Dialog specific styles
  declineReasonItem: {
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    marginBottom: spacing.sm / 2,
  },
  declineReasonItemSelected: {
    borderColor: primaryColor,
    backgroundColor: `${primaryColor}0D`,
  },
  declineReasonText: {
    fontSize: 14,
    color: '#1f2937',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  }
});
