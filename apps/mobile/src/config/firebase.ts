// import storage from '@react-native-firebase/storage';

export const STORAGE_BUCKET = 'gs://hairconnekt-prod.firebasestorage.app';

export const getStorageRef = (path: string) => {
    throw new Error('Firebase Storage is deprecated. Use backend upload endpoints.');
    // const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    // return storage().refFromURL(`${STORAGE_BUCKET}/${cleanPath}`);
};
