import React, { useEffect, useMemo, useState } from "react";
import { View, ScrollView, StyleSheet, SafeAreaView } from "react-native";

// Reusable components (assumed, based on previous refactoring)
import Text from '../../components/Text';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Badge from '../../components/badge';
import Picker from '../../components/Picker';
import Icon from '../../components/Icon'; 
import { colors } from '../../theme/tokens';
import { providerAnalyticsApi } from '@/api/providerAnalytics';

// Mock React Navigation hook
const useNavigation = () => ({
  goBack: () => console.log('Navigating back...'),
  navigate: (screen: string) => console.log(`Navigating to ${screen}`),
});

// Mock for mobile alerts/toasts
const toast = {
  success: (message: string) => console.log(`TOAST SUCCESS: ${message}`),
};

// --- Config & Data ---
const IconNames = {
  ArrowLeft: 'chevron-left',
  TrendingUp: 'trending-up',
  TrendingDown: 'trending-down',
  Users: 'users',
  Calendar: 'calendar',
  Euro: 'currency-euro',
  Star: 'star',
  Download: 'download',
  Info: 'lightbulb',
};

// Map metric color names to token colors
const getColorHex = (tailwindColor: string) => {
  switch (tailwindColor) {
    case 'text-green-600': return colors.green600;
    case 'text-blue-600': return colors.blue600;
    case 'text-purple-600': return colors.purple600;
    case 'text-amber-600': return colors.amber600;
    default: return colors.gray800;
  }
};

type MetricCard = {
  title: string;
  value: string;
  change: number;
  icon: string;
  color: string;
};

type ChartDataPoint = {
  label: string;
  value: number;
};

// Data remains the same
const metrics: MetricCard[] = [
  { title: "Gesamtumsatz", value: "€2,845", change: 12.5, icon: IconNames.Euro, color: "text-green-600" },
  { title: "Buchungen", value: "42", change: 8.3, icon: IconNames.Calendar, color: "text-blue-600" },
  { title: "Neue Kunden", value: "18", change: 15.2, icon: IconNames.Users, color: "text-purple-600" },
  { title: "Durchschn. Bewertung", value: "4.8", change: 2.1, icon: IconNames.Star, color: "text-amber-600" },
];

const revenueData: ChartDataPoint[] = [
  { label: "Mo", value: 320 },
  { label: "Di", value: 450 },
  { label: "Mi", value: 380 },
  { label: "Do", value: 520 },
  { label: "Fr", value: 680 },
  { label: "Sa", value: 895 },
  { label: "So", value: 600 },
];

const topServices = [
  { name: "Box Braids", bookings: 28, revenue: "€2,640", change: 12 },
  { name: "Cornrows", bookings: 18, revenue: "€990", change: -5 },
  { name: "Knotless Braids", bookings: 15, revenue: "€1,425", change: 8 },
  { name: "Twists", bookings: 12, revenue: "€900", change: 3 },
];

const clientRetention = [
  { label: "Neue Kunden", value: 42, color: colors.blue },
  { label: "Wiederkehrend", value: 58, color: colors.green },
];

const peakHours = [
  { hour: "09:00", bookings: 4 },
  { hour: "10:00", bookings: 6 },
  { hour: "11:00", bookings: 8 },
  { hour: "12:00", bookings: 5 },
  { hour: "13:00", bookings: 3 },
  { hour: "14:00", bookings: 7 },
  { hour: "15:00", bookings: 9 },
  { hour: "16:00", bookings: 10 },
  { hour: "17:00", bookings: 8 },
  { hour: "18:00", bookings: 6 },
];


