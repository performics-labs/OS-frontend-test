import { apiClient } from '@/lib/api-client';
import { API_ROUTES } from '@/constants';
import type {
    ProjectsResponse,
    Project,
    ProjectWithDocuments,
    CreateProjectRequest,
    UpdateProjectRequest,
} from '@/types';
import {
    ProjectsResponseSchema,
    ProjectSchema,
    ProjectWithDocumentsSchema,
    CreateProjectRequestSchema,
    UpdateProjectRequestSchema,
} from '@/schemas/projects.schema';

export async function fetchProjects(
    userId: string
): Promise<ProjectsResponse> {
    const response = await apiClient.get(API_ROUTES.PROJECTS, {
        params: {
            user_id: userId,
        },
    });
    return ProjectsResponseSchema.parse(response.data);
}

export async function fetchProject(id: string): Promise<ProjectWithDocuments> {
    const response = await apiClient.get(API_ROUTES.PROJECT(id));
    return ProjectWithDocumentsSchema.parse(response.data.project);
}

export async function createProject(data: CreateProjectRequest): Promise<Project> {
    const validatedData = CreateProjectRequestSchema.parse(data);
    const response = await apiClient.post(API_ROUTES.PROJECTS, validatedData);
    return ProjectSchema.parse(response.data.project);
}

export async function updateProject(id: string, data: UpdateProjectRequest): Promise<Project> {
    const validatedData = UpdateProjectRequestSchema.parse(data);
    const response = await apiClient.put(API_ROUTES.PROJECT(id), validatedData);
    return ProjectSchema.parse(response.data.project);
}

export async function deleteProject(id: string): Promise<void> {
    await apiClient.delete(API_ROUTES.PROJECT(id));
}
