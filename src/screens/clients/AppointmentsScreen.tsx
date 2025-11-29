import React from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import Card from '@/components/Card';
import Text from '@/components/Text';
import Button from '@/components/Button';
import { spacing } from '@/theme/tokens';

export function AppointmentsScreen() {

  // Placeholder RN screen; web-only implementation was removed due to invalid imports in mobile
  
  return (
    <SafeAreaView style={styles.container}>
      <Card style={styles.card}>
        <View style={styles.center}>
          <Text style={styles.title}>Meine Termine</Text>
          <Text style={styles.centerText}>
            Die mobile Terminübersicht wird bald verfügbar sein.
          </Text>
          <Button title="Zurück" variant="secondary" style={styles.button} onPress={() => {}} />
        </View>
      </Card>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  button: { marginTop: spacing.md },
  card: { padding: spacing.lg },
  center: { alignItems: 'center' },
  centerText: { textAlign: 'center' },
  container: { flex: 1, padding: spacing.lg },
  title: { fontWeight: '700', marginBottom: spacing.sm },
});
