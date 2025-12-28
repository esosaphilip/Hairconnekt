import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/Card';
import { colors } from '@/theme/tokens';
import { styles } from '../ProviderDashboard.styles';
import { Stats, formatEuro } from '../hooks/useProviderDashboard';
import { rootNavigationRef } from '@/navigation/rootNavigation';

interface StatsGridProps {
    stats: Stats | undefined;
    todayYmd: string;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats, todayYmd }) => {
    return (
        <View style={styles.statsGrid}>
            <Card
                style={styles.statCard}
                onPress={() => rootNavigationRef.current?.navigate('Kalender', {
                    screen: 'ProviderCalendar',
                    params: { targetDate: todayYmd, viewMode: 'day' }
                })}
            >
                <View style={styles.statHeader}>
                    <Ionicons name="calendar-outline" size={16} color={colors.primary} style={styles.statIcon} />
                    <Text style={styles.statLabel}>Termine heute</Text>
                </View>
                <View style={styles.rowEndBetween}>
                    <View>
                        <Text style={styles.statNumber}>{stats?.todayCount ?? 0}</Text>
                        <View style={styles.changeRow}>
                            <Ionicons name="arrow-up-outline" size={12} color={colors.green600} />
                            <Text style={styles.positiveChangeText}>+2 vs. gestern</Text>
                        </View>
                    </View>
                </View>
            </Card>

            <Card
                style={styles.statCard}
                onPress={() => rootNavigationRef.current?.navigate('Kalender', {
                    screen: 'ProviderCalendar',
                    params: { targetDate: todayYmd, viewMode: 'day' }
                })}
            >
                <View style={styles.statHeader}>
                    <Ionicons name="time-outline" size={16} color={colors.blue600} style={styles.statIcon} />
                    <Text style={styles.statLabel}>Nächster Termin</Text>
                </View>
                <View>
                    {stats?.nextAppointment ? (
                        <>
                            <Text style={styles.nextTimeText}>{stats.nextAppointment.time}</Text>
                            <Text style={styles.smallMutedText}>mit {stats.nextAppointment.client}</Text>
                            <Text style={styles.timeUntilText}>
                                In {Math.max(0, Math.floor(stats.nextAppointment.hoursUntil))} Std. {Math.max(0, Math.round((stats.nextAppointment.hoursUntil % 1) * 60))} Min.
                            </Text>
                        </>
                    ) : (
                        <Text style={styles.smallMutedText}>Keine Termine heute</Text>
                    )}
                </View>
            </Card>

            <Card
                style={styles.statCard}
                onPress={() => rootNavigationRef.current?.navigate('Mehr', { screen: 'ProviderAnalyticsScreen' })}
            >
                <View style={styles.statHeader}>
                    <Ionicons name="cash-outline" size={16} color={colors.green600} style={styles.statIcon} />
                    <Text style={styles.statLabel}>Diese Woche</Text>
                </View>
                <View>
                    <Text style={[styles.statNumber, styles.mb2, { color: colors.green600 }]}>{formatEuro(stats?.weekEarningsCents || 0)}</Text>
                    <Text style={styles.nettoText}>(netto)</Text>
                    <View style={styles.changeRow}>
                        <Ionicons name="arrow-up-outline" size={12} color={colors.green600} />
                        <Text style={styles.positiveChangeText}>+18%</Text>
                    </View>
                </View>
            </Card>

            <Card
                style={styles.statCard}
                onPress={() => rootNavigationRef.current?.navigate('Mehr', { screen: 'ProviderReviewsScreen' })}
            >
                <View style={styles.statHeader}>
                    <Ionicons name="star-outline" size={16} color={colors.amber600} style={styles.statIcon} />
                    <Text style={styles.statLabel}>Bewertung</Text>
                </View>
                <View>
                    <Text style={{ fontSize: 22, marginBottom: 2 }}>{(stats?.ratingAverage ?? 0).toFixed(1)} ★</Text>
                    <Text style={{ fontSize: 12, color: colors.gray600 }}>{stats?.reviewCount ?? 0} Bewertungen</Text>
                    <Text style={{ fontSize: 12, color: colors.gray500, marginTop: 2 }}>→ Stabil</Text>
                </View>
            </Card>
        </View>
    );
};
