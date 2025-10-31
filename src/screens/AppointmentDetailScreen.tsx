import React from 'react';
import { SafeAreaView, Text } from 'react-native';

export default function AppointmentDetailScreen({ route }: any) {
  const { id } = route.params || {};
  return (
    <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 18, fontWeight: '700' }}>Appointment Detail</Text>
      <Text style={{ marginTop: 8 }}>ID: {id}</Text>
      <Text style={{ marginTop: 8 }}>Details view coming soon…</Text>
    </SafeAreaView>
  );
}