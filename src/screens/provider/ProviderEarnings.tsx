import { useEffect, useState } from "react";
// lucide-react is not available in React Native; using react-native-svg or local SVG instead
// For now, we’ll inline simple text placeholders so the file compiles
const TrendingUp = () => <Text>↗</Text>;
const Download    = () => <Text>↓</Text>;
const Calendar    = () => <Text>📅</Text>;
const CreditCard  = () => <Text>💳</Text>;
const Euro        = () => <Text>€</Text>;
import { useNavigation } from "@react-navigation/native";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from "react-native";
import { getProviderAppointments, AppointmentListItem } from "@/api/appointments";
import { paymentsApi, PLATFORM_FEE_RATE, centsToEuros } from "@/api/payments";

// Minimal inline Card component to replace missing import
type CardProps = { children: React.ReactNode; style?: any };
const Card = ({ children, style }: CardProps) => (
  <View style={[styles.card, style]}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});

// React Native specific styles for this screen
const rnStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  headerAction: {
    padding: 4,
  },

  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },

  labelMuted: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6,
  },
  amountLarge: {
    fontSize: 32,
    fontWeight: '700',
    color: '#8B4513',
    marginBottom: 12,
  },
  amountMedium: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  linkPrimary: {
    color: '#8B4513',
    fontSize: 14,
    fontWeight: '600',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  primaryButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 10,
    borderRadius: 8,
  },
  chipButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginLeft: 8,
  },
  chipActive: {
    backgroundColor: '#8B4513',
    borderColor: '#8B4513',
  },
  chipInactive: {
    backgroundColor: '#FFFFFF',
  },

  chartWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 160,
    marginBottom: 8,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  chartBarContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: '100%',
    backgroundColor: '#8B4513',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  chartDay: {
    fontSize: 12,
    color: '#6B7280',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  trendText: {
    fontSize: 12,
    color: '#16A34A',
  },

  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  itemSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  detailList: {
    marginVertical: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 12,
    color: '#111827',
  },
});

// Minimal inline Button component to replace missing import
type ButtonProps = { children: React.ReactNode; onPress?: () => void; style?: any };
const Button = ({ children, onPress, style }: ButtonProps) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={style}
  >
    <Text style={{ textAlign: "center" }}>{children}</Text>
  </TouchableOpacity>
);
import { Badge } from "../../ui/Badge";

const weeklyData = [
  { day: "Mo", amount: 180, appointments: 2 },
  { day: "Di", amount: 245, appointments: 3 },
  { day: "Mi", amount: 0, appointments: 0 },
  { day: "Do", amount: 320, appointments: 4 },
  { day: "Fr", amount: 280, appointments: 3 },
  { day: "Sa", amount: 540, appointments: 6 },
  { day: "So", amount: 380, appointments: 4 },
];

/**
 * @typedef {Object} TransactionItem
 * @property {string} id
 * @property {string} date
 * @property {string} client
 * @property {string} service
 * @property {number} gross
 * @property {number} fee
 * @property {number} net
 * @property {('paid'|'pending')} status
 */
type TransactionItemTS = { id: string; date: string; client: string; service: string; gross: number; fee: number; net: number; status: 'paid' | 'pending' };
const initialRecentTransactions: TransactionItemTS[] = [];

