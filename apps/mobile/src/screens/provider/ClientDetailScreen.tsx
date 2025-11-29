import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, ScrollView, Pressable, Image, TextInput, Platform, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { colors, spacing, radii, typography, COLORS } from '@/theme/tokens';
import { http } from '@/api/http';
import { getProviderAppointments } from '@/api/appointments';
import type { AppointmentListItem as ApiAppointmentListItem, AppointmentServiceItem as ApiAppointmentServiceItem } from '@/api/appointments';
import { useNavigation } from '@react-navigation/native';

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
  const navigation = useNavigation<any>();
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
        const comp = (resCompleted?.items || []).filter((a) => String(a.client?.name || '') === String(clientItem?.name || ''));
        const resUpcoming = await getProviderAppointments('upcoming');
        const upc = (resUpcoming?.items || []).filter((a) => String(a.client?.name || '') === String(clientItem?.name || ''));
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
      try { navigation.navigate('ChatScreen', { id: clientItem.id }); } catch {}
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
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <Pressable onPress={goBack} style={styles.iconButton} {...(Platform.OS === 'web' ? { accessibilityRole: 'button' } : {})}>
            <Ionicons name={'chevron-back'} size={24} color={colors.gray700} />
          </Pressable>
          <Text style={[typography.h3, styles.flex1]}>Kundendetails</Text>
          <Pressable onPress={() => setIsFavorite(!isFavorite)} style={styles.iconButton}>
            <Ionicons name={'heart'} size={24} color={isFavorite ? colors.secondary : colors.gray400} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading && (
          <Card style={styles.cardPaddingMd}>
            <Text style={styles.textSmallGray600}>Lade Kundendaten...</Text>
          </Card>
        )}
        {error && (
          <Card style={styles.cardPaddingMd}>
            <Text style={styles.textSmallRed600}>{String(error)}</Text>
          </Card>
        )}

        {/* Client Header */}
        {clientItem && (
          <Card style={styles.cardPaddingLg}>
            <View style={styles.clientHeaderSection}>
              <View style={styles.avatarWrapper}>
                {clientItem.image ? (
                  <Image source={{ uri: clientItem.image }} style={styles.avatarImage} />
                ) : (
                  <Ionicons name={'person-circle-outline'} size={64} color={colors.gray400} />
                )}
              </View>
              <Text style={[typography.h3, styles.titleMarginXs]}>{clientItem.name}</Text>
              <Text style={styles.subtitleGray600}>
                {(() => {
                  const all = [...completed, ...upcoming];
                  const dates = all.map((a: AppointmentListItem) => a.appointmentDate).sort();
                  if (dates.length === 0) return '';
                  const d = new Date(dates[0] + 'T00:00:00');
                  return `Kunde seit ${d.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}`;
                })()}
              </Text>
              {clientItem.isVIP && (
                <View style={styles.vipBadge}>
                  <Text style={styles.vipBadgeText}>VIP</Text>
                </View>
              )}
            </View>

            {/* Contact Information */}
            <View style={styles.rowGapXs}>
              {clientItem.phone && (
                <Pressable onPress={handleCall} style={styles.contactRow} {...(Platform.OS === 'web' ? { accessibilityRole: 'link' } : {})}>
                  <Ionicons name={'call-outline'} size={18} color={colors.primary} />
                  <Text>{clientItem.phone}</Text>
                </Pressable>
              )}
              <View style={styles.contactRowNoRadius}>
                  <Ionicons name={'mail-outline'} size={18} color={colors.primary} />
                <Text style={styles.textSmallGray600}>Nicht verfügbar</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Quick Stats */}
        {clientItem && (
          <View style={styles.quickStatsRow}>
            <Card style={styles.cardStat}>
              <Text style={styles.statNumber}>{clientItem.appointments}</Text>
              <Text style={styles.statLabel}>Termine</Text>
            </Card>
            <Card style={styles.cardStat}>
              <Text style={styles.statNumber}>€{Math.round((clientItem.totalSpentCents || 0) / 100)}</Text>
              <Text style={styles.statLabel}>Umsatz</Text>
            </Card>
            <Card style={styles.cardStat}>
              <Text style={styles.statNumber}>—</Text>
              <Text style={styles.statLabel}>Bewertung</Text>
            </Card>
            <Card style={styles.cardStat}>
              <Ionicons name={'time-outline'} size={20} color={colors.primary} style={styles.iconTime} />
              <Text style={styles.statLabel}>{clientItem.lastVisitIso ? new Date(clientItem.lastVisitIso).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</Text>
            </Card>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActionsRow}>
          {clientItem && (
            <View style={styles.flex1Container}>
              <Button title="Termin" onPress={() => {
                if (Platform.OS === 'web') {
                  try { window.location.hash = `/provider/appointments/create?clientId=${clientItem.id}`; } catch {}
                } else {
                  console.log('Create appointment for', clientItem.id);
                }
              }} style={styles.primaryButton} textStyle={styles.primaryButtonText} />
            </View>
          )}
          <View style={styles.flex1Container}>
            <Button title="Nachricht" onPress={handleMessage} variant="ghost" />
          </View>
          <View style={styles.flex1Container}>
            <Button title="Anrufen" onPress={handleCall} variant="ghost" />
          </View>
        </View>

        {/* Internal Notes */}
        <Card style={styles.notesCard}>
          <View style={styles.notesHeaderRow}>
            <View style={styles.notesTitleRow}>
              <Ionicons name={'pricetag-outline'} size={18} color={colors.gray600} />
              <Text style={typography.h3}>Meine Notizen</Text>
              <View style={styles.privateChip}>
                <Text style={styles.privateChipText}>Privat</Text>
              </View>
            </View>
            {!isEditingNotes ? (
              <Pressable onPress={() => setIsEditingNotes(true)} style={styles.iconButton}>
                <Ionicons name={'create-outline'} size={18} color={colors.primary} />
              </Pressable>
            ) : (
              <View style={styles.notesEditActions}>
                <Button title="Abbrechen" variant="ghost" onPress={() => setIsEditingNotes(false)} />
                <Button title="Speichern" onPress={handleSaveNotes} style={styles.primaryButton} textStyle={styles.primaryButtonText} />
              </View>
            )}
          </View>

          {isEditingNotes ? (
            <TextInput
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={6}
              style={styles.textInputNotes}
              placeholder="Notizen zu diesem Kunden..."
            />
          ) : (
            <View>
              {notes ? (
                <Text style={styles.notesText}>{notes}</Text>
              ) : (
                <Text style={styles.notesTextEmpty}>Noch keine Notizen</Text>
              )}
            </View>
          )}

          <Text style={styles.notesUpdatedText}>Letzte Änderung: vor 3 Tagen</Text>
        </Card>

        {/* Appointment History */}
        <Card style={styles.historyCard}>
          <View style={styles.historyHeaderRow}>
            <Text style={typography.h3}>Terminhistorie ({completed.length + upcoming.length})</Text>
            <Pressable onPress={() => {
              if (clientItem?.id) {
                if (Platform.OS === 'web') {
                  try { window.location.hash = `/provider/calendar?clientId=${clientItem.id}`; } catch {}
                } else {
                  console.log('Open calendar with clientId', clientItem.id);
                }
              }
            }}>
              <Text style={styles.linkText}>Alle anzeigen</Text>
            </Pressable>
          </View>

          <View style={styles.historyList}>
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
                    <View style={styles.aptRow}>
                      <View style={styles.flex1Container}>
                        <Text style={styles.aptTitle}>{dateStr}</Text>
                        <Text style={styles.aptSummary}>{serviceSummary}</Text>
                      </View>
                      <View style={styles.aptRight}>
                        <Text style={styles.aptPrice}>€{priceEuro}</Text>
                        <View style={styles.statusChip}>
                          <Text style={styles.textSmall}>{statusLabel}</Text>
                        </View>
                      </View>
                    </View>
                    {apt.id !== arr[arr.length - 1]?.id && (
                      <View style={styles.divider} />
                    )}
                  </View>
                );
              })}
          </View>

          <View style={styles.historyFooter}>
            <View style={styles.footerRow}>
              <Text style={styles.totalLabel}>Gesamtumsatz:</Text>
              <Text style={styles.totalValue}>€{Math.round(((clientItem?.totalSpentCents || 0) / 100))}</Text>
            </View>
          </View>
        </Card>

        {/* Additional Information */}
        <Card style={styles.additionalCard}>
          <Text style={[typography.h3, styles.sectionTitle]}>Zusätzliche Informationen</Text>
          <View style={styles.rowGapXs}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Bevorzugte Zahlungsmethode</Text>
              <Text>Bar</Text>
            </View>
            <View style={styles.separatorThin} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Durchschnittliche Dauer</Text>
              <Text>4.5 Stunden</Text>
            </View>
            <View style={styles.separatorThin} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Lieblingsservice</Text>
              <Text>Box Braids</Text>
            </View>
            <View style={styles.separatorThin} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Stornierungsrate</Text>
              <Text style={styles.cancelRateText}>0% (sehr zuverlässig)</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  additionalCard: { padding: spacing.md },
  aptPrice: { color: colors.primary, fontWeight: '600' },
  aptRight: { alignItems: 'flex-end' },
  aptRow: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  aptSummary: { color: colors.gray600, fontSize: 12 },
  aptTitle: { fontWeight: '600' },
  avatarImage: { height: '100%', width: '100%' },
  avatarWrapper: { alignItems: 'center', backgroundColor: colors.gray100, borderRadius: 48, height: 96, justifyContent: 'center', marginBottom: spacing.sm, overflow: 'hidden', width: 96 },
  cancelRateText: { color: colors.green600 },
  cardPaddingLg: { padding: spacing.lg },
  cardPaddingMd: { padding: spacing.md },
  cardStat: { alignItems: 'center', flex: 1, minWidth: '45%', padding: spacing.md },
  clientHeaderSection: { alignItems: 'center', marginBottom: spacing.md },
  contactRow: { alignItems: 'center', borderRadius: radii.md, flexDirection: 'row', gap: spacing.sm, padding: spacing.sm },
  contactRowNoRadius: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, padding: spacing.sm },
  divider: { backgroundColor: colors.gray200, height: 1, marginTop: spacing.sm },
  flex1: { flex: 1 },
  flex1Container: { flex: 1 },
  footerRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  headerContainer: { backgroundColor: colors.white, paddingHorizontal: spacing.md, paddingVertical: spacing.md, shadowColor: colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  headerRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  historyCard: { padding: spacing.md },
  historyFooter: { borderTopColor: colors.gray200, borderTopWidth: 1, marginTop: spacing.md, paddingTop: spacing.md },
  historyHeaderRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  historyList: { rowGap: spacing.sm },
  iconButton: { padding: spacing.xs },
  iconTime: { marginBottom: spacing.xs },
  infoLabel: { color: colors.gray600 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  linkText: { color: colors.primary, fontSize: 12 },
  notesCard: { padding: spacing.md },
  notesEditActions: { flexDirection: 'row', gap: spacing.sm },
  notesHeaderRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  notesText: { color: colors.gray700, fontSize: 14, lineHeight: 20 },
  notesTextEmpty: { color: colors.gray400, fontSize: 12, fontStyle: 'italic' },
  notesTitleRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  notesUpdatedText: { color: colors.gray500, fontSize: 12, marginTop: spacing.sm },
  primaryButton: { backgroundColor: colors.primary },
  primaryButtonText: { color: colors.white },
  privateChip: { backgroundColor: colors.gray100, borderRadius: radii.sm, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  privateChipText: { color: colors.gray700, fontSize: 12 },
  quickActionsRow: { flexDirection: 'row', gap: spacing.sm },
  quickStatsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  rowGapXs: { rowGap: spacing.xs },
  safeArea: { backgroundColor: colors.gray50, flex: 1 },
  scrollContent: { padding: spacing.md },
  sectionTitle: { marginBottom: spacing.sm },
  separatorThin: { backgroundColor: colors.gray200, height: 1 },
  statLabel: { color: colors.gray600, fontSize: 12 },
  statNumber: { color: colors.primary, fontSize: 18, fontWeight: '700', marginBottom: spacing.xs },
  statusChip: { backgroundColor: colors.gray100, borderRadius: radii.sm, marginTop: 4, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  subtitleGray600: { color: colors.gray600, marginBottom: spacing.sm },
  textInputNotes: { borderColor: colors.gray200, borderRadius: radii.md, borderWidth: 1, minHeight: 120, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, width: '100%' },
  textSmall: { fontSize: 12 },
  textSmallGray600: { color: colors.gray600, fontSize: 12 },
  textSmallRed600: { color: COLORS.red600, fontSize: 12 },
  titleMarginXs: { marginBottom: spacing.xs },
  totalLabel: { color: colors.gray600, fontSize: 12 },
  totalValue: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  vipBadge: { backgroundColor: colors.amber600, borderRadius: radii.md, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  vipBadgeText: { color: colors.white, fontSize: 12, fontWeight: '600' },
});
