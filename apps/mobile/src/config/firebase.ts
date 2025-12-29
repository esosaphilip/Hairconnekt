import storage from '@react-native-firebase/storage';

export const STORAGE_BUCKET = 'gs://hairconnekt-prod.firebasestorage.app';

export const getStorageRef = (path: string) => {
    // Ensure we don't double-slash or malform the gs:// url
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return storage().refFromURL(`${STORAGE_BUCKET}/${cleanPath}`);
};
