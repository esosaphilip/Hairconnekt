
import React, { useState } from 'react';
import { Image, ImageProps, ImageStyle, StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { normalizeUrl } from '../utils/url';
import Icon from './Icon'; // Assuming you have this
import { COLORS } from '../theme/tokens';

type AppImageProps = Omit<ImageProps, 'source'> & {
    uri?: string | null;
    source?: ImageProps['source'];
    placeholder?: 'user' | 'business' | 'default';
    showLoading?: boolean;
    style?: ImageStyle;
};

export const AppImage: React.FC<AppImageProps> = ({
    uri,
    source,
    placeholder = 'default',
    showLoading = true,
    style,
    resizeMode = 'cover',
    ...props
}) => {
    const [loading, setLoading] = useState(true);

    // If source is provided (e.g. local require), use it directly.
    // Otherwise, normalize the uri.
    const imageSource = source ? source : (uri ? { uri: normalizeUrl(uri) } : null);

    // Check if we have a valid source to attempt rendering
    // We allow rendering if we have a source object OR a URI string
    const canAttemptRender = source || (imageSource && (imageSource as any).uri);

    const [hasError, setHasError] = useState(false);

    const handleLoadStart = () => setLoading(true);
    const handleLoadEnd = () => setLoading(false);

    const handleError = (e: any) => {
        console.log('AppImage load error:', e.nativeEvent?.error, imageSource);
        setLoading(false);
        setHasError(true);
        if (props.onError) props.onError(e);
    };

    if (!canAttemptRender || hasError) {
        return (
            <View style={[styles.placeholderContainer, style]}>
                <PlaceholderIcon type={placeholder} />
            </View>
        );
    }

    return (
        <View style={[style, styles.container]}>
            <Image
                source={imageSource as any}
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
