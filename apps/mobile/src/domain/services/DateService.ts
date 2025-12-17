import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export const DateService = {
  formatDate: (date: Date | string): string => {
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      return format(d, 'dd. MMM yyyy', { locale: de });
    } catch {
      return '';
    }
  },

  formatTime: (time: string): string => {
    // Assuming HH:mm:ss or HH:mm
    return time.substring(0, 5) + ' Uhr';
  },

  formatDateTime: (date: Date | string, time?: string): string => {
    const dStr = DateService.formatDate(date);
    const tStr = time ? DateService.formatTime(time) : '';
    return `${dStr} ${tStr}`.trim();
  },

  formatWeekdayDateMonth: (date: Date | string): string => {
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      return format(d, 'EEEE, dd. MMMM', { locale: de });
    } catch {
      return '';
    }
  }
};
