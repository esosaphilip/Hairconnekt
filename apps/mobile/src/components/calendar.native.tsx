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
  markedDates?: Record<string, { dots?: Array<{ color: string }> }>;
};

export function Calendar(props: CalendarProps) {
  const { selected, onSelect, disabledDate, markedDates } = props;
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

  const toDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
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

              const y = d.getFullYear();
              const m = String(d.getMonth() + 1).padStart(2, '0');
              const dayStr = String(d.getDate()).padStart(2, '0');
              const dateKey = `${y}-${m}-${dayStr}`;
              const marks = markedDates?.[dateKey];

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
                  {marks?.dots && marks.dots.length > 0 && (
                    <View style={styles.dotsRow}>
                      {marks.dots.slice(0, 3).map((dot, i) => (
                        <View key={i} style={[styles.dot, { backgroundColor: dot.color }]} />
                      ))}
                    </View>
                  )}
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
  container: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  navBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  navText: {
    fontSize: 18,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 6,
  },
  weekday: {
    width: 32,
    textAlign: 'center',
    fontSize: 12,
    color: '#6B7280',
  },
  weeks: {
    gap: 6,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCell: {
    width: 32,
    height: 40, // Increased to accommodate dots
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  blank: {
    backgroundColor: 'transparent',
    height: 32, // Keep blank cells consistent with original if possible, or just use 40
  },
  daySelected: {
    backgroundColor: '#8B4513',
  },
  dayDisabled: {
    opacity: 0.4,
  },
  dayText: {
    fontSize: 14,
    color: '#1F2937',
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dayTextDisabled: {
    color: '#6B7280',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    gap: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});


export default Calendar;