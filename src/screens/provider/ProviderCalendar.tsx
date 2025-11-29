import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, View, Text, Pressable, ScrollView, ActivityIndicator, Dimensions, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { rootNavigationRef } from '@/navigation/rootNavigation';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Badge from '@/components/badge';
import Avatar, { AvatarImage, AvatarFallback } from '@/components/avatar';
import { getProviderAppointments } from '@/api/appointments';
import type { AppointmentListItem } from '@/api/appointments';
import { colors, spacing } from '@/theme/tokens';
import { useAuth } from '@/auth/AuthContext';
import { logger } from '@/services/logger';
import { MESSAGES } from '@/constants';
 

const daysOfWeek = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export function ProviderCalendar() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState<number>(today.getDate());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('month');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<AppointmentListItem[]>([]);
  const route = useRoute() as { params?: { targetDate?: string; viewMode?: 'day' | 'week' | 'month' } };
  const authCtx = useAuth();
  const user = authCtx?.user ?? null;
  const tokens = authCtx?.tokens ?? null;
  const authLoading = !!authCtx?.loading;

  const isAuthenticated = !!(tokens && tokens.accessToken);
  const isProviderRole = (user?.userType === 'PROVIDER' || user?.userType === 'BOTH');

  // Derived values for month grid
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed
  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);
  const monthDays = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

