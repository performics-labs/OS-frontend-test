import { create } from 'zustand';
import type { Session, User } from '@/types';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    error: string | null;
    isLoading: boolean;
}

export interface AuthActions {
    setAuth: (user: User) => void;
    clearAuth: () => void;
    getUser: () => User | null;
    getSession: () => Session | null;
    setError: (error: string | null) => void;
    checkSessionExpiry: () => boolean;
    setLoading: (isLoading: boolean) => void;
    setToken: (token: string) => void;
}

export type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    error: null,
    isLoading: false,
};

const useAuthStore = create<AuthStore>()(
    devtools(
        persist(
            (set, get, store) => ({
                ...initialState,
                setAuth: (user: User) => {
                    if (!user || !user.user_id || !user.email) {
                        set({ error: 'Invalid user data.' });
                        return;
                    }

                    // TODO: Should I check if a  previous user session exists but expired?

                    set({
                        user,
                        isAuthenticated: true,
                        error: null,
                        isLoading: false,
                    });
                },
                clearAuth: () => {
                    sessionStorage.removeItem('auth-storage');
                    set({ ...store.getInitialState() });
                },
                getUser: () => get().user,
                getSession: () => get().user?.session || null,
                setError: (error: string | null) => set({ error }),
                checkSessionExpiry: () => {
                    const { user } = get();
                    const session = user?.session;

                    if (!session || !session.sid) {
                        return true;
                    }

                    const now = new Date();
                    const expiry = new Date(session.expires_at);
                    const isExpired = isNaN(expiry.getTime()) || expiry <= now;

                    return isExpired;
                },
                setLoading: (isLoading: boolean) => set({ isLoading }),
                setToken: (token: string) => set({ token }),
                // TODO: Should I implement a validateSession function that both checks and resets the session?
            }),
            {
                name: 'auth-storage',
                storage: createJSONStorage(() => sessionStorage),
                partialize: ({ user, isAuthenticated }) => ({
                    user,
                    isAuthenticated,
                }),
                version: 1,
            }
        ),
        {
            name: 'auth-store',
        }
    )
);

export { useAuthStore };
