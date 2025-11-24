import { z } from 'zod';
import {
    KBCategorySchema,
    KBStatusSchema,
    KBPrioritySchema,
    KBDocumentSchema,
    CreateKBDocRequestSchema,
    UpdateKBDocRequestSchema,
    KBDocumentsResponseSchema,
    KBDocumentResponseSchema,
    KBVersionsResponseSchema,
    PublishKBDocRequestSchema,
    UnpublishKBDocRequestSchema,
    LockKBDocRequestSchema,
    KBTreeResponseSchema,
    type KBTreeNode,
} from '@/schemas/knowledgeBase.schema';

export type KBCategory = z.infer<typeof KBCategorySchema>;
export type KBStatus = z.infer<typeof KBStatusSchema>;
export type KBPriority = z.infer<typeof KBPrioritySchema>;

export type KBDocument = z.infer<typeof KBDocumentSchema>;
export type CreateKBDocRequest = z.infer<typeof CreateKBDocRequestSchema>;
export type UpdateKBDocRequest = z.infer<typeof UpdateKBDocRequestSchema>;

export type KBDocumentsResponse = z.infer<typeof KBDocumentsResponseSchema>;
export type KBDocumentResponse = z.infer<typeof KBDocumentResponseSchema>;
export type KBVersionsResponse = z.infer<typeof KBVersionsResponseSchema>;

export type PublishKBDocRequest = z.infer<typeof PublishKBDocRequestSchema>;
export type UnpublishKBDocRequest = z.infer<typeof UnpublishKBDocRequestSchema>;
export type LockKBDocRequest = z.infer<typeof LockKBDocRequestSchema>;

export type { KBTreeNode };
export type KBTreeResponse = z.infer<typeof KBTreeResponseSchema>;
