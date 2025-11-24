import { z } from 'zod';

export const suggestionSchema = z.object({
    id: z.string().uuid(),
    documentId: z.string().uuid(),
    documentCreatedAt: z.date(),
    originalText: z.string(),
    suggestedText: z.string(),
    description: z.string().nullable(),
    isResolved: z.boolean().default(false),
    userId: z.string().uuid(),
    createdAt: z.date(),
});

export type Suggestion = z.infer<typeof suggestionSchema>;
