import { useState, useEffect, useCallback, useMemo } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { http } from '@/api/http';
import { API_CONFIG } from '@/constants';
import { logger } from '@/services/logger';
import { getErrorMessage } from '@/presentation/utils/errorHandler';
import { on } from '@/services/eventBus';
import { useProviderGate } from '@/hooks/useProviderGate';
import { providerAppointmentsApi } from '@/api/providerAppointments';
import { colors } from '@/theme/tokens';

export type NextAppointment = {
    time: string;
    client: string;
    hoursUntil: number;
};

export type Stats = {
    todayCount: number;
    nextAppointment?: NextAppointment | null;
    weekEarningsCents: number;
    ratingAverage: number;
    reviewCount: number;
};

export type Appointment = {
    id: string | number;
    time: string;
    hoursUntil: number;
    status: string;
    client: { id?: string; name: string; image?: string | null };
    service: string;
    priceCents: number;
};

export type Review = {
    id: string | number;
    client: string;
    rating: number;
    date: string;
    text: string;
    hasResponse?: boolean;
};

export type DashboardData = {
    stats: Stats;
    todayAppointments: Appointment[];
    recentReviews: Review[];
};

export function useProviderDashboard() {
    const navigation = useNavigation() as { navigate: (routeName: string, params?: Record<string, unknown>) => void };
    const [isAvailable, setIsAvailable] = useState(true);
    const [profile, setProfile] = useState<{ id?: string; name?: string; avatarUrl?: string | null } | null>(null);
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardData = useCallback(async (isRefresh = false) => {
        if (!isRefresh) setLoading(true);
        let mounted = true;

        try {
            const p = await http.get(API_CONFIG.ENDPOINTS.PROVIDERS.ME);
            if (mounted && p?.data) setProfile(p.data);
        } catch (e) {
            logger.warn('Failed to load provider profile', e);
        }

        try {
            const d = await http.get(API_CONFIG.ENDPOINTS.PROVIDERS.DASHBOARD);
            if (!mounted) return;

            const payload = d?.data;
            if (payload?.success && payload?.data) {
                setDashboard(payload.data);
            } else if (payload?.stats) {
                setDashboard(payload);
            }

            if (!(payload?.data?.todayAppointments?.length > 0) && !(payload?.todayAppointments?.length > 0)) {
                const todayItems = await providerAppointmentsApi.getTodayAppointments();
                if (mounted && todayItems.length > 0) {
                    setDashboard(current => ({
                        ...current!,
                        todayAppointments: todayItems
                    }));
                }
            }
            setError(null);

        } catch (err) {
            try {
                const pid = (profile?.id as string | undefined) || undefined;
                const today = new Date();
                const start = new Date(today.getFullYear(), today.getMonth(), 1);
                const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                const toYMD = (dt: Date) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
                const a = await http.get('/provider/analytics/overview', { params: { provider_id: pid, start_date: toYMD(start), end_date: toYMD(end) } });
                if (mounted) setDashboard(a?.data || null);
            } catch (e) {
                const msg = getErrorMessage(err);
                if (mounted) setError(msg);
                logger.error('Failed to load dashboard:', err);
            }
        } finally {
            if (mounted) {
                setLoading(false);
                setRefreshing(false);
            }
        }
        return () => { mounted = false; };
    }, [profile?.id]);

    useFocusEffect(
        useCallback(() => {
            fetchDashboardData();
        }, [fetchDashboardData])
    );

    useEffect(() => {
        const off = on('appointment_updated', () => {
            fetchDashboardData(true);
        });
        return () => off();
    }, [fetchDashboardData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchDashboardData(true);
    }, [fetchDashboardData]);

    const { status, checked } = useProviderGate();

    useEffect(() => {
        if (!checked) return;
        try {
            if (status === 'pending') {
                navigation.navigate('ProviderPendingApproval');
            } else if (status === 'not_provider') {
                navigation.navigate('ProviderWelcome');
            }
        } catch { }
    }, [status, checked, navigation]);

    const handleToggleOnline = async (v: boolean) => {
        setIsAvailable(v);
        try {
            const providers = await import('@/services/providers');
            const r = await providers.providersApi.setOnlineStatus(v);
            if (r?.isOnline !== undefined) setIsAvailable(!!r.isOnline);
        } catch { }
    };

    const toYMD = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };
    const todayYmd = useMemo(() => toYMD(new Date()), []);

    return {
        profile,
        dashboard,
        loading,
        refreshing,
        error,
        isAvailable,
        onRefresh,
        handleToggleOnline,
        todayYmd,
        navigation
    };
}

export function formatEuro(cents: number) {
    const euros = (cents || 0) / 100;
    try {
        if (typeof Intl !== 'undefined' && Intl.NumberFormat) {
            return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(euros);
        }
    } catch { }
    const value = Math.round((euros + Number.EPSILON));
    return `€${value.toString()}`;
}

export function safeLocaleDateString(date: Date, locale: string, options?: Intl.DateTimeFormatOptions) {
    try {
        return date.toLocaleDateString(locale, options);
    } catch {
        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const y = date.getFullYear();
        return `${d}.${m}.${y}`;
    }
}

export function statusToBadge(status: string) {
    switch ((status || '').toUpperCase()) {
        case 'CONFIRMED':
            return { label: 'Bestätigt', color: colors.green600 };
        case 'PENDING':
            return { label: 'Ausstehend', color: colors.amber600 };
        case 'IN_PROGRESS':
            return { label: 'In Arbeit', color: colors.blue600 };
        case 'COMPLETED':
            return { label: 'Abgeschlossen', color: colors.gray600 };
        case 'CANCELLED':
            return { label: 'Storniert', color: colors.error };
        default:
            return { label: 'Status', color: colors.gray300 };
    }
}