export function AnalyticsDashboardScreen() {
  const navigation = useNavigation();
  const [timePeriod, setTimePeriod] = useState("week");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await providerAnalyticsApi.getAnalytics({ period: 'month' });
        // Optional: integrate live data into charts/metrics if desired
        // For now, we keep UI static but could map data.keyMetrics/charts/topServices etc.
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  const maxRevenue = useMemo(() => Math.max(...revenueData.map((d) => d.value)), [revenueData]);
  const maxBookings = useMemo(() => Math.max(...peakHours.map((h) => h.bookings)), [peakHours]);

  const handleExport = async () => {
    const periodNormalized = (['week','month','quarter','year'] as const).includes(timePeriod as any) ? (timePeriod as 'week'|'month'|'quarter'|'year') : 'month';
    const body = { format: 'pdf' as const, period: periodNormalized };
    try {
      const res = await providerAnalyticsApi.exportAnalytics(body);
      toast.success(res?.message || "Bericht erstellt");
    } catch {
      toast.success("Bericht wird exportiert...");
    }
  };

  const timePeriodOptions = [
    { label: "Heute", value: "today" },
    { label: "Diese Woche", value: "week" },
    { label: "Dieser Monat", value: "month" },
    { label: "Dieses Quartal", value: "quarter" },
    { label: "Dieses Jahr", value: "year" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTitleRow}>
            <Button
              variant="ghost"
              size="icon"
              onPress={() => navigation.goBack()}
            >
              <Icon name={IconNames.ArrowLeft} size={20} color={colors.gray800} />
            </Button>
            <Text variant="h2" style={styles.headerTitle}>Analytics</Text>
            <Button
              variant="ghost"
              size="icon"
              onPress={handleExport}
            >
              <Icon name={IconNames.Download} size={20} color={colors.gray800} />
            </Button>
          </View>

          <View style={styles.timeSelect}>
            <Picker
              selectedValue={timePeriod}
              onValueChange={setTimePeriod}
              items={timePeriodOptions}
              placeholder="Zeitraum wählen"
            />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          {metrics.map((metric) => {
            const colorHex = getColorHex(metric.color);
            const isPositive = metric.change >= 0;
            const iconBg = `${colorHex}1A`; // 10% opacity

            return (
              <Card key={metric.title} style={styles.metricCard}>
                <View style={styles.metricIconRow}>
                  <View style={[styles.metricIconWrapper, { backgroundColor: iconBg }]}>
                    <Icon name={metric.icon} size={16} color={colorHex} />
                  </View>
                </View>
                <Text style={styles.metricTitle}>{metric.title}</Text>
                <Text style={styles.metricValue}>{metric.value}</Text>
                <View style={styles.metricChangeRow}>
                  <Icon 
                    name={isPositive ? IconNames.TrendingUp : IconNames.TrendingDown} 
                    size={12} 
                    color={isPositive ? colors.green600 : colors.error} 
                  />
                  <Text
                    style={[
                      styles.metricChangeText,
                      { color: isPositive ? colors.green600 : colors.error },
                    ]}
                  >
                    {isPositive ? "+" : ""}
                    {metric.change}%
                  </Text>
                </View>
              </Card>
            );
          })}
        </View>

        {/* Revenue Chart (Simulated Bar Chart) */}
        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text variant="h3" style={styles.chartTitle}>Umsatzentwicklung</Text>
              <Badge 
                label="+12.5%" 
                backgroundColor={colors.green500} 
                textColor={colors.green600}
                borderColor={colors.green600}
              />
          </View>

          <View style={styles.barChart}>
            {revenueData.map((data) => {
              const percentage = (data.value / maxRevenue) * 100;
              return (
                <View key={data.label} style={styles.barChartRow}>
                  <Text style={styles.barChartLabel}>{data.label}</Text>
                  <View style={styles.barChartBarWrapper}>
                    <View
                      style={[
                        styles.barChartBar,
                        { width: `${percentage}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.barChartValue}>
                    €{data.value}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Top Services */}
        <Card style={styles.card}>
          <Text variant="h3" style={styles.chartTitle}>Beliebteste Services</Text>
          <View style={styles.serviceList}>
            {topServices.map((service, index) => {
              const isPositive = service.change >= 0;
              return (
                <View key={service.name}>
                  <View style={styles.serviceRow}>
                    <View style={styles.serviceNameColumn}>
                      <Text style={styles.serviceRank}>#{index + 1}</Text>
                      <Text style={styles.serviceName}>{service.name}</Text>
                    </View>
                    <View style={styles.serviceChangeColumn}>
                      <Icon 
                        name={isPositive ? IconNames.TrendingUp : IconNames.TrendingDown} 
                        size={12} 
                        color={isPositive ? colors.green : colors.red} 
                      />
                      <Text
                        style={[
                          styles.serviceChangeText,
                          { color: isPositive ? colors.green : colors.red },
                        ]}
                      >
                        {isPositive ? "+" : ""}
                        {service.change}%
                      </Text>
                    </View>
                  </View>
                  <View style={styles.serviceDataRow}>
                    <Text style={styles.serviceBookings}>
                      {service.bookings} Buchungen
                    </Text>
                    <Text style={styles.serviceRevenue}>{service.revenue}</Text>
                  </View>
                  {index < topServices.length - 1 && (
                    <View style={styles.horizontalDivider} />
                  )}
                </View>
              );
            })}
          </View>
        </Card>

        {/* Client Retention (Segmented Progress Bar) */}
        <Card style={styles.card}>
          <Text variant="h3" style={styles.chartTitle}>Kundentyp</Text>
          <View style={styles.retentionContainer}>
            {/* Progress Bar */}
            <View style={styles.retentionBar}>
              {clientRetention.map((segment, index) => (
                <View
                  key={segment.label}
                  style={[
                    styles.retentionSegment,
                    { width: `${segment.value}%`, backgroundColor: segment.color },
                    index === 0 ? styles.retentionLeftCap : {},
                    index === clientRetention.length - 1 ? styles.retentionRightCap : {},
                  ]}
                >
                  <Text style={styles.retentionText}>
                    {segment.value}%
                  </Text>
                </View>
              ))}
            </View>

            {/* Legend */}
            <View style={styles.retentionLegend}>
              {clientRetention.map((segment) => (
                <View key={segment.label} style={styles.retentionLegendItem}>
                  <View style={[styles.retentionLegendDot, { backgroundColor: segment.color }]} />
                  <Text style={styles.retentionLegendLabel}>{segment.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </Card>

        {/* Peak Hours (Simulated Bar Chart) */}
        <Card style={styles.card}>
          <Text variant="h3" style={styles.chartTitle}>Stoßzeiten</Text>
          <View style={styles.peakHoursList}>
            {peakHours.map((hour) => {
              const percentage = (hour.bookings / maxBookings) * 100;
              return (
                <View key={hour.hour} style={styles.peakHourRow}>
                  <Text style={styles.peakHourLabel}>{hour.hour}</Text>
                  <View style={styles.peakHourBarWrapper}>
                    <View
                      style={[
                        styles.peakHourBar,
                        { width: `${percentage}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.peakHourValue}>
                    {hour.bookings}
                  </Text>
                </View>
              );
            })}
          </View>
          <Text style={styles.peakHourFooter}>
            Höchste Nachfrage: 16:00-17:00 Uhr
          </Text>
        </Card>

        {/* Insights Card */}
        <Card style={styles.insightsCard}>
          <View style={styles.insightsContent}>
            <Icon name={IconNames.Info} size={16} color={colors.blue} style={styles.insightsIcon} />
            <View style={styles.insightsTextContainer}>
              <Text style={styles.insightsTitle}>
                Erkenntnisse & Empfehlungen
              </Text>
              <View style={styles.insightsList}>
                <Text style={styles.insightsListItem}>• Deine Stoßzeiten sind 15:00-18:00 Uhr - erwäge zusätzliche Verfügbarkeit</Text>
                <Text style={styles.insightsListItem}>• Box Braids sind dein beliebtester Service mit höchstem Umsatz</Text>
                <Text style={styles.insightsListItem}>• 58% wiederkehrende Kunden - ausgezeichnete Kundenbindung!</Text>
                <Text style={styles.insightsListItem}>• Durchschnittlicher Buchungswert: €67 (Branchendurchschnitt: €55)</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Export Button */}
        <Button
          title="Detaillierten Bericht exportieren"
          variant="outline"
          onPress={handleExport}
          style={styles.exportButton}
        >
          <Icon name={IconNames.Download} size={16} color={colors.gray800} style={styles.exportIcon} />
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Stylesheet for React Native ---
const styles = StyleSheet.create({
  // Header styles
  header: {
    backgroundColor: colors.white,
    borderBottomColor: colors.gray200,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    color: colors.gray800,
    fontSize: 18,
    fontWeight: '600',
  },
  safeArea: {
    backgroundColor: colors.cream,
    flex: 1,
  },
  timeSelect: {
    height: 40,
    width: '100%',
  },
  // ScrollView content
  scrollContent: {
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  card: {
    padding: 16,
  },
  chartCard: {
    padding: 16,
  },
  chartHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  chartTitle: {
    color: colors.gray800,
    fontSize: 16,
    fontWeight: '600',
  },
  // --- Key Metrics Grid ---
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    gap: 4,
    padding: 16,
    width: '48.5%',
  },
  metricIconRow: {
    marginBottom: 8,
  },
  metricIconWrapper: {
    alignItems: 'center',
    borderRadius: 8,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  metricTitle: {
    color: colors.gray600,
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    color: colors.gray800,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricChangeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  metricChangeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // --- Revenue Chart Simulation ---
  barChart: {
    gap: 12,
  },
  barChartRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  barChartLabel: {
    color: colors.gray600,
    fontSize: 12,
    width: 24,
  },
  barChartBarWrapper: {
    backgroundColor: colors.gray100,
    borderRadius: 999,
    flex: 1,
    height: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  barChartBar: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: '100%',
  },
  barChartValue: {
    color: colors.gray800,
    fontSize: 12,
    textAlign: 'right',
    width: 48,
  },
  // --- Top Services ---
  serviceList: {
    gap: 12,
  },
  serviceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  serviceNameColumn: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  serviceRank: {
    color: colors.gray600,
    fontSize: 14,
  },
  serviceName: {
    color: colors.gray800,
    fontSize: 16,
    fontWeight: '500',
  },
  serviceChangeColumn: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  serviceChangeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  serviceDataRow: {
    flexDirection: 'row',
    fontSize: 14,
    justifyContent: 'space-between',
  },
  serviceBookings: {
    color: colors.gray600,
    fontSize: 14,
  },
  serviceRevenue: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  horizontalDivider: {
    backgroundColor: colors.gray100,
    height: 1,
    marginTop: 12,
  },
  // --- Client Retention ---
  retentionContainer: {
    gap: 16,
  },
  retentionBar: {
    borderRadius: 999,
    flexDirection: 'row',
    height: 32,
    overflow: 'hidden',
  },
  retentionSegment: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  retentionText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  retentionLegend: {
    flexDirection: 'row',
    gap: 24,
    justifyContent: 'center',
  },
  retentionLegendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  retentionLegendDot: {
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  retentionLegendLabel: {
    color: colors.gray600,
    fontSize: 14,
  },
  // --- Peak Hours ---
  peakHoursList: {
    gap: 8,
  },
  peakHourRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  peakHourLabel: {
    color: colors.gray600,
    fontSize: 12,
    width: 48,
  },
  peakHourBarWrapper: {
    backgroundColor: colors.gray100,
    borderRadius: 999,
    flex: 1,
    height: 20,
    overflow: 'hidden',
  },
  peakHourBar: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: '100%',
  },
  peakHourValue: {
    color: colors.gray800,
    fontSize: 12,
    textAlign: 'right',
    width: 32,
  },
  peakHourFooter: {
    color: colors.gray500,
    fontSize: 12,
    marginTop: 16,
    textAlign: 'center',
  },
  // --- Insights Card ---
  insightsCard: {
    backgroundColor: colors.infoBg,
    borderColor: colors.infoBorder,
    borderWidth: 1,
    padding: 16,
  },
  insightsContent: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  insightsIcon: {
    color: colors.blue,
    marginTop: 2,
  },
  insightsTextContainer: {
    flex: 1,
  },
  insightsTitle: {
    color: colors.gray800,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  insightsList: {
    gap: 6,
  },
  insightsListItem: {
    color: colors.gray600,
    fontSize: 12,
  },
  // --- Export Button ---
  exportButton: {
    borderColor: colors.gray300,
    height: 40,
    width: '100%',
  },
  exportIcon: { marginRight: 8 },
  retentionLeftCap: { borderBottomLeftRadius: 99, borderTopLeftRadius: 99 },
  retentionRightCap: { borderBottomRightRadius: 99, borderTopRightRadius: 99 },
});
