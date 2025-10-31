import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Platform,
  Modal,
  Alert, // Use Alert for simple confirmations/toasts
} from 'react-native';

// Replaced web imports with assumed custom/community React Native components
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Button from '../components/Button';
import Card from '../components/Card';
import { Avatar, AvatarImage } from '../components/avatar';
import Icon from '../components/Icon'; // Component for handling icons (e.g., using react-native-vector-icons)
import { colors, spacing } from '../theme/tokens';
import IconButton from '../components/IconButton';
import { Badge } from '../components/badge';

// Local tokens shim to keep existing style keys working
const COLORS = {
  ...colors,
  background: colors.gray50,
  border: colors.gray200,
  text: colors.gray800,
  textSecondary: colors.gray600,
  warningBg: '#FFFBEB',
  warningBorder: '#FEF3C7',
  infoBg: '#EFF6FF',
  infoBorder: '#DBEAFE',
  danger: colors.error,
};
const SPACING = spacing;
const FONT_SIZES = { h4: 18, h5: 16, body: 14, small: 12 };

// --- Mock Data (Remains largely the same, but using mobile-friendly types) ---
type Appointment = {
  id: string;
  status: 'upcoming' | 'completed' | string;
  provider: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    address: string;
    phone: string;
  };
  service: {
    name: string;
    duration: string;
    price: string;
  };
  date: string;
  time: string;
  bookingId: string;
  notes?: string;
  cancellationPolicy?: string;
};

