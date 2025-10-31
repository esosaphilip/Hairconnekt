import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Switch } from '../../components/switch';
import { Badge } from '../../components/badge';
import Input from '../../components/Input';
import { colors, spacing, radii, typography } from '../../theme/tokens';

// Types
type DayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

type TimeSlot = { start: string; end: string };
type DaySchedule = { isWorkday: boolean; slots: TimeSlot[] };
type WeekSchedule = Record<DayKey, DaySchedule>;

const DAYS: { key: DayKey; label: string }[] = [
  { key: 'monday', label: 'Montag' },
  { key: 'tuesday', label: 'Dienstag' },
  { key: 'wednesday', label: 'Mittwoch' },
  { key: 'thursday', label: 'Donnerstag' },
  { key: 'friday', label: 'Freitag' },
  { key: 'saturday', label: 'Samstag' },
  { key: 'sunday', label: 'Sonntag' },
];

export function AvailabilitySettingsScreen() {
  const [bufferTime, setBufferTime] = useState<number>(15);
  const [advanceBookingDays, setAdvanceBookingDays] = useState<number>(30);
  const [sameDayBooking, setSameDayBooking] = useState<boolean>(true);
  const [minAdvanceHours, setMinAdvanceHours] = useState<number>(2);
  const [message, setMessage] = useState<string | null>(null);
  const [daysModalOpen, setDaysModalOpen] = useState<boolean>(false);

  const [schedule, setSchedule] = useState<WeekSchedule>({
    monday: { isWorkday: true, slots: [{ start: '09:00', end: '18:00' }] },
    tuesday: { isWorkday: true, slots: [{ start: '09:00', end: '18:00' }] },
    wednesday: { isWorkday: true, slots: [{ start: '09:00', end: '18:00' }] },
    thursday: { isWorkday: true, slots: [{ start: '09:00', end: '18:00' }] },
    friday: { isWorkday: true, slots: [{ start: '09:00', end: '18:00' }] },
    saturday: { isWorkday: true, slots: [{ start: '10:00', end: '16:00' }] },
    sunday: { isWorkday: false, slots: [] },
  });

  const toggleWorkday = (day: DayKey) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        isWorkday: !prev[day].isWorkday,
        slots: !prev[day].isWorkday ? [{ start: '09:00', end: '18:00' }] : [],
      },
    }));
  };

  const addTimeSlot = (day: DayKey) => {
    const lastSlot = schedule[day].slots[schedule[day].slots.length - 1];
    const newStart = lastSlot ? lastSlot.end : '09:00';
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [...prev[day].slots, { start: newStart, end: '18:00' }],
      },
    }));
  };

  const removeTimeSlot = (day: DayKey, index: number) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.filter((_, i) => i !== index),
      },
    }));
  };

  const updateTimeSlot = (
    day: DayKey,
    index: number,
    field: 'start' | 'end',
    value: string
  ) => {
    const newSlots = [...schedule[day].slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: newSlots,
      },
    }));
  };

  const copyToOtherDays = (sourceDay: DayKey) => {
    const sourceDaySchedule = schedule[sourceDay];
    const newSchedule = { ...schedule };
    DAYS.forEach(({ key }) => {
      if (key !== sourceDay) {
        newSchedule[key] = {
          isWorkday: sourceDaySchedule.isWorkday,
          slots: sourceDaySchedule.slots.map((slot: TimeSlot) => ({ ...slot })),
        };
      }
    });
    setSchedule(newSchedule);
    setMessage('Zeiten auf alle Tage kopiert');
  };

  const handleSave = () => {
    let hasError = false;
    (Object.entries(schedule) as [DayKey, DaySchedule][]).forEach(([day, data]) => {
      if (data.isWorkday && data.slots.length === 0) {
        setMessage(
          `Bitte füge Arbeitszeiten für ${DAYS.find((d) => d.key === day)?.label} hinzu`
        );
        hasError = true;
      }
      data.slots.forEach((slot: TimeSlot) => {
        if (slot.start >= slot.end) {
          setMessage(
            `Endzeit muss nach Startzeit liegen (${DAYS.find((d) => d.key === day)?.label})`
          );
          hasError = true;
        }
      });
    });

    if (!hasError) {
      setMessage('Verfügbarkeit erfolgreich gespeichert!');
      if (Platform.OS === 'web') {
        try {
          // Navigate back to More screen on web
          window.location.hash = '/provider/more';
        } catch {}
      }
    }
  };

  const onOpenMore = () => {
    if (Platform.OS === 'web') {
      try { window.location.hash = '/provider/more'; } catch {}
    }
  };

  const increment = (value: number, delta: number, min: number, max: number) => {
    return Math.min(max, Math.max(min, value + delta));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={onOpenMore}
            style={styles.iconBtn}
            {...(Platform.OS === 'web' ? { accessibilityRole: 'button' } : {})}
          >
            <Ionicons name="chevron-back" size={24} color={colors.black} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, typography.h3]}>Verfügbarkeit festlegen</Text>
            <Text style={styles.headerSubtitle}>Lege deine Arbeitszeiten fest</Text>
          </View>
          <Pressable
            onPress={handleSave}
            style={styles.saveBtn}
            {...(Platform.OS === 'web' ? { accessibilityRole: 'button' } : {})}
          >
            <Ionicons name="save-outline" size={18} color={colors.white} />
            <Text style={styles.saveBtnText}>Speichern</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Weekly Schedule */}
        <Card style={{ padding: spacing.md, marginBottom: spacing.md }}>
          <Text style={styles.sectionTitle}>Regelmäßige Arbeitszeiten</Text>

          {DAYS.map(({ key, label }, idx) => (
            <View key={key} style={{ marginTop: spacing.md }}>
              <View style={styles.dayHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Switch value={schedule[key].isWorkday} onValueChange={() => toggleWorkday(key)} />
                  <Text style={{ marginLeft: spacing.sm, fontWeight: '600' }}>{label}</Text>
                </View>
                {schedule[key].isWorkday ? (
                  <Button
                    variant="ghost"
                    onPress={() => copyToOtherDays(key)}
                    title="Auf andere Tage kopieren"
                  />
                ) : null}
              </View>

              {schedule[key].isWorkday ? (
                <View style={{ marginLeft: 44, marginTop: spacing.sm }}>
                  {schedule[key].slots.map((slot, index) => (
                    <View key={index} style={styles.slotRow}>
                      <Input
                        value={slot.start}
                        onChangeText={(t) => updateTimeSlot(key, index, 'start', t)}
                        placeholder="HH:MM"
                        style={{ flex: 1 }}
                      />
                      <Text style={{ color: colors.gray600, marginHorizontal: spacing.sm }}>bis</Text>
                      <Input
                        value={slot.end}
                        onChangeText={(t) => updateTimeSlot(key, index, 'end', t)}
                        placeholder="HH:MM"
                        style={{ flex: 1 }}
                      />
                      {schedule[key].slots.length > 1 ? (
                        <Pressable
                          onPress={() => removeTimeSlot(key, index)}
                          style={styles.removeBtn}
                          {...(Platform.OS === 'web' ? { accessibilityRole: 'button' } : {})}
                        >
                          <Ionicons name="close-outline" size={18} color="#DC2626" />
                        </Pressable>
                      ) : null}
                    </View>
                  ))}
                  <Button
                    variant="ghost"
                    onPress={() => addTimeSlot(key)}
                    title="Zeitslot hinzufügen"
                    style={{ alignSelf: 'flex-start', marginTop: spacing.sm }}
                  />
                </View>
              ) : (
                <View style={{ marginLeft: 44, marginTop: spacing.sm }}>
                  <Badge variant="secondary">Geschlossen</Badge>
                </View>
              )}

              {idx !== DAYS.length - 1 ? <View style={styles.separator} /> : null}
            </View>
          ))}
        </Card>

        {/* Buffer Time */}
        <Card style={{ padding: spacing.md, marginBottom: spacing.md }}>
          <View style={{ flexDirection: 'row' }}>
            <Ionicons name="time-outline" size={20} color={colors.gray600} style={{ marginRight: spacing.sm, marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { marginBottom: 2 }]}>Pufferzeit zwischen Terminen</Text>
              <Text style={styles.mutedText}>Zeit zum Vorbereiten zwischen Kunden</Text>
              <View style={styles.inlineRow}>
                <Button title="-" variant="ghost" onPress={() => setBufferTime((v) => increment(v, -5, 0, 60))} />
                <Text style={{ marginHorizontal: spacing.md }}>{bufferTime} Min.</Text>
                <Button title="+" variant="ghost" onPress={() => setBufferTime((v) => increment(v, 5, 0, 60))} />
              </View>
            </View>
          </View>
        </Card>

        {/* Booking Settings */}
        <Card style={{ padding: spacing.md, marginBottom: spacing.md }}>
          <View style={{ flexDirection: 'row', marginBottom: spacing.sm }}>
            <Ionicons name="calendar-outline" size={20} color={colors.gray600} style={{ marginRight: spacing.sm, marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { marginBottom: 2 }]}>Buchungseinstellungen</Text>
              <Text style={styles.mutedText}>Wie weit im Voraus können Kunden buchen</Text>
            </View>
          </View>

          <View style={{ marginTop: spacing.sm }}>
            <Text style={styles.label}>Vorlaufzeit für Buchungen</Text>
        <Pressable onPress={() => setDaysModalOpen(true)} style={styles.selectTrigger} accessibilityRole={Platform.OS === 'web' ? 'button' : undefined}>
              <Text style={{ color: colors.black }}>{advanceBookingDays} Tage</Text>
              <Ionicons name="chevron-down" size={18} color={colors.gray500} />
            </Pressable>
            <Text style={styles.helperText}>Kunden können bis zu {advanceBookingDays} Tage im Voraus buchen</Text>
          </View>

          <View style={styles.blockRow}>
            <View>
              <Text style={styles.label}>Buchungen am selben Tag</Text>
              <Text style={styles.mutedText}>Erlaube Buchungen für heute</Text>
            </View>
            <Switch value={sameDayBooking} onValueChange={setSameDayBooking} />
          </View>

          <View style={styles.blockRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Mindestvorlauf (Stunden)</Text>
              <Text style={styles.mutedText}>Wie viele Stunden vorher muss gebucht werden</Text>
            </View>
            <View style={styles.inlineRow}>
              <Button title="-" variant="ghost" onPress={() => setMinAdvanceHours((v) => increment(v, -1, 0, 72))} />
              <Text style={{ marginHorizontal: spacing.sm }}>{minAdvanceHours} Std.</Text>
              <Button title="+" variant="ghost" onPress={() => setMinAdvanceHours((v) => increment(v, 1, 0, 72))} />
            </View>
          </View>
        </Card>

        {/* Quick Actions */}
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1, marginRight: spacing.sm }}>
            <Button
              variant="ghost"
              title="Urlaub/Auszeit planen"
              onPress={() => {
                if (Platform.OS === 'web') {
                  try { window.location.hash = '/provider/calendar/block'; } catch {}
                }
              }}
            />
          </View>
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <Button
              variant="ghost"
              title="Kalender ansehen"
              onPress={() => {
                if (Platform.OS === 'web') {
                  try { window.location.hash = '/provider/calendar'; } catch {}
                }
              }}
            />
          </View>
        </View>

        {message ? (
          <Text style={{ color: colors.primary, marginTop: spacing.md }}>{message}</Text>
        ) : null}
      </ScrollView>

      {/* Days Select Modal */}
      <Modal visible={daysModalOpen} transparent animationType="fade" onRequestClose={() => setDaysModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={[styles.sectionTitle, { marginBottom: spacing.sm }]}>Vorlaufzeit wählen</Text>
            {[7, 14, 30, 60, 90].map((d) => (
              <Pressable key={d} style={styles.modalItem} onPress={() => { setAdvanceBookingDays(d); setDaysModalOpen(false); }}>
                <Text style={{ color: colors.black }}>{d} Tage</Text>
              </Pressable>
            ))}
            <Button title="Abbrechen" variant="ghost" onPress={() => setDaysModalOpen(false)} style={{ marginTop: spacing.sm }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    paddingRight: spacing.sm,
    paddingVertical: spacing.xs,
  },
  headerTitle: {
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.gray600,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveBtnText: {
    color: colors.white,
    marginLeft: 6,
    fontWeight: '600',
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  removeBtn: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  separator: {
    height: 1,
    backgroundColor: colors.gray200,
    marginTop: spacing.md,
  },
  mutedText: {
    fontSize: 12,
    color: colors.gray600,
    marginBottom: spacing.sm,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray700,
    marginBottom: 6,
  },
  helperText: {
    fontSize: 12,
    color: colors.gray600,
    marginTop: 4,
  },
  selectTrigger: {
    borderWidth: 1,
    borderColor: colors.gray300,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  blockRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  modalItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
});

export default AvailabilitySettingsScreen;