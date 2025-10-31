import React, { useEffect, useState } from 'react';
import { SafeAreaView, FlatList, View, Text, ActivityIndicator, Pressable } from 'react-native';
import { getClientAppointments } from '../api/appointments';
import { colors, spacing } from '../theme/tokens';
import { hhmm } from '@hairconnekt/shared';

type StatusGroup = 'upcoming' | 'completed' | 'cancelled';

type AppointmentListItem = {
  id: string;
  provider?: {
    businessName?: string;
    name?: string;
  } | null;
  status: string;
  appointmentDate: string;
  startTime: number | string;
  services: { name: string }[];
};

interface BookingsListScreenProps {
  navigation: any; // TODO: replace with proper React Navigation types
}

export default function BookingsListScreen({ navigation }: BookingsListScreenProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<AppointmentListItem[]>([]);
  const [status, setStatus] = useState<StatusGroup>('upcoming');

  useEffect(() => {
    setLoading(true);
    setError(null);
    getClientAppointments(status)
      .then((data) => setItems(data.items || []))
      .catch((e) => setError(e?.message || 'Failed to load appointments'))
      .finally(() => setLoading(false));
  }, [status]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.md }}>
        <Text style={{ color: colors.error, textAlign: 'center' }}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', paddingHorizontal: spacing.md, paddingTop: spacing.md, gap: spacing.sm }}>
        {(['upcoming', 'completed', 'cancelled'] as StatusGroup[]).map((s) => {
          const selected = s === status;
          return (
            <Pressable
              key={s}
              onPress={() => setStatus(s)}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: selected ? colors.primary : colors.gray300,
                backgroundColor: selected ? colors.gray100 : colors.white,
              }}
            >
              <Text style={{ color: selected ? colors.primaryDark : colors.gray700, fontWeight: selected ? '700' : '500' }}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <FlatList
        data={items}
        keyExtractor={(it) => String(it.id)}
        contentContainerStyle={{ padding: spacing.md }}
        renderItem={({ item }: { item: AppointmentListItem }) => (
          <Pressable
            onPress={() => navigation.navigate('AppointmentDetail', { id: item.id })}
            style={{
              padding: spacing.md,
              borderWidth: 1,
              borderColor: colors.gray200,
              borderRadius: 12,
              marginBottom: spacing.md,
              backgroundColor: colors.white,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ fontWeight: '700' }}>{item.provider?.businessName || item.provider?.name || 'Provider'}</Text>
              <Text style={{ color: colors.gray600 }}>{item.status}</Text>
            </View>
            <Text style={{ color: colors.gray700 }}>
              {item.appointmentDate} {hhmm(String(item.startTime))}
            </Text>
            <Text style={{ marginTop: 4, color: colors.gray600 }}>{item.services.map((s: { name: string }) => s.name).join(', ')}</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}