import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';

// Replaced web imports with assumed custom/community React Native components
import { useNavigation } from '@react-navigation/native';
import Card from '../../components/Card';
import Button from '../../components/Button';
import IconButton from '../../components/IconButton';
import Icon from '../../components/Icon';
import { COLORS, SPACING, FONT_SIZES } from '../../theme/tokens';
import { providersApi } from '../../services/providers';
import { getProviderAppointments } from '@/api/appointments';

// Screen width for responsive layout
const screenWidth = Dimensions.get('window').width;

type MonthlyDatum = { month: string; revenue: number; appointments: number; newClients: number };
type TopServiceDatum = { name: string; bookings: number; revenue: number; growth: number };
type PeakHourDatum = { hour: string; bookings: number };
const monthLabels = ['Jan','Feb','Mar','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];

// --- Main Component ---
export function ProviderAnalyticsScreen() {
  const navigation = useNavigation();
  const [period, setPeriod] = useState("month");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  type DashboardStats = { weekEarningsCents?: number; todayCount?: number; reviewCount?: number; ratingAverage?: number };
  type Dashboard = { stats?: DashboardStats } | null;
  const [dashboard, setDashboard] = useState<Dashboard>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyDatum[]>([]);
  const [topServices, setTopServices] = useState<TopServiceDatum[]>([]);
  const [peakHours, setPeakHours] = useState<PeakHourDatum[]>([]);

  const maxRevenue = Math.max(0, ...monthlyData.map(d => d.revenue));
  const maxBookings = Math.max(0, ...peakHours.map(d => d.bookings));
  
  // Max revenue for top services is assumed to be the highest revenue item (14820)
  const maxServiceRevenue = 14820; 

  const handleDownload = () => {};

  // Helper: format cents to EUR string
  const formatCurrency = useMemo(() => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }), []);

  useEffect(() => {
    let active = true;
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await providersApi.getDashboard();
        if (active) setDashboard((data as Dashboard) || null);
      } catch (e) {
        console.error('Failed to load dashboard', e);
        let msg = 'Fehler beim Laden der Statistiken';
        if (typeof e === 'object' && e !== null && 'message' in (e as Record<string, unknown>)) {
          const m = (e as Record<string, unknown>).message;
          if (typeof m === 'string') msg = m;
        }
        if (active) setError(msg);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchDashboard();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getProviderAppointments('completed');
        const items = res.items || [];
        const byMonth: Record<string, { revenue: number; appointments: number; clients: Set<string> }> = {};
        const serviceMap: Record<string, { bookings: number; revenue: number }> = {};
        const hourBuckets: Record<string, number> = {};
        items.forEach((a) => {
          const d = new Date((a.appointmentDate || '') + 'T' + (a.startTime || '00:00:00'));
          const m = monthLabels[d.getMonth()] || '';
          const revenue = (a.totalPriceCents || 0) / 100;
          byMonth[m] = byMonth[m] || { revenue: 0, appointments: 0, clients: new Set<string>() };
          byMonth[m].revenue += revenue;
          byMonth[m].appointments += 1;
          const cname = a.client?.name || '';
          if (cname) byMonth[m].clients.add(cname);
          (a.services || []).forEach((s) => {
            const key = s.name || 'Service';
            serviceMap[key] = serviceMap[key] || { bookings: 0, revenue: 0 };
            serviceMap[key].bookings += 1;
            serviceMap[key].revenue += revenue;
          });
          const hour = d.getHours();
          const bucket = hour < 11 ? '9-11' : hour < 13 ? '11-13' : hour < 15 ? '13-15' : hour < 17 ? '15-17' : hour < 19 ? '17-19' : '19-21';
          hourBuckets[bucket] = (hourBuckets[bucket] || 0) + 1;
        });
        const monthly = monthLabels.map((ml) => ({ month: ml, revenue: byMonth[ml]?.revenue || 0, appointments: byMonth[ml]?.appointments || 0, newClients: byMonth[ml]?.clients.size || 0 })).filter((x) => x.revenue > 0 || x.appointments > 0);
        const top = Object.entries(serviceMap).map(([name, v]) => ({ name, bookings: v.bookings, revenue: v.revenue, growth: 0 })).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
        const peaks = Object.entries(hourBuckets).map(([hour, bookings]) => ({ hour, bookings })).sort((a, b) => a.hour.localeCompare(b.hour));
        if (mounted) {
          setMonthlyData(monthly);
          setTopServices(top);
          setPeakHours(peaks);
        }
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <SafeAreaView style={styles.flexContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <IconButton name="arrow-left" onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Statistiken & Berichte</Text>
          <IconButton name="download" onPress={handleDownload} />
        </View>
        {loading && (
          <Text style={{ marginTop: SPACING.xs, color: COLORS.textSecondary }}>Lade Daten…</Text>
        )}
        {!!error && (
          <Text style={{ marginTop: SPACING.xs, color: COLORS.danger }}>Fehler: {error}</Text>
        )}
      </View>

      {/* Period Selector (Fixed underneath the header) */}
      <View style={styles.periodSelectorContainer}>
        <View style={styles.periodSelector}>
          {["Woche", "Monat", "Jahr"].map((p) => {
            const key = p.toLowerCase();
            return (
              <Button
                key={key}
                title={p}
                size="sm"
                variant={period === key ? "default" : "outline"}
                onPress={() => setPeriod(key)}
                style={period === key ? styles.activeButton : styles.inactiveButton}
              />
            );
          })}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Key Metrics (connected to backend where available) */}
        <View style={styles.metricsGrid}>
          <Card style={styles.metricCard}>
            <View style={styles.metricRow}>
              <Icon name="euro" size={20} color={COLORS.success} />
              <Text style={styles.metricLabel}>Umsatz</Text>
            </View>
            <Text style={styles.metricValue}>
              {dashboard?.stats?.weekEarningsCents != null
                ? formatCurrency.format((dashboard.stats.weekEarningsCents || 0) / 100)
                : "€4,100"}
            </Text>
            <View style={styles.metricTrendRow}>
              <Icon name="trending-up" size={12} color={COLORS.success} />
              <Text style={styles.trendTextSuccess}>+8% vs. letzter Monat</Text>
            </View>
          </Card>

          <Card style={styles.metricCard}>
            <View style={styles.metricRow}>
              <Icon name="calendar" size={20} color={COLORS.infoText} />
              <Text style={styles.metricLabel}>Heutige Termine</Text>
            </View>
            <Text style={styles.metricValue}>
              {dashboard?.stats?.todayCount != null ? String(dashboard.stats.todayCount) : '52'}
            </Text>
            <View style={styles.metricTrendRow}>
              <Icon name="trending-up" size={12} color={COLORS.success} />
              <Text style={styles.trendTextSuccess}>+5 vs. letzter Monat</Text>
            </View>
          </Card>

          <Card style={styles.metricCard}>
            <View style={styles.metricRow}>
              <Icon name="message-square" size={20} color={COLORS.purple} />
              <Text style={styles.metricLabel}>Bewertungen</Text>
            </View>
            <Text style={styles.metricValue}>
              {dashboard?.stats?.reviewCount != null ? String(dashboard.stats.reviewCount) : '20'}
            </Text>
            <View style={styles.metricTrendRow}>
              <Icon name="trending-up" size={12} color={COLORS.success} />
              <Text style={styles.trendTextSuccess}>+25%</Text>
            </View>
          </Card>

          <Card style={styles.metricCard}>
            <View style={styles.metricRow}>
              <Icon name="star" size={20} color={COLORS.amber} />
              <Text style={styles.metricLabel}>Bewertung</Text>
            </View>
            <Text style={styles.metricValue}>
              {dashboard?.stats?.ratingAverage != null
                ? `${(dashboard.stats.ratingAverage || 0).toFixed(1)} ★`
                : '4.8 ★'}
            </Text>
            <View style={styles.metricTrendRow}>
              <Text style={styles.trendTextNeutral}>→ Stabil</Text>
            </View>
          </Card>
        </View>

        {/* Revenue Trend (Bar Chart) */}
        <Card style={styles.chartCard}>
          <Text style={styles.cardTitle}>Umsatzentwicklung</Text>
          <View style={styles.barChartContainer}>
            {monthlyData.map((data, index) => (
              <View key={index} style={styles.barColumn}>
                <TouchableOpacity
                    style={[
                      styles.bar,
                      { height: `${(data.revenue / maxRevenue) * 100}%` },
                    ]}
                    onPress={() => {}}
                />
                <Text style={styles.barLabel}>{data.month}</Text>
              </View>
            ))}
          </View>
          
          {/* Trend Summary */}
          <View style={styles.trendSummary}>
            <View style={styles.trendStat}>
              <Text style={styles.trendLabel}>Durchschnitt/Monat</Text>
              <Text style={styles.trendValueSuccess}>€3,542</Text>
            </View>
            <View style={styles.trendStatRight}>
              <Text style={styles.trendLabel}>Trend</Text>
              <View style={styles.trendRow}>
                <Icon name="trending-up" size={16} color={COLORS.success} />
                <Text style={styles.trendValueSuccess}>+12%</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Top Services */}
        <Card style={styles.chartCard}>
          <Text style={styles.cardTitle}>Beliebteste Services</Text>
          <View style={styles.serviceList}>
            {topServices.map((service, index) => (
              <View key={index} style={styles.serviceItem}>
                <View style={styles.serviceDetails}>
                  <View style={styles.serviceNameRow}>
                      <Text style={styles.serviceName}>{service.name}</Text>
                      <Text style={styles.serviceBookings}>{service.bookings} Buchungen</Text>
                  </View>
                  <View style={styles.serviceRevenueRow}>
                    <Text style={styles.serviceRevenue}>€{service.revenue.toLocaleString('de-DE')}</Text>
                    <View
                      style={service.growth >= 0 ? styles.trendRowSuccess : styles.trendRowDanger}
                    >
                      <Icon name={service.growth >= 0 ? "trending-up" : "trending-down"} size={12} color={service.growth >= 0 ? COLORS.success : COLORS.danger} />
                      <Text style={service.growth >= 0 ? styles.trendTextSuccess : styles.trendTextDanger}>
                          {Math.abs(service.growth)}%
                      </Text>
                    </View>
                  </View>
                </View>
                {/* Revenue Bar */}
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${(service.revenue / (Math.max(...topServices.map(s=>s.revenue)) || 1)) * 100}%` },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Peak Hours (Horizontal Bar Chart) */}
        <Card style={styles.chartCard}>
          <View style={styles.peakHoursTitleRow}>
            <Icon name="clock" size={20} color={COLORS.textSecondary} />
            <Text style={styles.cardTitle}>Stoßzeiten</Text>
          </View>
          <View style={styles.peakHoursList}>
            {peakHours.map((hour, index) => (
              <View key={index} style={styles.peakHourItem}>
                <Text style={styles.peakHourLabel}>{hour.hour} Uhr</Text>
                <View style={styles.peakHourBarBackground}>
                  <View
                    style={[
                      styles.peakHourBarFill,
                      { width: `${(hour.bookings / maxBookings) * 100}%` },
                    ]}
                  >
                    <Text style={styles.peakHourCount}>{hour.bookings}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Performance Metrics */}
        <Card style={styles.chartCard}>
          <Text style={styles.cardTitle}>Leistungskennzahlen</Text>
          <View style={styles.kpiList}>
            {[
              { label: "Annahmerate", value: "98%", trend: "+2%", color: COLORS.success },
              { label: "Stornierungsrate", value: "2%", trend: "-1%", color: COLORS.success },
              { label: "Wiederholungsrate", value: "72%", trend: "+5%", color: COLORS.primary },
              { label: "Ø Reaktionszeit", value: "2 Std.", trend: "→ Stabil", color: COLORS.text },
              { label: "Durchschn. Buchungswert", value: "€79", trend: "+3%", color: COLORS.primary },
            ].map((kpi, index) => (
              <View key={index} style={[styles.kpiItem, index < 4 && styles.kpiSeparator]}>
                <Text style={styles.kpiLabel}>{kpi.label}</Text>
                <View style={styles.kpiValueContainer}>
                  <Text style={[styles.kpiValue, { color: kpi.color }]}>{kpi.value}</Text>
                  <Text style={kpi.trend === '→ Stabil' ? styles.trendTextNeutral : kpi.trend.includes('+') ? styles.trendTextSuccess : styles.trendTextDanger}>{kpi.trend}</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Client Demographics */}
        <Card style={styles.chartCard}>
          <Text style={styles.cardTitle}>Kundensegmente</Text>
          <View style={styles.demographicList}>
            {[
              { label: "Neue Kunden", percent: 28, color: COLORS.infoText },
              { label: "Stammkunden", percent: 52, color: COLORS.success },
              { label: "Inaktiv (>3 Monate)", percent: 20, color: COLORS.border },
            ].map((segment, index) => (
              <View key={index} style={styles.demographicItem}>
                <View style={styles.segmentTextRow}>
                  <Text style={styles.segmentLabel}>{segment.label}</Text>
                  <Text style={styles.segmentLabel}>{segment.percent}%</Text>
                </View>
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${segment.percent}%`, backgroundColor: segment.color },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}


// --- React Native Stylesheet ---
const styles = StyleSheet.create({
  flexContainer: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  // --- Header Styles ---
  header: {
    backgroundColor: COLORS.white,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    elevation: 2,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    zIndex: 10,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: FONT_SIZES.h4 || 18,
    fontWeight: 'bold',
  },
  // --- Period Selector ---
  periodSelector: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  periodSelectorContainer: {
    backgroundColor: COLORS.white,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    paddingBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  activeButton: {
    backgroundColor: COLORS.primary || '#8B4513',
    borderColor: COLORS.primary || '#8B4513',
  },
  inactiveButton: {
    borderColor: COLORS.border || '#E5E7EB',
    backgroundColor: COLORS.white,
  },
  // --- Scroll Content & Metrics Grid ---
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  metricCard: {
    width: (screenWidth - SPACING.md * 2 - SPACING.sm) / 2,
    padding: SPACING.md,
  },
  metricRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  metricLabel: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.textSecondary,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: SPACING.xs / 2,
  },
  metricTrendRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.xs / 2,
  },
  trendTextSuccess: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.success,
  },
  trendTextNeutral: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.textSecondary,
  },
  trendTextDanger: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.danger,
  },
  // --- Chart Cards ---
  chartCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: FONT_SIZES.h5 || 16,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  // --- Revenue Bar Chart ---
  barChartContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: SPACING.xs,
    height: 192,
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    width: '100%',
  },
  barLabel: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  trendSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  trendStat: {
    // Left stat container
  },
  trendStatRight: {
    alignItems: 'flex-end',
  },
  trendLabel: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.textSecondary,
  },
  trendValueSuccess: {
    fontSize: FONT_SIZES.h5 || 16,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  trendRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.xs / 2,
  },
  // --- Top Services ---
  serviceList: {
    gap: SPACING.md,
  },
  serviceItem: {
    gap: SPACING.xs,
  },
  serviceDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
  },
  serviceNameRow: {
      // Left side (name and bookings)
      flex: 1,
  },
  serviceBookings: {
      fontSize: FONT_SIZES.small || 12,
      color: COLORS.textSecondary,
  },
  serviceRevenueRow: {
      // Right side (revenue and trend)
      alignItems: 'flex-end',
  },
  serviceName: {
    fontSize: FONT_SIZES.h5 || 16,
    fontWeight: '600',
  },
  serviceRevenue: {
    fontSize: FONT_SIZES.h5 || 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  trendRowSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs / 2,
  },
  trendRowDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs / 2,
  },
  progressBarBackground: {
    backgroundColor: COLORS.border,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    backgroundColor: COLORS.primary,
    height: '100%',
  },
  // --- Peak Hours ---
  peakHoursTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  peakHoursList: {
    gap: SPACING.sm,
  },
  peakHourItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  peakHourLabel: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.textSecondary,
    width: 60,
  },
  peakHourBarBackground: {
    backgroundColor: COLORS.border,
    flex: 1,
    height: 32,
    borderRadius: 4,
    overflow: 'hidden',
  },
  peakHourBarFill: {
    alignItems: 'flex-end',
    backgroundColor: COLORS.infoText,
    height: '100%',
    justifyContent: 'center',
    paddingRight: SPACING.xs,
  },
  peakHourCount: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.white,
    fontWeight: '500',
  },
  // --- KPI & Demographics List ---
  kpiList: {
    gap: SPACING.xs,
  },
  kpiItem: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: SPACING.sm,
  },
  kpiSeparator: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  kpiLabel: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.textSecondary || '#6B7280',
  },
  kpiValueContainer: {
    alignItems: 'flex-end',
  },
  kpiValue: {
    fontSize: FONT_SIZES.h5 || 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  demographicList: {
    gap: SPACING.md,
  },
  demographicItem: {
    gap: SPACING.xs / 2,
  },
  segmentTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  segmentLabel: {
    fontSize: FONT_SIZES.body || 14,
  },
});
