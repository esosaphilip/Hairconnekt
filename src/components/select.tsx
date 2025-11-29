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
  itemsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  trigger: { borderWidth: 1, borderColor: '#E5E7EB', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  content: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, marginTop: 6 },
  label: { fontSize: 12, color: '#6B7280' },
  item: { paddingVertical: 8, paddingHorizontal: 12 },
  separator: { height: 1, backgroundColor: '#E5E7EB' },
  itemChip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' },
  itemChipActive: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  itemChipText: { color: '#374151', fontSize: 13 },
  itemChipTextActive: { color: '#1D4ED8' },
});

export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue };
