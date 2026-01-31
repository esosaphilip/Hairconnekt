import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AppImage } from '@/components/AppImage';
import { rootNavigationRef } from '@/navigation/rootNavigation';
import { styles } from '../HomeScreen.styles';
import { PopularStyle } from '../hooks/useHomeScreen';
import { getStyleImage } from '@/utils/styleImages';

interface PopularStyleCardProps {
    item: PopularStyle;
}

export const PopularStyleCard: React.FC<PopularStyleCardProps> = ({ item }) => {
    const source = getStyleImage(item.slug || 'default', item.iconUrl);
    const isUri = source && typeof source === 'object' && 'uri' in source;

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => rootNavigationRef.current?.navigate('Tabs', {
                screen: 'Search',
                params: {
                    // If it's a specific service (has price), search for it by name
                    // If it's a category (fallback), filter by category
                    initialTerm: item.price ? item.name : undefined,
                    initialFilter: !item.price ? `cat:${item.slug}` : undefined
                }
            })}
            style={styles.popularStyleCard}
        >
            <View style={styles.popularStyleImageContainer}>
                <AppImage
                    source={!isUri ? source : undefined}
                    uri={isUri ? (source as any).uri : undefined}
                    style={styles.popularStyleImage}
                />
                <View style={styles.imageOverlay} />
                <View style={styles.popularStyleTextContainer}>
                    <Text style={styles.popularStyleName}>{item.name}</Text>
                    <View style={styles.popularStyleDetails}>
                        <Text style={styles.popularStylePrice}>
                            {item.price ? `ab €${(item.price / 100).toFixed(2)}` : 'Jetzt entdecken'}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};