useEffect(() => {
    let cancelled = false;
    // Only fetch when authenticated and with provider role
    if (!isAuthenticated || !isProviderRole) {
      setAppointments([]);
      setError(null);
      setLoading(false);
      return () => { cancelled = true; };
    }
    setLoading(true);
    setError(null);
    getProviderAppointments('upcoming')
      .then((res) => {
        if (!cancelled) {
          const items = res && res.items ? res.items : [];
          setAppointments(items);
        }
      })
      .catch((err: unknown) => {
        const error = err as { response?: { status?: number }; message?: string };
        const status = error?.response?.status;
        let msg: string = String(MESSAGES.ERROR.UNKNOWN);
        if (status === 401) msg = 'Bitte melde dich als Anbieter an';
        else if (status === 403) msg = 'Keine Berechtigung: Anbieterrolle erforderlich';
        if (!cancelled) setError(msg);
        logger.error('Failed to fetch provider appointments:', err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isProviderRole]);

  // Initialize from navigation params (targetDate: YYYY-MM-DD, viewMode: 'day'|'week'|'month')
  useEffect(() => {
    const params = route?.params || {};
    if (typeof params?.targetDate === 'string') {
      const d = new Date(params.targetDate + 'T00:00:00');
      if (!Number.isNaN(d.getTime())) {
        setCurrentDate(d);
        setSelectedDate(d.getDate());
      }
    }
    if (params?.viewMode && ['day', 'week', 'month'].includes(params.viewMode)) {
      setViewMode(params.viewMode);
    }
  }, [route]);

  // Group appointments by day-of-month
  const apptsByDay = useMemo(() => {
    const map = new Map<number, AppointmentListItem[]>();
    appointments.forEach((a) => {
      const d = new Date(a.appointmentDate + 'T00:00:00');
      const day = d.getDate();
      if (!map.has(day)) map.set(day, []);
      const list = map.get(day);
      if (list) list.push(a);
    });
    return map;
  }, [appointments]);

  const getAppointmentDots = (day: number): string[] => (apptsByDay.get(day) || []).map((a) => String(a.status || ''));

  const selectedDateLabel = useMemo(() => {
    const d = new Date(year, month, selectedDate);
    return d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
  }, [year, month, selectedDate]);

  const selectedDay = useMemo(() => {
    const list = apptsByDay.get(selectedDate) || [];
    const items = list.map((a) => {
      const start = (a.startTime || '').slice(0, 5);
      const end = (a.endTime || '').slice(0, 5);
      const serviceSummary = (a.services || []).map((s) => s.name).join(' + ');
      const priceEuro = (a.totalPriceCents || 0) / 100;
      return {
        id: a.id,
        time: `${start} - ${end}`,
        client: {
          name: a.client?.name || 'Kunde',
          image: a.client?.avatarUrl || '',
        },
        service: serviceSummary,
        price: `€${priceEuro.toFixed(0)}`,
        status: a.status,
      };
    });
    const totalRevenueEuro = items.reduce((sum, i) => {
      const num = Number(i.price.replace(/[^\d]/g, ''));
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
    return { items, totalRevenueEuro };
  }, [apptsByDay, selectedDate]);

  const statusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return '#22C55E';
      case 'PENDING':
        return '#EAB308';
      case 'IN_PROGRESS':
        return '#3B82F6';
      default:
        return '#D1D5DB';
    }
  };

  // Local component aliases with relaxed typing because our UI primitives are JS modules
  const RNButton = Button;
  const RNCard = Card;
  const RNBadge = Badge;
  const RNAvatar = Avatar;
  const RNAvatarImage = AvatarImage;
  const RNAvatarFallback = AvatarFallback;

  const Header = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerTopRow}>
        <Text style={styles.headerTitle}>Terminkalender</Text>
        <View style={styles.headerActionsRow}>
          <Pressable style={styles.headerIconButton}>
            <Ionicons name="filter" size={20} color={colors.gray700} />
          </Pressable>
          <Pressable style={styles.headerIconButton}>
            <Ionicons name="search" size={20} color={colors.gray700} />
          </Pressable>
          <Pressable style={styles.headerIconButton}>
            <Ionicons name="ellipsis-vertical" size={20} color={colors.gray700} />
          </Pressable>
        </View>
      </View>

      <View style={styles.toggleRow}>
        {[{ label: 'Tag', mode: 'day' }, { label: 'Woche', mode: 'week' }, { label: 'Monat', mode: 'month' }].map(({ label, mode }, idx) => (
          <RNButton
            key={mode}
            title={label}
            onPress={() => setViewMode(mode as 'day' | 'week' | 'month')}
            variant={viewMode === mode ? 'secondary' : 'ghost'}
            style={[styles.toggleButton, idx < 2 && styles.toggleButtonMargin]}
          />
        ))}
      </View>

      <View style={styles.monthNavRow}>
        <Pressable
          onPress={() => {
            const prev = new Date(year, month - 1, 1);
            setCurrentDate(prev);
            setSelectedDate(1);
          }}
          style={styles.headerNavRow}
        >
          <Ionicons name="chevron-back" size={18} color={colors.gray700} />
          <Text style={styles.prevText}>Vorherige</Text>
        </Pressable>
        <Text style={styles.monthLabel}>
          {currentDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
        </Text>
        <Pressable
          onPress={() => {
            const next = new Date(year, month + 1, 1);
            setCurrentDate(next);
            setSelectedDate(1);
          }}
          style={styles.headerNavRow}
        >
          <Text style={styles.nextText}>Nächste</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.gray700} />
        </Pressable>
      </View>
    </View>
  );

  const MonthGrid = () => {
    const screenWidth = Dimensions.get('window').width;
    const containerHPad = 16;
    const gridWidth = screenWidth - containerHPad * 2;
    const cellWidth = gridWidth / 7;
    return (
      <View style={[styles.monthGridContainer, { paddingHorizontal: containerHPad }] }>
        <View style={styles.monthHeaderRow}>
          {daysOfWeek.map((day) => (
            <View key={day} style={[styles.monthDayCell, { width: cellWidth }]}>
              <Text style={styles.monthDayLabel}>{day}</Text>
            </View>
          ))}
        </View>
        <View style={styles.monthDaysWrap}>
          {monthDays.map((day) => {
            const dayAppointments = getAppointmentDots(day);
            const isSelected = day === selectedDate;
            const todayCheck = new Date();
            const isToday = day === todayCheck.getDate() && month === todayCheck.getMonth() && year === todayCheck.getFullYear();
            const bg = isSelected ? { backgroundColor: colors.primary } : isToday ? { borderWidth: 2, borderColor: colors.primary } : { backgroundColor: colors.white };
            const textColor = isSelected ? colors.white : isToday ? colors.primary : colors.gray700;
            return (
              <Pressable key={day} onPress={() => setSelectedDate(day)} style={[styles.monthDayButtonBase, { width: cellWidth }, bg]}>
                <Text style={[styles.monthDayNumber, { color: textColor }]}>{day}</Text>
                <View style={styles.dayDotsRow}>
                  {dayAppointments.slice(0, 3).map((status, idx) => {
                    const dotStatusStyle = status === 'CONFIRMED' ? styles.dayDotConfirmed : status === 'IN_PROGRESS' ? styles.dayDotInProgress : status === 'PENDING' ? styles.dayDotPending : styles.dayDotDefault;
                    return <View key={idx} style={[styles.dayDot, idx < 2 && styles.dayDotMargin, dotStatusStyle]} />;
                  })}
                  {dayAppointments.length > 3 && (
                    <Text style={[styles.dayMoreLabel, { color: textColor }]}>+{dayAppointments.length - 3}</Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  };

  const SelectedDayDetails = () => (
    <View style={styles.selectedDayContainer}>
      <View style={styles.selectedDayHeaderRow}>
        <View>
          <Text style={styles.selectedDayTitle}>{selectedDateLabel}</Text>
          <Text style={styles.selectedDaySubtitle}>
            {(apptsByDay.get(selectedDate)?.length || 0)} Termine · €{selectedDay.totalRevenueEuro} Umsatz
          </Text>
        </View>
        <RNButton
          title="+ Termin"
          variant="secondary"
          onPress={() => rootNavigationRef.current?.navigate('Kalender', { screen: 'CreateAppointmentScreen' })}
        />
      </View>

      <View>
        {loading && (
          <RNCard style={styles.baseCard}>
            <Text style={styles.selectedEmptyLabel}>Lade Termine...</Text>
          </RNCard>
        )}
        {!!error && (
          <RNCard style={styles.baseCard}>
            <Text style={styles.errorLabel}>{error}</Text>
          </RNCard>
        )}

        {!loading && !error && (selectedDay.items.length > 0 ? (
          selectedDay.items.map((apt, idx) => (
            <RNCard key={apt.id} style={[styles.baseCard, idx < selectedDay.items.length - 1 && styles.aptCardMargin]}> 
              <View style={styles.aptRow}>
                <Text style={styles.timeText}>{apt.time}</Text>
                <View style={styles.aptRight}>
                  <View style={styles.aptInfoRow}>
                    <RNAvatar size={40}>
                      {apt.client.image ? (
                        <RNAvatarImage uri={apt.client.image} />
                      ) : (
                        <RNAvatarFallback label={(apt.client.name || 'K').slice(0, 2).toUpperCase()} />
                      )}
                    </RNAvatar>
                    <View style={styles.aptRightInner}>
                      <Text style={styles.aptClientName}>{apt.client.name}</Text>
                      <Text style={styles.aptService}>{apt.service}</Text>
                    </View>
                    <Text style={styles.aptPrice}>{apt.price}</Text>
                  </View>
                  <RNBadge style={{ backgroundColor: statusColor(String(apt.status || '')), borderColor: statusColor(String(apt.status || '')) }}>
                    {apt.status === 'CONFIRMED' ? 'Bestätigt' : apt.status === 'IN_PROGRESS' ? 'Läuft' : 'Ausstehend'}
                  </RNBadge>
                </View>
              </View>
            </RNCard>
          ))
        ) : (
          <RNCard style={styles.baseCard}>
            <Text style={styles.selectedEmptyLabel}>Keine Termine für diesen Tag</Text>
          </RNCard>
        ))}

        {/* Free Slot */}
        <RNCard style={styles.dayFreeCard}>
          <View style={styles.dayFreeRow}>
            <Text style={{ color: colors.gray600 }}>15:00 - 16:00 Verfügbar</Text>
            <RNButton title="Buchen" variant="ghost" onPress={() => rootNavigationRef.current?.navigate('Kalender', { screen: 'CreateAppointmentScreen' })} />
          </View>
        </RNCard>
      </View>
    </View>
  );

  // Auth and role guards
  if (authLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Laden...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerPadded}>
          <Ionicons name="warning-outline" size={48} color={colors.gray400} />
          <Text style={styles.warningText}>Bitte melde dich als Anbieter an</Text>
          <Pressable
            style={styles.primaryButton}
            onPress={() => rootNavigationRef.current?.navigate('Login', { userType: 'provider', returnUrl: '/provider/dashboard' })}
          >
            <Text style={styles.primaryButtonText}>Anmelden</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!isProviderRole) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerPadded}>
          <Ionicons name="information-circle-outline" size={48} color={colors.gray400} />
          <Text style={styles.warningText}>Dieser Bereich ist nur für Anbieter</Text>
          <Pressable
            style={styles.primaryButton}
            onPress={() => rootNavigationRef.current?.navigate('Register', { userType: 'provider' })}
          >
            <Text style={styles.primaryButtonText}>Anbieter werden</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      {loading && appointments.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Termine werden geladen...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerPadded}>
          <Ionicons name="warning-outline" size={48} color={colors.gray400} />
          <Text style={styles.warningText}>
            Verbindungsfehler
          </Text>
          <Pressable
            style={styles.primaryButton}
            onPress={() => {
              if (!isAuthenticated) {
                rootNavigationRef.current?.navigate('Login', { userType: 'provider', returnUrl: '/provider/dashboard' });
                return;
              }
              if (!isProviderRole) {
                rootNavigationRef.current?.navigate('Register', { userType: 'provider' });
                return;
              }
              setError(null);
              setLoading(true);
              getProviderAppointments('upcoming')
                .then((res) => {
                  const items = res && res.items ? res.items : [];
                  setAppointments(items);
                })
                .catch((err) => {
                  const status = err?.response?.status;
                  let msg = 'Fehler beim Laden der Termine';
                  if (status === 401) msg = 'Bitte melde dich als Anbieter an';
                  else if (status === 403) msg = 'Keine Berechtigung: Anbieterrolle erforderlich';
                  setError(msg);
                })
                .finally(() => {
                  setLoading(false);
                });
            }}
          >
            <Text style={styles.primaryButtonText}>Erneut versuchen</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView>
          {viewMode === 'month' && <MonthGrid />}
          <SelectedDayDetails />
          <View style={styles.listSpacer} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

export default ProviderCalendar;

const styles = StyleSheet.create({
  aptCardMargin: { marginBottom: 12 },
  aptClientName: { fontWeight: '700' },
  aptInfoRow: { alignItems: 'center', flexDirection: 'row', marginBottom: 6 },
  aptPrice: { color: colors.primary, fontWeight: '700', marginLeft: 12 },
  aptRight: { flex: 1, marginLeft: 12 },
  aptRightInner: { flex: 1, marginLeft: 12 },
  aptRow: { flexDirection: 'row' },
  aptService: { color: colors.gray600 },
  baseCard: { padding: spacing.md },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  centerPadded: { alignItems: 'center', flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  dayDot: { borderRadius: 3, height: 6, width: 6 },
  dayDotConfirmed: { backgroundColor: colors.success },
  dayDotDefault: { backgroundColor: colors.gray300 },
  dayDotInProgress: { backgroundColor: colors.info },
  dayDotMargin: { marginRight: 4 },
  dayDotPending: { backgroundColor: colors.warning },
  dayDotsRow: { alignItems: 'center', flexDirection: 'row' },
  dayFreeCard: { backgroundColor: colors.gray50, borderStyle: 'dashed', marginTop: 12, padding: spacing.md },
  dayFreeRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  dayMoreLabel: { fontSize: 10 },
  errorLabel: { color: colors.error, fontSize: 14 },
  headerActionsRow: { flexDirection: 'row' },
  headerContainer: { backgroundColor: colors.white, borderBottomColor: colors.gray200, borderBottomWidth: 1, paddingBottom: 12, paddingHorizontal: 16, paddingTop: 16 },
  headerIconButton: { padding: 8 },
  headerNavRow: { alignItems: 'center', flexDirection: 'row' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  headerTopRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  listSpacer: { height: spacing.xl },
  loadingText: { color: colors.gray600, marginTop: 12 },
  monthDayButtonBase: { alignItems: 'center', aspectRatio: 1, borderRadius: 10, justifyContent: 'space-between', padding: 6 },
  monthDayCell: { alignItems: 'center', paddingVertical: 6 },
  monthDayLabel: { color: colors.gray500, fontSize: 12 },
  monthDayNumber: { fontWeight: '600' },
  monthDaysWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  monthGridContainer: { paddingVertical: 16 },
  monthHeaderRow: { flexDirection: 'row', justifyContent: 'space-between' },
  monthLabel: { fontSize: 18, fontWeight: '600' },
  monthNavRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  nextText: { color: colors.gray600, fontSize: 14, marginRight: 6 },
  prevText: { color: colors.gray600, fontSize: 14, marginLeft: 6 },
  primaryButton: { backgroundColor: colors.primary, borderRadius: 8, marginTop: 20, paddingHorizontal: 20, paddingVertical: 12 },
  primaryButtonText: { color: colors.white, fontWeight: '600' },
  safeArea: { backgroundColor: colors.gray50, flex: 1 },
  selectedDayContainer: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16, shadowColor: colors.black, shadowOpacity: 0.05, shadowRadius: 8 },
  selectedDayHeaderRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  selectedDaySubtitle: { color: colors.gray600, fontSize: 14 },
  selectedDayTitle: { fontSize: 18, fontWeight: '700' },
  selectedEmptyLabel: { color: colors.gray600, fontSize: 14 },
  timeText: { color: colors.gray600, paddingTop: 4, width: 80 },
  toggleButton: {},
  toggleButtonMargin: { marginRight: spacing.xs },
  toggleRow: { flexDirection: 'row', marginBottom: 12 },
  warningText: { color: colors.gray700, fontSize: 16, fontWeight: '600', marginTop: 16, textAlign: 'center' },
});