const mockAppointments: Record<string, Appointment> = {
  // ... (Your mockAppointments data structure here)
  "1": {
    id: "1",
    status: "upcoming",
    provider: {
      id: "1",
      name: "Sarah Mueller",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      rating: 4.9,
      address: "Friedrichstraße 123, 10117 Berlin",
      phone: "+4930123456", // Clean phone number for linking
    },
    service: {
      name: "Knotless Box Braids",
      duration: "4-5 Std.",
      price: "180,00 €",
    },
    date: "29. Oktober 2025",
    time: "14:00",
    bookingId: "HC-2025-10-0001",
    notes: "Bitte eigene Extensions mitbringen (Farbe: 1B)",
    cancellationPolicy: "Kostenlose Stornierung bis 24 Stunden vor dem Termin",
  },
  "2": {
    id: "2",
    status: "completed",
    provider: {
      id: "2",
      name: "Marcus Johnson",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      rating: 4.8,
      address: "Kurfürstendamm 45, 10719 Berlin",
      phone: "+4930789012",
    },
    service: {
      name: "Cornrows with Extensions",
      duration: "3 Std.",
      price: "120,00 €",
    },
    date: "15. Oktober 2025",
    time: "10:00",
    bookingId: "HC-2025-10-0002",
  },
};
// --- Custom Styles and Tokens (Simplified from the previous example) ---
// Cast styles to any to temporarily allow web-only properties like `gap` in RN styles.
const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: COLORS.background || '#F9FAFB',
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white || '#FFFFFF',
    padding: SPACING.lg || 24,
  },
  // --- Header Styles ---
  header: {
    backgroundColor: COLORS.white || '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border || '#E5E7EB',
    paddingHorizontal: SPACING.md || 16,
    paddingVertical: SPACING.md || 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    // React Native doesn't support `gap` yet; consider margins.
    gap: SPACING.sm || 8,
  },
  headerTitle: {
    fontSize: FONT_SIZES.h4 || 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.textSecondary || '#6B7280',
  },
  menuButton: {
    padding: SPACING.xs || 4,
  },
  // --- Scroll Content & Cards ---
  scrollContent: {
    padding: SPACING.md || 16,
    paddingBottom: SPACING.xl * 2 || 64,
  },
  statusBadgeContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md || 16,
  },
  dateCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    // React Native doesn't support `gap` yet; consider margins.
    gap: SPACING.md || 16,
  },
  dateCircle: {
    width: 64,
    height: 64,
    backgroundColor: COLORS.primary + '1A' || '#8B45131A',
    borderRadius: 16,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary || '#8B4513',
    lineHeight: 28,
  },
  dateMonth: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.textSecondary || '#6B7280',
    marginTop: -4,
  },
  dateText: {
    fontSize: FONT_SIZES.h4 || 18,
    fontWeight: '600',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    // React Native doesn't support `gap` yet; consider margins.
    gap: SPACING.xs || 4,
    marginTop: SPACING.xs || 4,
  },
  // --- Provider Card Styles ---
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    // React Native doesn't support `gap` yet; consider margins.
    gap: SPACING.sm || 8,
    marginBottom: SPACING.sm || 8,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: FONT_SIZES.h5 || 16,
    fontWeight: '600',
    marginBottom: SPACING.xs || 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // React Native doesn't support `gap` yet; consider margins.
    gap: SPACING.xs / 2 || 2,
  },
  ratingText: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.text || '#1F2937',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border || '#E5E7EB',
    marginVertical: SPACING.md || 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    // React Native doesn't support `gap` yet; consider margins.
    gap: SPACING.sm || 8,
    marginBottom: SPACING.sm || 8,
  },
  addressInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addressText: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.textSecondary || '#6B7280',
    flex: 1,
  },
  phoneLink: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.primary || '#8B4513',
    textDecorationLine: 'underline',
  },
  // --- Service Details ---
  detailTitle: {
    fontSize: FONT_SIZES.h5 || 16,
    fontWeight: '600',
    marginBottom: SPACING.sm || 8,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm || 8,
  },
  serviceLabel: {
    color: COLORS.textSecondary || '#6B7280',
  },
  serviceTotal: {
    fontWeight: 'bold',
    color: COLORS.primary || '#8B4513',
  },
  // --- Notes/Policy Cards ---
  notesCard: {
    backgroundColor: COLORS.warningBg || '#FFFBEB', // amber-50
    borderColor: COLORS.warningBorder || '#FEF3C7', // amber-200
    borderWidth: 1,
  },
  policyCard: {
    backgroundColor: COLORS.infoBg || '#EFF6FF', // blue-50
    borderColor: COLORS.infoBorder || '#DBEAFE', // blue-200
    borderWidth: 1,
  },
  notesText: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.text || '#1F2937',
  },
  // --- Action Buttons ---
  actionButtonContainer: {
    paddingTop: SPACING.md || 16,
    // React Native doesn't support `gap` yet; consider margins.
    gap: SPACING.sm || 8,
  },
  actionButtonGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // React Native doesn't support `gap` yet; consider margins.
    gap: SPACING.sm || 8,
  },
  gridButton: {
    flex: 1,
    height: 48,
  },
  // --- Modal (Replaces AlertDialog) ---
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dialogContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: SPACING.lg || 24,
  },
  dialogTitle: {
    fontSize: FONT_SIZES.h4 || 18,
    fontWeight: 'bold',
    marginBottom: SPACING.xs || 4,
  },
  dialogDescription: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.textSecondary || '#6B7280',
    marginBottom: SPACING.md || 16,
  },
  dialogFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    // React Native doesn't support `gap` yet; consider margins.
    gap: SPACING.sm || 8,
    marginTop: SPACING.md || 16,
  },
  cancelButton: {
    backgroundColor: COLORS.danger || '#EF4444', // red-600
  },
  // --- Dropdown Menu Replacement ---
  dropdownMenu: {
    position: 'absolute',
    top: 50,
    right: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 10,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
  },
  dropdownText: {
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZES.body,
  },
}) as any;

