import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

/**
 * Lightweight, React Native–friendly calendar used on mobile platforms.
 * Props (informal):
 * - selected: Date | undefined
 * - onSelect: (date: Date) => void | undefined
 * - disabledDate: (date: Date) => boolean | undefined
 */

// It intentionally avoids web-only libraries (react-day-picker, lucide-react).
// For web, apps/mobile/src/components/calendar.tsx remains the implementation.
export type CalendarProps = {
  selected?: Date;
  onSelect?: (date: Date) => void;
  disabledDate?: (date: Date) => boolean;
};

export function Calendar(props: CalendarProps) {
  const { selected, onSelect, disabledDate } = props;
  const initial = selected ?? new Date();
  const [cursor, setCursor] = useState(new Date(initial.getFullYear(), initial.getMonth(), 1));

  const monthMeta = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    // leading blanks
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    // month days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(year, month, d));
    }
    // chunk into weeks
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return { year, month, weeks };
  }, [cursor]);

  const monthLabel = useMemo(() => {
    return cursor.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
  }, [cursor]);

  const isSameDay = (a: Date | null | undefined, b: Date | null | undefined) => {
    if (!a || !b) return false;
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  };

  const prevMonth = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  const nextMonth = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));

  const weekdayLabels = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={prevMonth} style={styles.navBtn} accessibilityRole="button" accessibilityLabel="Vorheriger Monat">
          <Text style={styles.navText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <TouchableOpacity onPress={nextMonth} style={styles.navBtn} accessibilityRole="button" accessibilityLabel="Nächster Monat">
          <Text style={styles.navText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Weekday header */}
      <View style={styles.weekHeader}>
        {weekdayLabels.map((w) => (
          <Text key={w} style={styles.weekday}>
            {w}
          </Text>
        ))}
      </View>

      {/* Weeks grid */}
      <View style={styles.weeks}>
        {monthMeta.weeks.map((week, wi) => (
          <View key={wi} style={styles.weekRow}>
            {week.map((d, di) => {
              if (!d) return <View key={di} style={[styles.dayCell, styles.blank]} />;
              const disabled = typeof disabledDate === 'function' ? !!disabledDate(d) : false;
              const selectedDay = isSameDay(d, selected ?? null);
              return (
                <TouchableOpacity
                  key={di}
                  style={[
                    styles.dayCell,
                    selectedDay && styles.daySelected,
                    disabled && styles.dayDisabled,
                  ]}
                  disabled={disabled}
                  onPress={() => onSelect?.(d)}
                >
                  <Text style={[styles.dayText, selectedDay && styles.dayTextSelected, disabled && styles.dayTextDisabled]}>
                    {d.getDate()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  blank: {
    backgroundColor: 'transparent',
  },
  container: {
    padding: 12,
  },
  dayCell: {
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  dayDisabled: {
    opacity: 0.4,
  },
  daySelected: {
    backgroundColor: '#8B4513',
  },
  dayText: {
    color: '#1F2937',
    fontSize: 14,
  },
  dayTextDisabled: {
    color: '#6B7280',
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  navBtn: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  navText: {
    fontSize: 18,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 6,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekday: {
    color: '#6B7280',
    fontSize: 12,
    textAlign: 'center',
    width: 32,
  },
  weeks: {
    gap: 6,
  },
});

export default Calendar;