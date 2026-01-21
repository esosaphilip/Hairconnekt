import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Image, ImageStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '@/components/Card';
import Text from '@/components/Text';
import Button from '@/components/Button';
import { spacing, colors, radii, FONT_SIZES, shadows } from '@/theme/tokens';
import { clientBookingApi } from '@/api/clientBooking';
import { IBooking } from '@/domain/models/booking';
import { useNavigation } from '@react-navigation/native';
import Icon from '@/components/Icon';
import { on } from '@/services/eventBus';
import { renderBookingCard } from './renderBookingCard';
import Avatar, { AvatarImage, AvatarFallback } from '@/components/avatar';

export function AppointmentsScreen() {
  const navigation = useNavigation<any>();
  const [appointments, setAppointments] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await clientBookingApi.getAppointments(activeTab);
      const sorted = data.sort((a, b) => {
        const dA = new Date(a.startTime).getTime();
        const dB = new Date(b.startTime).getTime();
        return activeTab === 'upcoming' ? dA - dB : dB - dA;
      });
      setAppointments(sorted);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    const off = on('appointment_updated', () => fetchAppointments());
    return () => off();
  }, [activeTab]);

  // --- Next Appointment Logic ---
  const nextAppointment = useMemo(() => {
    if (activeTab !== 'upcoming' || appointments.length === 0) return null;
    const first = appointments[0];
    const diffHours = (new Date(first.startTime).getTime() - Date.now()) / (1000 * 60 * 60);
    if (diffHours > 0) {
      return { ...first, hoursUntil: Math.ceil(diffHours) };
    }
    return null;
  }, [appointments, activeTab]);

  // --- List Data Logic (Filter out next appointment to prevent duplicates/crashes) ---
  const listData = useMemo(() => {
    if (activeTab === 'upcoming' && nextAppointment) {
      return appointments.filter(a => a.id !== nextAppointment.id); // Valid filtering
    }
    return appointments;
  }, [appointments, activeTab, nextAppointment]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  // --- Segmented Control Tab ---
  const Tab = ({ status, label }: { status: typeof activeTab; label: string }) => {
    const isActive = activeTab === status;
    // Fix: appointments array only contains data for the *active* tab.
    // So we can only show a count for the active tab using this data source.
    const count = isActive ? appointments.length : 0;

    return (
      <TouchableOpacity
        style={[styles.segmentTab, isActive && styles.segmentTabActive]}
        onPress={() => setActiveTab(status)}
        activeOpacity={0.8}
      >
        <Text style={[styles.segmentTabText, isActive && styles.segmentTabTextActive]}>
          {label}
        </Text>
        {status === 'upcoming' && count > 0 && (
          <View style={styles.segmentBadge}>
            <Text style={styles.segmentBadgeText}>{count}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const NextAppointmentCard = () => {
    if (!nextAppointment) return null;

    // Calculate fallback avatar label
    const firstChar = nextAppointment.providerName?.charAt(0) || '?';
    const fallbackLabel = firstChar.toUpperCase();

    return (
      <View style={styles.heroCardWrapper}>
        {/* Header Section */}
        <View style={styles.heroHeaderRow}>
          <View style={styles.heroHeaderTitleRow}>
            <Icon name="clock" size={20} color="#92400E" />
            <Text style={styles.heroTitle}>Dein nächster Termin</Text>
          </View>
          <Text style={styles.heroTimeRemaining}>In {nextAppointment.hoursUntil} Std.</Text>
        </View>

        {/* Card Body - resembling RenderBookingCard but highlighted */}
        <TouchableOpacity
          onPress={() => navigation.navigate('AppointmentDetail', { id: nextAppointment.id })}
          activeOpacity={0.9}
          style={styles.heroInnerCard}
        >
          {/* Provider Info Row */}
          <View style={styles.heroProviderRow}>
            <View style={styles.avatarContainer}>
              <Avatar size={56} style={styles.heroAvatar}>
                {nextAppointment.providerImage ? (
                  <AvatarImage uri={nextAppointment.providerImage} style={styles.heroAvatarImage} />
                ) : (
                  <AvatarFallback label={fallbackLabel} style={{ backgroundColor: colors.primary + '20' }} textStyle={{ color: colors.primary }} />
                )}
              </Avatar>
              {/* Online Indicator could go here if needed */}
            </View>

            <View style={styles.heroProviderInfo}>
              <Text style={styles.heroProviderName}>{nextAppointment.providerName}</Text>
              <View style={styles.heroRatingRow}>
                <Icon name="star" size={14} color={colors.accentGold} />
                <Text style={styles.heroRatingText}>{nextAppointment.rating || 4.8}</Text>
                <Text style={styles.heroReviewCount}>({nextAppointment.reviewCount || 12} Bewertungen)</Text>
              </View>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.heroDivider} />

          {/* Details Row */}
          <View style={styles.heroDetailsRow}>
            <View style={styles.heroDetailItem}>
              <Icon name="calendar" size={16} color={colors.gray600} />
              <Text style={styles.heroDetailText}>
                {new Date(nextAppointment.startTime).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })}
              </Text>
            </View>
            <View style={styles.heroDetailItem}>
              <Icon name="clock" size={16} color={colors.gray600} />
              <Text style={styles.heroDetailText}>
                {new Date(nextAppointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <View style={styles.heroDetailItem}>
              <Icon name="map-pin" size={16} color={colors.gray600} />
              <Text style={styles.heroDetailText} numberOfLines={1}>
                {nextAppointment.location || nextAppointment.provider?.address || 'Adresse laden...'}
              </Text>
            </View>
          </View>

          {/* Service Badge / Price */}
          <View style={styles.heroFooter}>
            <View style={styles.heroServiceBadge}>
              <Text style={styles.heroServiceText}>{nextAppointment.serviceName}</Text>
            </View>
            <Text style={styles.heroPrice}>{nextAppointment.price}</Text>
          </View>

        </TouchableOpacity>
      </View>
    );
  };

  // --- Actions ---
  const handleReschedule = (id: string) => {
    navigation.navigate('RescheduleAppointment', { id });
  };

  const handleCancel = (id: string) => {
    // Confirmation is handled here (or in renderBookingCard if we wanted, but logic is better here)
    // Actually renderBookingCard calls onCancel directly if confirmed via its own UI?
    // Wait, renderBookingCard implements handleMoreOptions containing Alert/ActionSheet.
    // The UI shows "Stornieren", clicking it calls onCancel.
    // So here we should show the FINAL confirmation "Are you sure?" OR just execute if the card did the menu.
    // The User said: "Stornieren (Alert confirmation)".
    // renderBookingCard's ActionSheet has "Stornieren". Clicking that calls onCancel.
    // So onCancel should show the "Are you sure?" Alert.

    // Check if renderBookingCard does the confirmation.
    // My implementation of renderBookingCard executes onCancel immediately when "Stornieren" is tapped in ActionSheet.
    // So I should do the "Are you sure?" Alert here.

    import('react-native').then(({ Alert }) => {
      Alert.alert(
        "Termin stornieren?",
        "Möchtest du diesen Termin wirklich stornieren?",
        [
          { text: "Zurück", style: "cancel" },
          {
            text: "Ja, stornieren",
            style: "destructive",
            onPress: async () => {
              try {
                setLoading(true);
                await clientBookingApi.cancelAppointment(id);
                fetchAppointments(); // Refresh list
              } catch (e) {
                console.error("Cancel failed", e);
                // Simple error alert
                Alert.alert("Fehler", "Termin konnte nicht storniert werden.");
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.screenTitle}>Meine Termine</Text>
          <Icon name="calendar" size={24} color={colors.gray800} />
        </View>

        <View style={styles.segmentedControl}>
          <Tab status="upcoming" label="Anstehend" />
          <Tab status="completed" label="Abgeschlossen" />
          <Tab status="cancelled" label="Abgesagt" />
        </View>
      </View>

      <View style={styles.content}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={listData} // Use filtered data
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => renderBookingCard(
              item,
              navigation.navigate,
              // Only pass actions for upcoming appointments
              activeTab === 'upcoming' ? handleCancel : undefined,
              activeTab === 'upcoming' ? handleReschedule : undefined
            )}
            ListHeaderComponent={activeTab === 'upcoming' ? <NextAppointmentCard /> : null}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="calendar" size={48} color={colors.gray300} />
                <Text style={styles.emptyTitle}>
                  {activeTab === 'upcoming' ? 'Keine anstehenden Termine' : 'Keine Termine gefunden'}
                </Text>
                {activeTab === 'upcoming' && (
                  <Button title="Braider finden" onPress={() => navigation.navigate('Search')} style={{ marginTop: spacing.md }} />
                )}
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  screenTitle: { fontSize: 24, fontWeight: '700', color: '#111827' },

  // Segmented Control
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  segmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6
  },
  segmentTabActive: {
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  segmentTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280'
  },
  segmentTabTextActive: {
    color: '#111827',
    fontWeight: '600'
  },
  segmentBadge: {
    backgroundColor: '#92400E', // Darker amber/brown
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  segmentBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },

  content: { flex: 1 },
  listContent: { padding: spacing.md },

  // Hero Card
  heroCardWrapper: {
    backgroundColor: '#FFF7ED', // orange-50
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFEDD5', // orange-100
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroTitle: { fontSize: 14, fontWeight: '600', color: '#92400E' },
  heroTimeRemaining: { fontSize: 15, fontWeight: '700', color: '#92400E' },

  heroInnerCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    ...shadows.sm,
  },
  heroProviderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: { marginRight: 12 },
  heroAvatar: { width: 56, height: 56, borderRadius: 28 },
  heroAvatarImage: { width: 56, height: 56, borderRadius: 28 },
  heroProviderInfo: { flex: 1, justifyContent: 'center' },
  heroProviderName: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 2 },
  heroRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroRatingText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  heroReviewCount: { fontSize: 13, color: '#6B7280' },

  heroDivider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 12 },

  heroDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  heroDetailItem: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  heroDetailText: { fontSize: 13, color: '#4B5563', flex: 1 },

  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  heroServiceBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  heroServiceText: { fontSize: 13, fontWeight: '500', color: '#374151' },
  heroPrice: { fontSize: 16, fontWeight: '700', color: '#111827' },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '500', color: '#374151', marginTop: 16 },
});
