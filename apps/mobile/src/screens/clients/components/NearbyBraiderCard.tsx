import React from 'react';
import { IBraider } from '@/domain/models/braider';
import ProviderCard from '@/components/ProviderCard';
import { rootNavigationRef } from '@/navigation/rootNavigation';

interface NearbyBraiderCardProps {
    braider: IBraider;
    isFavorite: boolean;
    onToggleFavorite: (id: string) => void;
    formatCurrency: (euros: number) => string;
}

export const NearbyBraiderCard: React.FC<NearbyBraiderCardProps> = ({
    braider,
    isFavorite,
    onToggleFavorite,
    formatCurrency,
}) => {
    return (
        <ProviderCard
            data={{
                ...braider,
                reviews: braider.reviews?.length || 0,
            }}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
            onPress={() => rootNavigationRef.current?.navigate('ProviderDetail', { id: braider.id })}
            formatCurrency={formatCurrency}
        />
    );
};
