import { z } from 'zod';
import {
    DocumentTypeSchema,
    ProjectSchema,
    ProjectDocumentSchema,
    ProjectWithDocumentsSchema,
    CreateProjectRequestSchema,
    UpdateProjectRequestSchema,
    ProjectsResponseSchema,
    ProjectResponseSchema,
    UploadDocumentInputSchema,
    DocumentUploadProgressSchema,
} from '@/schemas/projects.schema';

export type DocumentType = z.infer<typeof DocumentTypeSchema>;

export type Project = z.infer<typeof ProjectSchema>;
export type ProjectDocument = z.infer<typeof ProjectDocumentSchema>;
export type ProjectWithDocuments = z.infer<typeof ProjectWithDocumentsSchema>;

export type CreateProjectRequest = z.infer<typeof CreateProjectRequestSchema>;
export type UpdateProjectRequest = z.infer<typeof UpdateProjectRequestSchema>;

export type ProjectsResponse = z.infer<typeof ProjectsResponseSchema>;
export type ProjectResponse = z.infer<typeof ProjectResponseSchema>;

export type UploadDocumentInput = z.infer<typeof UploadDocumentInputSchema>;
export type DocumentUploadProgress = z.infer<typeof DocumentUploadProgressSchema>;
