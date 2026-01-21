import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { rootNavigationRef } from '@/navigation/rootNavigation';
import { useAuth } from '@/auth/AuthContext';
import { clientBraiderApi } from '@/api/clientBraider';
import { IBraider } from '@/domain/models/braider';
import { addFavorite, removeFavorite, favoriteStatus } from '@/services/favorites';
import { showMessage } from 'react-native-flash-message';
import { useLocation } from '@/context/LocationContext';
import { useI18n } from '@/i18n';
import { MESSAGES } from '@/constants';
import { logger } from '@/services/logger';

export interface PopularStyle {
    id: string;
    name: string;
    slug: string;
    iconUrl?: string;
    price?: number;
}

export function useHomeScreen() {
    const { t, locale } = useI18n();
    const { tokens, user } = useAuth();
    const isAuthenticated = !!tokens?.accessToken;
    const { location } = useLocation();

    const [favorites, setFavorites] = useState<string[]>([]);
    const [popularCategories, setPopularCategories] = useState<PopularStyle[]>([]);
    const [nearby, setNearby] = useState<IBraider[] | null>(null);
    const [nearbyLoading, setNearbyLoading] = useState<boolean>(false);
    const [nearbyError, setNearbyError] = useState<string | null>(null);

    // Fetch popular/random services for the dashboard
    useEffect(() => {
        (async () => {
            try {
                // Fetch random services (using search with empty query + limit)
                // In a real app, might want a specific 'getPopular' endpoint
                const services = await clientBraiderApi.searchServices({ limit: 5 });

                const styles: PopularStyle[] = services.map(s => ({
                    id: s.id,
                    name: s.name,
                    slug: s.id, // Using ID as slug for search/nav
                    iconUrl: s.imageUrl,
                    price: s.price
                }));

                setPopularCategories(styles);
            } catch (error) {
                logger.error('Failed to fetch popular styles', error);
                // Fallback to static list on error
                const staticCategories: PopularStyle[] = [
                    { id: 'cat_braids', name: 'Braids', slug: 'braids', iconUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=400' },
                    { id: 'cat_twists', name: 'Twists', slug: 'twists', iconUrl: 'https://images.unsplash.com/photo-1628045667794-fb4d99c30f4a?auto=format&fit=crop&q=80&w=400' },
                    { id: 'cat_locs', name: 'Locs', slug: 'locs', iconUrl: 'https://images.unsplash.com/photo-1520186717578-831e353272cc?auto=format&fit=crop&q=80&w=400' },
                    { id: 'cat_microblading', name: 'Microblading', slug: 'microblading', iconUrl: 'https://images.unsplash.com/photo-1596704017235-d961726d9e0f?auto=format&fit=crop&q=80&w=400' },
                    { id: 'cat_natural', name: 'Natural', slug: 'natural', iconUrl: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&q=80&w=400' },
                ];
                setPopularCategories(staticCategories);
            }
        })();
    }, []);

    const displayName = user?.firstName ? `${user.firstName}! 👋` : user?.email ? `${user.email}` : t('screens.home.welcomeTo');
    const initials = user?.firstName && user?.lastName
        ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
        : (user?.email ? user.email[0].toUpperCase() : "U");

    // Safe currency formatter
    const formatCurrency = useCallback((euros: number) => {
        try {
            if (typeof Intl !== 'undefined' && Intl.NumberFormat) {
                const currencyLocale = locale === 'de' ? 'de-DE' : 'en-GB';
                return new Intl.NumberFormat(currencyLocale, { style: 'currency', currency: 'EUR' }).format(euros);
            }
        } catch { }
        const value = Math.round((euros + Number.EPSILON) * 100) / 100;
        return `€${value.toFixed(2)}`;
    }, [locale]);

    const initFavStatus = useCallback(async (currentNearby: IBraider[] | null) => {
        if (!isAuthenticated || !currentNearby?.length) return;
        const ids = (currentNearby || []).map((n) => n.id).filter(Boolean);
        if (!ids.length) return;
        try {
            const res = await favoriteStatus(ids);
            setFavorites(res.favorites || []);
        } catch {
            // best-effort: ignore
        }
    }, [isAuthenticated]);

    const fetchNearbyData = useCallback(async (latitude: number, longitude: number) => {
        setNearbyLoading(true);
        setNearbyError(null);

        try {
            const items = await clientBraiderApi.getNearby({
                lat: latitude,
                lon: longitude,
                radiusKm: 50,
                limit: 20
            });
            const uniqueItems = Array.from(new Map(items.map(item => [item.id, item])).values());
            setNearby(uniqueItems);
            initFavStatus(items);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : t('screens.home.fetchError');
            setNearbyError(message);
            setNearby([]);
            logger.error('Failed to fetch nearby providers', err);
        } finally {
            setNearbyLoading(false);
        }
    }, [initFavStatus, t]);

    useFocusEffect(
        useCallback(() => {
            if (location) {
                fetchNearbyData(location.lat, location.lon);
            }
        }, [location, fetchNearbyData])
    );

    const handleLocationPress = () => {
        rootNavigationRef.current?.navigate('LocationSelection');
    };

    const handleToggleFavorite = async (id: string) => {
        if (!isAuthenticated) {
            rootNavigationRef.current?.navigate('Login');
            return;
        }
        const isFav = favorites.includes(id);
        setFavorites((prev) => (isFav ? prev.filter((f) => f !== id) : [...prev, id]));
        try {
            if (isFav) {
                await removeFavorite(id);
            } else {
                await addFavorite(id);
            }
        } catch (err: unknown) {
            setFavorites((prev) => (isFav ? [...prev, id] : prev.filter((f) => f !== id)));
            const msg = err instanceof Error ? err.message : MESSAGES.ERROR.UNKNOWN;
            showMessage({
                message: 'Fehler',
                description: msg,
                type: 'danger',
            });
            logger.error('Failed to toggle favorite', err);
        }
    };

    return {
        t,
        displayName,
        initials,
        isAuthenticated,
        popularCategories,
        nearby,
        nearbyLoading,
        nearbyError,
        favorites,
        formatCurrency,
        handleLocationPress,
        handleToggleFavorite,
        user
    };
}
