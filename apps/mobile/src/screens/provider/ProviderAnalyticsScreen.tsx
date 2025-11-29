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

// Screen width for responsive layout
const screenWidth = Dimensions.get('window').width;

// --- Mock Data (Replicated) ---
const monthlyData = [
  { month: "Jan", revenue: 2800, appointments: 32, newClients: 8 },
  { month: "Feb", revenue: 3200, appointments: 38, newClients: 12 },
  { month: "Mar", revenue: 2950, appointments: 35, newClients: 10 },
  { month: "Apr", revenue: 3400, appointments: 42, newClients: 15 },
  { month: "Mai", revenue: 3800, appointments: 48, newClients: 18 },
  { month: "Jun", revenue: 4100, appointments: 52, newClients: 20 },
];

const topServices = [
  { name: "Box Braids", bookings: 156, revenue: 14820, growth: 12 },
  { name: "Knotless Braids", bookings: 98, revenue: 10290, growth: 8 },
  { name: "Cornrows", bookings: 87, revenue: 5655, growth: -3 },
  { name: "Senegalese Twists", bookings: 72, revenue: 7920, growth: 15 },
];

const peakHours = [
  { hour: "9-11", bookings: 12 },
  { hour: "11-13", bookings: 18 },
  { hour: "13-15", bookings: 24 },
  { hour: "15-17", bookings: 32 },
  { hour: "17-19", bookings: 28 },
  { hour: "19-21", bookings: 15 },
];

// --- Main Component ---
export function ProviderAnalyticsScreen() {
  const navigation = useNavigation();
  const [period, setPeriod] = useState("month"); // "week" | "month" | "year"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  type DashboardStats = { weekEarningsCents?: number; todayCount?: number; reviewCount?: number; ratingAverage?: number };
  type Dashboard = { stats?: DashboardStats } | null;
  const [dashboard, setDashboard] = useState<Dashboard>(null);

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));
  const maxBookings = Math.max(...peakHours.map(d => d.bookings));
  
  // Max revenue for top services is assumed to be the highest revenue item (14820)
  const maxServiceRevenue = 14820; 

  const handleDownload = () => {
      Alert.alert("Download", "Bericht-Download - Funktion in Entwicklung");
  };

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
                    onPress={() => Alert.alert("Monatsdetails", `Umsatz im ${data.month}: €${data.revenue}\nTermine: ${data.appointments}\nNeue Kunden: ${data.newClients}`)}
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
                      { width: `${(service.revenue / maxServiceRevenue) * 100}%` },
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
  activeButton: {
    backgroundColor: COLORS.primary || '#8B4513',
    borderColor: COLORS.primary || '#8B4513',
  },
  periodSelectorContainer: {
    backgroundColor: COLORS.white,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    paddingBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  inactiveButton: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border || '#E5E7EB',
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
    padding: SPACING.md,
    width: (screenWidth - SPACING.md * 2 - SPACING.sm) / 2,
  },
  metricRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  metricLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.body || 14,
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
    color: COLORS.success,
    fontSize: FONT_SIZES.small || 12,
  },
  trendTextNeutral: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.small || 12,
  },
  trendTextDanger: {
    color: COLORS.danger,
    fontSize: FONT_SIZES.small || 12,
  },
  // --- Chart Cards ---
  chartCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
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
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.small || 12,
    marginTop: SPACING.xs,
  },
  trendSummary: {
    alignItems: 'center',
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.sm,
  },
  trendStat: {
    // Left stat container
  },
  trendStatRight: {
    alignItems: 'flex-end',
  },
  trendLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.body || 14,
  },
  trendValueSuccess: {
    color: COLORS.success,
    fontSize: FONT_SIZES.h5 || 16,
    fontWeight: 'bold',
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
      alignItems: 'flex-start',
      flexDirection: 'row',
      justifyContent: 'space-between',
  },
  serviceNameRow: {
      // Left side (name and bookings)
      flex: 1,
  },
  serviceBookings: {
      color: COLORS.textSecondary,
      fontSize: FONT_SIZES.small || 12,
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
    color: COLORS.primary,
    fontSize: FONT_SIZES.h5 || 16,
    fontWeight: '600',
  },
  trendRowSuccess: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.xs / 2,
  },
  trendRowDanger: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.xs / 2,
  },
  progressBarBackground: {
    backgroundColor: COLORS.border,
    borderRadius: 4,
    height: 8,
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
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.body || 14,
    width: 60,
  },
  peakHourBarBackground: {
    backgroundColor: COLORS.border,
    borderRadius: 4,
    flex: 1,
    height: 32,
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
    color: COLORS.white,
    fontSize: FONT_SIZES.small || 12,
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
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
  },
  kpiLabel: {
    color: COLORS.textSecondary || '#6B7280',
    fontSize: FONT_SIZES.body || 14,
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
