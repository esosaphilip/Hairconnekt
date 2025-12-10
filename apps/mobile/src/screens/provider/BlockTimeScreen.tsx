import React, { useState } from 'react';
import { SafeAreaView, View, Text, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { Switch } from 'react-native';
import { colors, spacing, radii, typography } from '../../theme/tokens';
import { http } from '../../api/http';
import { providersApi } from '@/services/providers';

const BLOCK_REASONS: { value: BlockReason; label: string }[] = [
  { value: 'pause', label: 'Pause' },
  { value: 'lunch', label: 'Mittagspause' },
  { value: 'external', label: 'Termin außerhalb' },
  { value: 'vacation', label: 'Urlaub' },
  { value: 'sick', label: 'Krankheit' },
  { value: 'other', label: 'Sonstiges' },
];

const DAYS_OF_WEEK: { value: DayValue; label: string }[] = [
  { value: 'monday', label: 'Mo' },
  { value: 'tuesday', label: 'Di' },
  { value: 'wednesday', label: 'Mi' },
  { value: 'thursday', label: 'Do' },
  { value: 'friday', label: 'Fr' },
  { value: 'saturday', label: 'Sa' },
  { value: 'sunday', label: 'So' },
];

type BlockReason = 'pause' | 'lunch' | 'external' | 'vacation' | 'sick' | 'other';
type RepeatFrequency = 'daily' | 'weekly' | 'monthly';
type DayValue = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
type RepeatEndType = 'never' | 'date' | 'count';

export function BlockTimeScreen() {
  const [reason, setReason] = useState<BlockReason>('vacation');
  const [customReason, setCustomReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [allDay, setAllDay] = useState(true);
  const [repeat, setRepeat] = useState(false);
  const [repeatFrequency, setRepeatFrequency] = useState<RepeatFrequency>('weekly');
  const [repeatDays, setRepeatDays] = useState<DayValue[]>([]);
  const [repeatEndType, setRepeatEndType] = useState<RepeatEndType>('never');
  const [repeatEndDate, setRepeatEndDate] = useState('');
  const [repeatCount, setRepeatCount] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providerId, setProviderId] = useState<string>('');

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const profile: any = await providersApi.getMyProfile();
        const pid = profile?.id || profile?.provider?.id || '';
        if (mounted) setProviderId(pid || '');
      } catch (_) {
        if (mounted) setProviderId('');
      }
    })();
    return () => { mounted = false; };
  }, []);

  const toggleRepeatDay = (day: DayValue) => {
    setRepeatDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const navToCalendar = () => {
    // Navigation back to calendar can be integrated here
  };

  const handleBlock = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!startDate) {
        Alert.alert('Fehler', 'Bitte wähle ein Startdatum.');
        return;
      }
      if (!allDay && (!startTime || !endTime)) {
        Alert.alert('Fehler', 'Bitte wähle Start- und Endzeit.');
        return;
      }

      const payload = {
        providerId,
        reason,
        customReason: reason === 'other' ? customReason : undefined,
        startDate,
        endDate: endDate || startDate,
        startTime: allDay ? undefined : startTime,
        endTime: allDay ? undefined : endTime,
        allDay,
        repeat,
        repeatFrequency: repeat ? repeatFrequency : undefined,
        repeatDays: repeat && repeatFrequency === 'weekly' ? repeatDays : undefined,
        repeatEndType: repeat ? repeatEndType : undefined,
        repeatEndDate: repeat && repeatEndType === 'date' ? repeatEndDate : undefined,
        repeatCount: repeat && repeatEndType === 'count' ? repeatCount : undefined,
        notes,
      };

      try {
        await http.post('/blocked-time', payload);
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Zeit konnte nicht blockiert werden';
        setError(msg);
        Alert.alert('Fehler', String(msg));
        return;
      }
      Alert.alert('Erfolg', 'Zeit wurde erfolgreich blockiert.');
      navToCalendar();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      console.error(err);
      setError(err?.response?.data?.message || err?.message || 'Unbekannter Fehler');
      Alert.alert('Fehler', 'Die Zeit konnte nicht blockiert werden.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray50 }}>
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
        {/* Reason */}
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

        {/* Date & time */}
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

        {/* Repeat */}
        <Card style={{ padding: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: '600' }}>Wiederholung</Text>
            <Switch value={repeat} onValueChange={setRepeat} />
          </View>
          {repeat && (
            <View style={{ marginTop: spacing.sm, rowGap: spacing.sm }}>
              <Text style={{ fontWeight: '600' }}>Häufigkeit</Text>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                {([
                  { value: 'daily', label: 'Täglich' },
                  { value: 'weekly', label: 'Wöchentlich' },
                  { value: 'monthly', label: 'Monatlich' },
                ] as { value: RepeatFrequency; label: string }[]).map((f) => (
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
                  {([
                    { value: 'never', label: 'Nie' },
                    { value: 'date', label: 'Am Datum' },
                    { value: 'count', label: 'Nach X Wiederholungen' },
                  ] as { value: RepeatEndType; label: string }[]).map((opt) => (
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
                  <Input
                    label="Anzahl"
                    value={String(repeatCount)}
                    onChangeText={(t) => {
                      const n = parseInt(t || '1', 10);
                      setRepeatCount(Number.isNaN(n) ? 1 : Math.max(1, n));
                    }}
                    keyboardType="numeric"
                  />
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

        {/* Error message */}
        {error && <Text style={{ color: colors.error, marginTop: spacing.md }}>{error}</Text>}

        {/* Actions */}
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Button title="Abbrechen" variant="ghost" onPress={navToCalendar} />
          </View>
          <View style={{ flex: 1 }}>
            <Button title="Zeit blockieren" onPress={handleBlock} style={{ backgroundColor: colors.primary }} disabled={loading} />
          </View>
        </View>

        {loading && <ActivityIndicator />}
      </ScrollView>
    </SafeAreaView>
  );
}
