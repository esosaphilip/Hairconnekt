"use client";

import * as React from "react";
import { cn } from "./utils";

/**
 * Lightweight web fallback Calendar component.
 * This avoids external web-only dependencies (lucide-react, react-day-picker)
 * so the Expo web bundler can compile without additional installs.
 *
 * Props (informal):
 * - selected?: Date
 * - onSelect?: (date: Date) => void
 */
function Calendar(_props: any) {
  const props = _props || {};
  const { className } = props;

  const initial = props.selected ?? new Date();
  const [cursor, setCursor] = React.useState(
    new Date(initial.getFullYear(), initial.getMonth(), 1)
  );

  const monthMeta = React.useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
    const weeks: (Date | null)[][] = [];
    for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
    return { year, month, weeks };
  }, [cursor]);

  const monthLabel = React.useMemo(() => {
    return cursor.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
  }, [cursor]);

  const isSameDay = (a?: Date | null, b?: Date | null) => {
    if (!a || !b) return false;
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };

  const prevMonth = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  const nextMonth = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));

  const weekdayLabels = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

  return (
    <div className={cn("p-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button type="button" aria-label="Vorheriger Monat" className="opacity-70 hover:opacity-100" onClick={prevMonth}>
          ‹
        </button>
        <div className="text-sm font-medium">{monthLabel}</div>
        <button type="button" aria-label="Nächster Monat" className="opacity-70 hover:opacity-100" onClick={nextMonth}>
          ›
        </button>
      </div>

      {/* Weekday header */}
      <div className="flex justify-between mb-2 px-1">
        {weekdayLabels.map((w) => (
          <div key={w} className="w-8 text-center text-xs text-gray-500">
            {w}
          </div>
        ))}
      </div>

      {/* Weeks grid */}
      <div className="flex flex-col gap-1">
        {monthMeta.weeks.map((week, wi) => (
          <div key={wi} className="flex justify-between">
            {week.map((d, di) => {
              if (!d) return <div key={di} className="w-8 h-8" />;
              const selectedDay = isSameDay(d, props.selected ?? null);
              return (
                <button
                  key={di}
                  className={cn(
                    "w-8 h-8 rounded-md flex items-center justify-center bg-gray-100",
                    selectedDay && "bg-[#8B4513] text-white font-semibold"
                  )}
                  onClick={() => props.onSelect?.(d)}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export { Calendar };
