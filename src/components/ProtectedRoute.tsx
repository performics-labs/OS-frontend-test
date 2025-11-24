import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/hooks';
import { APP_ROUTES } from '@/constants';
import { getCurrentSession } from '@/services';
import { Loader2 } from 'lucide-react';

function ProtectedRoute() {
    const { getSession, checkSessionExpiry, setAuth, clearAuth } = useAuth();
    const location = useLocation();
    const [isValidating, setIsValidating] = useState(true);
    const [isValid, setIsValid] = useState(false);

    const session = getSession();
    const isExpired = checkSessionExpiry();

    useEffect(() => {
        const validateSession = async () => {
            // If no local session or expired, skip backend validation
            if (!session || isExpired) {
                setIsValidating(false);
                setIsValid(false);
                return;
            }

            try {
                // Validate session with backend
                const response = await getCurrentSession();

                // Update auth store with fresh user data
                setAuth(response.data);
                setIsValid(true);
            } catch (error) {
                // Session invalid on backend (401, 403, etc.)
                console.warn('[ProtectedRoute] Backend session validation failed', error);
                clearAuth();
                setIsValid(false);
            } finally {
                setIsValidating(false);
            }
        };

        validateSession();
    }, [session?.sid]); // Re-validate when session ID changes

    // Show loading while validating
    if (isValidating) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // Redirect to login if invalid
    if (!isValid || !session || isExpired) {
        sessionStorage.setItem('auth_return_url', location.pathname);
        return <Navigate to={APP_ROUTES.LOGIN} replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;
