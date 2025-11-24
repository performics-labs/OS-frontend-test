import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { LogoutButton } from '@/components/LogoutButton';

vi.mock('@/hooks', () => ({
    useAuth: vi.fn(),
}));

const navigate = vi.fn();

vi.mock('react-router', async () => {
    const router = await vi.importActual('react-router');
    return {
        ...router,
        useNavigate: () => navigate,
    };
});

import { useAuth } from '@/hooks';

describe('<LogoutButton />', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('Should render logout button', () => {
        (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            isAuthenticated: true,
            logout: vi.fn(),
            clearAuth: vi.fn(),
        });

        render(<LogoutButton />);

        expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    });

    it('Should return null if user is not authenticated', () => {
        (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            isAuthenticated: false,
            logout: vi.fn(),
            clearAuth: vi.fn(),
        });

        const { container } = render(<LogoutButton />);

        expect(container).toBeEmptyDOMElement();
    });

    it('Should logout user, call clearAuth, and navigate on click', async () => {
        Object.defineProperty(window, 'location', {
            writable: true,
            value: { href: '' },
        });

        const logout = vi.fn().mockResolvedValue({ success: true });
        const clearAuth = vi.fn();

        (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            isAuthenticated: true,
            logout,
            clearAuth,
        });

        render(<LogoutButton />);

        const logoutButton = screen.getByRole('button', { name: /logout/i });

        fireEvent.click(logoutButton);

        await waitFor(() => {
            expect(logout).toHaveBeenCalledTimes(1);
            expect(window.location.href).toContain(`/login`);
        });
    });
});
