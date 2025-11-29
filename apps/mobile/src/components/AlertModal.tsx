import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors } from '../theme/tokens';

type ButtonSpec = {
  title: string;
  onPress: () => void;
  variant?: 'outline' | 'ghost' | 'primary';
  style?: StyleProp<ViewStyle>;
};

type AlertModalProps = {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  customContent?: React.ReactNode;
  buttons?: ButtonSpec[];
};

export default function AlertModal({ isVisible, onClose, title, description, customContent, buttons = [] }: AlertModalProps) {
  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {!!title && <Text style={styles.title}>{title}</Text>}
          {!!description && <Text style={styles.description}>{description}</Text>}
          {!!customContent && <View style={styles.customContent}>{customContent}</View>}
          <View style={styles.buttonsRow}>
            {(buttons.length ? buttons : ([{ title: 'Schließen', onPress: onClose, variant: 'outline' as const }] as ButtonSpec[])).map((b, idx) => (
              <Pressable key={idx} onPress={b.onPress} style={[styles.button, b.variant === 'outline' ? styles.buttonOutline : styles.buttonPrimary, b.style]}>
                <Text style={[styles.buttonLabel, b.variant === 'outline' ? styles.buttonLabelOutline : styles.buttonLabelPrimary]}>{b.title}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.35)', flex: 1, justifyContent: 'center', padding: 16 },
  button: { borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10 },
  buttonLabel: { fontSize: 14, fontWeight: '600' },
  buttonLabelOutline: { color: colors.black },
  buttonLabelPrimary: { color: colors.white },
  buttonOutline: { borderColor: colors.gray200, borderWidth: 1 },
  buttonPrimary: { backgroundColor: colors.primary },
  buttonsRow: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end', marginTop: 16 },
  card: { backgroundColor: colors.white, borderRadius: 12, maxWidth: 480, padding: 16, width: '90%' },
  customContent: { marginTop: 12 },
  description: { color: colors.gray600, fontSize: 14, marginTop: 6 },
  title: { color: colors.black, fontSize: 16, fontWeight: '700' },
});
