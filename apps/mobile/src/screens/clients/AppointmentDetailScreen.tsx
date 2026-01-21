import React from 'react';
import { StyleSheet, View, Image, ScrollView, TouchableOpacity, Alert, Platform, Linking, ActionSheetIOS } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Text from '@/components/Text';
import Button from '@/components/Button';
import Icon from '@/components/Icon';
import { colors, spacing, radii, shadows } from '@/theme/tokens';
import type { BookingsStackScreenProps } from '@/navigation/types';
import { http } from '@/api/http';

export default function AppointmentDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const [appointment, setAppointment] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await http.get(`/appointments/${id}`);
        if (mounted) {
          setAppointment(res.data?.data || res.data);
        }
      } catch (err: any) {
        if (mounted) setError(err.message || 'Fehler beim Laden');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const openMaps = () => {
    const address = appointment.provider?.address || appointment.address;
    if (!address) {
      Alert.alert('Keine Adresse', 'Für diesen Termin ist keine Adresse hinterlegt.');
      return;
    }
    const query = encodeURIComponent(address);
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
    });
    if (url) Linking.openURL(url);
  };

  const handleMoreOptions = () => {
    const options = ['Abbrechen', 'Termin verschieben', 'Termin stornieren'];
    const destructiveButtonIndex = 2;
    const cancelButtonIndex = 0;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          destructiveButtonIndex,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            // Reschedule
            // TODO: Navigate to Reschedule Screen
            navigation.navigate('RescheduleAppointment', { id });
          } else if (buttonIndex === 2) {
            handleCancel();
          }
        }
      );
    } else {
      Alert.alert(
        'Optionen',
        'Wähle eine Aktion',
        [
          { text: 'Abbrechen', style: 'cancel' },
          {
            text: 'Termin verschieben',
            onPress: () => navigation.navigate('RescheduleAppointment', { id })
          },
          { text: 'Termin stornieren', style: 'destructive', onPress: handleCancel },
        ]
      );
    }
  };

  const handleCancel = () => {
    Alert.alert(
      "Termin stornieren?",
      "Möchtest du diesen Termin wirklich stornieren? Diese Aktion kann nicht rückgängig gemacht werden.",
      [
        { text: "Zurück", style: "cancel" },
        {
          text: "Ja, stornieren",
          style: "destructive",
          onPress: async () => {
            // Implementation of cancel logic
            try {
              await http.post(`/appointments/${id}/cancel`); // Assuming endpoint
              navigation.goBack();
            } catch (e) {
              Alert.alert("Fehler", "Konnte Termin nicht stornieren.");
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Text>Laden...</Text>
      </SafeAreaView>
    );
  }

  if (error || !appointment) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Text style={{ color: 'red' }}>{error || 'Termin nicht gefunden'}</Text>
        <Button title="Zurück" onPress={() => navigation.goBack()} style={{ marginTop: 20 }} />
      </SafeAreaView>
    );
  }

  // Helper to safely get nested service details
  const serviceName = appointment.service?.name || appointment.serviceName || 'Service';
  const duration = appointment.service?.duration || appointment.duration;
  const durationText = typeof duration === 'number' ? `${duration} min` : (duration || '—');
  const priceVal = appointment.totalPrice || appointment.price;
  const priceText = typeof priceVal === 'number' ? `${priceVal} €` : (priceVal || '—');

  // Helper to get formatted date parts
  const dateObj = new Date(appointment.startTime);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleString('de-DE', { month: 'short' }).toUpperCase();
  const dateStr = dateObj.toLocaleDateString('de-DE');
  const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const getStatusBadgeStyle = (status: string) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'pending': return { bg: '#FEF3C7', text: '#92400E', label: 'Ausstehend' };
      case 'upcoming': return { bg: '#DCFCE7', text: '#166534', label: 'Bevorstehend' };
      case 'confirmed': return { bg: '#DCFCE7', text: '#166534', label: 'Bestätigt' };
      case 'completed': return { bg: '#F3F4F6', text: '#374151', label: 'Abgeschlossen' };
      case 'cancelled': return { bg: '#FEE2E2', text: '#991B1B', label: 'Storniert' };
      default: return { bg: colors.gray100, text: colors.gray800, label: status };
    }
  };

  const statusStyle = getStatusBadgeStyle(appointment.status);
  const isActionable = ['pending', 'upcoming', 'confirmed'].includes((appointment.status || '').toLowerCase());

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={24} color={colors.gray800} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Termindetails</Text>
          <Text style={styles.headerSub}>#{id.substring(0, 8)}</Text>
        </View>
        {isActionable && (
          <TouchableOpacity style={styles.moreBtn} onPress={handleMoreOptions} testID="more-options-btn">
            <Icon name="more-vertical" size={24} color={colors.gray800} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Status Badge */}
        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>{statusStyle.label}</Text>
          </View>
        </View>

        {/* Date Card */}
        <View style={styles.card}>
          <View style={styles.dateRow}>
            <View style={styles.dateBox}>
              <Text style={styles.dateBoxDay}>{day}</Text>
              <Text style={styles.dateBoxMonth}>{month}</Text>
            </View>
            <View>
              <Text style={styles.cardTitle}>{dateStr}</Text>
              <View style={styles.iconTextRow}>
                <Icon name="clock" size={14} color={colors.gray600} />
                <Text style={styles.bodyText}>{timeStr} Uhr</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Provider Info */}
        <View style={styles.card}>
          <View style={styles.providerHeader}>
            <Image
              source={{ uri: appointment.provider?.avatar || 'https://via.placeholder.com/150' }}
              style={styles.avatar}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{appointment.provider?.businessName || appointment.providerName}</Text>
              <View style={styles.iconTextRow}>
                <Icon name="star" size={14} color="#FBBF24" />
                <Text style={styles.bodyText}>4.9</Text>
              </View>
            </View>
            <Button
              title="Profil"
              variant="outline"
              size="sm"
              onPress={() => {
                const pid = appointment.providerId || appointment.provider?.id;
                if (pid) {
                  navigation.navigate('ProviderDetail', { id: pid });
                } else {
                  Alert.alert('Fehler', 'Keine Provider-ID gefunden');
                }
              }}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.providerDetails}>
            <View style={styles.detailRow}>
              <Icon name="map-pin" size={16} color={colors.gray400} />
              <Text style={[styles.bodyText, { flex: 1 }]}>{appointment.provider?.address || appointment.address || 'Adresse nicht verfügbar'}</Text>
              <TouchableOpacity>
                <Icon name="navigation" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.detailRow}>
              <Icon name="phone" size={16} color={colors.gray400} />
              <Text style={[styles.bodyText, { color: colors.primary }]}>{appointment.provider?.phone || '+49 123 456 789'}</Text>
            </View>
          </View>
        </View>

        {/* Service Details */}
        <View style={styles.card}>
          <Text style={[styles.cardTitle, { marginBottom: spacing.md }]}>Service-Details</Text>
          <View style={styles.kvRow}>
            <Text style={styles.label}>Service</Text>
            <Text style={styles.value}>{serviceName}</Text>
          </View>
          <View style={styles.kvRow}>
            <Text style={styles.label}>Dauer</Text>
            <Text style={styles.value}>{durationText}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.kvRow}>
            <Text style={styles.label}>Gesamtpreis</Text>
            <Text style={[styles.value, { color: colors.primary, fontWeight: '700' }]}>{priceText}</Text>
          </View>
        </View>

        {/* Notes (Hinweise) */}
        <View style={[styles.card, { backgroundColor: '#FEFCE8', borderColor: '#FEF9C3', borderWidth: 1 }]}>
          <Text style={[styles.cardTitle, { marginBottom: spacing.xs }]}>Hinweise</Text>
          <Text style={[styles.bodyText, { color: '#854D0E' }]}>
            {appointment.notes || 'Bitte eigene Extensions mitbringen (Farbe: 1B)'}
          </Text>
        </View>

        {/* Cancellation Policy (Stornierungsbedingungen) */}
        <View style={[styles.card, { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE', borderWidth: 1 }]}>
          <Text style={[styles.cardTitle, { marginBottom: spacing.xs }]}>Stornierungsbedingungen</Text>
          <Text style={[styles.bodyText, { color: '#1E40AF' }]}>
            Kostenlose Stornierung bis 24 Stunden vor dem Termin.
          </Text>
        </View>

        {/* Actions */}
        {isActionable && (
          <View style={styles.actions}>
            <Button
              title="Nachricht senden"
              icon={<Icon name="message-circle" size={18} color="white" />}
              onPress={() => navigation.navigate('Chat', { recipientId: appointment.providerId })}
              style={{ marginBottom: spacing.sm, backgroundColor: colors.primary }}
            />
            <View style={styles.secondaryActions}>
              <Button
                title="Route"
                variant="outline"
                icon={<Icon name="navigation" size={18} color={colors.primary} />}
                style={{ flex: 1, borderColor: colors.primary }}
                textStyle={{ color: colors.primary }}
                onPress={openMaps}
              />
              <View style={{ width: spacing.md }} />
              <Button
                title="Verschieben"
                variant="outline"
                icon={<Icon name="edit" size={18} color={colors.primary} />}
                style={{ flex: 1, borderColor: colors.primary }}
                textStyle={{ color: colors.primary }}
                onPress={() => navigation.navigate('RescheduleAppointment', { id })}
              />
            </View>
          </View>
        )}

        {/* Review Button (Completed only) */}
        {(appointment.status || '').toLowerCase() === 'completed' && (
          <View style={styles.actions}>
            <Button
              title="Bewerten"
              icon={<Icon name="star" size={18} color="white" />}
              onPress={() => navigation.navigate('WriteReviews', { appointmentId: id })}
              style={{ backgroundColor: colors.primary }}
            />
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  backBtn: { padding: spacing.xs },
  moreBtn: { padding: spacing.xs },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.gray900 },
  headerSub: { fontSize: 12, color: colors.gray500 },

  content: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  statusRow: { alignItems: 'center', marginBottom: spacing.md },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  statusText: { fontWeight: '600', fontSize: 14 },

  card: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },

  // Date Card
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  dateBox: {
    width: 60, height: 60,
    backgroundColor: '#fdf6f3', // primary light
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBoxDay: { fontSize: 24, fontWeight: '700', color: colors.primary },
  dateBoxMonth: { fontSize: 12, color: colors.gray600 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.gray900 },
  bodyText: { fontSize: 14, color: colors.gray700 },
  iconTextRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },

  // Provider
  providerHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  divider: { height: 1, backgroundColor: colors.gray100, marginVertical: spacing.md },
  providerDetails: { gap: spacing.sm },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },

  // Service
  kvRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  label: { color: colors.gray600, fontSize: 14 },
  value: { color: colors.gray900, fontSize: 14, fontWeight: '500' },

  actions: { marginTop: spacing.xs },
  secondaryActions: { flexDirection: 'row' }
});
