import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { getProviderAppointments } from '../../services/appointments';
import { Avatar } from '../ui/Avatar';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

const { width } = Dimensions.get('window');
const daysOfWeek = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export function ProviderCalendar() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [viewMode, setViewMode] = useState('month');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const navigation = useNavigation();

  // Derived values for month grid
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);
  const monthDays = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getProviderAppointments('upcoming')
      .then((res) => {
        setAppointments(res?.items || []);
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || err?.message || 'Fehler beim Laden der Termine';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  // Group appointments by day-of-month
  const apptsByDay = useMemo(() => {
    const map = new Map();
    appointments.forEach((a) => {
      const d = new Date(a.appointmentDate + 'T00:00:00');
      const day = d.getDate();
      const list = map.get(day) || [];
      list.push(a);
      map.set(day, list);
    });
    return map;
  }, [appointments]);

  const getAppointmentDots = (day) => {
    return (apptsByDay.get(day) || []).map((a) => a.status);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return '#10B981';
      case 'PENDING': return '#F59E0B';
      case 'IN_PROGRESS': return '#3B82F6';
      default: return '#9CA3AF';
    }
  };

  const selectedDateLabel = useMemo(() => {
    const d = new Date(year, month, selectedDate);
    return d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
  }, [year, month, selectedDate]);

  const selectedDayAppointments = useMemo(() => {
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

  const navigateToPrevMonth = () => {
    const prev = new Date(year, month - 1, 1);
    setCurrentDate(prev);
    setSelectedDate(1);
  };

  const navigateToNextMonth = () => {
    const next = new Date(year, month + 1, 1);
    setCurrentDate(next);
    setSelectedDate(1);
  };

  const renderCalendarDay = (day) => {
    const dayAppointments = getAppointmentDots(day);
    const isSelected = day === selectedDate;
    const todayCheck = new Date();
    const isToday = day === todayCheck.getDate() && 
                   month === todayCheck.getMonth() && 
                   year === todayCheck.getFullYear();

    return (
      <TouchableOpacity
        key={day}
        onPress={() => setSelectedDate(day)}
        style={[
          styles.calendarDay,
          isSelected && styles.selectedDay,
          isToday && !isSelected && styles.todayDay,
        ]}
      >
        <Text style={[
          styles.dayText,
          isSelected && styles.selectedDayText,
          isToday && !isSelected && styles.todayDayText,
        ]}>
          {day}
        </Text>
        {dayAppointments.length > 0 && (
          <View style={styles.appointmentDots}>
            {dayAppointments.slice(0, 3).map((status, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  { backgroundColor: isSelected ? '#FFFFFF' : getStatusColor(status) }
                ]}
              />
            ))}
            {dayAppointments.length > 3 && (
              <Text style={styles.moreDots}>+{dayAppointments.length - 3}</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderAppointmentCard = (apt) => (
    <Card key={apt.id} style={styles.appointmentCard}>
      <View style={styles.appointmentContent}>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{apt.time}</Text>
        </View>
        <View style={styles.appointmentDetails}>
          <View style={styles.clientInfo}>
            <Avatar
              source={{ uri: apt.client.image }}
              size={40}
              style={styles.avatar}
            />
            <View style={styles.clientDetails}>
              <Text style={styles.clientName}>{apt.client.name}</Text>
              <Text style={styles.serviceText}>{apt.service}</Text>
            </View>
            <Text style={styles.priceText}>{apt.price}</Text>
          </View>
          <Badge
            text={apt.status === 'CONFIRMED' ? 'Bestätigt' : 
                  apt.status === 'IN_PROGRESS' ? 'Läuft' : 'Ausstehend'}
            color={getStatusColor(apt.status)}
            style={styles.statusBadge}
          />
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Terminkalender</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconButton}>
                <Icon name="filter" size={20} color="#374151" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Icon name="search" size={20} color="#374151" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Icon name="more-vertical" size={20} color="#374151" />
              </TouchableOpacity>
            </View>
          </View>

          {/* View Toggle */}
          <View style={styles.viewToggle}>
            {['Tag', 'Woche', 'Monat'].map((view, idx) => {
              const mode = ['day', 'week', 'month'][idx];
              const isActive = viewMode === mode;
              return (
                <TouchableOpacity
                  key={view}
                  onPress={() => setViewMode(mode)}
                  style={[styles.viewButton, isActive && styles.activeViewButton]}
                >
                  <Text style={[styles.viewButtonText, isActive && styles.activeViewButtonText]}>
                    {view}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Date Navigator */}
          <View style={styles.dateNavigator}>
            <TouchableOpacity onPress={navigateToPrevMonth} style={styles.navButton}>
              <Icon name="chevron-left" size={16} color="#6B7280" />
              <Text style={styles.navButtonText}>Vorherige</Text>
            </TouchableOpacity>
            <Text style={styles.monthTitle}>
              {currentDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
            </Text>
            <TouchableOpacity onPress={navigateToNextMonth} style={styles.navButton}>
              <Text style={styles.navButtonText}>Nächste</Text>
              <Icon name="chevron-right" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Month View Calendar */}
        {viewMode === 'month' && (
          <View style={styles.calendarContainer}>
            {/* Day Headers */}
            <View style={styles.dayHeaders}>
              {daysOfWeek.map(day => (
                <View key={day} style={styles.dayHeader}>
                  <Text style={styles.dayHeaderText}>{day}</Text>
                </View>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {monthDays.map(renderCalendarDay)}
            </View>
          </View>
        )}

        {/* Selected Day Details */}
        <View style={styles.dayDetails}>
          <View style={styles.dayDetailsHeader}>
            <View>
              <Text style={styles.selectedDateTitle}>{selectedDateLabel}</Text>
              <Text style={styles.dayStats}>
                {apptsByDay.get(selectedDate)?.length || 0} Termine · €{selectedDayAppointments.totalRevenueEuro} Umsatz
              </Text>
            </View>
            <Button
              title="+ Termin"
              onPress={() => navigation.navigate('CreateAppointment')}
              style={styles.addButton}
              textStyle={styles.addButtonText}
            />
          </View>

          {/* Appointments List */}
          <View style={styles.appointmentsList}>
            {loading && (
              <Card style={styles.loadingCard}>
                <ActivityIndicator size="small" color="#8B4513" />
                <Text style={styles.loadingText}>Lade Termine...</Text>
              </Card>
            )}
            {error && (
              <Card style={styles.errorCard}>
                <Text style={styles.errorText}>{error}</Text>
              </Card>
            )}
            {!loading && !error && (
              selectedDayAppointments.items.length > 0 ? (
                selectedDayAppointments.items.map(renderAppointmentCard)
              ) : (
                <Card style={styles.emptyCard}>
                  <Text style={styles.emptyText}>Keine Termine für diesen Tag</Text>
                </Card>
              )
            )}

            {/* Free Slot */}
            <Card style={styles.freeSlotCard}>
              <View style={styles.freeSlotContent}>
                <Text style={styles.freeSlotText}>15:00 - 16:00 Verfügbar</Text>
                <TouchableOpacity style={styles.bookButton}>
                  <Text style={styles.bookButtonText}>Buchen</Text>
                </TouchableOpacity>
              </View>
            </Card>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
    paddingBottom: 80,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  viewToggle: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  viewButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  activeViewButton: {
    backgroundColor: '#8B4513',
    borderColor: '#8B4513',
  },
  viewButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  activeViewButtonText: {
    color: '#FFFFFF',
  },
  dateNavigator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  calendarContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayHeaderText: {
    fontSize: 12,
    color: '#6B7280',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  calendarDay: {
    width: (width - 32 - 24) / 7, // Account for padding and gaps
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  selectedDay: {
    backgroundColor: '#8B4513',
  },
  todayDay: {
    borderWidth: 2,
    borderColor: '#8B4513',
  },
  dayText: {
    fontSize: 14,
    color: '#374151',
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  todayDayText: {
    color: '#8B4513',
  },
  appointmentDots: {
    position: 'absolute',
    bottom: 4,
    flexDirection: 'row',
    gap: 2,
    alignItems: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  moreDots: {
    fontSize: 8,
    color: '#6B7280',
  },
  dayDetails: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dayDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  dayStats: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  appointmentsList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  appointmentCard: {
    padding: 16,
  },
  appointmentContent: {
    flexDirection: 'row',
    gap: 12,
  },
  timeContainer: {
    width: 96,
    paddingTop: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  appointmentDetails: {
    flex: 1,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  serviceText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8B4513',
  },
  statusBadge: {
    alignSelf: 'flex-start',
  },
  loadingCard: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  errorCard: {
    padding: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
  },
  emptyCard: {
    padding: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
  freeSlotCard: {
    padding: 16,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  freeSlotContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  freeSlotText: {
    fontSize: 14,
    color: '#6B7280',
  },
  bookButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  bookButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
});
