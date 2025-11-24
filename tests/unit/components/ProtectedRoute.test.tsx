vi.mock('react-router', async () => {
    const router = await vi.importActual('react-router');
    return {
        ...router,
        Navigate: vi.fn(() => null),
        useLocation: vi.fn(),
        Outlet: vi.fn(() => <div>Protected Content</div>),
    };
});

vi.mock('@/hooks', () => ({
    useAuth: vi.fn(),
}));

// Import AFTER mocks
import { render, screen } from '@testing-library/react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '@/hooks';
import ProtectedRoute from '@/components/ProtectedRoute';
import { APP_ROUTES } from '@/constants';

describe('ProtectedRoute', () => {
    const mockGetSession = vi.fn();
    const mockCheckSessionExpiry = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            getSession: mockGetSession,
            checkSessionExpiry: mockCheckSessionExpiry,
        });

        (useLocation as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            pathname: '/showcase',
            state: null,
        });

        // Mock sessionStorage
        Storage.prototype.setItem = vi.fn();
    });

    it('should render children when session exists', () => {
        mockGetSession.mockReturnValue({ user: { id: '123' } });
        mockCheckSessionExpiry.mockReturnValue(false);

        render(<ProtectedRoute />);

        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should redirect when session is undefined', () => {
        mockGetSession.mockReturnValue(undefined);
        mockCheckSessionExpiry.mockReturnValue(false);

        render(<ProtectedRoute />);

        expect(Navigate).toHaveBeenCalled();
        const props = (Navigate as ReturnType<typeof vi.fn>).mock.calls[0][0];
        expect(props.to).toBe(APP_ROUTES.LOGIN);
        expect(props.replace).toBe(true);
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should redirect to login and store return URL when not authenticated', () => {
        mockGetSession.mockReturnValue(null);
        mockCheckSessionExpiry.mockReturnValue(false);

        render(<ProtectedRoute />);

        expect(sessionStorage.setItem).toHaveBeenCalledWith('auth_return_url', '/showcase');
        expect(Navigate).toHaveBeenCalled();
        const props = (Navigate as ReturnType<typeof vi.fn>).mock.calls[0][0];
        expect(props.to).toBe(APP_ROUTES.LOGIN);
        expect(props.replace).toBe(true);
    });
});