export function AppointmentDetailScreen() {
  const navigation = useNavigation<any>();
  type Params = { id?: string };
  const route = useRoute<RouteProp<Record<string, Params>, string>>();
  // Cast navigation to any to avoid React Navigation generic "never" issues in strict TS
  const nav: any = navigation as any;
  // Get ID from route params (React Navigation)
  const { id } = route.params || {} as Params;

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showMenu, setShowMenu] = useState(false); // State for custom dropdown menu

  // Use the ID from route params to fetch the data
  const appointment = mockAppointments[id || "1"];

  // --- Utility Functions ---

  if (!appointment) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.headerTitle}>Termin nicht gefunden</Text>
        <Button
          title="Zurück zu Terminen"
          onPress={() => nav.navigate('Appointments')}
          style={{ marginTop: SPACING.md }}
        />
      </View>
    );
  }

  const handleCancel = () => {
    // Replaced sonner toast with native Alert or a community notification library
    Alert.alert("Erfolg", "Termin wurde storniert");
    setShowCancelDialog(false);
    nav.navigate("Appointments");
  };

  const handleReschedule = () => {
    Alert.alert("Info", "Umbuchung kommt bald");
    setShowMenu(false);
  };

  const handleGetDirections = () => {
    const address = appointment.provider.address;
    const url =
      Platform.OS === 'ios'
        ? `http://maps.apple.com/?daddr=${encodeURIComponent(address)}`
        : `http://maps.google.com/maps?daddr=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  const handleLeaveReview = () => {
    Alert.alert("Info", "Bewertungsfunktion kommt bald");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge>Bevorstehend</Badge>;
      case 'completed':
        return <Badge variant="secondary">Abgeschlossen</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Storniert</Badge>;
      default:
        return null;
    }
  };

  // --- Custom Dropdown Menu (Replaces DropdownMenu) ---
  const DropdownMenuRN = () => (
    <Modal
      transparent={true}
      visible={showMenu}
      animationType="fade"
      onRequestClose={() => setShowMenu(false)}
    >
      <TouchableOpacity
        style={styles.modalContainer}
        activeOpacity={1}
        onPress={() => setShowMenu(false)}
      >
        <View style={styles.dropdownMenu}>
          <TouchableOpacity onPress={handleReschedule} style={styles.dropdownItem}>
            <Icon name="edit" size={18} color={COLORS.text} />
            <Text style={styles.dropdownText}>Termin verschieben</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setShowMenu(false); setShowCancelDialog(true); }} style={styles.dropdownItem}>
            <Icon name="ban" size={18} color={COLORS.danger} />
            <Text style={[styles.dropdownText, { color: COLORS.danger }]}>Termin stornieren</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // --- Cancel Dialog (Replaces AlertDialog) ---
  const CancelDialog = () => (
    <Modal
      transparent={true}
      visible={showCancelDialog}
      animationType="slide"
      onRequestClose={() => setShowCancelDialog(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.dialogContent}>
          <Text style={styles.dialogTitle}>Termin stornieren?</Text>
          <Text style={styles.dialogDescription}>
            Möchtest du diesen Termin wirklich stornieren? Diese Aktion kann nicht rückgängig gemacht werden.
            {appointment.cancellationPolicy && (
              <Text style={{ marginTop: SPACING.xs, fontSize: FONT_SIZES.body }}>
                {appointment.cancellationPolicy}
              </Text>
            )}
          </Text>
          <View style={styles.dialogFooter}>
            <Button title="Zurück" variant="ghost" onPress={() => setShowCancelDialog(false)} />
            <Button
              title="Ja, stornieren"
              onPress={handleCancel}
              style={styles.cancelButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );


  return (
    <SafeAreaView style={styles.flexContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <IconButton name="arrow-left" onPress={() => navigation.goBack()} />
          <View>
            <Text style={styles.headerTitle}>Termindetails</Text>
            <Text style={styles.headerSubtitle}>{appointment.bookingId}</Text>
          </View>
        </View>
        {appointment.status === "upcoming" && (
          <IconButton
            name="more-vertical"
            onPress={() => setShowMenu(true)}
            style={styles.menuButton}
          />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status */}
        <View style={styles.statusBadgeContainer}>
          {getStatusBadge(appointment.status)}
        </View>

        {/* Date & Time */}
        <Card style={{ padding: SPACING.lg, marginBottom: SPACING.md }}>
          <View style={styles.dateCardContent}>
            <View style={styles.dateCircle}>
              <Text style={styles.dateDay}>{appointment.date.split('.')[0]}</Text>
              <Text style={styles.dateMonth}>
                {/* Simple extraction of the short month name, assuming format DD. Monat YYYY */}
                {appointment.date.split(' ')[1].substring(0, 3).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.dateText}>{appointment.date}</Text>
              <View style={styles.timeInfo}>
                <Icon name="clock" size={16} color={COLORS.textSecondary} />
                <Text style={styles.headerSubtitle}>{appointment.time} Uhr</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Provider Info */}
        <Card style={{ padding: SPACING.md, marginBottom: SPACING.md }}>
            <View style={styles.providerHeader}>
              <Avatar size={64}>
                <AvatarImage source={{ uri: appointment.provider.avatar }} />
              </Avatar>
              <View style={styles.providerInfo}>
                <Text style={styles.providerName}>{appointment.provider.name}</Text>
                <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color={COLORS.warning || '#FBBF24'} />
                  <Text style={styles.ratingText}>{appointment.provider.rating}</Text>
                </View>
              </View>
              <Button
                title="Profil"
                variant="ghost"
                onPress={() => nav.navigate('ProviderProfile', { id: appointment.provider.id })}
              />
            </View>

          <View style={styles.separator} />

          <View style={{ gap: SPACING.sm } as any}>
            <View style={styles.contactItem}>
              <Icon name="map-pin" size={20} color={COLORS.border} style={{ marginTop: 2 }} />
              <View style={styles.addressInfo}>
                <Text style={styles.addressText}>{appointment.provider.address}</Text>
                <IconButton name="navigation" size={18} onPress={handleGetDirections} />
              </View>
            </View>

            <View style={styles.contactItem}>
              <Icon name="phone" size={20} color={COLORS.border} />
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${appointment.provider.phone}`)}>
                <Text style={styles.phoneLink}>
                  {appointment.provider.phone.replace(/(\d{2})(\d{2})(\d{3})(\d{3})/, "+$1 $2 $3 $4")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        {/* Service Details */}
        <Card style={{ padding: SPACING.md, marginBottom: SPACING.md }}>
          <Text style={styles.detailTitle}>Service-Details</Text>
          <View style={{ gap: SPACING.xs } as any}>
            <View style={styles.serviceRow}>
              <Text style={styles.serviceLabel}>Service</Text>
              <Text>{appointment.service.name}</Text>
            </View>
            <View style={styles.serviceRow}>
              <Text style={styles.serviceLabel}>Dauer</Text>
              <Text>{appointment.service.duration}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.serviceRow}>
              <Text style={{ fontWeight: '600' }}>Gesamtpreis</Text>
              <Text style={styles.serviceTotal}>{appointment.service.price}</Text>
            </View>
          </View>
        </Card>

        {/* Notes */}
        {appointment.notes && (
          <Card style={[styles.notesCard, { padding: SPACING.md, marginBottom: SPACING.md }]}>
            <Text style={styles.detailTitle}>Hinweise</Text>
            <Text style={styles.notesText}>{appointment.notes}</Text>
          </Card>
        )}

        {/* Cancellation Policy */}
        {appointment.status === "upcoming" && appointment.cancellationPolicy && (
          <Card style={[styles.policyCard, { padding: SPACING.md, marginBottom: SPACING.md }]}>
            <Text style={styles.detailTitle}>Stornierungsbedingungen</Text>
            <Text style={styles.notesText}>{appointment.cancellationPolicy}</Text>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtonContainer}>
          {appointment.status === "upcoming" && (
            <>
              <Button
                title="Nachricht senden"
                onPress={() => nav.navigate('Chat', { providerId: appointment.provider.id })}
                style={{ backgroundColor: COLORS.primary, height: 48 }}
              />
              <View style={styles.actionButtonGrid}>
                <Button
                  title="Route"
                  variant="ghost"
                  onPress={handleGetDirections}
                  style={styles.gridButton}
                />
                <Button
                  title="Verschieben"
                  variant="ghost"
                  onPress={handleReschedule}
                  style={styles.gridButton}
                />
              </View>
            </>
          )}

          {appointment.status === "completed" && (
            <Button
              title="Bewertung abgeben"
              onPress={handleLeaveReview}
              style={{ backgroundColor: COLORS.primary, height: 48 }}
            />
          )}
        </View>
      </ScrollView>

      {/* Modals for Dialog and Dropdown Menu */}
      <CancelDialog />
      <DropdownMenuRN />
    </SafeAreaView>
  );
}