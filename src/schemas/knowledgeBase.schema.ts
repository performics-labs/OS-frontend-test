import { z } from 'zod';

export const KBCategorySchema = z.enum(['brand', 'channels', 'performance', 'client-management']);

export const KBStatusSchema = z.enum(['draft', 'published', 'archived']);

export const KBPrioritySchema = z.enum(['high', 'medium', 'low']);

export const KBDocumentSchema = z.object({
    id: z.string(),
    created_by_user_id: z.string(),
    updated_by_user_id: z.string().nullable(),
    title: z.string().min(1).max(255),
    content: z.string(),
    category: KBCategorySchema,
    slug: z.string(),
    tags: z.array(z.string()).nullable(),
    priority: KBPrioritySchema,
    applies_to: z.array(z.string()).nullable(),
    context_triggers: z.array(z.string()).nullable(),
    metadata: z.record(z.string(), z.unknown()).nullable(),
    s3_uri: z.string().nullable(),
    s3_path: z.string().nullable(),
    last_synced_at: z.string().nullable(),
    parent_id: z.string().nullable(),
    path: z.array(z.string()),
    depth: z.number().int(),
    is_folder: z.boolean(),
    sort_order: z.number().int(),
    version: z.number().int(),
    parent_version_id: z.string().nullable(),
    status: KBStatusSchema,
    is_locked: z.boolean(),
    locked_by_user_id: z.string().nullable(),
    locked_at: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
    deleted_at: z.string().nullable(),
});

export const CreateKBDocRequestSchema = z.object({
    created_by_user_id: z.string(),
    title: z.string().min(1).max(255),
    content: z.string(),
    category: KBCategorySchema,
    slug: z.string().optional(),
    tags: z.array(z.string()).optional(),
    priority: KBPrioritySchema.default('medium'),
    applies_to: z.array(z.string()).optional(),
    context_triggers: z.array(z.string()).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
    status: KBStatusSchema.default('draft'),
    parent_id: z.string().optional(),
    is_folder: z.boolean().default(false),
    sort_order: z.number().int().default(0).optional(),
});

export const UpdateKBDocRequestSchema = z.object({
    updated_by_user_id: z.string(),
    title: z.string().min(1).max(255).optional(),
    content: z.string().optional(),
    category: KBCategorySchema.optional(),
    tags: z.array(z.string()).optional(),
    priority: KBPrioritySchema.optional(),
    applies_to: z.array(z.string()).optional(),
    context_triggers: z.array(z.string()).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
    status: KBStatusSchema.optional(),
    parent_id: z.string().nullable().optional(),
    sort_order: z.number().int().optional(),
    create_version: z.boolean().optional(),
});

export const KBDocumentsResponseSchema = z.object({
    success: z.boolean(),
    documents: z.array(KBDocumentSchema),
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
});

export const KBDocumentResponseSchema = z.object({
    success: z.boolean(),
    document: KBDocumentSchema,
});

export const KBVersionsResponseSchema = z.object({
    success: z.boolean(),
    versions: z.array(KBDocumentSchema),
    total: z.number().int(),
});

export const PublishKBDocRequestSchema = z.object({
    updated_by_user_id: z.string(),
});

export const UnpublishKBDocRequestSchema = z.object({
    updated_by_user_id: z.string(),
});

export const LockKBDocRequestSchema = z.object({
    locked_by_user_id: z.string(),
});

export type KBTreeNode = z.infer<typeof KBDocumentSchema> & {
    children: KBTreeNode[];
};

export const KBTreeNodeSchema: z.ZodType<KBTreeNode> = KBDocumentSchema.extend({
    children: z.lazy(() => z.array(KBTreeNodeSchema)),
});

export const KBTreeResponseSchema = z.object({
    success: z.boolean(),
    tree: z.array(KBTreeNodeSchema),
    total_nodes: z.number().int(),
});
