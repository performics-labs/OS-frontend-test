import { create } from 'zustand';
import { ARTIFACT_ANIMATION } from '@/constants';

/**
 * Artifact data structure
 */
export interface Artifact {
    id: string;
    type: 'text' | 'code' | 'image' | 'spreadsheet';
    title: string;
    content: string;
    language?: string; // For code artifacts
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Artifact store state
 */
interface ArtifactState {
    // Current artifact data
    artifact: Artifact | null;

    // UI state
    isOpen: boolean;
    isEditing: boolean;

    // Actions
    openArtifact: (artifact: Artifact) => void;
    closeArtifact: () => void;
    toggleEditMode: () => void;
    setEditMode: (editing: boolean) => void;
    updateArtifactContent: (content: string) => void;
}

/**
 * Artifact store implementation
 */
let cleanupTimer: NodeJS.Timeout | null = null;

export const useArtifactStore = create<ArtifactState>((set) => ({
    // Initial state
    artifact: null,
    isOpen: false,
    isEditing: false,

    // Open artifact overlay
    openArtifact: (artifact) => {
        // Clear any pending cleanup when opening new artifact
        if (cleanupTimer) {
            clearTimeout(cleanupTimer);
            cleanupTimer = null;
        }

        set({
            artifact,
            isOpen: true,
            isEditing: false, // Reset edit mode when opening new artifact
        });
    },

    // Close artifact overlay with animation delay
    closeArtifact: () => {
        set({ isOpen: false });

        // Clear any existing timeout to prevent memory leaks
        if (cleanupTimer) clearTimeout(cleanupTimer);

        // Keep artifact data for collapse animation (300ms duration)
        cleanupTimer = setTimeout(() => {
            set({ artifact: null });
            cleanupTimer = null;
        }, ARTIFACT_ANIMATION.duration);
    },

    // Toggle between view and edit modes
    toggleEditMode: () => set((state) => ({ isEditing: !state.isEditing })),

    // Set edit mode explicitly
    setEditMode: (editing) => set({ isEditing: editing }),

    // Update artifact content (for edit mode)
    updateArtifactContent: (content) =>
        set((state) => ({
            artifact: state.artifact ? { ...state.artifact, content, updatedAt: new Date() } : null,
        })),
}));
