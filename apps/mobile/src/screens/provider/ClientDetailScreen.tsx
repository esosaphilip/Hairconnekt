import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, ScrollView, Pressable, Image, TextInput, Platform, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { colors, spacing, radii, typography, COLORS } from '@/theme/tokens';
import { http } from '@/api/http';
import { providerClientsApi } from '@/api/providerClients';
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
        const detail: any = await providerClientsApi.detail(String(clientId));
        const item: ProviderClientItem | null = detail
          ? {
              id: String(detail.id),
              name: [detail.firstName, detail.lastName].filter(Boolean).join(' ') || String(detail.name || ''),
              image: detail.avatar || undefined,
              phone: detail?.contactInfo?.phone || detail.phone || undefined,
              appointments: Number(detail?.stats?.totalAppointments || 0),
              lastVisitIso: detail?.stats?.lastVisit || undefined,
              totalSpentCents: Math.round(Number(detail?.stats?.totalSpent || 0) * 100),
              isVIP: !!detail?.isVIP,
            }
          : null;
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

  const handleSaveNotes = async () => {
    try {
      if (!clientItem?.id) return;
      await providerClientsApi.patchNotes(clientItem.id, notes || '');
      setIsEditingNotes(false);
      Alert.alert('Gespeichert', 'Notizen gespeichert');
    } catch (e: any) {
      Alert.alert('Fehler', e?.response?.data?.message || e?.message || 'Speichern fehlgeschlagen');
    }
  };

  const toggleVip = async () => {
    try {
      if (!clientItem?.id) return;
      const res = await providerClientsApi.patchVip(clientItem.id, !clientItem.isVIP);
      setClientItem((prev) => (prev ? { ...prev, isVIP: !!res?.isVIP } : prev));
      Alert.alert('Erfolg', res?.message || (res?.isVIP ? 'Als VIP markiert' : 'VIP entfernt'));
    } catch (e: any) {
      Alert.alert('Fehler', e?.response?.data?.message || e?.message || 'VIP-Status ändern fehlgeschlagen');
    }
  };

  const blockClient = async () => {
    try {
      if (!clientItem?.id) return;
      const res = await providerClientsApi.block(clientItem.id, 'Verstoss gegen Richtlinien');
      Alert.alert('Erfolg', res?.message || 'Kunde blockiert');
    } catch (e: any) {
      Alert.alert('Fehler', e?.response?.data?.message || e?.message || 'Blockieren fehlgeschlagen');
    }
  };

  const handleCall = () => {
    if (clientItem?.phone) {
      if (Platform.OS === 'web') {
        try { window.location.href = `tel:${clientItem.phone}`; } catch {}
      } else {
        Alert.alert('Anrufen', String(clientItem.phone));
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
          <Pressable onPress={toggleVip} style={styles.iconButton}>
            <Ionicons name={clientItem?.isVIP ? 'star' : 'star-outline'} size={24} color={clientItem?.isVIP ? colors.amber600 : colors.gray400} />
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
          <View style={styles.flex1Container}>
            <Button title="Blockieren" onPress={blockClient} variant="ghost" />
          </View>
        </View>

        {/* Internal Notes */}
        <Card style={styles.notesCard}>
          <View style={styles.notesHeaderRow}>
            <View style={styles.notesTitleRow}>
              <Ionicons name={'pricetag-outline'} size={18} color={colors.gray600} />
              <Text style={[typography.h3]}>Meine Notizen</Text>
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
  safeArea: { flex: 1, backgroundColor: colors.gray50 },
  headerContainer: { backgroundColor: colors.white, paddingHorizontal: spacing.md, paddingVertical: spacing.md, shadowColor: colors.black, shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconButton: { padding: spacing.xs },
  flex1: { flex: 1 },
  scrollContent: { padding: spacing.md },
  cardPaddingMd: { padding: spacing.md },
  cardPaddingLg: { padding: spacing.lg },
  textSmallGray600: { fontSize: 12, color: colors.gray600 },
  textSmallRed600: { fontSize: 12, color: COLORS.red600 },
  clientHeaderSection: { alignItems: 'center', marginBottom: spacing.md },
  avatarWrapper: { width: 96, height: 96, borderRadius: 48, overflow: 'hidden', marginBottom: spacing.sm, backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' },
  avatarImage: { width: '100%', height: '100%' },
  titleMarginXs: { marginBottom: spacing.xs },
  subtitleGray600: { color: colors.gray600, marginBottom: spacing.sm },
  vipBadge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radii.md, backgroundColor: colors.amber600 },
  vipBadgeText: { color: colors.white, fontWeight: '600', fontSize: 12 },
  rowGapXs: { rowGap: spacing.xs },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radii.md },
  contactRowNoRadius: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm },
  quickStatsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cardStat: { flex: 1, minWidth: '45%', padding: spacing.md, alignItems: 'center' },
  statNumber: { color: colors.primary, fontSize: 18, fontWeight: '700', marginBottom: spacing.xs },
  statLabel: { fontSize: 12, color: colors.gray600 },
  iconTime: { marginBottom: spacing.xs },
  quickActionsRow: { flexDirection: 'row', gap: spacing.sm },
  flex1Container: { flex: 1 },
  primaryButton: { backgroundColor: colors.primary },
  primaryButtonText: { color: colors.white },
  notesCard: { padding: spacing.md },
  notesHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  notesTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  privateChip: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radii.sm, backgroundColor: colors.gray100 },
  privateChipText: { fontSize: 12, color: colors.gray700 },
  notesEditActions: { flexDirection: 'row', gap: spacing.sm },
  textInputNotes: { width: '100%', paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.gray200, borderRadius: radii.md, minHeight: 120 },
  notesText: { fontSize: 14, color: colors.gray700, lineHeight: 20 },
  notesTextEmpty: { fontSize: 12, color: colors.gray400, fontStyle: 'italic' },
  notesUpdatedText: { fontSize: 12, color: colors.gray500, marginTop: spacing.sm },
  historyCard: { padding: spacing.md },
  historyHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  linkText: { fontSize: 12, color: colors.primary },
  historyList: { rowGap: spacing.sm },
  aptRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  aptTitle: { fontWeight: '600' },
  aptSummary: { fontSize: 12, color: colors.gray600 },
  aptRight: { alignItems: 'flex-end' },
  aptPrice: { fontWeight: '600', color: colors.primary },
  statusChip: { marginTop: 4, paddingHorizontal: spacing.sm, paddingVertical: 2, backgroundColor: colors.gray100, borderRadius: radii.sm },
  textSmall: { fontSize: 12 },
  divider: { height: 1, backgroundColor: colors.gray200, marginTop: spacing.sm },
  historyFooter: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.gray200 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 12, color: colors.gray600 },
  totalValue: { fontSize: 16, fontWeight: '700', color: colors.primary },
  additionalCard: { padding: spacing.md },
  sectionTitle: { marginBottom: spacing.sm },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoLabel: { color: colors.gray600 },
  separatorThin: { height: 1, backgroundColor: colors.gray200 },
  cancelRateText: { color: colors.green600 },
});
