import React, { useState } from 'react';
import { SafeAreaView, View } from 'react-native';
import Card from '../components/Card';
import Text from '../components/Text';
import Button from '../components/Button';
import { spacing } from '../theme/tokens';

const upcomingAppointments = [
  {
    id: 1,
    date: "Montag, 28. Okt.",
    time: "14:00 - 18:00 Uhr",
    provider: "Aisha Mohammed",
    business: "Aisha's Braiding Studio",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    address: "Westenhellweg 102, Dortmund",
    distance: "1.2 km",
    services: ["Box Braids", "Styling"],
    price: "€135",
    status: "confirmed",
    hoursUntil: 25,
  },
  {
    id: 2,
    date: "Freitag, 1. Nov.",
    time: "10:00 - 13:00 Uhr",
    provider: "Fatima Hassan",
    business: "Natural Hair Lounge",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    address: "Rheinische Str. 45, Dortmund",
    distance: "2.5 km",
    services: ["Cornrows"],
    price: "€85",
    status: "pending",
    hoursUntil: 120,
  },
];

const completedAppointments = [
  {
    id: 3,
    date: "Montag, 14. Okt.",
    provider: "Lina Okafor",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    services: ["Box Braids"],
    price: "€95",
    reviewed: false,
  },
  {
    id: 4,
    date: "Samstag, 5. Okt.",
    provider: "Aisha Mohammed",
    business: "Aisha's Braiding Studio",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    services: ["Cornrows", "Styling"],
    price: "€75",
    reviewed: true,
  },
];

export function AppointmentsScreen() {
  const [activeTab, setActiveTab] = useState('upcoming');

  // Placeholder RN screen; web-only implementation was removed due to invalid imports in mobile

  return (
    <SafeAreaView style={{ flex: 1, padding: spacing.lg }}>
      <Card style={{ padding: spacing.lg }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontWeight: '700', marginBottom: spacing.sm }}>Meine Termine</Text>
          <Text style={{ textAlign: 'center' }}>
            Die mobile Terminübersicht wird bald verfügbar sein.
          </Text>
          <Button title="Zurück" variant="secondary" style={{ marginTop: spacing.md }} onPress={() => { /* placeholder */ }} />
        </View>
      </Card>
    </SafeAreaView>
  );
}
