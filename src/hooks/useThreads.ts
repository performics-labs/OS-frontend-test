import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchThreads, deleteThread } from '@/services/threads/thread-service';
import { useAuthStore } from '@/stores/auth-store';

const THREADS_QUERY_KEY = ['threads'];

export function useThreads(limit: number = 50) {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);

    const {
        data: threads = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: THREADS_QUERY_KEY,
        queryFn: () => fetchThreads(limit),
        enabled: !!user,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteThread,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: THREADS_QUERY_KEY });
        },
    });

    return {
        threads,
        isLoading,
        error,
        deleteThread: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
    };
}
