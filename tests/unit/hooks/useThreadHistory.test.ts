import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';

vi.mock('@/services/threads/thread-service', () => ({
    fetchThreadsPaginated: vi.fn(),
    deleteThread: vi.fn(),
    createThread: vi.fn(),
}));

vi.mock('@/stores/auth-store', () => ({
    useAuthStore: vi.fn(() => ({
        user: {
            user_id: 'test-user-id',
            email: 'test@example.com',
        },
    })),
}));

import { useThreadHistory } from '@/hooks/useThreadHistory';
import { fetchThreadsPaginated } from '@/services/threads/thread-service';

const mockFetchThreadsPaginated = fetchThreadsPaginated as ReturnType<typeof vi.fn>;

function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    return function Wrapper({ children }: { children: ReactNode }) {
        return createElement(QueryClientProvider, { client: queryClient }, children);
    };
}

describe('useThreadHistory Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch and return threads', async () => {
        const mockThreads = [
            {
                id: 'thread-1',
                user_id: 'test-user-id',
                title: 'Test Thread 1',
                metadata: {},
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                project_id: null,
            },
        ];

        mockFetchThreadsPaginated.mockResolvedValueOnce({
            threads: mockThreads,
            has_more: false,
        });

        const { result } = renderHook(() => useThreadHistory(), {
            wrapper: createWrapper(),
        });

        expect(result.current.isLoading).toBe(true);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.threads).toEqual(mockThreads);
        expect(result.current.error).toBe(null);
    });

    it('should handle pagination correctly', async () => {
        const mockPage1 = {
            threads: [
                {
                    id: 'thread-1',
                    user_id: 'test-user-id',
                    title: 'Thread 1',
                    metadata: {},
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    project_id: null,
                },
            ],
            has_more: true,
        };

        const mockPage2 = {
            threads: [
                {
                    id: 'thread-2',
                    user_id: 'test-user-id',
                    title: 'Thread 2',
                    metadata: {},
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    project_id: null,
                },
            ],
            has_more: false,
        };

        mockFetchThreadsPaginated.mockResolvedValueOnce(mockPage1).mockResolvedValueOnce(mockPage2);

        const { result } = renderHook(() => useThreadHistory(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.threads).toHaveLength(1);
        expect(result.current.hasNextPage).toBe(true);
    });

    it('should return empty threads array when no data', async () => {
        mockFetchThreadsPaginated.mockResolvedValue({
            threads: [],
            has_more: false,
        });

        const { result } = renderHook(() => useThreadHistory(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.hasNextPage).toBe(false);
    });
});
