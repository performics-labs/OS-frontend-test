import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
} from '@/services/projects/project-service';
import { apiClient } from '@/lib/api-client';
import { API_ROUTES } from '@/constants';
import type { CreateProjectRequest, UpdateProjectRequest } from '@/types';

vi.mock('@/lib/api-client', () => ({
    apiClient: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    },
}));

describe('Project Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('fetchProjects', () => {
        it('should fetch projects for a user', async () => {
            const mockResponse = {
                data: {
                    projects: [
                        {
                            id: '1',
                            user_id: 'user-1',
                            owner_user_id: 'user-1',
                            name: 'Test Project',
                            description: 'Test description',
                            custom_instructions: null,
                            metadata: null,
                            last_activity_at: null,
                            created_at: '2024-01-01T00:00:00Z',
                            updated_at: '2024-01-01T00:00:00Z',
                        },
                    ],
                    total_count: 1,
                    owned_count: 1,
                    shared_count: 0,
                },
            };

            vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

            const result = await fetchProjects('user-1');

            expect(apiClient.get).toHaveBeenCalledWith(API_ROUTES.PROJECTS, {
                params: { user_id: 'user-1' },
            });
            expect(result.projects).toHaveLength(1);
            expect(result.projects[0].id).toBe('1');
        });
    });

    describe('fetchProject', () => {
        it('should fetch a single project by ID', async () => {
            const mockResponse = {
                data: {
                    project: {
                        id: '1',
                        user_id: 'user-1',
                        owner_user_id: 'user-1',
                        name: 'Test Project',
                        description: 'Test description',
                        custom_instructions: null,
                        metadata: null,
                        last_activity_at: null,
                        created_at: '2024-01-01T00:00:00Z',
                        updated_at: '2024-01-01T00:00:00Z',
                        documents: [],
                    },
                },
            };

            vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

            const result = await fetchProject('1');

            expect(apiClient.get).toHaveBeenCalledWith(API_ROUTES.PROJECT('1'));
            expect(result.id).toBe('1');
            expect(result.name).toBe('Test Project');
        });
    });

    describe('createProject', () => {
        it('should create a new project', async () => {
            const projectData: CreateProjectRequest = {
                user_id: 'user-1',
                name: 'New Project',
                description: 'New description',
            };

            const mockResponse = {
                data: {
                    project: {
                        id: '1',
                        user_id: 'user-1',
                        owner_user_id: 'user-1',
                        name: 'New Project',
                        description: 'New description',
                        custom_instructions: null,
                        metadata: null,
                        last_activity_at: null,
                        created_at: '2024-01-01T00:00:00Z',
                        updated_at: '2024-01-01T00:00:00Z',
                    },
                },
            };

            vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

            const result = await createProject(projectData);

            expect(apiClient.post).toHaveBeenCalledWith(API_ROUTES.PROJECTS, projectData);
            expect(result.name).toBe('New Project');
        });
    });

    describe('updateProject', () => {
        it('should update an existing project', async () => {
            const updateData: UpdateProjectRequest = {
                name: 'Updated Project',
                description: 'Updated description',
            };

            const mockResponse = {
                data: {
                    project: {
                        id: '1',
                        user_id: 'user-1',
                        owner_user_id: 'user-1',
                        name: 'Updated Project',
                        description: 'Updated description',
                        custom_instructions: null,
                        metadata: null,
                        last_activity_at: null,
                        created_at: '2024-01-01T00:00:00Z',
                        updated_at: '2024-01-02T00:00:00Z',
                    },
                },
            };

            vi.mocked(apiClient.put).mockResolvedValue(mockResponse);

            const result = await updateProject('1', updateData);

            expect(apiClient.put).toHaveBeenCalledWith(API_ROUTES.PROJECT('1'), updateData);
            expect(result.name).toBe('Updated Project');
        });
    });

    describe('deleteProject', () => {
        it('should delete a project', async () => {
            vi.mocked(apiClient.delete).mockResolvedValue({});

            await deleteProject('1');

            expect(apiClient.delete).toHaveBeenCalledWith(API_ROUTES.PROJECT('1'));
        });
    });
});
