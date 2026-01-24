import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, { tokenExists: !!token });
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('[API Error]', error.response?.status, error.response?.data);
        if (error.response?.status === 401) {
            console.warn('401 Unauthorized detected - preventing auto-redirect for debugging');
            // localStorage.removeItem('token');
            // localStorage.removeItem('user');
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
