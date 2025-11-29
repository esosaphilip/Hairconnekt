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
  backdrop: {
    alignItems: 'center',
    backgroundColor: '#00000055',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.md,
  },
  cancel: {
    borderBottomWidth: 0,
  },
  option: {
    borderBottomColor: colors.gray200,
    borderBottomWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  optionText: {
    color: colors.black,
    fontSize: 16,
  },
  sheet: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    overflow: 'hidden',
    width: '100%',
  },
  trigger: {
    backgroundColor: colors.white,
    borderColor: colors.gray300,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  triggerText: {
    color: colors.gray700,
    fontSize: 16,
  },
});