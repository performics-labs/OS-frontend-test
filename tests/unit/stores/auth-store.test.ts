import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/stores';
import type { User } from '@/types';

describe('Auth Store', () => {
    const testUser: User = {
        user_id: '000',
        email: 'test@example.com',
        display_name: 'Test',
        roles: ['user'],
        consent: {
            telemetry: true,
            model_training: false,
            marketing: false,
        },
        session: {
            sid: 'sid-1',
            expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        },
    };

    beforeEach(() => {
        useAuthStore.setState({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
            isLoading: false,
        });
    });

    it('Should set user and mark it as authenticated', () => {
        useAuthStore.getState().setAuth(testUser);

        const { user, isAuthenticated, error } = useAuthStore.getState();

        expect(user).toEqual(testUser);
        expect(isAuthenticated).toBe(true);
        expect(error).toBeNull();
    });

    it('Should clear auth state', () => {
        useAuthStore.getState().setAuth(testUser);

        const { clearAuth } = useAuthStore.getState();
        clearAuth();

        const { user, isAuthenticated } = useAuthStore.getState();

        expect(user).toBeNull();
        expect(isAuthenticated).toBe(false);
    });

    it('Should set and get token', () => {
        useAuthStore.getState().setToken('123');

        const { token } = useAuthStore.getState();

        expect(token).toBe('123');
    });

    it('Should detect an expired session', () => {
        const expiredTestUser: User = {
            ...testUser,
            session: {
                ...testUser.session,
                expires_at: new Date(Date.now() - 1000).toISOString(),
            },
        };

        useAuthStore.getState().setAuth(expiredTestUser);

        const { checkSessionExpiry } = useAuthStore.getState();
        const isExpired = checkSessionExpiry();

        expect(isExpired).toBe(true);
    });

    it('Should detect an invalid user', () => {
        // @ts-expect-error intentionally invalid
        useAuthStore.getState().setAuth({ user_id: '', email: '' });

        const { error } = useAuthStore.getState();

        expect(error).toBe('Invalid user data.');
    });
});
