import { ImageSourcePropType } from 'react-native';

const styleImages: Record<string, ImageSourcePropType> = {
    'braids': require('../../assets/styles/braids.jpg'),
    'twists': require('../../assets/styles/twists.jpg'),
    'locs': require('../../assets/styles/locs.jpg'),
    'microblading': require('../../assets/styles/microblading.jpg'),
    'natural': require('../../assets/styles/locs.jpg'), // Fallback/reuse if needed
    'weave': require('../../assets/styles/braids.jpg'), // Fallback
};

export const getStyleImage = (slug: string, remoteUrl?: string): ImageSourcePropType | { uri: string } => {
    const normalizedSlug = slug.toLowerCase();

    // Helper to find partial matches if exact match fails
    const key = Object.keys(styleImages).find(k => normalizedSlug.includes(k));

    if (key) {
        return styleImages[key];
    }

    // Fallback to remote URL or default placeholder
    return remoteUrl ? { uri: remoteUrl } : { uri: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=400&q=80' };
};
