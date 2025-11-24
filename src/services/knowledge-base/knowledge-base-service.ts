import { apiClient } from '@/lib/api-client';
import { API_ROUTES } from '@/constants';
import type {
    KBDocument,
    KBDocumentsResponse,
    CreateKBDocRequest,
    UpdateKBDocRequest,
    PublishKBDocRequest,
    UnpublishKBDocRequest,
    LockKBDocRequest,
    KBVersionsResponse,
    KBTreeResponse,
} from '@/types/knowledgeBase';
import {
    KBDocumentSchema,
    KBDocumentsResponseSchema,
    CreateKBDocRequestSchema,
    UpdateKBDocRequestSchema,
    KBVersionsResponseSchema,
    KBTreeResponseSchema,
} from '@/schemas/knowledgeBase.schema';

export type ListKBDocsParams = {
    category?: string;
    status?: string;
    tags?: string[];
    searchQuery?: string;
    limit?: number;
    offset?: number;
};

export async function fetchKBDocuments(params: ListKBDocsParams): Promise<KBDocumentsResponse> {
    const queryParams: Record<string, string> = {};

    if (params.category) queryParams.category = params.category;
    if (params.status) queryParams.status = params.status;
    if (params.tags && params.tags.length > 0) queryParams.tags = params.tags.join(',');
    if (params.searchQuery) queryParams.search_query = params.searchQuery;
    if (params.limit) queryParams.limit = String(params.limit);
    if (params.offset) queryParams.offset = String(params.offset);

    const response = await apiClient.get(API_ROUTES.KB_DOCS, { params: queryParams });
    return KBDocumentsResponseSchema.parse(response.data);
}

export async function fetchKBDocument(id: string): Promise<KBDocument> {
    const response = await apiClient.get(API_ROUTES.KB_DOC(id));
    return KBDocumentSchema.parse(response.data.document);
}

export async function fetchKBDocumentBySlug(slug: string): Promise<KBDocument> {
    const response = await apiClient.get(API_ROUTES.KB_DOC_BY_SLUG(slug));
    return KBDocumentSchema.parse(response.data.document);
}

export async function createKBDocument(data: CreateKBDocRequest): Promise<KBDocument> {
    const validatedData = CreateKBDocRequestSchema.parse(data);
    const response = await apiClient.post(API_ROUTES.KB_DOCS, validatedData);
    return KBDocumentSchema.parse(response.data.document);
}

export async function updateKBDocument(id: string, data: UpdateKBDocRequest): Promise<KBDocument> {
    const validatedData = UpdateKBDocRequestSchema.parse(data);
    const response = await apiClient.put(API_ROUTES.KB_DOC(id), validatedData);
    return KBDocumentSchema.parse(response.data.document);
}

export async function publishKBDocument(
    id: string,
    data: PublishKBDocRequest
): Promise<KBDocument> {
    const response = await apiClient.post(API_ROUTES.KB_DOC_PUBLISH(id), data);
    return KBDocumentSchema.parse(response.data.document);
}

export async function unpublishKBDocument(
    id: string,
    data: UnpublishKBDocRequest
): Promise<KBDocument> {
    const response = await apiClient.post(API_ROUTES.KB_DOC_UNPUBLISH(id), data);
    return KBDocumentSchema.parse(response.data.document);
}

export async function lockKBDocument(id: string, data: LockKBDocRequest): Promise<void> {
    await apiClient.post(API_ROUTES.KB_DOC_LOCK(id), data);
}

export async function unlockKBDocument(id: string): Promise<void> {
    await apiClient.post(API_ROUTES.KB_DOC_UNLOCK(id));
}

export async function deleteKBDocument(id: string): Promise<void> {
    await apiClient.delete(API_ROUTES.KB_DOC(id));
}

export async function restoreKBDocument(id: string): Promise<void> {
    await apiClient.post(API_ROUTES.KB_DOC_RESTORE(id));
}

export async function fetchKBDocumentVersions(id: string): Promise<KBVersionsResponse> {
    const response = await apiClient.get(API_ROUTES.KB_DOC_VERSIONS(id));
    return KBVersionsResponseSchema.parse(response.data);
}

export type FetchKBTreeParams = {
    category?: string;
    status?: string;
    includeDrafts?: boolean;
};

export async function fetchKBDocumentsTree(params: FetchKBTreeParams): Promise<KBTreeResponse> {
    const queryParams: Record<string, string> = {};

    if (params.category) queryParams.category = params.category;
    if (params.status) queryParams.status = params.status;
    if (params.includeDrafts !== undefined)
        queryParams.include_drafts = String(params.includeDrafts);

    const response = await apiClient.get(API_ROUTES.KB_DOCS_TREE, { params: queryParams });
    return KBTreeResponseSchema.parse(response.data);
}
