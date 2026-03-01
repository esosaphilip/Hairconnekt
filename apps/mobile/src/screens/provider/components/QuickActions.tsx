import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/Card';
import { colors } from '@/theme/tokens';
import { styles } from '../ProviderDashboard.styles';
import { rootNavigationRef } from '@/navigation/rootNavigation';

const quickActionsData: { label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    // [MVP-CUT] Reason: BlockTimeScreen disabled for MVP | Restore in: v2
    // { label: 'Blockierte Zeit', icon: 'close-outline' },
    { label: 'Termin erstellen', icon: 'add-outline' },
    { label: 'Dienste bearbeiten', icon: 'create-outline' },
    { label: 'Verfügbarkeit', icon: 'time-outline' },
];

export const QuickActions: React.FC = () => {
    const handlePress = (label: string) => {
        switch (label) {
            // [MVP-CUT] Reason: BlockTimeScreen disabled for MVP | Restore in: v2
            // case 'Blockierte Zeit':
            //     rootNavigationRef.current?.navigate('Kalender', { screen: 'BlockTimeScreen' });
            //     break;
            case 'Termin erstellen':
                rootNavigationRef.current?.navigate('Kalender', { screen: 'CreateAppointmentScreen' });
                break;
            case 'Dienste bearbeiten':
                rootNavigationRef.current?.navigate('Profil', { screen: 'ProviderServicesScreen' });
                break;
            case 'Verfügbarkeit':
                rootNavigationRef.current?.navigate('Profil', { screen: 'ProviderAvailabilityScreen' });
                break;
        }
    };

    return (
        <View style={styles.mbMd}>
            <Text style={[styles.sectionTitle, styles.mbSm]}>Schnellaktionen</Text>
            <View style={styles.quickActionsRow}>
                {quickActionsData.map((qa) => (
                    <Card key={qa.label} style={styles.quickActionCard}>
                        <Pressable
                            onPress={() => handlePress(qa.label)}
                            style={styles.centered}
                        >
                            <Ionicons name={qa.icon} size={24} color={colors.gray600} />
                            <Text style={styles.quickActionLabel}>{qa.label}</Text>
                        </Pressable>
                    </Card>
                ))}
            </View>
        </View>
    );
};
