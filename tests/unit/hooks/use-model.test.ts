import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useModel } from '@/hooks';
import { fetchModels } from '@/services';
import { useModelStore, useAuthStore } from '@/stores';
import { DEFAULT_MODEL_OPTION, ERROR_MESSAGES } from '@/constants';
import type { Model, User } from '@/types';

vi.mock('@/services', () => ({
    fetchModels: vi.fn(),
}));

const MOCKED_MODELS: Model[] = [
    {
        id: 'model-1',
        name: 'Test Model 1',
        description: 'Test Description 1',
        provider: 'test-provider',
        badge: 'new',
    },
    {
        id: 'model-2',
        name: 'Test Model 2',
        description: 'Test Description 2',
        provider: 'test-provider',
        badge: 'experimental',
    },
];

const MOCK_USER: User = {
    user_id: 'test-user-123',
    email: 'test@publicisgroupe.com',
    display_name: 'Test User',
    roles: [],
    consent: {
        telemetry: true,
        model_training: false,
        marketing: false,
    },
    session: {
        sid: 'session-123',
        expires_at: new Date(Date.now() + 900000).toISOString(),
    },
};

describe('useModel', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        act(() => {
            useModelStore.setState({
                models: null,
                currentModel: DEFAULT_MODEL_OPTION,
                isLoading: false,
                error: null,
                currentUserId: null,
            });
            useAuthStore.setState({
                user: null,
                token: null,
                isAuthenticated: false,
                error: null,
                isLoading: false,
            });
        });
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('should fetch models on mount when models are not in store', async () => {
        (fetchModels as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            data: { models: MOCKED_MODELS },
        });

        const { result } = renderHook(() => useModel());

        expect(result.current.isLoading).toBe(true);
        expect(result.current.models).toBeNull();

        await waitFor(() => {
            expect(result.current.models).toEqual(MOCKED_MODELS);
        });

        expect(result.current.isLoading).toBe(false);
        expect(fetchModels).toHaveBeenCalledTimes(1);
    });

    it('should not fetch models if they are already in store', async () => {
        act(() => {
            useModelStore.setState({ models: MOCKED_MODELS });
        });

        const { result } = renderHook(() => useModel());

        expect(result.current.models).toEqual(MOCKED_MODELS);
        expect(fetchModels).not.toHaveBeenCalled();
    });

    it('should sync user model when user is authenticated', async () => {
        (fetchModels as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            data: { models: MOCKED_MODELS },
        });

        act(() => {
            useAuthStore.setState({ user: MOCK_USER, isAuthenticated: true });
        });

        const { result } = renderHook(() => useModel());

        await waitFor(() => {
            expect(result.current.models).toEqual(MOCKED_MODELS);
        });

        const store = useModelStore.getState();
        expect(store.currentUserId).toBe(MOCK_USER.user_id);
    });

    it('should handle API error correctly', async () => {
        const error = new Error('API Error');
        (fetchModels as ReturnType<typeof vi.fn>).mockRejectedValueOnce(error);

        const { result } = renderHook(() => useModel());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        const store = useModelStore.getState();
        expect(store.error).toBeTruthy();
        expect(result.current.models).toBeNull();
    });

    it('should handle missing models in API response', async () => {
        (fetchModels as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            data: { models: null },
        });

        const { result } = renderHook(() => useModel());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        const store = useModelStore.getState();
        expect(store.error).toBe(ERROR_MESSAGES.MODELS.MISSING_MODELS);
        expect(result.current.models).toBeNull();
    });

    it('should allow setting current model when user is authenticated', async () => {
        (fetchModels as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            data: { models: MOCKED_MODELS },
        });

        act(() => {
            useAuthStore.setState({ user: MOCK_USER, isAuthenticated: true });
        });

        const { result } = renderHook(() => useModel());

        await waitFor(() => {
            expect(result.current.models).toEqual(MOCKED_MODELS);
        });

        act(() => {
            result.current.setCurrentModel(MOCKED_MODELS[0]);
        });

        expect(useModelStore.getState().currentModel).toEqual(MOCKED_MODELS[0]);
    });

    it('should not set model when user is not authenticated', () => {
        const { result } = renderHook(() => useModel());

        act(() => {
            result.current.setCurrentModel(MOCKED_MODELS[0]);
        });

        expect(useModelStore.getState().currentModel).toEqual(DEFAULT_MODEL_OPTION);
    });

    it('should expose loading state control', () => {
        const { result } = renderHook(() => useModel());

        act(() => {
            result.current.setLoading(true);
        });

        expect(result.current.isLoading).toBe(true);

        act(() => {
            result.current.setLoading(false);
        });

        expect(result.current.isLoading).toBe(false);
    });

    it('should allow manually setting models', () => {
        const { result } = renderHook(() => useModel());

        act(() => {
            result.current.setModels(MOCKED_MODELS);
        });

        expect(result.current.models).toEqual(MOCKED_MODELS);
    });
});
