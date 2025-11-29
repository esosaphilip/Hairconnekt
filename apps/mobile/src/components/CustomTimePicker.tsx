import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';

// Lightweight placeholder component to unblock builds.
// TODO: Replace with a native time picker on iOS/Android and a modal input on Web.
type Props = {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  icon?: React.ReactNode;
  style?: any;
};

export default function CustomTimePicker({ label, value, onChange, icon, style }: Props) {
  const handlePress = useCallback(() => {
    try {
      Alert.alert(
        'Zeit auswählen',
        'Der native Zeit-Selector ist noch nicht implementiert. Dieses Platzhalter-Steuerelement dient nur als Anzeige.',
      );
    } catch (e) {
      // Fallback for environments where Alert may not be available
      console.warn('Time picker not implemented yet');
    }
  }, []);

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable onPress={handlePress} style={styles.input} accessibilityRole="button">
        <View style={styles.inputContent}>
          {icon ? <View style={styles.icon}>{icon}</View> : null}
          <Text style={styles.valueText}>{value || '—:—'}</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: '#4B5563',
    fontSize: 12,
    marginBottom: 6,
  },
  valueText: {
    color: '#1F2937',
    fontSize: 14,
  },
});
