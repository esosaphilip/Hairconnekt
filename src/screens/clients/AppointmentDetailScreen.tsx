import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import Text from '@/components/Text';
import { colors, spacing } from '@/theme/tokens';
import type { BookingsStackScreenProps } from '@/navigation/types';

export default function AppointmentDetailScreen({ route }: BookingsStackScreenProps<'AppointmentDetail'>) {
  const { id } = route.params;
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Termin-Details</Text>
      <Text style={styles.text}>ID: {id}</Text>
      <Text style={styles.text}>Details-Ansicht folgt…</Text>
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