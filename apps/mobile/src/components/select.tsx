import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';

type Item = { label: string; value: string };
type SelectProps = React.PropsWithChildren<{ selectedValue?: string; onValueChange?: (v: string) => void; items?: Item[]; style?: any }>;
type BaseProps = React.PropsWithChildren<{ onPress?: () => void; style?: any }>;

function Select({ selectedValue, onValueChange, items, children, style }: SelectProps) {
  if (items && items.length) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.itemsRow}>
          {items.map((it) => {
            const active = it.value === selectedValue;
            return (
              <Pressable key={it.value} onPress={() => onValueChange && onValueChange(it.value)} style={[styles.itemChip, active && styles.itemChipActive]}>
                <Text style={[styles.itemChipText, active && styles.itemChipTextActive]}>{it.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }
  return <View style={[styles.container, style]}>{children}</View>;
}
function SelectGroup(props: BaseProps) { return <View>{props.children}</View>; }
function SelectValue(props: React.PropsWithChildren<{}>) { return <Text>{props.children as string}</Text>; }
function SelectTrigger({ children, onPress }: BaseProps) { return <Pressable onPress={onPress} style={styles.trigger}><Text>{children as string}</Text></Pressable>; }
function SelectContent(props: BaseProps) { return <View style={styles.content}>{props.children}</View>; }
function SelectLabel(props: React.PropsWithChildren<{}>) { return <Text style={styles.label}>{props.children as string}</Text>; }
function SelectItem({ children, onPress }: BaseProps) { return <Pressable onPress={onPress} style={styles.item}><Text>{children as string}</Text></Pressable>; }
function SelectSeparator() { return <View style={styles.separator} />; }
function SelectScrollUpButton() { return <View />; }
function SelectScrollDownButton() { return <View />; }

const styles = StyleSheet.create({
  container: { width: '100%' },
  content: { borderColor: '#E5E7EB', borderRadius: 8, borderWidth: 1, marginTop: 6 },
  item: { paddingHorizontal: 12, paddingVertical: 8 },
  itemChip: { backgroundColor: '#F9FAFB', borderColor: '#E5E7EB', borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6 },
  itemChipActive: { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
  itemChipText: { color: '#374151', fontSize: 13 },
  itemChipTextActive: { color: '#1D4ED8' },
  itemsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  label: { color: '#6B7280', fontSize: 12 },
  separator: { backgroundColor: '#E5E7EB', height: 1 },
  trigger: { borderColor: '#E5E7EB', borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
});

export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue };
