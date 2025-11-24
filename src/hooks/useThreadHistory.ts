import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchThreadsPaginated,
    deleteThread,
    createThread,
} from '@/services/threads/thread-service';
import { useAuthStore } from '@/stores/auth-store';
import type { Thread } from '@/schemas/threads.schema';

const THREAD_HISTORY_QUERY_KEY = ['thread-history'];
const PAGE_SIZE = 20;

function isError(error: unknown): error is Error {
    return error instanceof Error;
}

interface ThreadPage {
    threads: Thread[];
    has_more: boolean;
}

interface InfiniteThreadData {
    pages: ThreadPage[];
    pageParams: (string | undefined)[];
}

interface UseThreadHistoryReturn {
    threads: Thread[];
    isLoading: boolean;
    isFetchingNextPage: boolean;
    hasNextPage: boolean;
    error: Error | null;
    fetchNextPage: () => void;
    deleteThread: (threadId: string) => Promise<void>;
    isDeleting: boolean;
    createThread: (title?: string) => Promise<Thread>;
    isCreating: boolean;
}

export function useThreadHistory(): UseThreadHistoryReturn {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);

    const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
        useInfiniteQuery({
            queryKey: THREAD_HISTORY_QUERY_KEY,
            queryFn: ({ pageParam }) =>
                fetchThreadsPaginated({
                    limit: PAGE_SIZE,
                    ending_before: pageParam,
                }),
            getNextPageParam: (lastPage) => {
                if (
                    !lastPage ||
                    !lastPage.threads ||
                    !Array.isArray(lastPage.threads) ||
                    !lastPage.has_more ||
                    lastPage.threads.length === 0
                ) {
                    return undefined;
                }
                return lastPage.threads[lastPage.threads.length - 1].id;
            },
            initialPageParam: undefined as string | undefined,
            enabled: !!user,
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        });

    const threads = data?.pages.flatMap((page) => page.threads) ?? [];

    const deleteMutation = useMutation({
        mutationFn: deleteThread,
        onMutate: async (threadId) => {
            await queryClient.cancelQueries({ queryKey: THREAD_HISTORY_QUERY_KEY });

            const previousData = queryClient.getQueryData(THREAD_HISTORY_QUERY_KEY);

            queryClient.setQueryData<InfiniteThreadData>(THREAD_HISTORY_QUERY_KEY, (old) => {
                if (!old) return old;

                return {
                    ...old,
                    pages: old.pages.map((page) => ({
                        ...page,
                        threads: page.threads.filter((t) => t.id !== threadId),
                    })),
                };
            });

            return { previousData };
        },
        onError: (err, _threadId, context) => {
            console.error('[useThreadHistory] Error deleting thread:', err);
            if (context?.previousData) {
                queryClient.setQueryData(THREAD_HISTORY_QUERY_KEY, context.previousData);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: THREAD_HISTORY_QUERY_KEY });
        },
    });

    const createMutation = useMutation({
        mutationFn: createThread,
        onMutate: async (title) => {
            await queryClient.cancelQueries({ queryKey: THREAD_HISTORY_QUERY_KEY });

            const previousData = queryClient.getQueryData(THREAD_HISTORY_QUERY_KEY);

            const tempThread: Thread = {
                id: `temp-${crypto.randomUUID()}`,
                user_id: user?.user_id || '',
                title: title || 'New Chat',
                metadata: {},
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                project_id: null,
            };

            queryClient.setQueryData<InfiniteThreadData>(THREAD_HISTORY_QUERY_KEY, (old) => {
                if (!old || !old.pages) {
                    return {
                        pages: [{ threads: [tempThread], has_more: false }],
                        pageParams: [undefined],
                    };
                }

                return {
                    ...old,
                    pages: [
                        {
                            threads: [tempThread, ...old.pages[0].threads],
                            has_more: old.pages[0].has_more,
                        },
                        ...old.pages.slice(1),
                    ],
                };
            });

            return { previousData, tempThread };
        },
        onSuccess: (newThread, _title, context) => {
            queryClient.setQueryData<InfiniteThreadData>(THREAD_HISTORY_QUERY_KEY, (old) => {
                if (!old) return old;

                return {
                    ...old,
                    pages: old.pages.map((page, index) => {
                        if (index === 0) {
                            return {
                                ...page,
                                threads: page.threads.map((t) =>
                                    t.id === context?.tempThread.id ? newThread : t
                                ),
                            };
                        }
                        return page;
                    }),
                };
            });
        },
        onError: (err, _title, context) => {
            console.error('[useThreadHistory] Error creating thread:', err);
            if (context?.previousData) {
                queryClient.setQueryData(THREAD_HISTORY_QUERY_KEY, context.previousData);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: THREAD_HISTORY_QUERY_KEY });
        },
    });

    return {
        threads,
        isLoading,
        isFetchingNextPage,
        hasNextPage: hasNextPage ?? false,
        error: error && isError(error) ? error : null,
        fetchNextPage: () => fetchNextPage(),
        deleteThread: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
        createThread: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
    };
}
