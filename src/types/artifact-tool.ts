import { z } from 'zod';

const artifactKindSchema = z.enum(['text', 'code', 'image', 'spreadsheet']);

export const artifactResultSchema = z.object({
    id: z.string(),
    title: z.string(),
    kind: artifactKindSchema,
    content: z.string().optional(),
    language: z.string().optional(),
});

export const artifactInputSchema = z.object({
    title: z.string(),
    kind: artifactKindSchema,
});

export type ArtifactResult = z.infer<typeof artifactResultSchema>;
export type ArtifactInput = z.infer<typeof artifactInputSchema>;
