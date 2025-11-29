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
const useRoute = (): { params: { id: string } } => ({
  params: {
    id: 'req-123',
  },
});

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

// Mock data (same as Web)
const mockRequest = {
  id: "req-123",
  client: {
    id: "client-1",
    name: "Sarah Müller",
    avatar: "",
    phone: "+4915198765432", // Cleaned phone number for Linking
    email: "sarah.mueller@email.de",
    totalBookings: 12,
    joinedDate: "März 2024",
  },
  service: {
    name: "Box Braids - Medium",
    duration: "5 Std.",
    price: "€95",
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

export function AppointmentRequestScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params; // Get ID from route params
  const [request] = useState(mockRequest);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [declineReason, setDeclineReason] = useState<string | null>(null);
  const [selectedAlternative, setSelectedAlternative] = useState<number | null>(null);
  const [customMessage, setCustomMessage] = useState<string>("");

  const handleAccept = () => {
    // Logic to accept...
    toast.success("Buchungsanfrage angenommen!");
    setShowAcceptDialog(false);
    setTimeout(() => navigation.navigate("ProviderCalendar"), 1500);
  };

  const handleDecline = () => {
    if (!declineReason && !customMessage) {
      toast.error("Bitte gib einen Grund für die Ablehnung an");
      return;
    }
    // Logic to decline...
    toast.success("Buchungsanfrage abgelehnt");
    setShowDeclineDialog(false);
    setTimeout(() => navigation.navigate("ProviderDashboard"), 1500);
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
    backgroundColor: backgroundColor,
    flex: 1,
  },
  // Header styles (replaces sticky header div)
  header: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomColor: '#f0f0f0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    padding: spacing.md,
  },
  backButton: {
    paddingRight: spacing.sm,
  },
  headerSubtitle: {
    color: '#6b7280',
    fontSize: 12, // text-gray-500
  },
  // ScrollView content
  scrollContent: {
    paddingBottom: 150,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md, // Space for fixed action buttons
  },
  // Card styles
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    marginBottom: spacing.md,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  // Status Badge row
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  statusText: {
    color: '#6b7280',
    fontSize: 12,
    marginLeft: spacing.sm,
  },
  // Client Info
  clientInfo: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  clientDetails: {
    flex: 1,
  },
  clientStats: {
    color: '#6b7280',
    fontSize: 12,
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
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  detailIcon: {
    alignItems: 'center',
    borderRadius: 8,
    flexShrink: 0,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailTitle: {
    color: '#6b7280',
    fontSize: 12,
  },
  detailValue: {
    fontSize: 14,
    color: '#1f2937', // text-gray-900
    fontWeight: '500',
  },
  detailSubValue: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 2,
  },
  subtitle: {
    color: '#6b7280',
    fontSize: 14,
  },
  // Alternative Dates
  alternativeDatesList: {
    marginTop: spacing.sm,
  },
  alternativeDateItem: {
    alignItems: 'center',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm / 2,
    padding: spacing.sm,
  },
  alternativeDateItemSelected: {
    backgroundColor: `${primaryColor}0D`,
    borderColor: primaryColor, // 5% opacity
  },
  alternativeDateText: {
    color: '#1f2937',
    fontSize: 14,
  },
  alternativeDateSubText: {
    color: '#6b7280',
    fontSize: 12,
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
    height: 48,
    width: '100%',
  },
  // Decline Dialog specific styles
  declineReasonItem: {
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 2,
    marginBottom: spacing.sm / 2,
    padding: spacing.sm,
  },
  declineReasonItemSelected: {
    backgroundColor: `${primaryColor}0D`,
    borderColor: primaryColor,
  },
  declineReasonText: {
    color: '#1f2937',
    fontSize: 14,
  },
  label: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '500',
  }
});