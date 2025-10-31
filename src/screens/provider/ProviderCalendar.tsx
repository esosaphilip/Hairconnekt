import React, { useEffect, useMemo, useState, type ComponentType } from 'react';
import { SafeAreaView, View, Text, Pressable, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { Badge } from '../../components/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/avatar';
import { getProviderAppointments, type AppointmentListItem } from '../../api/appointments';
import { colors, spacing } from '../../theme/tokens';

const daysOfWeek = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export function ProviderCalendar() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState<Date>(today);
  const [selectedDate, setSelectedDate] = useState<number>(today.getDate());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<AppointmentListItem[]>([]);

  // Derived values for month grid
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed
  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);
  const monthDays = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getProviderAppointments('upcoming')
      .then((res) => {
        if (!cancelled) setAppointments((res && (res as any).items) || []);
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || err?.message || 'Fehler beim Laden der Termine';
        if (!cancelled) setError(msg);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Group appointments by day-of-month
  const apptsByDay = useMemo(() => {
    const map = new Map<number, AppointmentListItem[]>();
    appointments.forEach((a) => {
      const d = new Date(a.appointmentDate + 'T00:00:00');
      const day = d.getDate();
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(a);
    });
    return map;
  }, [appointments]);

  const getAppointmentDots = (day: number) => (apptsByDay.get(day) || []).map((a) => a.status);

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
      } as const;
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
  const RNButton = Button as unknown as ComponentType<any>;
  const RNCard = Card as unknown as ComponentType<any>;
  const RNBadge = Badge as unknown as ComponentType<any>;
  const RNAvatar = Avatar as unknown as ComponentType<any>;
  const RNAvatarImage = AvatarImage as unknown as ComponentType<any>;
  const RNAvatarFallback = AvatarFallback as unknown as ComponentType<any>;

  const Header = () => (
    <View style={{ backgroundColor: colors.white, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderColor: '#00000010' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '700' }}>Terminkalender</Text>
        <View style={{ flexDirection: 'row' }}>
          <Pressable style={{ padding: 8 }}>
            <Ionicons name="filter" size={20} color={colors.gray700} />
          </Pressable>
          <Pressable style={{ padding: 8 }}>
            <Ionicons name="search" size={20} color={colors.gray700} />
          </Pressable>
          <Pressable style={{ padding: 8 }}>
            <Ionicons name="ellipsis-vertical" size={20} color={colors.gray700} />
          </Pressable>
        </View>
      </View>

      <View style={{ flexDirection: 'row', marginBottom: 12 }}>
        {[{ label: 'Tag', mode: 'day' as const }, { label: 'Woche', mode: 'week' as const }, { label: 'Monat', mode: 'month' as const }].map(({ label, mode }, idx) => (
          <RNButton
            key={mode}
            title={label}
            onPress={() => setViewMode(mode)}
            variant={viewMode === mode ? 'secondary' : 'ghost'}
            style={{ marginRight: idx < 2 ? 8 : 0 }}
          />
        ))}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable
          onPress={() => {
            const prev = new Date(year, month - 1, 1);
            setCurrentDate(prev);
            setSelectedDate(1);
          }}
          style={{ flexDirection: 'row', alignItems: 'center' }}
        >
          <Ionicons name="chevron-back" size={18} color={colors.gray700} />
          <Text style={{ fontSize: 14, color: colors.gray600, marginLeft: 6 }}>Vorherige</Text>
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>
          {currentDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
        </Text>
        <Pressable
          onPress={() => {
            const next = new Date(year, month + 1, 1);
            setCurrentDate(next);
            setSelectedDate(1);
          }}
          style={{ flexDirection: 'row', alignItems: 'center' }}
        >
          <Text style={{ fontSize: 14, color: colors.gray600, marginRight: 6 }}>Nächste</Text>
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
      <View style={{ paddingHorizontal: containerHPad, paddingVertical: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          {daysOfWeek.map((day) => (
            <View key={day} style={{ width: cellWidth, alignItems: 'center', paddingVertical: 6 }}>
              <Text style={{ fontSize: 12, color: colors.gray500 }}>{day}</Text>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {monthDays.map((day) => {
            const dayAppointments = getAppointmentDots(day);
            const isSelected = day === selectedDate;
            const todayCheck = new Date();
            const isToday = day === todayCheck.getDate() && month === todayCheck.getMonth() && year === todayCheck.getFullYear();
            const baseStyle = {
              width: cellWidth,
              aspectRatio: 1,
              padding: 6,
              borderRadius: 10,
              alignItems: 'center' as const,
              justifyContent: 'space-between' as const,
            };
            const bg = isSelected ? { backgroundColor: colors.primary } : isToday ? { borderWidth: 2, borderColor: colors.primary } : { backgroundColor: colors.white };
            const textColor = isSelected ? colors.white : isToday ? colors.primary : colors.gray700;
            return (
              <Pressable key={day} onPress={() => setSelectedDate(day)} style={[baseStyle, bg]}>
                <Text style={{ color: textColor, fontWeight: '600' }}>{day}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {dayAppointments.slice(0, 3).map((status, idx) => (
                    <View key={idx} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: statusColor(status), marginRight: idx < 2 ? 4 : 0 }} />
                  ))}
                  {dayAppointments.length > 3 && (
                    <Text style={{ fontSize: 10, color: textColor }}>+{dayAppointments.length - 3}</Text>
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
    <View style={{ backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <View>
          <Text style={{ fontSize: 18, fontWeight: '700' }}>{selectedDateLabel}</Text>
          <Text style={{ fontSize: 14, color: colors.gray600 }}>
            {(apptsByDay.get(selectedDate)?.length || 0)} Termine · €{selectedDay.totalRevenueEuro} Umsatz
          </Text>
        </View>
        <RNButton
          title="+ Termin"
          variant="secondary"
          onPress={() => {
            // TODO: wire navigation when available
          }}
        />
      </View>

      <View>
        {loading && (
          <RNCard style={{ padding: spacing.md }}>
            <Text style={{ fontSize: 14, color: colors.gray600 }}>Lade Termine...</Text>
          </RNCard>
        )}
        {!!error && (
          <RNCard style={{ padding: spacing.md }}>
            <Text style={{ fontSize: 14, color: '#991B1B' }}>{error}</Text>
          </RNCard>
        )}

        {!loading && !error && (selectedDay.items.length > 0 ? (
          selectedDay.items.map((apt, idx) => (
            <RNCard key={apt.id} style={{ padding: spacing.md, marginBottom: idx < selectedDay.items.length - 1 ? 12 : 0 }}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ width: 80, color: colors.gray600, paddingTop: 4 }}>{apt.time}</Text>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <RNAvatar size={40}>
                      {apt.client.image ? (
                        <RNAvatarImage uri={apt.client.image} />
                      ) : (
                        <RNAvatarFallback label={(apt.client.name || 'K').slice(0, 2).toUpperCase()} />
                      )}
                    </RNAvatar>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={{ fontWeight: '700' }}>{apt.client.name}</Text>
                      <Text style={{ color: colors.gray600 }}>{apt.service}</Text>
                    </View>
                    <Text style={{ color: colors.primary, fontWeight: '700', marginLeft: 12 }}>{apt.price}</Text>
                  </View>
                  <RNBadge style={{ backgroundColor: statusColor(apt.status), borderColor: statusColor(apt.status) }}>
                    {apt.status === 'CONFIRMED' ? 'Bestätigt' : apt.status === 'IN_PROGRESS' ? 'Läuft' : 'Ausstehend'}
                  </RNBadge>
                </View>
              </View>
            </RNCard>
          ))
        ) : (
          <RNCard style={{ padding: spacing.md }}>
            <Text style={{ fontSize: 14, color: colors.gray600 }}>Keine Termine für diesen Tag</Text>
          </RNCard>
        ))}

        {/* Free Slot */}
        <RNCard style={{ padding: spacing.md, borderStyle: 'dashed', backgroundColor: colors.gray50, marginTop: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.gray600 }}>15:00 - 16:00 Verfügbar</Text>
            <RNButton title="Buchen" variant="ghost" onPress={() => {}} />
          </View>
        </RNCard>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray50 }}>
      <Header />
      {loading && appointments.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator />
        </View>
      ) : (
        <ScrollView>
          {viewMode === 'month' && <MonthGrid />}
          <SelectedDayDetails />
          <View style={{ height: spacing.xl }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

export default ProviderCalendar;