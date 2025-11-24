import axios from 'axios';
import { API_BASE_URL, IS_DEV } from '@/constants';
import { API_CONFIG } from '@/constants/config';
import { useAuthStore } from '@/stores';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Required for cookies
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: API_CONFIG.TIMEOUT,
});

// Request interceptor (for future token injection if needed)
apiClient.interceptors.request.use(
    (config) => {
        // Add user ID header for MSW
        const user = useAuthStore.getState().user;
        if (user?.user_id) {
            config.headers['x-user-id'] = user.user_id;
        }
        // Log requests in development
        if (IS_DEV) {
            console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for auth errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Session expired - clear auth and preserve return URL
            console.warn('[API] Unauthorized - session expired');

            const { clearAuth } = useAuthStore.getState();
            clearAuth();

            // Preserve current location for redirect after login
            const currentPath = window.location.pathname;
            if (currentPath !== '/login') {
                sessionStorage.setItem('auth_return_url', currentPath);
            }

            // Use window.location for full page navigation (React Router not available in interceptor)
            // This is acceptable because 401 means session is completely invalid
            window.location.href = '/login';
        } else if (error.response?.status === 403) {
            // Forbidden - log error
            console.error('[API] Forbidden:', error.response.data);
        }
        return Promise.reject(error);
    }
);

export { apiClient };
