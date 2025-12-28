import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Switch,
  Text,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/Card';
import { colors } from '@/theme/tokens';
import { styles } from './ProviderDashboard.styles';
import { useProviderDashboard, safeLocaleDateString } from './hooks/useProviderDashboard';
import { StatsGrid } from './components/StatsGrid';
import { TodaySchedule } from './components/TodaySchedule';
import { QuickActions } from './components/QuickActions';
import { RecentReviews } from './components/RecentReviews';

export function ProviderDashboard() {
  const {
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
  } = useProviderDashboard();

  const todayLabel = useMemo(() =>
    safeLocaleDateString(new Date(), 'de-DE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }),
    []);

  return (
    <SafeAreaView style={styles.safeArea}>
      {loading && !dashboard && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.welcomeText}>
                  Willkommen zurück{profile?.name ? `, ${profile.name}!` : '!'} 👋
                </Text>
                <Text style={styles.dateText}>{todayLabel}</Text>
              </View>
              <View style={styles.headerActions}>
                <Pressable
                  style={styles.headerActionButton}
                  onPress={() => navigation.navigate('ProviderNotificationsScreen')}
                >
                  <Ionicons name="notifications-outline" size={22} color={colors.gray700} />
                </Pressable>
                <Pressable
                  style={styles.headerActionButton}
                  onPress={() => navigation.navigate('Mehr', { screen: 'ProviderSettingsScreen' })}
                >
                  <Ionicons name="settings-outline" size={22} color={colors.gray700} />
                </Pressable>
              </View>
            </View>

            {/* Availability Toggle */}
            <Card>
              <View style={styles.rowBetweenCenter}>
                <View>
                  <Text style={[styles.availabilityText, { color: isAvailable ? colors.green600 : colors.gray600 }]}>
                    {isAvailable ? 'Verfügbar' : 'Nicht verfügbar'}
                  </Text>
                  <Text style={styles.availabilityDescription}>
                    {isAvailable ? 'Kunden können dich jetzt buchen' : 'Du erscheinst nicht in den Suchergebnissen'}
                  </Text>
                </View>
                <Switch
                  value={isAvailable}
                  onValueChange={handleToggleOnline}
                />
              </View>
            </Card>
          </View>

          <View style={styles.statsContainer}>
            {/* Stats Grid */}
            <StatsGrid stats={dashboard?.stats} todayYmd={todayYmd} />

            {/* Today's Schedule */}
            <TodaySchedule
              appointments={dashboard?.todayAppointments ?? []}
              todayYmd={todayYmd}
              onRefresh={() => onRefresh()}
              navigation={navigation}
            />

            {/* Quick Actions */}
            <QuickActions />

            {/* Recent Reviews */}
            <RecentReviews reviews={dashboard?.recentReviews ?? []} />
          </View>

          {!!error && (
            <View style={styles.errorContainerPadding}>
              <Card>
                <Text style={styles.errorText}>{error}</Text>
              </Card>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
