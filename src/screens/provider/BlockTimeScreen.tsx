import React, { useState } from 'react';
import { SafeAreaView, View, Text, ScrollView, Pressable, TextInput, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { Switch } from '../../components/switch';
import { colors, spacing, radii, typography } from '../../theme/tokens';

// Reasons for blocking time
const BLOCK_REASONS = [
  { value: 'pause', label: 'Pause' },
  { value: 'lunch', label: 'Mittagspause' },
  { value: 'external', label: 'Termin außerhalb' },
  { value: 'vacation', label: 'Urlaub' },
  { value: 'sick', label: 'Krankheit' },
  { value: 'other', label: 'Sonstiges' },
];

// Days of the week for weekly repeats
const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Mo' },
  { value: 'tuesday', label: 'Di' },
  { value: 'wednesday', label: 'Mi' },
  { value: 'thursday', label: 'Do' },
  { value: 'friday', label: 'Fr' },
  { value: 'saturday', label: 'Sa' },
  { value: 'sunday', label: 'So' },
];

export function BlockTimeScreen() {
  // Form state
  const [reason, setReason] = useState<string>('vacation');
  const [customReason, setCustomReason] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('17:00');
  const [allDay, setAllDay] = useState<boolean>(true);
  const [repeat, setRepeat] = useState<boolean>(false);
  const [repeatFrequency, setRepeatFrequency] = useState<string>('weekly');
  const [repeatDays, setRepeatDays] = useState<string[]>([]);
  const [repeatEndType, setRepeatEndType] = useState<string>('never');
  const [repeatEndDate, setRepeatEndDate] = useState<string>('');
  const [repeatCount, setRepeatCount] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');

  const toggleRepeatDay = (day: string) => {
    setRepeatDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const navToCalendar = () => {
    // Navigate back to Provider Calendar; using hash route on web for consistency with existing navigation
    if (Platform.OS === 'web') {
  try {
    if (typeof window !== 'undefined' && window.location) {
      window.location.hash = '/provider/calendar';
    }
  } catch {}
    } else {
      console.log('Navigate to provider calendar');
    }
  };

  const handleBlock = () => {
    if (!startDate) {
      Alert.alert('Fehler', 'Bitte wähle ein Startdatum');
      return;
    }
    if (repeat && repeatFrequency === 'weekly' && repeatDays.length === 0) {
      Alert.alert('Fehler', 'Bitte wähle mindestens einen Wochentag');
      return;
    }
    if (!allDay && startTime >= endTime) {
      Alert.alert('Fehler', 'Endzeit muss nach Startzeit liegen');
      return;
    }
    Alert.alert('Erfolg', 'Zeit erfolgreich blockiert!');
    setTimeout(navToCalendar, 800);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray50 }}>
      {/* Header */}
      <View style={{ backgroundColor: colors.white, paddingHorizontal: spacing.md, paddingVertical: spacing.md, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Pressable onPress={navToCalendar} style={{ padding: spacing.xs }}>
        <Ionicons name={'chevron-back'} size={24} color={colors.gray700} />
          </Pressable>
          <View style={{ flex: 1 }}>
        <Text style={[typography.h3]}>Zeit blockieren</Text>
            <Text style={{ fontSize: 12, color: colors.gray600 }}>Blockiere Zeiten für Pausen oder Urlaub</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, rowGap: spacing.md }}>
        {/* Reason Selection */}
        <Card style={{ padding: spacing.md }}>
          <Text style={{ marginBottom: spacing.sm, fontWeight: '600' }}>Grund</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm }}>
            {BLOCK_REASONS.map((r) => (
              <Pressable
                key={r.value}
                onPress={() => setReason(r.value)}
                style={{
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderRadius: radii.md,
                  borderWidth: 2,
                  borderColor: reason === r.value ? colors.primary : colors.gray300,
                  backgroundColor: reason === r.value ? '#f8f1ec' : colors.white,
                }}
              >
                <Text style={{ fontWeight: reason === r.value ? '600' : '400' }}>{r.label}</Text>
              </Pressable>
            ))}
          </View>
          {reason === 'other' && (
            <Input label="Eigener Grund" value={customReason} onChangeText={setCustomReason} placeholder="Gib einen Grund ein" />
          )}
        </Card>

        {/* Date and Time Selection */}
        <Card style={{ padding: spacing.md }}>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Input label="Startdatum" value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Enddatum" value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD" />
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Ionicons name={'time-outline'} size={18} color={colors.gray600} />
              <Text style={{ fontSize: 14, color: colors.gray700 }}>Ganztägig</Text>
            </View>
            <Switch value={allDay} onValueChange={setAllDay} />
          </View>
          {!allDay && (
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
              <View style={{ flex: 1 }}>
                <Input label="Startzeit" value={startTime} onChangeText={setStartTime} placeholder="HH:MM" />
              </View>
              <View style={{ flex: 1 }}>
                <Input label="Endzeit" value={endTime} onChangeText={setEndTime} placeholder="HH:MM" />
              </View>
            </View>
          )}
        </Card>

        {/* Repeat Options */}
        <Card style={{ padding: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: '600' }}>Wiederholung</Text>
            <Switch value={repeat} onValueChange={setRepeat} />
          </View>
          {repeat && (
            <View style={{ marginTop: spacing.sm, rowGap: spacing.sm }}>
              <Text style={{ fontWeight: '600' }}>Häufigkeit</Text>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                {[
                  { value: 'daily', label: 'Täglich' },
                  { value: 'weekly', label: 'Wöchentlich' },
                  { value: 'monthly', label: 'Monatlich' },
                ].map((f) => (
                  <Pressable
                    key={f.value}
                    onPress={() => setRepeatFrequency(f.value)}
                    style={{
                      flex: 1,
                      paddingVertical: spacing.sm,
                      borderRadius: radii.md,
                      borderWidth: 2,
                      borderColor: repeatFrequency === f.value ? colors.primary : colors.gray300,
                      backgroundColor: repeatFrequency === f.value ? colors.primary : colors.white,
                    }}
                  >
                    <Text style={{ textAlign: 'center', color: repeatFrequency === f.value ? colors.white : colors.black }}>{f.label}</Text>
                  </Pressable>
                ))}
              </View>
              {repeatFrequency === 'weekly' && (
                <View>
                  <Text style={{ marginBottom: spacing.xs }}>Wochentage</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                    {DAYS_OF_WEEK.map((day) => (
                      <Pressable
                        key={day.value}
                        onPress={() => toggleRepeatDay(day.value)}
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: spacing.md,
                          borderRadius: radii.md,
                          borderWidth: 2,
                          borderColor: repeatDays.includes(day.value) ? colors.primary : colors.gray300,
                          backgroundColor: repeatDays.includes(day.value) ? colors.primary : colors.white,
                        }}
                      >
                        <Text style={{ color: repeatDays.includes(day.value) ? colors.white : colors.black }}>{day.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              <View style={{ height: 1, backgroundColor: colors.gray200 }} />

              <View>
                <Text style={{ marginBottom: spacing.xs }}>Wiederholung endet</Text>
                <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm }}>
                  {[
                    { value: 'never', label: 'Nie' },
                    { value: 'date', label: 'Am Datum' },
                    { value: 'count', label: 'Nach X Wiederholungen' },
                  ].map((opt) => (
                    <Pressable
                      key={opt.value}
                      onPress={() => setRepeatEndType(opt.value)}
                      style={{
                        flex: 1,
                        paddingVertical: spacing.sm,
                        borderRadius: radii.md,
                        borderWidth: 2,
                        borderColor: repeatEndType === opt.value ? colors.primary : colors.gray300,
                        backgroundColor: repeatEndType === opt.value ? colors.primary : colors.white,
                      }}
                    >
                      <Text style={{ textAlign: 'center', color: repeatEndType === opt.value ? colors.white : colors.black }}>{opt.label}</Text>
                    </Pressable>
                  ))}
                </View>
                {repeatEndType === 'date' && (
                  <Input label="Enddatum" value={repeatEndDate} onChangeText={setRepeatEndDate} placeholder="YYYY-MM-DD" />
                )}
                {repeatEndType === 'count' && (
                  <Input label="Anzahl" value={String(repeatCount)} onChangeText={(t) => {
                    const n = parseInt(t || '1', 10);
                    setRepeatCount(Number.isNaN(n) ? 1 : Math.max(1, n));
                  }} keyboardType="numeric" />
                )}
              </View>
            </View>
          )}
        </Card>

        {/* Notes */}
        <Card style={{ padding: spacing.md }}>
          <Text style={{ marginBottom: spacing.xs }}>Notizen (optional)</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            style={{ width: '100%', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.gray300, borderRadius: radii.md, minHeight: 100 }}
            placeholder="Weitere Details..."
          />
        </Card>

        {/* Summary */}
        <Card style={{ padding: spacing.md }}>
        <Text style={[typography.h3, { marginBottom: spacing.xs }]}>Zusammenfassung</Text>
          <Text style={{ fontSize: 12 }}>
            <Text style={{ color: colors.gray600 }}>Grund:</Text> {reason === 'other' ? (customReason || 'Sonstiges') : (BLOCK_REASONS.find((r) => r.value === reason)?.label || '')}
          </Text>
          <Text style={{ fontSize: 12 }}>
            <Text style={{ color: colors.gray600 }}>Zeitraum:</Text>{' '}
            <Text style={{ fontWeight: '600' }}>
              {startDate || 'Nicht gewählt'}
              {endDate ? ` bis ${endDate}` : ''}
            </Text>
          </Text>
          {!allDay ? (
            <Text style={{ fontSize: 12 }}>
              <Text style={{ color: colors.gray600 }}>Uhrzeit:</Text>{' '}
              <Text style={{ fontWeight: '600' }}>{startTime} - {endTime}</Text>
            </Text>
          ) : (
            <Text style={{ fontSize: 12 }}>
              <Text style={{ color: colors.gray600 }}>Ganztägig</Text>
            </Text>
          )}
          {repeat && (
            <Text style={{ fontSize: 12 }}>
              <Text style={{ color: colors.gray600 }}>Wiederholt sich:</Text>{' '}
              <Text style={{ fontWeight: '600' }}>
                {repeatFrequency === 'daily' && 'Täglich'}
                {repeatFrequency === 'weekly' && 'Wöchentlich'}
                {repeatFrequency === 'monthly' && 'Monatlich'}
              </Text>
            </Text>
          )}
        </Card>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Button title="Abbrechen" variant="ghost" onPress={navToCalendar} />
          </View>
          <View style={{ flex: 1 }}>
            <Button title="Zeit blockieren" onPress={handleBlock} style={{ backgroundColor: colors.primary }} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}