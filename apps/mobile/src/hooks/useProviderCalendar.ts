import { useState, useEffect, useCallback, useMemo } from 'react';
import { providersApi } from '../services/providers';
import { colors } from '../theme/tokens';

export type MarkedDates = Record<string, { dots?: Array<{ color: string }> }>;

export function useProviderCalendar(year: number, month: number) {
    const [markedDates, setMarkedDates] = useState<MarkedDates>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMonthAppointments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 0);
            const toYMD = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

            const data = await providersApi.getCalendar({
                startDate: toYMD(startDate),
                endDate: toYMD(endDate),
                view: 'month'
            });

            const appointments = Array.isArray(data?.appointments) ? data.appointments : [];
            const newMarked: MarkedDates = {};

            appointments.forEach((apt: any) => {
                const dateKey = apt.date; // Assuming Backend returns YYYY-MM-DD
                if (!newMarked[dateKey]) {
                    newMarked[dateKey] = { dots: [] };
                }

                let color: string = colors.gray300;
                if (apt.status === 'CONFIRMED') color = colors.success || '#22C55E';
                else if (apt.status === 'PENDING') color = colors.warning || '#EAB308';
                else if (apt.status === 'IN_PROGRESS') color = colors.info || '#3B82F6';

                // Limit to 3 dots per day
                if (newMarked[dateKey].dots!.length < 3) {
                    newMarked[dateKey].dots!.push({ color });
                }
            });

            setMarkedDates(newMarked);
        } catch (err: any) {
            console.error('Failed to fetch provider month appointments:', err);
            setError('Fehler beim Laden der Termindaten');
        } finally {
            setLoading(false);
        }
    }, [year, month]);

    useEffect(() => {
        fetchMonthAppointments();
    }, [fetchMonthAppointments]);

    return { markedDates, loading, error, refresh: fetchMonthAppointments };
}
