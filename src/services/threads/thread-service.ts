import { apiClient } from '@/lib/api-client';
import { API_ROUTES } from '@/constants';
import type { Thread } from '@/schemas/threads.schema';
import { ThreadsResponseSchema } from '@/schemas/threads.schema';

export interface FetchThreadsParams {
    limit?: number;
    ending_before?: string;
    starting_after?: string;
}

export async function fetchThreads(limit: number = 50): Promise<Thread[]> {
    const response = await apiClient.get(API_ROUTES.THREADS, {
        params: {
            limit,
        },
    });
    const parsed = ThreadsResponseSchema.parse(response.data);
    return parsed.data.threads;
}

export async function fetchThreadsPaginated(
    params: FetchThreadsParams = {}
): Promise<{ threads: Thread[]; has_more: boolean }> {
    const response = await apiClient.get(API_ROUTES.THREADS, {
        params: {
            limit: params.limit || 20,
            ending_before: params.ending_before,
            starting_after: params.starting_after,
        },
    });
    const parsed = ThreadsResponseSchema.parse(response.data);
    return {
        threads: parsed.data.threads,
        has_more: parsed.data.has_more ?? false,
    };
}

export async function createThread(title: string = 'New Chat'): Promise<Thread> {
    const response = await apiClient.post(API_ROUTES.THREADS, {
        title,
    });

    return response.data.data;
}

export async function deleteThread(threadId: string): Promise<void> {
    await apiClient.delete(`${API_ROUTES.THREADS}/${threadId}`);
}

export async function fetchProjectThreads(projectId: string): Promise<Thread[]> {
    const response = await apiClient.get(API_ROUTES.PROJECT_THREADS(projectId));
    const parsed = ThreadsResponseSchema.parse(response.data);
    return parsed.data.threads;
}
