import React, { useEffect, useState } from 'react';
import { SafeAreaView, FlatList, View, Text, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { clientBookingApi } from '@/api/clientBooking';
import { IBooking, BookingStatus } from '@/domain/models/booking';
import { colors, spacing } from '@/theme/tokens';
import { useAuth } from '@/auth/AuthContext';
import { rootNavigationRef } from '@/navigation/rootNavigation';
import { useI18n } from '@/i18n';
import { logger } from '@/services/logger';
import { MESSAGES } from '@/constants';
import { DateService } from '@/domain/services/DateService';
import { DomainError, ErrorType } from '@/domain/errors/DomainError';

const statusOptions: BookingStatus[] = ['upcoming', 'completed', 'cancelled'];

import type { BookingsStackParamList } from '@/navigation/types';

export default function BookingsListScreen() {
  const navigation = useNavigation<NavigationProp<BookingsStackParamList>>();
  const { tokens, loading: authLoading } = useAuth();
  const isAuthenticated = !!tokens?.accessToken;
  const { t } = useI18n();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState<boolean>(false);
  const [items, setItems] = useState<IBooking[]>([]);
  const [status, setStatus] = useState<BookingStatus>('upcoming');

  const fetchAppointments = React.useCallback(() => {
    if (!isAuthenticated) {
      setItems([]);
      setError(null);
      setIsUnauthorized(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setIsUnauthorized(false);
    clientBookingApi.getAppointments(status)
      .then((data) => setItems(data || []))
      .catch((e: unknown) => {
        const err = e as DomainError;
        const unauthorized = err.type === ErrorType.UNAUTHORIZED;
        setIsUnauthorized(unauthorized);
        const msg = unauthorized
          ? t('screens.bookingsList.loginPrompt', {})
          : err.message || t('common.genericError', {});
        setError(msg);
        logger.error('Failed to fetch appointments:', e);
      })
      .finally(() => setLoading(false));
  }, [status, isAuthenticated, t]);

  useEffect(() => {
    if (authLoading) return;
    fetchAppointments();
  }, [status, isAuthenticated, authLoading, fetchAppointments]);

  if (loading || authLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.centeredPadded}>
        <Text style={styles.centerText}>{t('screens.bookingsList.loginPrompt', {})}</Text>
        <Pressable onPress={() => rootNavigationRef.current?.navigate('Login')} style={styles.primaryButton} accessibilityRole="button">
          <Text style={styles.primaryButtonText}>{t('screens.bookingsList.loginButton', {})}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centeredPadded}>
        <Text style={styles.errorText}>{error}</Text>
        {isUnauthorized ? (
          <Pressable onPress={() => rootNavigationRef.current?.navigate('Login')} style={[styles.primaryButton, styles.mtMd]} accessibilityRole="button">
            <Text style={styles.primaryButtonText}>{t('screens.bookingsList.loginButton', {})}</Text>
          </Pressable>
        ) : (
          <Pressable onPress={() => fetchAppointments()} style={[styles.primaryButton, styles.mtMd]} accessibilityRole="button">
            <Text style={styles.primaryButtonText}>{t('common.retry', {})}</Text>
          </Pressable>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.flexContainer}>
      <View style={styles.statusRow}>
        {statusOptions.map((s) => {
          const selected = s === status;
          return (
            <Pressable
              key={s}
              onPress={() => setStatus(s)}
              style={[styles.statusChip, selected && styles.statusChipSelected]}
            >
              <Text style={[styles.statusChipText, selected && styles.statusChipTextSelected]}>
                {t(`screens.bookingsList.status.${s}`, {})}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <FlatList<IBooking>
        data={items}
        keyExtractor={(it) => it.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('AppointmentDetail', { id: item.id })}
            style={styles.card}
          >
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardProviderName}>{item.providerName}</Text>
              <Text style={styles.cardStatus}>{item.status}</Text>
            </View>
            <Text style={styles.cardInfoText}>
              {DateService.formatDateTime(item.date, item.time)}
            </Text>
            <Text style={styles.cardServicesText}>{item.serviceName}</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderColor: colors.gray200,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardInfoText: {
    color: colors.gray700,
  },
  cardProviderName: {
    fontWeight: '700',
  },
  cardServicesText: {
    color: colors.gray600,
    marginTop: 4,
  },
  cardStatus: {
    color: colors.gray600,
  },
  centerText: {
    color: colors.gray700,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  centeredPadded: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.md,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
  },
  flexContainer: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
  },
  mtMd: {
    marginTop: spacing.md,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  statusChip: {
    backgroundColor: colors.white,
    borderColor: colors.gray300,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusChipSelected: {
    backgroundColor: colors.gray100,
    borderColor: colors.primary,
  },
  statusChipText: {
    color: colors.gray700,
    fontWeight: '500',
  },
  statusChipTextSelected: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
});
