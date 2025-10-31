import React, { useState } from 'react';
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
  const navigation: any = useNavigation();
  const [period, setPeriod] = useState("month"); // "week" | "month" | "year"

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));
  const maxBookings = Math.max(...peakHours.map(d => d.bookings));
  
  // Max revenue for top services is assumed to be the highest revenue item (14820)
  const maxServiceRevenue = 14820; 

  const handleDownload = () => {
      Alert.alert("Download", "Bericht-Download - Funktion in Entwicklung");
  };

  return (
    <SafeAreaView style={styles.flexContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <IconButton name="arrow-left" onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Statistiken & Berichte</Text>
          <IconButton name="download" onPress={handleDownload} />
        </View>
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
        
        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <Card style={styles.metricCard}>
            <View style={styles.metricRow}>
              <Icon name="euro" size={20} color={COLORS.success} />
              <Text style={styles.metricLabel}>Umsatz</Text>
            </View>
            <Text style={styles.metricValue}>€4,100</Text>
            <View style={styles.metricTrendRow}>
              <Icon name="trending-up" size={12} color={COLORS.success} />
              <Text style={styles.trendTextSuccess}>+8% vs. letzter Monat</Text>
            </View>
          </Card>

          <Card style={styles.metricCard}>
            <View style={styles.metricRow}>
              <Icon name="calendar" size={20} color={COLORS.infoText} />
              <Text style={styles.metricLabel}>Termine</Text>
            </View>
            <Text style={styles.metricValue}>52</Text>
            <View style={styles.metricTrendRow}>
              <Icon name="trending-up" size={12} color={COLORS.success} />
              <Text style={styles.trendTextSuccess}>+5 vs. letzter Monat</Text>
            </View>
          </Card>

          <Card style={styles.metricCard}>
            <View style={styles.metricRow}>
              <Icon name="users" size={20} color={COLORS.purple} />
              <Text style={styles.metricLabel}>Neue Kunden</Text>
            </View>
            <Text style={styles.metricValue}>20</Text>
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
            <Text style={styles.metricValue}>4.8 ★</Text>
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
    flex: 1,
    backgroundColor: COLORS.background || '#F9FAFB',
  },
  // --- Header Styles ---
  header: {
    backgroundColor: COLORS.white || '#FFFFFF',
    paddingHorizontal: SPACING.md || 16,
    paddingVertical: SPACING.sm || 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border || '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: FONT_SIZES.h4 || 18,
    fontWeight: 'bold',
  },
  // --- Period Selector ---
  periodSelectorContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: SPACING.xs,
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
    padding: SPACING.md || 16,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  metricLabel: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.textSecondary || '#6B7280',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: SPACING.xs / 2,
  },
  metricTrendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs / 2,
  },
  trendTextSuccess: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.success || '#10B981',
  },
  trendTextNeutral: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.textSecondary || '#6B7280',
  },
  trendTextDanger: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.danger || '#EF4444',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.xs,
    height: 192, // h-48
    marginBottom: SPACING.md,
    alignItems: 'flex-end',
  },
  barColumn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    backgroundColor: COLORS.primary || '#8B4513',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barLabel: {
    fontSize: FONT_SIZES.small || 12,
    color: COLORS.textSecondary || '#6B7280',
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
    color: COLORS.textSecondary || '#6B7280',
  },
  trendValueSuccess: {
    fontSize: FONT_SIZES.h5 || 16,
    fontWeight: 'bold',
    color: COLORS.success || '#10B981',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    color: COLORS.primary || '#8B4513',
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
    width: '100%',
    height: 8,
    backgroundColor: COLORS.border || '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary || '#8B4513',
  },
  // --- Peak Hours ---
  peakHoursTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  peakHoursList: {
    gap: SPACING.sm,
  },
  peakHourItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  peakHourLabel: {
    fontSize: FONT_SIZES.body || 14,
    color: COLORS.textSecondary || '#6B7280',
    width: 60,
  },
  peakHourBarBackground: {
    flex: 1,
    height: 32, // h-8
    backgroundColor: COLORS.border || '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  peakHourBarFill: {
    height: '100%',
    backgroundColor: COLORS.infoText || '#3B82F6', // blue-500
    justifyContent: 'center',
    alignItems: 'flex-end',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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