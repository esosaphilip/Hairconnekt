import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { Badge } from '@/components/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/avatar';
import { colors } from '@/theme/tokens';
import { styles } from '../ProviderDashboard.styles';
import { Appointment, statusToBadge, formatEuro } from '../hooks/useProviderDashboard';
import { rootNavigationRef } from '@/navigation/rootNavigation';
import { http } from '@/api/http';

interface TodayScheduleProps {
    appointments: Appointment[];
    todayYmd: string;
    onRefresh: () => void;
    navigation: any;
}

export const TodaySchedule: React.FC<TodayScheduleProps> = ({
    appointments,
    todayYmd,
    onRefresh,
    navigation
}) => {
    const handleUpdateStatus = async (appointment: Appointment) => {
        const isStarted = appointment.status === 'IN_PROGRESS';
        const newStatus = isStarted ? 'COMPLETED' : 'IN_PROGRESS';
        const actionLabel = isStarted ? 'abschließen' : 'starten';

        Alert.alert(`Termin ${actionLabel}`, `Möchtest du diesen Termin jetzt ${actionLabel}?`, [
            { text: 'Abbrechen', style: 'cancel' },
            {
                text: isStarted ? 'Abschließen' : 'Starten',
                onPress: async () => {
                    try {
                        await http.patch(`/appointments/${appointment.id}/status`, { status: newStatus });
                        Alert.alert('Erfolg', `Termin wurde aktualisiert.`);
                        onRefresh();
                    } catch (e) {
                        Alert.alert('Fehler', 'Konnte Status nicht aktualisieren.');
                    }
                }
            }
        ]);
    };

    return (
        <View style={styles.mbMd}>
            <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Heutiger Zeitplan</Text>
                <Pressable onPress={() => rootNavigationRef.current?.navigate('Kalender', {
                    screen: 'ProviderCalendar',
                    params: { targetDate: todayYmd, viewMode: 'day' }
                })}>
                    <Text style={styles.seeAllText}>Alle anzeigen</Text>
                </Pressable>
            </View>

            <View>
                {appointments.map((appointment) => {
                    const b = statusToBadge(appointment.status);
                    return (
                        <Card key={appointment.id} style={styles.cardMb12}>
                            <View style={styles.row}>
                                <View style={styles.indicatorContainer}>
                                    <View style={[styles.appointmentIndicator, { backgroundColor: b.color }]} />
                                </View>

                                <View style={styles.flex1}>
                                    <View style={styles.appointmentHeaderRow}>
                                        <View>
                                            <Text style={styles.smallMutedText}>{appointment.time}</Text>
                                            {appointment.hoursUntil <= 3 && (
                                                <Text style={styles.timeUntilText}>
                                                    In {Math.max(0, Math.floor(appointment.hoursUntil))} Std. {Math.max(0, Math.round((appointment.hoursUntil % 1) * 60))} Min.
                                                </Text>
                                            )}
                                        </View>
                                        <Badge style={{ backgroundColor: b.color, borderColor: b.color }}>
                                            {b.label}
                                        </Badge>
                                    </View>

                                    <View style={styles.appointmentRow}>
                                        <Avatar size={40}>
                                            {appointment.client.image ? (
                                                <AvatarImage uri={appointment.client.image} />
                                            ) : (
                                                <AvatarFallback label={(appointment.client.name || 'K').slice(0, 2).toUpperCase()} />
                                            )}
                                        </Avatar>
                                        <View style={styles.clientInfo}>
                                            <Text style={styles.clientName}>{appointment.client.name}</Text>
                                            <Text style={styles.smallMutedText}>{appointment.service}</Text>
                                        </View>
                                        <Text style={styles.priceText}>{formatEuro(appointment.priceCents)}</Text>
                                    </View>

                                    <View style={styles.row}>
                                        <Button
                                            title={appointment.status === 'IN_PROGRESS' ? "Abschließen" : "Starten"}
                                            style={[styles.actionButton, {
                                                backgroundColor: appointment.status === 'IN_PROGRESS' ? colors.gray600 : colors.green600,
                                                flex: 2
                                            }]}
                                            onPress={() => handleUpdateStatus(appointment)}
                                        />
                                        <Button
                                            title="Nachricht"
                                            variant="ghost"
                                            style={styles.ghostButtonWide}
                                            onPress={() => {
                                                navigation.navigate('Mehr', {
                                                    screen: 'ChatScreen',
                                                    params: {
                                                        userId: typeof appointment.client.id === 'string' ? appointment.client.id : undefined
                                                    }
                                                });
                                            }}
                                        />
                                        <Pressable
                                            style={styles.iconButton}
                                            onPress={() => { /* Open more options */ }}
                                        >
                                            <Ionicons name="ellipsis-vertical" size={20} color={colors.gray600} />
                                        </Pressable>
                                    </View>
                                </View>
                            </View>
                        </Card>
                    );
                })}

                {appointments.length === 0 && (
                    <Text style={styles.smallGrayText}>Keine Termine heute</Text>
                )}

                {appointments.length > 0 && (
                    <View style={styles.dashedRow}>
                        <View style={styles.dashedDivider} />
                        <Text style={styles.smallGrayText}>Freie Zeit verfügbar</Text>
                    </View>
                )}
            </View>
        </View>
    );
};
