import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../theme/tokens';

export function TransactionHistoryScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Transaktionshistorie</Text>
          <Text style={styles.text}>Inhalt wird später hinzugefügt.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
  },
  container: {
    padding: spacing.lg,
  },
  safeArea: {
    backgroundColor: colors.gray50,
    flex: 1,
  },
  text: {
    color: colors.gray600,
    fontSize: 14,
    marginTop: spacing.sm,
  },
  title: {
    color: colors.gray800,
    fontSize: 20,
    fontWeight: '600',
  },
});