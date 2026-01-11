import React, { useEffect, useState, useMemo } from 'react';
import { SafeAreaView, View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Image, ImageStyle } from 'react-native';
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

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

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
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('AppointmentDetail', { id: nextAppointment.id })}
        style={styles.heroCardWrapper}
        activeOpacity={0.9}
      >
        <View style={styles.heroCardContent}>
          <View style={styles.heroHeader}>
            <Icon name="clock" size={20} color="#92400E" />
            <Text style={styles.heroTitle}>Dein nächster Termin</Text>
          </View>

          <Text style={styles.heroTimeRemaining}>In {nextAppointment.hoursUntil} Stunden</Text>

          <Text style={styles.heroDateTime}>
            {new Date(nextAppointment.startTime).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'short' })} • {new Date(nextAppointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(nextAppointment.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} Uhr
          </Text>
        </View>
      </TouchableOpacity>
    );
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
            data={appointments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              // Hide duplicated next appointment from list if desired, or keep it.
              // Design usually implies list contains all, or next is pulled out.
              // Implementing "pull out" logic:
              if (nextAppointment && item.id === nextAppointment.id) return null;
              return renderBookingCard(item, navigation.navigate);
            }}
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
  heroCardContent: {},
  heroHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  heroTitle: { fontSize: 14, fontWeight: '500', color: '#92400E' }, // amber-800
  heroTimeRemaining: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 },
  heroDateTime: { fontSize: 14, color: '#4B5563' },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '500', color: '#374151', marginTop: 16 },
});
