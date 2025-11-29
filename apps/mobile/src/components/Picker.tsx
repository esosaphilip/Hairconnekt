import React, { useMemo, useState } from 'react';
import { Modal, Pressable, View, Text, StyleSheet } from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';

type Item = { label: string; value: string };
type PickerProps = {
  selectedValue?: string;
  onValueChange?: (next: string) => void;
  items: Item[];
  placeholder?: string;
};

export default function Picker({ selectedValue, onValueChange, items, placeholder = 'Bitte wählen' }: PickerProps) {
  const [open, setOpen] = useState(false);
  const selectedLabel = useMemo(() => items.find((i) => i.value === selectedValue)?.label || placeholder, [items, selectedValue, placeholder]);

  return (
    <View>
      <Pressable style={styles.trigger} onPress={() => setOpen(true)}>
        <Text style={styles.triggerText}>{selectedLabel}</Text>
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            {items.map((it) => (
              <Pressable
                key={it.value}
                style={styles.option}
                onPress={() => {
                  onValueChange?.(it.value);
                  setOpen(false);
                }}
              >
                <Text style={styles.optionText}>{it.label}</Text>
              </Pressable>
            ))}
            <Pressable style={[styles.option, styles.cancel]} onPress={() => setOpen(false)}>
              <Text style={[styles.optionText, { color: colors.error }]}>Abbrechen</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    backgroundColor: colors.white,
  },
  triggerText: {
    color: colors.gray700,
    fontSize: 16,
  },
  backdrop: {
    flex: 1,
    backgroundColor: '#00000055',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  sheet: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  option: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  optionText: {
    fontSize: 16,
    color: colors.black,
  },
  cancel: {
    borderBottomWidth: 0,
  },
});