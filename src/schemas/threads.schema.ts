import { z } from 'zod';

export const ThreadSchema = z.object({
    id: z.string(),
    user_id: z.string(),
    title: z.string(),
    metadata: z.record(z.string(), z.unknown()),
    created_at: z.string(),
    updated_at: z.string(),
    project_id: z.string().nullable(),
});

export const ThreadsResponseSchema = z.object({
    success: z.boolean().optional(),
    data: z.object({
        threads: z.array(ThreadSchema),
        has_more: z.boolean().optional(),
        next_cursor: z.string().nullable().optional(),
    }),
});

export type Thread = z.infer<typeof ThreadSchema>;
export type ThreadsResponse = z.infer<typeof ThreadsResponseSchema>;
