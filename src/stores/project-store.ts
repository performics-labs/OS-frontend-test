import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
    Project,
    ProjectDocument,
    ProjectWithDocuments,
    DocumentUploadProgress,
} from '@/types';

export type ProjectStats = {
    total_count: number;
    owned_count: number;
    shared_count: number;
};

export type ProjectState = {
    currentProjectId: string | null; // Normalized: Only store ID
    projects: Project[] | null;
    documents: Record<string, ProjectDocument>; // Normalized: documents by ID
    selectedDocumentIds: string[];
    uploadProgress: Record<string, DocumentUploadProgress>;
    projectStats: ProjectStats | null;
    currentWorkspaceId: string | null;
    isLoading: boolean;
    isUploadingDocument: boolean;
    error: string | null;
};

export type ProjectActions = {
    setCurrentProject: (project: ProjectWithDocuments | null) => void;
    setProjects: (projects: Project[]) => void;
    setDocuments: (documents: ProjectDocument[]) => void;
    addDocument: (document: ProjectDocument) => void;
    removeDocument: (documentId: string) => void;
    setSelectedDocumentIds: (ids: string[]) => void;
    toggleDocumentSelection: (documentId: string) => void;
    clearDocumentSelection: () => void;
    updateUploadProgress: (documentId: string, progress: DocumentUploadProgress) => void;
    removeUploadProgress: (documentId: string) => void;
    setProjectStats: (stats: ProjectStats) => void;
    setCurrentWorkspaceId: (id: string | null) => void;
    setLoading: (isLoading: boolean) => void;
    setUploadingDocument: (isUploading: boolean) => void;
    setError: (error: string | null) => void;
    resetProjectState: () => void;
};

export type ProjectStore = ProjectState & ProjectActions;

const initialState: ProjectState = {
    currentProjectId: null,
    projects: null,
    documents: {},
    selectedDocumentIds: [],
    uploadProgress: {},
    projectStats: null,
    currentWorkspaceId: null,
    isLoading: false,
    isUploadingDocument: false,
    error: null,
};

const useProjectStore = create<ProjectStore>()(
    devtools(
        (set, get) => ({
            ...initialState,

            setCurrentProject: (project: ProjectWithDocuments | null) => {
                if (!project) {
                    set({
                        currentProjectId: null,
                        documents: {},
                        selectedDocumentIds: [],
                    });
                    return;
                }

                // Normalize documents to Record<id, document>
                const documentsById = (project.documents || []).reduce(
                    (acc, doc) => {
                        acc[doc.id] = doc;
                        return acc;
                    },
                    {} as Record<string, ProjectDocument>
                );

                // Extract project without documents for projects array
                const { documents: _, ...projectWithoutDocs } = project;

                // Update or add project to projects array
                const currentProjects = get().projects || [];
                const projectIndex = currentProjects.findIndex((p) => p.id === project.id);
                const updatedProjects =
                    projectIndex >= 0
                        ? currentProjects.map((p, i) =>
                              i === projectIndex ? projectWithoutDocs : p
                          )
                        : [...currentProjects, projectWithoutDocs];

                set({
                    currentProjectId: project.id,
                    projects: updatedProjects,
                    documents: documentsById,
                    selectedDocumentIds: [],
                });
            },

            setProjects: (projects: Project[]) => {
                set({ projects });
            },

            setDocuments: (documents: ProjectDocument[]) => {
                const documentsById = documents.reduce(
                    (acc, doc) => {
                        acc[doc.id] = doc;
                        return acc;
                    },
                    {} as Record<string, ProjectDocument>
                );
                set({ documents: documentsById });
            },

            addDocument: (document: ProjectDocument) => {
                const { documents } = get();
                set({
                    documents: {
                        ...documents,
                        [document.id]: document,
                    },
                });
            },

            removeDocument: (documentId: string) => {
                const { documents, selectedDocumentIds } = get();
                const updatedDocuments = { ...documents };
                delete updatedDocuments[documentId];

                const updatedSelectedIds = selectedDocumentIds.filter((id) => id !== documentId);

                set({
                    documents: updatedDocuments,
                    selectedDocumentIds: updatedSelectedIds,
                });
            },

            setSelectedDocumentIds: (ids: string[]) => {
                set({ selectedDocumentIds: ids });
            },

            toggleDocumentSelection: (documentId: string) => {
                const { selectedDocumentIds } = get();
                const isSelected = selectedDocumentIds.includes(documentId);

                set({
                    selectedDocumentIds: isSelected
                        ? selectedDocumentIds.filter((id) => id !== documentId)
                        : [...selectedDocumentIds, documentId],
                });
            },

            clearDocumentSelection: () => {
                set({ selectedDocumentIds: [] });
            },

            updateUploadProgress: (documentId: string, progress: DocumentUploadProgress) => {
                const { uploadProgress } = get();
                set({
                    uploadProgress: {
                        ...uploadProgress,
                        [documentId]: progress,
                    },
                });
            },

            removeUploadProgress: (documentId: string) => {
                const { uploadProgress } = get();
                const remainingProgress = { ...uploadProgress };
                delete remainingProgress[documentId];
                set({ uploadProgress: remainingProgress });
            },

            setLoading: (isLoading: boolean) => {
                set({ isLoading });
            },

            setUploadingDocument: (isUploading: boolean) => {
                set({ isUploadingDocument: isUploading });
            },

            setProjectStats: (stats: ProjectStats) => {
                set({ projectStats: stats });
            },

            setCurrentWorkspaceId: (id: string | null) => {
                set({ currentWorkspaceId: id });
            },

            setError: (error: string | null) => {
                set({ error });
            },

            resetProjectState: () => {
                set(initialState);
            },
        }),
        {
            name: 'project-store',
        }
    )
);

// Custom hooks for selecting project state (Zustand best practice)
export const useCurrentProject = () => {
    const currentProjectId = useProjectStore((state) => state.currentProjectId);
    const projects = useProjectStore((state) => state.projects);

    if (!currentProjectId || !projects) return null;

    const project = projects.find((p) => p.id === currentProjectId);
    return project || null;
};

export const useCurrentProjectWithDocuments = (): ProjectWithDocuments | null => {
    const currentProject = useCurrentProject();
    const documents = useProjectDocuments();

    if (!currentProject) return null;

    return {
        ...currentProject,
        documents: Object.values(documents),
    };
};

export const useProjects = () => useProjectStore((state) => state.projects);
export const useProjectDocuments = () => useProjectStore((state) => state.documents);
export const useProjectDocument = (documentId: string) =>
    useProjectStore((state) => state.documents[documentId]);
export const useSelectedDocumentIds = () => useProjectStore((state) => state.selectedDocumentIds);
export const useProjectLoading = () => useProjectStore((state) => state.isLoading);

export { useProjectStore };
