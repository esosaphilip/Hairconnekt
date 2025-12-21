import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, Modal, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Switch } from 'react-native';
import Badge from '../../components/badge';
import Input from '../../components/Input';
import { colors, spacing, radii, typography } from '../../theme/tokens';
import { http } from '../../api/http';
import { providersApi } from '@/services/providers';
import { rootNavigationRef } from '@/navigation/rootNavigation';

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
  const navigation = useNavigation();
  const [availabilityId, setAvailabilityId] = useState<string | null>(null);
  const [bufferTime, setBufferTime] = useState<number>(15);
  const [advanceBookingDays, setAdvanceBookingDays] = useState<number>(30);
  const [sameDayBooking, setSameDayBooking] = useState<boolean>(true);
  const [minAdvanceHours, setMinAdvanceHours] = useState<number>(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const data = await providersApi.getAvailabilitySettings();
        if (data?.weeklySchedule) {
          const ws = data.weeklySchedule as Record<string, { isAvailable: boolean; startTime?: string; endTime?: string; breaks?: Array<{ start: string; end: string }> }>;
          const newSchedule: WeekSchedule = { ...schedule };
          (Object.keys(ws) as DayKey[]).forEach((day: DayKey) => {
            const d = ws[day];
            if (!d) return;
            newSchedule[day].isWorkday = !!d.isAvailable;
            const slots: TimeSlot[] = [];
            if (d.startTime && d.endTime) slots.push({ start: d.startTime, end: d.endTime });
            (d.breaks || []).forEach((b) => slots.push({ start: b.start, end: b.end }));
            newSchedule[day].slots = slots;
          });
          setSchedule(newSchedule);
        }
        if (typeof data?.bufferTimeBetweenAppointments === 'number') setBufferTime(data.bufferTimeBetweenAppointments);
        if (data?.advanceBooking) {
          if (typeof data.advanceBooking.minimumNotice === 'number') setMinAdvanceHours(data.advanceBooking.minimumNotice);
          if (typeof data.advanceBooking.maximumWindow === 'number') setAdvanceBookingDays(data.advanceBooking.maximumWindow);
        }
        if (typeof data?.autoBlockHolidays === 'boolean') {
          // reserved for future toggle
        }
      } catch { }
      setLoading(false);
    };
    fetchAvailability();
  }, []);

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

  const handleSave = async () => {
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

    if (hasError) {
      return;
    }

    setLoading(true);
    setError(null);

    const slots = Object.entries(schedule).flatMap(([day, daySchedule]) => {
      if (!daySchedule.isWorkday) return [] as Array<{ weekday: string; start: string; end: string }>;
      return daySchedule.slots.map((slot) => ({ weekday: day, start: slot.start, end: slot.end }));
    });

    try {
      // 1. Update availability slots (strict contract: slots only)
      await providersApi.updateAvailabilitySettings({ slots });

      // 2. Update booking settings via profile
      await providersApi.updateProfile({
        bufferTimeMinutes: bufferTime,
        advanceBookingDays: advanceBookingDays,
        acceptsSameDayBooking: sameDayBooking,
      });

      setMessage('Verfügbarkeit gespeichert');
      if (Platform.OS === 'web') {
        try {
          // Navigate back to More screen on web
          window.location.hash = '/provider/more';
        } catch { }
      }
    } catch (err) {
      let msg = 'Ein Fehler ist aufgetreten.';
      if (typeof err === 'object' && err !== null) {
        const response = (err as Record<string, unknown>)['response'] as Record<string, unknown> | undefined;
        const data = response?.['data'] as Record<string, unknown> | undefined;
        const m = data?.['message'];
        if (typeof m === 'string') {
          msg = m;
        } else {
          const m2 = (err as Record<string, unknown>)['message'];
          if (typeof m2 === 'string') msg = m2;
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const onOpenMore = () => {
    if (Platform.OS === 'web') {
      try { window.location.hash = '/provider/more'; } catch { }
      return;
    }
    try {
      // Prefer stack goBack; fallback to explicit navigation
      // goBack ensures consistent behavior even if screen was opened from settings or dashboard
      // If there's no back history, navigate to Mehr
      // @ts-ignore
      if (navigation.canGoBack && navigation.canGoBack()) {
        // @ts-ignore
        navigation.goBack();
      } else {
        rootNavigationRef.current?.navigate('ProviderTabs', { screen: 'Mehr', params: { screen: 'ProviderMore' } });
      }
    } catch { }
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
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, typography.h3]}>Verfügbarkeit festlegen</Text>
            <Text style={styles.headerSubtitle}>Lege deine Arbeitszeiten fest</Text>
          </View>
          <Pressable
            onPress={handleSave}
            style={styles.saveBtn}
            {...(Platform.OS === 'web' ? { accessibilityRole: 'button' } : {})}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color={colors.white} /> : <Ionicons name="save-outline" size={18} color={colors.white} />}
            <Text style={styles.saveBtnText}>Speichern</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Weekly Schedule */}
        <Card style={styles.cardPaddedSection}>
          <Text style={styles.sectionTitle}>Regelmäßige Arbeitszeiten</Text>

          {DAYS.map(({ key, label }, idx) => (
            <View key={key} style={styles.mtMd}>
              <View style={styles.dayHeaderRow}>
                <View style={styles.inlineRow}>
                  <Switch value={schedule[key].isWorkday} onValueChange={() => toggleWorkday(key)} />
                  <Text style={styles.dayLabel}>{label}</Text>
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
                <View style={styles.indentBlock}>
                  {schedule[key].slots.map((slot, index) => (
                    <View key={index} style={styles.slotRow}>
                      <Input
                        value={slot.start}
                        onChangeText={(t) => updateTimeSlot(key, index, 'start', t)}
                        placeholder="HH:MM"
                        style={styles.flex1}
                      />
                      <Text style={styles.slotSeparator}>bis</Text>
                      <Input
                        value={slot.end}
                        onChangeText={(t) => updateTimeSlot(key, index, 'end', t)}
                        placeholder="HH:MM"
                        style={styles.flex1}
                      />
                      {schedule[key].slots.length > 1 ? (
                        <Pressable
                          onPress={() => removeTimeSlot(key, index)}
                          style={styles.removeBtn}
                          {...(Platform.OS === 'web' ? { accessibilityRole: 'button' } : {})}
                        >
                          <Ionicons name="close-outline" size={18} color={colors.error} />
                        </Pressable>
                      ) : null}
                    </View>
                  ))}
                  <Button
                    variant="ghost"
                    onPress={() => addTimeSlot(key)}
                    title="Zeitslot hinzufügen"
                    style={styles.addSlotBtn}
                  />
                </View>
              ) : (
                <View style={styles.indentBlock}>
                  <Badge variant="secondary"><Text>Geschlossen</Text></Badge>
                </View>
              )}

              {idx !== DAYS.length - 1 ? <View style={styles.separator} /> : null}
            </View>
          ))}
        </Card>

        {/* Buffer Time */}
        <Card style={styles.cardPaddedSection}>
          <View style={styles.row}>
            <Ionicons name="time-outline" size={20} color={colors.gray600} style={styles.iconWithText} />
            <View style={styles.flex1}>
              <Text style={[styles.sectionTitle, styles.titleMarginBottom2]}>Pufferzeit zwischen Terminen</Text>
              <Text style={styles.mutedText}>Zeit zum Vorbereiten zwischen Kunden</Text>
              <View style={styles.inlineRow}>
                <Button title="-" variant="ghost" onPress={() => setBufferTime((v) => increment(v, -5, 0, 60))} />
                <Text style={styles.mxMd}>{bufferTime} Min.</Text>
                <Button title="+" variant="ghost" onPress={() => setBufferTime((v) => increment(v, 5, 0, 60))} />
              </View>
            </View>
          </View>
        </Card>

        {/* Booking Settings */}
        <Card style={styles.cardPaddedSection}>
          <View style={styles.rowMbSm}>
            <Ionicons name="calendar-outline" size={20} color={colors.gray600} style={styles.iconWithText} />
            <View style={styles.flex1}>
              <Text style={[styles.sectionTitle, styles.titleMarginBottom2]}>Buchungseinstellungen</Text>
              <Text style={styles.mutedText}>Wie weit im Voraus können Kunden buchen</Text>
            </View>
          </View>

          <View style={styles.mtSm}>
            <Text style={styles.label}>Vorlaufzeit für Buchungen</Text>
            <Pressable onPress={() => setDaysModalOpen(true)} style={styles.selectTrigger} accessibilityRole={Platform.OS === 'web' ? 'button' : undefined}>
              <Text style={styles.blackText}>{advanceBookingDays} Tage</Text>
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
            <View style={styles.flex1}>
              <Text style={styles.label}>Mindestvorlauf (Stunden)</Text>
              <Text style={styles.mutedText}>Wie viele Stunden vorher muss gebucht werden</Text>
            </View>
            <View style={styles.inlineRow}>
              <Button title="-" variant="ghost" onPress={() => setMinAdvanceHours((v) => increment(v, -1, 0, 72))} />
              <Text style={styles.mxSm}>{minAdvanceHours} Std.</Text>
              <Button title="+" variant="ghost" onPress={() => setMinAdvanceHours((v) => increment(v, 1, 0, 72))} />
            </View>
          </View>
        </Card>

        {/* Quick Actions */}
        <View style={styles.row}>
          <View style={styles.quickActionLeft}>
            <Button
              variant="ghost"
              title="Urlaub/Auszeit planen"
              onPress={() => {
                if (Platform.OS === 'web') {
                  try { window.location.hash = '/provider/calendar/block'; } catch { }
                }
              }}
            />
          </View>
          <View style={styles.quickActionRight}>
            <Button
              variant="ghost"
              title="Kalender ansehen"
              onPress={() => {
                if (Platform.OS === 'web') {
                  try { window.location.hash = '/provider/calendar'; } catch { }
                }
              }}
            />
          </View>
        </View>

        {message && <Text style={styles.messageText}>{message}</Text>}
        {error && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>

      {/* Days Select Modal */}
      <Modal visible={daysModalOpen} transparent animationType="fade" onRequestClose={() => setDaysModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={[styles.sectionTitle, styles.mbSm]}>Vorlaufzeit wählen</Text>
            {[7, 14, 30, 60, 90].map((d) => (
              <Pressable key={d} style={styles.modalItem} onPress={() => { setAdvanceBookingDays(d); setDaysModalOpen(false); }}>
                <Text style={styles.blackText}>{d} Tage</Text>
              </Pressable>
            ))}
            <Button title="Abbrechen" variant="ghost" onPress={() => setDaysModalOpen(false)} style={styles.mtSm} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  addSlotBtn: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  blackText: {
    color: colors.black,
  },
  blockRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  cardPaddedSection: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  container: {
    backgroundColor: colors.gray50,
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  dayHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayLabel: {
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  errorText: {
    color: colors.error,
    marginTop: spacing.md,
  },
  flex1: {
    flex: 1,
  },
  header: {
    backgroundColor: colors.white,
    borderBottomColor: colors.gray200,
    borderBottomWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerSubtitle: {
    color: colors.gray600,
    fontSize: 12,
  },
  headerTitle: {
    marginBottom: 2,
  },
  helperText: {
    color: colors.gray600,
    fontSize: 12,
    marginTop: 4,
  },
  iconBtn: {
    paddingRight: spacing.sm,
    paddingVertical: spacing.xs,
  },
  iconWithText: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  indentBlock: {
    marginLeft: 44,
    marginTop: spacing.sm,
  },
  inlineRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  label: {
    color: colors.gray700,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  mbSm: {
    marginBottom: spacing.sm,
  },
  messageText: {
    color: colors.primary,
    marginTop: spacing.md,
  },
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: colors.overlay,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.md,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    maxWidth: 420,
    padding: spacing.md,
    width: '100%',
  },
  modalItem: {
    borderBottomColor: colors.gray200,
    borderBottomWidth: 1,
    paddingVertical: spacing.sm,
  },
  mtMd: {
    marginTop: spacing.md,
  },
  mtSm: {
    marginTop: spacing.sm,
  },
  mutedText: {
    color: colors.gray600,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  mxMd: {
    marginHorizontal: spacing.md,
  },
  mxSm: {
    marginHorizontal: spacing.sm,
  },
  quickActionLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },
  quickActionRight: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  removeBtn: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
  row: {
    flexDirection: 'row',
  },
  rowMbSm: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  saveBtn: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  saveBtnText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 6,
  },
  sectionTitle: {
    color: colors.black,
    fontSize: 16,
    fontWeight: '600',
  },
  selectTrigger: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.gray300,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  separator: {
    backgroundColor: colors.gray200,
    height: 1,
    marginTop: spacing.md,
  },
  slotRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  slotSeparator: {
    color: colors.gray600,
    marginHorizontal: spacing.sm,
  },
  titleMarginBottom2: {
    marginBottom: 2,
  },
});

export default AvailabilitySettingsScreen;
