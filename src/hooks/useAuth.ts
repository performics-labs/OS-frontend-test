import { useCallback, useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores';
import { logoutUser, refreshSession as refreshSessionAPI } from '@/services';
import { getErrorMessage } from '@/utils';

// Session refresh configuration
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const SESSION_REFRESH_THRESHOLD = 2 * 60 * 1000; // Refresh if less than 2 min remaining

function useAuth() {
    const user = useAuthStore((state) => state.user);
    const token = useAuthStore((state) => state.token);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isLoading = useAuthStore((state) => state.isLoading);
    const setAuth = useAuthStore((state) => state.setAuth);
    const setError = useAuthStore((state) => state.setError);
    const clearAuth = useAuthStore((state) => state.clearAuth);
    const setLoading = useAuthStore((state) => state.setLoading);
    const getSession = useAuthStore((state) => state.getSession);
    const checkSessionExpiry = useAuthStore((state) => state.checkSessionExpiry);

    const sessionCheckInterval = useRef<NodeJS.Timeout | null>(null);

    const handleError = useCallback(
        (error: unknown): string => {
            const message = getErrorMessage(error);
            setError(message);
            return message;
        },
        [setError]
    );

    const refreshSession = useCallback(async () => {
        try {
            const response = await refreshSessionAPI();
            setAuth(response.data.user);
            return true;
        } catch (error) {
            console.warn('[useAuth] Session refresh failed:', error);
            clearAuth();
            return false;
        }
    }, [setAuth, clearAuth]);

    const checkAndRefreshSession = useCallback(async () => {
        const session = getSession();
        if (!session || !session.expires_at) {
            return;
        }

        const now = new Date().getTime();
        const expiresAt = new Date(session.expires_at).getTime();
        const timeRemaining = expiresAt - now;

        // If less than 2 minutes remaining, refresh
        if (timeRemaining < SESSION_REFRESH_THRESHOLD && timeRemaining > 0) {
            console.log('[useAuth] Session expiring soon, refreshing...');
            await refreshSession();
        }
    }, [getSession, refreshSession]);

    // Periodic session check
    useEffect(() => {
        if (isAuthenticated) {
            // Check immediately on mount
            checkAndRefreshSession();

            // Set up interval
            sessionCheckInterval.current = setInterval(
                checkAndRefreshSession,
                SESSION_CHECK_INTERVAL
            );
        }

        return () => {
            if (sessionCheckInterval.current) {
                clearInterval(sessionCheckInterval.current);
            }
        };
    }, [isAuthenticated, checkAndRefreshSession]);

    const logout = useCallback(async () => {
        setLoading(true);

        try {
            await logoutUser();
            clearAuth();

            return {
                success: true,
                error: null,
            };
        } catch (error) {
            const message = handleError(error);

            return {
                success: false,
                error: message,
            };
        } finally {
            setLoading(false);
        }
    }, [clearAuth, setLoading, handleError]);

    return {
        user,
        token,
        isAuthenticated,
        isLoading,
        setAuth,
        setError,
        clearAuth,
        setLoading,
        getSession,
        checkSessionExpiry,
        logout,
        refreshSession,
    };
}

export { useAuth };
