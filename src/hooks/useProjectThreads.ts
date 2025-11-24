import { useQuery } from '@tanstack/react-query';
import { fetchProjectThreads } from '@/services/threads/thread-service';
import { useAuthStore } from '@/stores/auth-store';

export function useProjectThreads(projectId: string | undefined) {
    const user = useAuthStore((state) => state.user);

    const {
        data: threads = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ['project-threads', projectId],
        queryFn: () => fetchProjectThreads(projectId!),
        enabled: !!user && !!projectId,
    });

    return {
        threads,
        isLoading,
        error,
    };
}
