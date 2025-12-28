import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import Card from '@/components/Card';
import Text from '@/components/Text';
import Button from '@/components/Button';
import { spacing, colors, radii, FONT_SIZES } from '@/theme/tokens';
import { clientBookingApi } from '@/api/clientBooking';
import { IBooking } from '@/domain/models/booking';
import { useNavigation } from '@react-navigation/native';
import Icon from '@/components/Icon'; // Ensure Icon exists or use Ionicons directly if needed

export function AppointmentsScreen() {
  const navigation = useNavigation();
  const [appointments, setAppointments] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = async () => {
    try {
      // Fetch 'upcoming' by default
      const data = await clientBookingApi.getAppointments('upcoming');
      setAppointments(data);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  const renderItem = ({ item }: { item: IBooking }) => (
    <Card style={styles.appointmentCard}>
      <View style={styles.headerRow}>
        <Text style={styles.providerName}>{item.providerName}</Text>
        <StatusBadge status={item.status} />
      </View>
      <Text style={styles.serviceName}>{item.serviceName}</Text>

      <View style={styles.infoRow}>
        <Text style={styles.infoText}>📅 {item.date}</Text>
        <Text style={styles.infoText}>⏰ {item.time}</Text>
      </View>

      {item.location && (
        <Text style={styles.location} numberOfLines={1}>📍 {item.location}</Text>
      )}

      <View style={styles.footerRow}>
        <Text style={styles.price}>{item.price || 'Preisanfrage'}</Text>
        {/* Placeholder for actions like Cancel/Reschedule */}
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Meine Termine</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>Keine anstehenden Termine.</Text>
              <Button
                title="Jetzt buchen"
                variant="primary"
                style={{ marginTop: spacing.md }}
                onPress={() => navigation.navigate('Home' as any)}
              />
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const StatusBadge = ({ status }: { status: string }) => {
  const getStyle = () => {
    switch (status) {
      case 'confirmed': return { bg: colors.green100, text: colors.green800 };
      case 'cancelled': return { bg: colors.red100, text: colors.red800 };
      default: return { bg: colors.gray100, text: colors.gray800 };
    }
  };
  const style = getStyle();
  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <Text style={[styles.badgeText, { color: style.text }]}>
        {status === 'confirmed' ? 'Bestätigt' : status === 'pdending' ? 'Angefragt' : status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.md, backgroundColor: colors.white },
  screenTitle: { fontSize: FONT_SIZES.h4, fontWeight: '700', color: colors.text },
  listContent: { padding: spacing.md },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { color: colors.gray600, fontSize: FONT_SIZES.body },

  appointmentCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radii.md,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  providerName: { fontWeight: '600', fontSize: FONT_SIZES.body, color: colors.text },
  serviceName: { fontSize: FONT_SIZES.h5, fontWeight: '700', color: colors.primary, marginBottom: spacing.sm },
  infoRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xs },
  infoText: { color: colors.gray800, fontSize: FONT_SIZES.small },
  location: { color: colors.gray600, fontSize: FONT_SIZES.small, marginBottom: spacing.sm },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs, paddingTop: spacing.xs, borderTopWidth: 1, borderTopColor: colors.gray100 },
  price: { fontWeight: '700', color: colors.text },

  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '600' },
});
