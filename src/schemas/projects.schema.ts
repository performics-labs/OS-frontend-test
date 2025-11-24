import { z } from 'zod';

export const DocumentTypeSchema = z.enum(['pdf', 'txt', 'md', 'docx', 'csv', 'json', 'image']);

export const ProjectSchema = z.object({
    id: z.string(),
    owner_user_id: z.string(),
    user_id: z.string(),
    name: z.string().min(1).max(255),
    description: z.string().nullable(),
    custom_instructions: z.string().nullable(),
    metadata: z.record(z.string(), z.unknown()).nullable(),
    last_activity_at: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string().nullable(),
});

export const ProjectDocumentSchema = z.object({
    id: z.string(),
    project_id: z.string(),
    name: z.string(),
    type: DocumentTypeSchema,
    size: z.number().int().min(0),
    content: z.string().optional(),
    uploaded_at: z.string(),
});

export const ProjectWithDocumentsSchema = ProjectSchema.extend({
    documents: z.array(ProjectDocumentSchema),
});

export const CreateProjectRequestSchema = z.object({
    user_id: z.string(),
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    custom_instructions: z.string().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
});

export const UpdateProjectRequestSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    custom_instructions: z.string().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
});

export const ProjectsResponseSchema = z.object({
    success: z.boolean().optional(),
    projects: z.array(ProjectSchema),
    total_count: z.number().int().min(0),
    owned_count: z.number().int().min(0),
    shared_count: z.number().int().min(0),
});

export const ProjectResponseSchema = z.object({
    success: z.boolean().optional(),
    project: z.union([ProjectSchema, ProjectWithDocumentsSchema]),
});

export const UploadDocumentInputSchema = z.object({
    projectId: z.string(),
    file: z.instanceof(File),
});

export const DocumentUploadProgressSchema = z.object({
    documentId: z.string(),
    fileName: z.string(),
    progress: z.number().min(0).max(100),
    status: z.enum(['pending', 'uploading', 'processing', 'complete', 'error']),
    error: z.string().optional(),
});