export function ProviderEarnings() {
  const [period, setPeriod] = useState("week");
  const navigation = useNavigation() as any;
  const navigate = (path: string) => {
    // In a full app, map path to route names; for now, keep compile-safe navigation
    try {
      navigation.navigate(path);
    } catch (e) {
      // noop fallback
    }
  };

  const [availableBalance, setAvailableBalance] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<TransactionItemTS[]>(initialRecentTransactions);

  useEffect(() => {
    let mounted = true;
    async function loadFinancials() {
      try {
        const [completed, upcoming, payoutsRes] = await Promise.all([
          // API expects a StatusGroup ('upcoming' | 'completed' | 'cancelled'), not an object
          getProviderAppointments('completed'),
          getProviderAppointments('upcoming'),
          paymentsApi.listProviderPayouts(),
        ]);

        if (!mounted) return;

        // Compute balances
        const completedGrossCents = (completed.items || []).reduce(
          (sum: number, a: AppointmentListItem) => sum + (a.totalPriceCents || 0),
          0
        );
        const completedNetCents = completedGrossCents * (1 - PLATFORM_FEE_RATE);
        // paymentsApi.listProviderPayouts() returns { items, count }
        const reservedOrPaidOutCents = (payoutsRes.items || []).reduce(
          (sum: number, p) => sum + (p.amountCents || 0),
          0
        );
        setAvailableBalance(Math.max(0, centsToEuros(completedNetCents - reservedOrPaidOutCents)));

        const upcomingGrossCents = (upcoming.items || []).reduce(
          (sum: number, a: AppointmentListItem) => sum + (a.totalPriceCents || 0),
          0
        );
        const upcomingNetCents = upcomingGrossCents * (1 - PLATFORM_FEE_RATE);
        setPendingPayments(centsToEuros(upcomingNetCents));

        // Build recent transactions from appointments
        const mapApptToItem = (a: AppointmentListItem): TransactionItemTS => {
          const dateStr = `${a.appointmentDate}T${(a.startTime || '00:00:00')}`;
          const dt = new Date(dateStr);
          return {
            id: String(a.id || `${a.appointmentDate}-${a.startTime}`),
            date: dt.toLocaleString('de-DE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
            client: a.client?.name || 'Kunde',
            service: (a.services || []).map((s: { name: string }) => s.name).join(', '),
            gross: centsToEuros(a.totalPriceCents || 0),
            fee: centsToEuros((a.totalPriceCents || 0) * PLATFORM_FEE_RATE),
            net: centsToEuros((a.totalPriceCents || 0) * (1 - PLATFORM_FEE_RATE)),
            status: a.status === 'COMPLETED' ? 'paid' as const : 'pending' as const,
          };
        };
        const recent: TransactionItemTS[] = [
          ...((completed.items || []).map(mapApptToItem)),
          ...((upcoming.items || []).map(mapApptToItem)),
        ]
          .sort((a, b) => {
            // sort descending by date (approximate, using string parse)
            const ad = new Date(a.date.replace(' ', ' ')).getTime();
            const bd = new Date(b.date.replace(' ', ' ')).getTime();
            return bd - ad;
          })
          .slice(0, 5);
        setRecentTransactions(recent);
      } catch (err) {
        console.warn('Failed to load provider earnings', err);
      }
    }
    loadFinancials();
    return () => { mounted = false; };
  }, []);

  const maxAmount = Math.max(...weeklyData.map(d => d.amount));

  return (
    <SafeAreaView style={rnStyles.safeArea}>
      {/* Header */}
      <View style={rnStyles.header}>
        <Text style={rnStyles.headerTitle}>Einnahmen & Auszahlungen</Text>
        <TouchableOpacity onPress={() => {}} style={rnStyles.headerAction}>
          <Download />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={rnStyles.scrollContent}>
        {/* Balance Cards */}
        <View style={rnStyles.section}>
          <Card>
            <Text style={rnStyles.labelMuted}>Verfügbares Guthaben</Text>
            <Text style={rnStyles.amountLarge}>€{availableBalance.toFixed(2)}</Text>
            <Button
              onPress={() => navigation.navigate('PayoutRequestScreen')}
              style={rnStyles.primaryButton}
            >
              Auszahlung beantragen
            </Button>
            <Text style={rnStyles.helperText}>Bereit zur Auszahlung</Text>
          </Card>

          <Card>
            <View style={rnStyles.rowBetween}>
              <View>
                <Text style={rnStyles.labelMuted}>Ausstehende Zahlungen</Text>
                <Text style={rnStyles.amountMedium}>€{pendingPayments.toFixed(2)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Badge variant="outline">Ausstehend</Badge>
                <Text style={rnStyles.helperText}>Nach Terminabschluss</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Earnings Chart */}
        <View style={rnStyles.section}>
          <Card>
            <View style={rnStyles.rowBetween}>
              <Text style={rnStyles.sectionTitle}>Einnahmen-Übersicht</Text>
              <View style={rnStyles.row}>
                <Button
                  onPress={() => setPeriod('week')}
                  style={[rnStyles.chipButton, period === 'week' ? rnStyles.chipActive : rnStyles.chipInactive]}
                >
                  Woche
                </Button>
                <Button
                  onPress={() => setPeriod('month')}
                  style={[rnStyles.chipButton, period === 'month' ? rnStyles.chipActive : rnStyles.chipInactive]}
                >
                  Monat
                </Button>
              </View>
            </View>

            {/* Simple Bar Chart */}
            <View style={rnStyles.chartWrapper}>
              {weeklyData.map((data, index) => (
                <View key={index} style={rnStyles.chartColumn}>
                  <View style={rnStyles.chartBarContainer}>
                    <View style={[rnStyles.chartBar, { height: `${(data.amount / maxAmount) * 100}%` }]} />
                  </View>
                  <Text style={rnStyles.chartDay}>{data.day}</Text>
                </View>
              ))}
            </View>

            <View style={rnStyles.summaryRow}>
              <View>
                <Text style={rnStyles.labelMuted}>Gesamt diese Woche</Text>
                <Text style={[rnStyles.amountMedium, { color: '#16A34A' }]}>€1,945</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <View style={rnStyles.row}>
                  <TrendingUp />
                  <Text style={rnStyles.trendText}>+18%</Text>
                </View>
                <Text style={rnStyles.helperText}>vs. letzte Woche</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Recent Transactions */}
        <View style={rnStyles.section}>
          <View style={rnStyles.rowBetween}>
            <Text style={rnStyles.sectionTitle}>Letzte Transaktionen</Text>
            <TouchableOpacity onPress={() => navigate('/provider/earnings/transactions')}>
              <Text style={rnStyles.linkPrimary}>Alle anzeigen</Text>
            </TouchableOpacity>
          </View>

          <View>
            {recentTransactions.map((transaction) => (
              <Card key={transaction.id} style={{ marginBottom: 12 }}>
                <View style={rnStyles.rowBetween}>
                  <View>
                    <Text style={rnStyles.itemTitle}>{transaction.client}</Text>
                    <Text style={rnStyles.itemSubtitle}>{transaction.service}</Text>
                  </View>
                  <Badge variant={transaction.status === 'paid' ? 'success' : 'secondary'}>
                    {transaction.status === 'paid' ? 'Bezahlt' : 'Ausstehend'}
                  </Badge>
                </View>

                <View style={rnStyles.detailList}>
                  <View style={rnStyles.detailRow}>
                    <Text style={rnStyles.detailLabel}>Betrag:</Text>
                    <Text style={rnStyles.detailValue}>€{transaction.gross.toFixed(2)}</Text>
                  </View>
                  <View style={rnStyles.detailRow}>
                    <Text style={[rnStyles.detailLabel, { color: '#DC2626' }]}>Gebühr (10%):</Text>
                    <Text style={[rnStyles.detailValue, { color: '#DC2626' }]}>-€{transaction.fee.toFixed(2)}</Text>
                  </View>
                  <View style={[rnStyles.detailRow, { borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 4 }] }>
                    <Text style={[rnStyles.detailLabel, { color: '#111827' }]}>Deine Einnahmen:</Text>
                    <Text style={[rnStyles.detailValue, { color: '#16A34A' }]}>€{transaction.net.toFixed(2)}</Text>
                  </View>
                </View>

                <Text style={rnStyles.helperText}>{transaction.date}</Text>
              </Card>
            ))}
          </View>
        </View>

        {/* Service Performance */}
        <View style={rnStyles.section}>
          <Text style={rnStyles.sectionTitle}>Leistungsstärkste Services</Text>
          <Card>
            <View style={rnStyles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={rnStyles.itemTitle}>Box Braids</Text>
                <Text style={rnStyles.itemSubtitle}>24 Buchungen</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[rnStyles.itemTitle, { color: '#8B4513' }]}>€2,280</Text>
                <View style={rnStyles.row}>
                  <TrendingUp />
                  <Text style={rnStyles.trendText}>+8%</Text>
                </View>
              </View>
            </View>

            <View style={rnStyles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={rnStyles.itemTitle}>Cornrows</Text>
                <Text style={rnStyles.itemSubtitle}>18 Buchungen</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[rnStyles.itemTitle, { color: '#8B4513' }]}>€1,170</Text>
                <View style={rnStyles.row}>
                  <TrendingUp />
                  <Text style={rnStyles.trendText}>+5%</Text>
                </View>
              </View>
            </View>

            <View style={rnStyles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={rnStyles.itemTitle}>Senegalese Twists</Text>
                <Text style={rnStyles.itemSubtitle}>12 Buchungen</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[rnStyles.itemTitle, { color: '#8B4513' }]}>€1,380</Text>
                <View style={rnStyles.row}>
                  <Text style={rnStyles.trendText}>→ Stabil</Text>
                </View>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
