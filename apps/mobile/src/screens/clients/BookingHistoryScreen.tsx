import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { colors } from "@/theme/tokens";
import Icon from "@/components/Icon";
import { useAuth } from "@/auth/AuthContext";
import { useI18n } from "@/i18n";
import { clientBookingApi } from '@/api/clientBooking';
import { IBooking } from '@/domain/models/booking';
import { DateService } from '@/domain/services/DateService';
import { DomainError, ErrorType } from '@/domain/errors/DomainError';
import { renderBookingCard } from "./renderBookingCard";

export function BookingHistoryScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'completed' | 'cancelled'>('completed');
  
  const auth = useAuth();
  const authLoading = auth?.loading ?? false;
  const isAuthenticated = !!auth?.tokens?.accessToken;
  const { t } = useI18n();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState<IBooking[]>([]);
  const [cancelled, setCancelled] = useState<IBooking[]>([]);

  const counts = useMemo(() => ({ completed: completed.length, cancelled: cancelled.length }), [completed.length, cancelled.length]);
  const activeBookings = activeTab === 'completed' ? completed : cancelled;

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setCompleted([]);
      setCancelled([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    Promise.all([
      clientBookingApi.getAppointments('completed'),
      clientBookingApi.getAppointments('cancelled'),
    ])
      .then(([comp, canc]) => {
        setCompleted(comp);
        setCancelled(canc);
      })
      .catch((e) => {
        const err = e as DomainError;
        const msg = (err.type === ErrorType.UNAUTHORIZED)
          ? t('screens.bookingsList.loginPrompt', {})
          : (err.message || t('common.error', {}));
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, authLoading]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.gray600} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buchungshistorie</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {counts.completed}
            </Text>
            <Text style={styles.statLabel}>Abgeschlossen</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {counts.cancelled}
            </Text>
            <Text style={styles.statLabel}>Storniert</Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.statItemTotal}>
              <Text style={styles.statValue}>
                {counts.completed + counts.cancelled}
              </Text>
              <Text style={styles.statLabel}>Gesamt</Text>
            </View>
          </View>
        </View>

        {/* Tabs and Content */}
        <View style={styles.tabsSection}>
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'completed' && styles.tabButtonActive]}
              onPress={() => setActiveTab('completed')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
                Abgeschlossen ({counts.completed})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'cancelled' && styles.tabButtonActive]}
              onPress={() => setActiveTab('cancelled')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'cancelled' && styles.tabTextActive]}>
                Storniert ({counts.cancelled})
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.tabsContent}>
            {loading || authLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator />
              </View>
            ) : error ? (
              <Text style={styles.noDataErrorText}>{error}</Text>
            ) : activeBookings.length > 0 ? (
              <View style={styles.listContainer}>
                {activeBookings.map((booking) => (
                  renderBookingCard(booking, navigation.navigate)
                ))}
              </View>
            ) : (
              <Text style={styles.noDataText}>
                {activeTab === 'completed' ? 'Keine abgeschlossenen Buchungen gefunden.' : 'Keine stornierten Buchungen gefunden.'}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Stylesheet for React Native ---

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderBottomColor: colors.gray200,
    borderBottomWidth: StyleSheet.hairlineWidth,
    elevation: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  headerTitle: { color: colors.gray800, fontSize: 18, fontWeight: 'bold' },
  listContainer: {},
  loadingContainer: { alignItems: 'center', paddingVertical: 24 },
  noDataErrorText: { color: colors.error, fontSize: 14, marginTop: 20, textAlign: 'center' },
  noDataText: { color: colors.gray500, fontSize: 14, marginTop: 20, textAlign: 'center' },
  safeArea: { backgroundColor: colors.gray50, flex: 1 },
  scrollViewContent: { paddingBottom: 24 },
  spacer: { width: 24 },
  statItem: { alignItems: 'center', flex: 1 },
  statItemTotal: { alignItems: 'center' },
  statLabel: { color: colors.gray600, fontSize: 12 },
  statValue: { color: colors.primary, fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  statsContainer: { alignItems: 'center', backgroundColor: colors.white, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, paddingHorizontal: 16, paddingVertical: 24 },
  tabButton: { alignItems: 'center', borderRadius: 6, flex: 1, paddingVertical: 10 },
  tabButtonActive: { backgroundColor: colors.white, elevation: 2, shadowColor: colors.black, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  tabText: { color: colors.gray500, fontSize: 14, fontWeight: '500' },
  tabTextActive: { color: colors.gray800, fontWeight: '600' },
  tabsContainer: { backgroundColor: colors.gray100, borderRadius: 8, flexDirection: 'row', marginBottom: 16, padding: 4 },
  tabsContent: {},
  tabsSection: { paddingHorizontal: 16, paddingVertical: 16 },
});
