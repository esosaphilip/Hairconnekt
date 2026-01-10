import React, { useEffect, useState, useMemo } from 'react';
import { SafeAreaView, View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Image } from 'react-native';
import Card from '@/components/Card';
import Text from '@/components/Text';
import Button from '@/components/Button';
import { spacing, colors, radii, FONT_SIZES, shadows } from '@/theme/tokens';
import { clientBookingApi } from '@/api/clientBooking';
import { IBooking, BookingStatus } from '@/domain/models/booking';
import { useNavigation } from '@react-navigation/native';
import Icon from '@/components/Icon';
import { on } from '@/services/eventBus';
import LinearGradient from 'react-native-linear-gradient';

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
      // Sort logic if not backend sorted: upcoming ASC, others DESC
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

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  // --- Next Appointment Logic ---
  const nextAppointment = useMemo(() => {
    if (activeTab !== 'upcoming' || appointments.length === 0) return null;
    const first = appointments[0];
    const diffHours = (new Date(first.startTime).getTime() - Date.now()) / (1000 * 60 * 60);
    // Show if within 48 hours
    if (diffHours > 0 && diffHours <= 48) {
      return { ...first, hoursUntil: Math.ceil(diffHours) };
    }
    return null;
  }, [appointments, activeTab]);

  // --- Tab Component ---
  const Tab = ({ status, label }: { status: typeof activeTab; label: string }) => {
    const isActive = activeTab === status;
    return (
      <TouchableOpacity
        style={[styles.tab, isActive && styles.tabActive]}
        onPress={() => setActiveTab(status)}
      >
        <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{label}</Text>
        {status === 'upcoming' && (
          <View style={styles.badge}>
            <Text style={styles.badgeTextCount}>
              {/* This count is optimistic, realistically we need total count from API or store */}
              {/* For UI demo we just show a dot or static number, or fetch separate counts. Leaving static as per design request/logic */}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // --- Render Components ---
  const renderItem = ({ item }: { item: IBooking }) => {
    const isNext = nextAppointment?.id === item.id;
    // Hide the item from main list if it is the "Next Appointment" presented in header
    // Actually, usually "Next" is duplicated or just highlighted. Design implies special card at top, 
    // AND list below. If list includes it, it's fine, but maybe redundant. 
    // Let's hide it from the list to avoid duplication if it's shown in header.
    if (isNext) return null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('AppointmentDetail', { id: item.id })}
      >
        {/* Header: Date | Time | Status */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.dateText}>
              {new Date(item.startTime).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'short' })}
            </Text>
            <Text style={styles.timeText}>
              {new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} Uhr
            </Text>
          </View>
          <StatusBadge status={item.status} />
        </View>

        {/* Provider Row */}
        <View style={styles.providerRow}>
          <Image
            source={{ uri: item.provider?.avatar || 'https://via.placeholder.com/150' }}
            style={styles.avatar}
          />
          <View style={styles.providerInfo}>
            <Text style={styles.providerName}>{item.providerName}</Text>
            {/* Rating Mock */}
            <View style={styles.ratingRow}>
              <Icon name="star" size={14} color="#FBBF24" />
              <Text style={styles.ratingText}>4.8</Text>
            </View>
          </View>
        </View>

        {/* Details: Address & Services */}
        <View style={styles.detailsBlock}>
          <View style={styles.detailRow}>
            <Icon name="map-pin" size={14} color={colors.gray600} />
            <View>
              <Text style={styles.addressText}>{item.provider?.address || 'Adresse nicht verfügbar'}</Text>
              <Text style={styles.distanceText}>1.2 km entfernt</Text>
            </View>
          </View>
          <View style={styles.servicesRow}>
            <View style={styles.serviceTag}>
              <Text style={styles.serviceTagText}>{item.serviceName}</Text>
            </View>
          </View>
        </View>

        {/* Footer: Price & Actions */}
        <View style={styles.cardFooter}>
          <Text style={styles.price}>{item.price} €</Text>
          <View style={styles.actions}>
            <Button
              title="Nachricht"
              variant="outline"
              size="sm"
              icon={<Icon name="message-circle" size={14} />}
              onPress={() => { }}
            />
            <TouchableOpacity style={styles.moreBtn}>
              <Icon name="more-vertical" size={16} color={colors.gray600} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const NextAppointmentCard = () => {
    if (!nextAppointment) return null;
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('AppointmentDetail', { id: nextAppointment.id })}
        style={styles.nextCardWrapper}
      >
        {/* Gradient Background would go here. Using View with bg color/opacity for now compatible with plain RN */}
        <View style={[styles.nextCardInner]}>
          <View style={styles.nextHeader}>
            <Icon name="clock" size={20} color={colors.primary} />
            <Text style={styles.nextLabel}>Dein nächster Termin</Text>
          </View>
          <Text style={styles.nextTimeIn}>In {nextAppointment.hoursUntil} Stunden</Text>
          <Text style={styles.nextDateTime}>
            {new Date(nextAppointment.startTime).toLocaleDateString()} • {new Date(nextAppointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.screenTitle}>Meine Termine</Text>
          <TouchableOpacity style={styles.calendarBtn}>
            <Icon name="calendar" size={24} color={colors.gray800} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <Tab status="upcoming" label="Anstehend" />
          <Tab status="completed" label="Abgeschlossen" />
          <Tab status="cancelled" label="Abgesagt" />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={appointments}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
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
                  <Button
                    title="Braider finden"
                    onPress={() => navigation.navigate('Search')}
                    style={{ marginTop: spacing.md }}
                  />
                )}
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const StatusBadge = ({ status }: { status: string }) => {
  let bg = colors.gray100;
  let text = colors.gray800;
  let label = status;

  if (status === 'confirmed') { bg = '#DCFCE7'; text = '#166534'; label = 'Bestätigt'; } // green-100/800
  if (status === 'pending') { bg = '#FEF3C7'; text = '#92400E'; label = 'Ausstehend'; } // amber-100/800
  if (status === 'cancelled') { bg = '#FEE2E2'; text = '#991B1B'; label = 'Abgesagt'; } // red-100/800
  if (status === 'completed') { bg = '#F3F4F6'; text = '#374151'; label = 'Abgeschlossen'; }

  return (
    <View style={[styles.statusBadge, { backgroundColor: bg }]}>
      <Text style={[styles.statusText, { color: text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  header: { backgroundColor: colors.white, paddingHorizontal: spacing.md, paddingBottom: 0, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md },
  screenTitle: { fontSize: 24, fontWeight: '700', color: colors.gray900 },
  calendarBtn: { padding: spacing.xs },

  tabsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4
  },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: 16, fontWeight: '500', color: colors.gray500 },
  tabTextActive: { color: colors.primary, fontWeight: '600' },
  badge: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
  badgeTextCount: { color: colors.white, fontSize: 10, fontWeight: '700' },

  content: { flex: 1 },
  listContent: { padding: spacing.md, gap: spacing.md },

  // Next Appointment Card
  nextCardWrapper: {
    backgroundColor: '#fdf6f3', // Lightest brown tint
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: '#e8dcd6',
    marginBottom: spacing.md,
    overflow: 'hidden'
  },
  nextCardInner: { padding: spacing.md },
  nextHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
  nextLabel: { color: colors.primary, fontWeight: '600' },
  nextTimeIn: { fontSize: 20, fontWeight: '700', color: colors.gray900, marginBottom: 4 },
  nextDateTime: { fontSize: 14, color: colors.gray600 },

  // Regular Card
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: spacing.md,
    ...shadows.sm,
    marginBottom: spacing.sm,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  dateText: { fontSize: 16, fontWeight: '600', color: colors.gray900 },
  timeText: { fontSize: 14, color: colors.gray600, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },

  providerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: spacing.sm },
  providerInfo: { flex: 1 },
  providerName: { fontSize: 16, fontWeight: '600', color: colors.gray900 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 12, color: colors.gray700 },

  detailsBlock: { marginBottom: spacing.md, gap: spacing.sm },
  detailRow: { flexDirection: 'row', gap: spacing.xs },
  addressText: { fontSize: 14, color: colors.gray800 },
  distanceText: { fontSize: 12, color: colors.gray500 },
  servicesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  serviceTag: { backgroundColor: colors.gray100, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  serviceTagText: { fontSize: 12, color: colors.gray700 },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.gray100 },
  price: { fontSize: 16, fontWeight: '700', color: colors.primary },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  moreBtn: { padding: spacing.xs },

  // Empty State
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.gray900, marginTop: spacing.md },
});
