import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import Text from '@/components/Text';
import { colors, spacing } from '@/theme/tokens';
import type { BookingsStackScreenProps } from '@/navigation/types';

export default function AppointmentDetailScreen({ route }: BookingsStackScreenProps<'AppointmentDetail' | 'AppointmentDetails'>) {
  const { id } = route.params;
  const [appointment, setAppointment] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        // Assuming clientBraiderApi or similar has getAppointmentById, or use generic http
        // Since we don't have a specific api method for GET /appointments/:id exposed in shared apis yet (maybe),
        // we'll use http directly or find 'appointmentsApi'.
        const { http } = require('@/api/http');
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Laden...</Text>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Termin-Details</Text>
      <Text style={styles.text}>ID: {id}</Text>
      {appointment && (
        <View style={{ marginTop: 20 }}>
          <Text style={styles.text}>Service: {appointment.serviceName || appointment.service?.name}</Text>
          <Text style={styles.text}>Datum: {new Date(appointment.startTime).toLocaleString()}</Text>
          <Text style={styles.text}>Status: {appointment.status}</Text>
          <Text style={styles.text}>Provider: {appointment.provider?.businessName || appointment.providerName}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.gray50,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  text: {
    color: colors.gray700,
    marginTop: spacing.sm,
  },
  title: {
    color: colors.gray800,
    fontSize: 18,
    fontWeight: '700',
  },
});
