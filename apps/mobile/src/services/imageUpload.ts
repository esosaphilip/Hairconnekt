
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
 */
export const uploadImageToFirebase = async (
    uri: string,
    path: string
): Promise<string> => {
    if (!uri) throw new Error('Image URI is required');

    // Dynamic import to avoid cycles or context issues
    const { getStorageRef } = require('../config/firebase');

    const ref = getStorageRef(path);

    // Only for React Native Firebase (native)
    // For local checks or web, logic might differ but basic RN usage assumes file path uri
    await ref.putFile(uri);

    const url = await ref.getDownloadURL();
    return url;
};
