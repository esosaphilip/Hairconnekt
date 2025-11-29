import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme/tokens';

type Option = {
  label: string;
  icon?: string;
  onPress: () => void;
  isDestructive?: boolean;
};

type ActionSheetProps = {
  isVisible: boolean;
  onClose: () => void;
  options: Option[];
  title?: string;
};

export default function ActionSheet({ isVisible, onClose, options, title }: ActionSheetProps) {
  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {!!title && <Text style={styles.title}>{title}</Text>}
          {options.map((opt, idx) => (
            <Pressable key={idx} onPress={() => { opt.onPress(); onClose(); }} style={styles.item}>
              <Text style={[styles.itemText, opt.isDestructive ? styles.destructiveText : null]}>{opt.label}</Text>
            </Pressable>
          ))}
          <Pressable onPress={onClose} style={[styles.item, styles.cancelItem]}>
            <Text style={styles.cancelText}>Abbrechen</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { alignItems: 'center', backgroundColor: colors.black, flex: 1, justifyContent: 'center', opacity: 0.33, padding: 16 },
  cancelItem: { borderTopColor: colors.gray200, borderTopWidth: 1, marginTop: 4 },
  cancelText: { color: colors.black, fontSize: 14, fontWeight: '700' },
  card: { backgroundColor: colors.white, borderRadius: 12, paddingVertical: 8, width: '100%' },
  destructiveText: { color: colors.error },
  item: { paddingHorizontal: 12, paddingVertical: 12 },
  itemText: { color: colors.black, fontSize: 14 },
  title: { color: colors.black, fontSize: 16, fontWeight: '700', paddingHorizontal: 12, paddingVertical: 8 },
});
