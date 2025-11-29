import React from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../theme/tokens';

export function EditProfileScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Profil bearbeiten</Text>
        <Text style={styles.text}>Inhalt wird später hinzugefügt.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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