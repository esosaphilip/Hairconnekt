import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, ScrollView, Pressable, Image, TextInput, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { colors, spacing, radii, typography, COLORS } from '../../theme/tokens';
import { http } from '../../api/http';
import { getProviderAppointments } from '../../api/appointments';
import type { AppointmentListItem as ApiAppointmentListItem, AppointmentServiceItem as ApiAppointmentServiceItem } from '../../api/appointments';

// Types
interface ProviderClientItem {
  id: string;
  name: string;
  image?: string;
  phone?: string;
  appointments: number;
  lastVisitIso?: string;
  totalSpentCents: number;
  isVIP: boolean;
}

// Use API types to keep state consistent with server responses
type AppointmentServiceItem = ApiAppointmentServiceItem;
type AppointmentListItem = ApiAppointmentListItem;

export function ClientDetailScreen() {
  // Derive client ID from the URL hash on web as a placeholder until React Navigation is wired
  const [clientId, setClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [clientItem, setClientItem] = useState<ProviderClientItem | null>(null);
  const [completed, setCompleted] = useState<AppointmentListItem[]>([]);
  const [upcoming, setUpcoming] = useState<AppointmentListItem[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      try {
        const hash = window.location.hash || '';
        const match = hash.match(/provider\/clients\/([^/?#]+)/);
        setClientId(match ? match[1] : null);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;
    async function loadClient() {
      setLoading(true);
      setError(null);
      try {
        const res = await http.get('/providers/clients');
        const items = (res?.data?.items || []) as ProviderClientItem[];
        const item = items.find((c) => c.id === clientId) || null;
        if (!cancelled) setClientItem(item);
      } catch (err: any) {
        const msg = err?.message || 'Fehler beim Laden des Kunden';
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    async function loadAppointments() {
      try {
        const resCompleted = await getProviderAppointments('completed');
        const comp = (resCompleted?.items || []).filter((a) => a.client?.id === clientId);
        const resUpcoming = await getProviderAppointments('upcoming');
        const upc = (resUpcoming?.items || []).filter((a) => a.client?.id === clientId);
        if (!cancelled) {
          setCompleted(comp);
          setUpcoming(upc);
        }
      } catch {
        // best-effort: ignore
      }
    }
    loadClient();
    loadAppointments();
    return () => { cancelled = true; };
  }, [clientId]);

  const handleSaveNotes = () => {
    setIsEditingNotes(false);
    Alert.alert('Gespeichert', 'Notizen gespeichert');
  };

  const handleCall = () => {
    if (clientItem?.phone) {
      if (Platform.OS === 'web') {
        try { window.location.href = `tel:${clientItem.phone}`; } catch {}
      } else {
        Alert.alert('Anrufen', clientItem.phone);
      }
    }
  };

  const handleMessage = () => {
    if (!clientItem?.id) return;
    if (Platform.OS === 'web') {
      try { window.location.hash = `/provider/messages/${clientItem.id}`; } catch {}
    } else {
      console.log('Navigate to provider messages', clientItem.id);
    }
  };

  const goBack = () => {
    if (Platform.OS === 'web') {
      try { window.history.back(); } catch {}
    } else {
      console.log('Navigate back');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray50 }}>
      {/* Header */}
      <View style={{ backgroundColor: colors.white, paddingHorizontal: spacing.md, paddingVertical: spacing.md, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Pressable onPress={goBack} style={{ padding: spacing.xs }} {...(Platform.OS === 'web' ? { accessibilityRole: 'button' } : {})}>
        <Ionicons name={'chevron-back'} size={24} color={colors.gray700} />
          </Pressable>
        <Text style={[typography.h3, { flex: 1 }]}>Kundendetails</Text>
          <Pressable onPress={() => setIsFavorite(!isFavorite)} style={{ padding: spacing.xs }}>
        <Ionicons name={'heart'} size={24} color={isFavorite ? '#FF6B6B' : colors.gray400} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        {loading && (
          <Card style={{ padding: spacing.md }}>
            <Text style={{ fontSize: 12, color: colors.gray600 }}>Lade Kundendaten...</Text>
          </Card>
        )}
        {error && (
          <Card style={{ padding: spacing.md }}>
            <Text style={{ fontSize: 12, color: COLORS.red600 }}>{String(error)}</Text>
          </Card>
        )}

        {/* Client Header */}
        {clientItem && (
          <Card style={{ padding: spacing.lg }}>
            <View style={{ alignItems: 'center', marginBottom: spacing.md }}>
              <View style={{ width: 96, height: 96, borderRadius: 48, overflow: 'hidden', marginBottom: spacing.sm, backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' }}>
                {clientItem.image ? (
                  <Image source={{ uri: clientItem.image }} style={{ width: '100%', height: '100%' }} />
                ) : (
        <Ionicons name={'person-circle-outline'} size={64} color={colors.gray400} />
                )}
              </View>
        <Text style={[typography.h3, { marginBottom: spacing.xs }]}>{clientItem.name}</Text>
              <Text style={{ color: colors.gray600, marginBottom: spacing.sm }}>
                {(() => {
                  const all = [...completed, ...upcoming];
                  const dates = all.map((a: AppointmentListItem) => a.appointmentDate).sort();
                  if (dates.length === 0) return '';
                  const d = new Date(dates[0] + 'T00:00:00');
                  return `Kunde seit ${d.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}`;
                })()}
              </Text>
              {clientItem.isVIP && (
                <View style={{ paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radii.md, backgroundColor: '#f59e0b' }}>
                  <Text style={{ color: colors.white, fontWeight: '600', fontSize: 12 }}>VIP</Text>
                </View>
              )}
            </View>

            {/* Contact Information */}
            <View style={{ rowGap: spacing.xs }}>
              {clientItem.phone && (
                <Pressable onPress={handleCall} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radii.md }} {...(Platform.OS === 'web' ? { accessibilityRole: 'link' } : {})}>
          <Ionicons name={'call-outline'} size={18} color={colors.primary} />
                  <Text>{clientItem.phone}</Text>
                </Pressable>
              )}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm }}>
          <Ionicons name={'mail-outline'} size={18} color={colors.primary} />
                <Text style={{ fontSize: 12, color: colors.gray600 }}>Nicht verfügbar</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Quick Stats */}
        {clientItem && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            <Card style={{ flex: 1, minWidth: '45%', padding: spacing.md, alignItems: 'center' }}>
              <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '700', marginBottom: spacing.xs }}>{clientItem.appointments}</Text>
              <Text style={{ fontSize: 12, color: colors.gray600 }}>Termine</Text>
            </Card>
            <Card style={{ flex: 1, minWidth: '45%', padding: spacing.md, alignItems: 'center' }}>
              <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '700', marginBottom: spacing.xs }}>€{Math.round((clientItem.totalSpentCents || 0) / 100)}</Text>
              <Text style={{ fontSize: 12, color: colors.gray600 }}>Umsatz</Text>
            </Card>
            <Card style={{ flex: 1, minWidth: '45%', padding: spacing.md, alignItems: 'center' }}>
              <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '700', marginBottom: spacing.xs }}>—</Text>
              <Text style={{ fontSize: 12, color: colors.gray600 }}>Bewertung</Text>
            </Card>
            <Card style={{ flex: 1, minWidth: '45%', padding: spacing.md, alignItems: 'center' }}>
        <Ionicons name={'time-outline'} size={20} color={colors.primary} style={{ marginBottom: spacing.xs }} />
              <Text style={{ fontSize: 12, color: colors.gray600 }}>{clientItem.lastVisitIso ? new Date(clientItem.lastVisitIso).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</Text>
            </Card>
          </View>
        )}

        {/* Quick Actions */}
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {clientItem && (
            <View style={{ flex: 1 }}>
              <Button title="Termin" onPress={() => {
                if (Platform.OS === 'web') {
                  try { window.location.hash = `/provider/appointments/create?clientId=${clientItem.id}`; } catch {}
                } else {
                  console.log('Create appointment for', clientItem.id);
                }
              }} style={{ backgroundColor: colors.primary }} textStyle={{ color: colors.white }} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Button title="Nachricht" onPress={handleMessage} variant="ghost" />
          </View>
          <View style={{ flex: 1 }}>
            <Button title="Anrufen" onPress={handleCall} variant="ghost" />
          </View>
        </View>

        {/* Internal Notes */}
        <Card style={{ padding: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Ionicons name={'pricetag-outline'} size={18} color={colors.gray600} />
        <Text style={[typography.h3]}>Meine Notizen</Text>
              <View style={{ paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radii.sm, backgroundColor: colors.gray100 }}>
                <Text style={{ fontSize: 12, color: colors.gray700 }}>Privat</Text>
              </View>
            </View>
            {!isEditingNotes ? (
              <Pressable onPress={() => setIsEditingNotes(true)} style={{ padding: spacing.xs }}>
          <Ionicons name={'create-outline'} size={18} color={colors.primary} />
              </Pressable>
            ) : (
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <Button title="Abbrechen" variant="ghost" onPress={() => setIsEditingNotes(false)} />
                <Button title="Speichern" onPress={handleSaveNotes} style={{ backgroundColor: colors.primary }} textStyle={{ color: colors.white }} />
              </View>
            )}
          </View>

          {isEditingNotes ? (
            <TextInput
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={6}
              style={{ width: '100%', paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.gray200, borderRadius: radii.md, minHeight: 120 }}
              placeholder="Notizen zu diesem Kunden..."
            />
          ) : (
            <View>
              {notes ? (
                <Text style={{ fontSize: 14, color: colors.gray700, lineHeight: 20 }}>{notes}</Text>
              ) : (
                <Text style={{ fontSize: 12, color: colors.gray400, fontStyle: 'italic' }}>Noch keine Notizen</Text>
              )}
            </View>
          )}

          <Text style={{ fontSize: 12, color: colors.gray500, marginTop: spacing.sm }}>Letzte Änderung: vor 3 Tagen</Text>
        </Card>

        {/* Appointment History */}
        <Card style={{ padding: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm }}>
        <Text style={[typography.h3]}>Terminhistorie ({completed.length + upcoming.length})</Text>
            <Pressable onPress={() => {
              if (clientItem?.id) {
                if (Platform.OS === 'web') {
                  try { window.location.hash = `/provider/calendar?clientId=${clientItem.id}`; } catch {}
                } else {
                  console.log('Open calendar with clientId', clientItem.id);
                }
              }
            }}>
              <Text style={{ fontSize: 12, color: colors.primary }}>Alle anzeigen</Text>
            </Pressable>
          </View>

          <View style={{ rowGap: spacing.sm }}>
            {[...completed, ...upcoming]
              .sort((a: AppointmentListItem, b: AppointmentListItem) => (a.appointmentDate > b.appointmentDate ? -1 : a.appointmentDate < b.appointmentDate ? 1 : 0))
              .slice(0, 3)
              .map((apt: AppointmentListItem, idx: number, arr: AppointmentListItem[]) => {
                const dateStr = new Date(apt.appointmentDate + 'T00:00:00').toLocaleDateString('de-DE', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                });
                const serviceSummary = (apt.services || []).map((s: AppointmentServiceItem) => s.name).join(' + ') || '—';
                const priceEuro = Math.round((apt.totalPriceCents || 0) / 100);
                const statusLabel = apt.status === 'COMPLETED' ? 'Abgeschlossen' : apt.status === 'CONFIRMED' ? 'Bestätigt' : apt.status === 'CANCELLED' ? 'Storniert' : 'Ausstehend';
                return (
                  <View key={apt.id}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: '600' }}>{dateStr}</Text>
                        <Text style={{ fontSize: 12, color: colors.gray600 }}>{serviceSummary}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontWeight: '600', color: colors.primary }}>€{priceEuro}</Text>
                        <View style={{ marginTop: 4, paddingHorizontal: spacing.sm, paddingVertical: 2, backgroundColor: colors.gray100, borderRadius: radii.sm }}>
                          <Text style={{ fontSize: 12 }}>{statusLabel}</Text>
                        </View>
                      </View>
                    </View>
                    {apt.id !== arr[arr.length - 1]?.id && (
                      <View style={{ height: 1, backgroundColor: colors.gray200, marginTop: spacing.sm }} />
                    )}
                  </View>
                );
              })}
          </View>

          <View style={{ marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.gray200 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: colors.gray600 }}>Gesamtumsatz:</Text>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.primary }}>€{Math.round(((clientItem?.totalSpentCents || 0) / 100))}</Text>
            </View>
          </View>
        </Card>

        {/* Additional Information */}
        <Card style={{ padding: spacing.md }}>
        <Text style={[typography.h3, { marginBottom: spacing.sm }]}>Zusätzliche Informationen</Text>
          <View style={{ rowGap: spacing.xs }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.gray600 }}>Bevorzugte Zahlungsmethode</Text>
              <Text>Bar</Text>
            </View>
            <View style={{ height: 1, backgroundColor: colors.gray200 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.gray600 }}>Durchschnittliche Dauer</Text>
              <Text>4.5 Stunden</Text>
            </View>
            <View style={{ height: 1, backgroundColor: colors.gray200 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.gray600 }}>Lieblingsservice</Text>
              <Text>Box Braids</Text>
            </View>
            <View style={{ height: 1, backgroundColor: colors.gray200 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.gray600 }}>Stornierungsrate</Text>
              <Text style={{ color: '#16a34a' }}>0% (sehr zuverlässig)</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
