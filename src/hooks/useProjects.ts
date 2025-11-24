import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
} from '@/services';
import type { UpdateProjectRequest, CreateProjectRequest } from '@/types';
import { useAuthStore } from '@/stores/auth-store';

const PROJECTS_QUERY_KEY = (userId: string) => ['projects', userId];
const PROJECT_QUERY_KEY = (userId: string, id: string) => ['projects', userId, id];

export function useProjects() {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);
    const userId = user?.user_id;

    const {
        data: projectsData,
        isLoading,
        error,
    } = useQuery({
        queryKey: PROJECTS_QUERY_KEY(userId || ''),
        queryFn: () => fetchProjects(userId || ''),
        enabled: !!userId,
    });

    const createMutation = useMutation({
        mutationFn: (data: Omit<CreateProjectRequest, 'user_id'>) => {
            if (!userId) throw new Error('User not authenticated');
            return createProject({ ...data, user_id: userId });
        },
        onSuccess: () => {
            if (userId) {
                queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY(userId) });
            }
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateProjectRequest }) =>
            updateProject(id, data),
        onSuccess: (_data: unknown, variables: { id: string; data: UpdateProjectRequest }) => {
            if (userId) {
                queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY(userId) });
                queryClient.invalidateQueries({
                    queryKey: PROJECT_QUERY_KEY(userId, variables.id),
                });
            }
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteProject,
        onSuccess: () => {
            if (userId) {
                queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY(userId) });
            }
        },
    });

    return {
        projects: projectsData?.projects ?? [],
        isLoading,
        error,
        createProject: createMutation.mutateAsync,
        updateProject: updateMutation.mutateAsync,
        deleteProject: deleteMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}

export function useProject(id: string) {
    const user = useAuthStore((state) => state.user);
    const userId = user?.user_id;

    const { data, isLoading, error } = useQuery({
        queryKey: PROJECT_QUERY_KEY(userId || '', id),
        queryFn: () => fetchProject(id),
        enabled: !!id && !!userId,
    });

    return {
        project: data,
        isLoading,
        error,
    };
}
