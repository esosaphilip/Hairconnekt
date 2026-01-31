
import React, { useState } from 'react';
import { Image, ImageProps, ImageStyle, StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { normalizeUrl } from '../utils/url';
import Icon from './Icon'; // Assuming you have this
import { COLORS } from '../theme/tokens';

type AppImageProps = Omit<ImageProps, 'source'> & {
    uri: string | null | undefined;
    placeholder?: 'user' | 'business' | 'default';
    showLoading?: boolean;
    style?: ImageStyle;
};

export const AppImage: React.FC<AppImageProps> = ({
    uri,
    placeholder = 'default',
    showLoading = true,
    style,
    resizeMode = 'cover',
    ...props
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const normalizedUri = normalizeUrl(uri);

    const handleLoadStart = () => setLoading(true);
    const handleLoadEnd = () => setLoading(false);
    const handleError = () => {
        setLoading(false);
        setError(true);
    };

    if (!normalizedUri || error) {
        return (
            <View style={[styles.placeholderContainer, style]}>
                <PlaceholderIcon type={placeholder} />
            </View>
        );
    }

    return (
        <View style={[style, styles.container]}>
            <Image
                source={{ uri: normalizedUri }}
                style={[StyleSheet.absoluteFill, style]}
                resizeMode={resizeMode}
                onLoadStart={handleLoadStart}
                onLoadEnd={handleLoadEnd}
                onError={handleError}
                {...props}
            />
            {showLoading && loading && (
                <View style={[StyleSheet.absoluteFill, styles.loadingContainer]}>
                    <ActivityIndicator size="small" color={COLORS.primary || '#8B4513'} />
                </View>
            )}
        </View>
    );
};

const PlaceholderIcon = ({ type }: { type: 'user' | 'business' | 'default' }) => {
    let iconName = 'image';
    if (type === 'user') iconName = 'user';
    if (type === 'business') iconName = 'briefcase'; // or 'shopping-bag'

    return <Icon name={iconName} size={24} color={COLORS.textSecondary || '#9CA3AF'} />;
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },
    placeholderContainer: {
        backgroundColor: '#E5E7EB', // gray-200
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.3)',
    }
});
