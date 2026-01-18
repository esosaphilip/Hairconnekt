
import { Platform } from 'react-native';

const guessMimeFromUri = (uri: string): string => {
    const lower = (uri || '').toLowerCase();
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.webp')) return 'image/webp';
    if (lower.endsWith('.heic') || lower.endsWith('.heif')) return 'image/heic';
    return 'image/jpeg';
};

/**
 * Shared utility for uploading images to Firebase Storage
 * @deprecated Use backend API endpoints instead
 */
export const uploadImageToFirebase = async (
    uri: string,
    path: string
): Promise<string> => {
    throw new Error('uploadImageToFirebase is deprecated. Use api/users or api/providers instead.');
};
