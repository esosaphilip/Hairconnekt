import { API_BASE_URL } from '../config';
import { getAccessToken } from '../auth/tokenStorage';

/**
 * Uploads a single image file to a specified endpoint using native fetch.
 * Native fetch avoids multipart form data issues common with Axios in React Native.
 */
export const uploadImageFile = async (
    uri: string,
    endpointPath: string, // e.g. '/users/me/avatar' or '/providers/me/profile-picture'
    fieldName = 'file'
) => {
    const token = await getAccessToken();
    if (!token) {
        throw new Error('Not authenticated for image upload');
    }

    const formData = new FormData();

    // Extract filename and type
    const filename = uri.split('/').pop() || 'upload.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    // Append with correct structure required by React Native FormData
    formData.append(fieldName, {
        uri,
        name: filename,
        type,
    } as any);

    try {
        const fullUrl = `${API_BASE_URL}${endpointPath.startsWith('/') ? '' : '/'}${endpointPath}`;

        // Using native fetch deliberately for multipart reliability in RN
        const response = await fetch(fullUrl, {
            method: 'POST',
            body: formData,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[uploadService] Server responded with error:', errorText);
            throw new Error(`Upload failed (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('[uploadService] Fetch error:', error);
        throw error;
    }
};

/**
 * Uploads multiple images to a specified endpoint.
 */
export const uploadMultipleImages = async (
    uris: string[],
    endpointPath: string, // e.g. '/providers/me/portfolio'
    fieldName = 'images',
    metadata?: Record<string, string>
) => {
    const token = await getAccessToken();
    if (!token) {
        throw new Error('Not authenticated for multiple image upload');
    }

    const formData = new FormData();

    uris.forEach(uri => {
        const filename = uri.split('/').pop() || 'upload.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append(fieldName, {
            uri,
            name: filename,
            type,
        } as any);
    });

    if (metadata) {
        Object.keys(metadata).forEach(key => {
            formData.append(key, metadata[key]);
        });
    }

    try {
        const fullUrl = `${API_BASE_URL}${endpointPath.startsWith('/') ? '' : '/'}${endpointPath}`;

        const response = await fetch(fullUrl, {
            method: 'POST',
            body: formData,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[uploadService] Server responded with error:', errorText);
            throw new Error(`Multiple upload failed (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        return data; // Should contain { success: true, data: results[] }
    } catch (error) {
        console.error('[uploadService] Multiple fetch error:', error);
        throw error;
    }
};
