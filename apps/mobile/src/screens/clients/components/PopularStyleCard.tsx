import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { rootNavigationRef } from '@/navigation/rootNavigation';
import { styles } from '../HomeScreen.styles';
import { PopularStyle } from '../hooks/useHomeScreen';

interface PopularStyleCardProps {
    item: PopularStyle;
}

export const PopularStyleCard: React.FC<PopularStyleCardProps> = ({ item }) => {
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
                <Image
                    source={{ uri: item.iconUrl || 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=400&q=80' }}
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
