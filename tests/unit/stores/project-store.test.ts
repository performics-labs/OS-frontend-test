import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore } from '@/stores/project-store';
import type {
    Project,
    ProjectDocument,
    ProjectWithDocuments,
    DocumentUploadProgress,
} from '@/types';

// Helper to get current project from normalized store
const getCurrentProject = () => {
    const state = useProjectStore.getState();
    if (!state.currentProjectId || !state.projects) return null;
    const project = state.projects.find((p) => p.id === state.currentProjectId);
    if (!project) return null;
    return {
        ...project,
        documents: Object.values(state.documents),
    };
};

describe('Project Store', () => {
    beforeEach(() => {
        useProjectStore.getState().resetProjectState();
    });

    const createMockProject = (overrides?: Partial<Project>): Project => ({
        id: '1',
        user_id: 'user-1',
        owner_user_id: 'user-1',
        name: 'Test Project',
        description: 'Test description',
        custom_instructions: null,
        metadata: null,
        last_activity_at: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        ...overrides,
    });

    const createMockDocument = (overrides?: Partial<ProjectDocument>): ProjectDocument => ({
        id: 'doc-1',
        project_id: '1',
        name: 'test.pdf',
        type: 'pdf',
        size: 1024,
        uploaded_at: '2024-01-01',
        ...overrides,
    });

    describe('setCurrentProject', () => {
        it('should set the current project', () => {
            const project: ProjectWithDocuments = {
                ...createMockProject(),
                documents: [],
            };

            // First set projects so the helper can find the project
            useProjectStore.getState().setProjects([project]);
            useProjectStore.getState().setCurrentProject(project);

            expect(getCurrentProject()).toEqual(project);
        });

        it('should reset documents and selection when setting project', () => {
            const project: ProjectWithDocuments = {
                ...createMockProject(),
                documents: [createMockDocument()],
            };

            useProjectStore.getState().setCurrentProject(project);

            // Documents now stored as Record
            expect(Object.keys(useProjectStore.getState().documents)).toHaveLength(1);
            expect(useProjectStore.getState().selectedDocumentIds).toEqual([]);
        });
    });

    describe('setProjects', () => {
        it('should set the projects list', () => {
            const projects: Project[] = [createMockProject()];

            useProjectStore.getState().setProjects(projects);

            expect(useProjectStore.getState().projects).toEqual(projects);
        });
    });

    describe('document management', () => {
        it('should add a document', () => {
            const document = createMockDocument();

            useProjectStore.getState().addDocument(document);

            // Documents now stored as Record
            expect(Object.values(useProjectStore.getState().documents)).toContain(document);
        });

        it('should remove a document', () => {
            const document = createMockDocument();

            useProjectStore.getState().addDocument(document);
            useProjectStore.getState().removeDocument('doc-1');

            // Documents now stored as Record
            expect(Object.keys(useProjectStore.getState().documents)).toHaveLength(0);
        });

        it('should set documents', () => {
            const documents: ProjectDocument[] = [
                createMockDocument({ id: 'doc-1', name: 'test1.pdf' }),
                createMockDocument({ id: 'doc-2', name: 'test2.pdf', size: 2048 }),
            ];

            useProjectStore.getState().setDocuments(documents);

            // Documents are now stored as Record<id, document>
            expect(Object.values(useProjectStore.getState().documents)).toEqual(documents);
        });
    });

    describe('document selection', () => {
        it('should set selected document IDs', () => {
            const ids = ['doc-1', 'doc-2'];

            useProjectStore.getState().setSelectedDocumentIds(ids);

            expect(useProjectStore.getState().selectedDocumentIds).toEqual(ids);
        });

        it('should toggle document selection', () => {
            useProjectStore.getState().toggleDocumentSelection('doc-1');

            expect(useProjectStore.getState().selectedDocumentIds).toContain('doc-1');

            useProjectStore.getState().toggleDocumentSelection('doc-1');

            expect(useProjectStore.getState().selectedDocumentIds).not.toContain('doc-1');
        });

        it('should clear document selection', () => {
            useProjectStore.getState().setSelectedDocumentIds(['doc-1', 'doc-2']);
            useProjectStore.getState().clearDocumentSelection();

            expect(useProjectStore.getState().selectedDocumentIds).toEqual([]);
        });
    });

    describe('upload progress', () => {
        it('should update upload progress', () => {
            const progress: DocumentUploadProgress = {
                documentId: 'doc-1',
                fileName: 'test.pdf',
                progress: 50,
                status: 'uploading',
            };

            useProjectStore.getState().updateUploadProgress('doc-1', progress);

            expect(useProjectStore.getState().uploadProgress['doc-1']).toEqual(progress);
        });

        it('should remove upload progress', () => {
            const progress: DocumentUploadProgress = {
                documentId: 'doc-1',
                fileName: 'test.pdf',
                progress: 50,
                status: 'uploading',
            };

            useProjectStore.getState().updateUploadProgress('doc-1', progress);
            useProjectStore.getState().removeUploadProgress('doc-1');

            expect(useProjectStore.getState().uploadProgress['doc-1']).toBeUndefined();
        });
    });

    describe('state management', () => {
        it('should set loading state', () => {
            useProjectStore.getState().setLoading(true);

            expect(useProjectStore.getState().isLoading).toBe(true);
        });

        it('should set uploading document state', () => {
            useProjectStore.getState().setUploadingDocument(true);

            expect(useProjectStore.getState().isUploadingDocument).toBe(true);
        });

        it('should set error', () => {
            useProjectStore.getState().setError('Test error');

            expect(useProjectStore.getState().error).toBe('Test error');
        });

        it('should set project stats', () => {
            const stats = {
                total_count: 10,
                owned_count: 5,
                shared_count: 5,
            };

            useProjectStore.getState().setProjectStats(stats);

            expect(useProjectStore.getState().projectStats).toEqual(stats);
        });

        it('should set current workspace ID', () => {
            useProjectStore.getState().setCurrentWorkspaceId('workspace-1');

            expect(useProjectStore.getState().currentWorkspaceId).toBe('workspace-1');
        });
    });

    describe('resetProjectState', () => {
        it('should reset to initial state', () => {
            useProjectStore.getState().setProjects([createMockProject()]);
            useProjectStore.getState().setError('Error');
            useProjectStore.getState().setLoading(true);

            useProjectStore.getState().resetProjectState();

            expect(useProjectStore.getState().projects).toBeNull();
            expect(useProjectStore.getState().error).toBeNull();
            expect(useProjectStore.getState().isLoading).toBe(false);
        });
    });
});
