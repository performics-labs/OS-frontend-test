import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useArtifactStore } from '@/stores/artifact-store';
import type { Artifact } from '@/types/artifacts';

describe('artifact-store', () => {
    const mockArtifact: Artifact = {
        id: 'art_test_1',
        type: 'text',
        title: 'Test Artifact',
        content: 'Test content',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(() => {
        // Reset store to initial state
        useArtifactStore.setState({
            artifact: null,
            isOpen: false,
            isEditing: false,
        });
    });

    describe('openArtifact', () => {
        it('sets artifact and opens overlay', () => {
            const { openArtifact } = useArtifactStore.getState();
            openArtifact(mockArtifact);

            const state = useArtifactStore.getState();
            expect(state.artifact).toEqual(mockArtifact);
            expect(state.isOpen).toBe(true);
            expect(state.isEditing).toBe(false);
        });

        it('resets edit mode when opening new artifact', () => {
            // Set edit mode
            useArtifactStore.setState({ isEditing: true });

            // Open new artifact
            const { openArtifact } = useArtifactStore.getState();
            openArtifact(mockArtifact);

            // Edit mode should be reset
            expect(useArtifactStore.getState().isEditing).toBe(false);
        });
    });

    describe('closeArtifact', () => {
        it('closes overlay immediately', () => {
            const { openArtifact, closeArtifact } = useArtifactStore.getState();
            openArtifact(mockArtifact);
            closeArtifact();

            expect(useArtifactStore.getState().isOpen).toBe(false);
        });

        it('clears artifact data after delay', async () => {
            vi.useFakeTimers();

            const { openArtifact, closeArtifact } = useArtifactStore.getState();
            openArtifact(mockArtifact);
            closeArtifact();

            // Artifact still exists (for animation)
            expect(useArtifactStore.getState().artifact).not.toBeNull();

            // Advance timers past cleanup delay
            vi.advanceTimersByTime(300);

            // Artifact now cleared
            expect(useArtifactStore.getState().artifact).toBeNull();

            vi.useRealTimers();
        });
    });

    describe('edit mode', () => {
        it('toggles edit mode', () => {
            const { toggleEditMode } = useArtifactStore.getState();

            expect(useArtifactStore.getState().isEditing).toBe(false);
            toggleEditMode();
            expect(useArtifactStore.getState().isEditing).toBe(true);
            toggleEditMode();
            expect(useArtifactStore.getState().isEditing).toBe(false);
        });

        it('sets edit mode explicitly', () => {
            const { setEditMode } = useArtifactStore.getState();

            setEditMode(true);
            expect(useArtifactStore.getState().isEditing).toBe(true);

            setEditMode(false);
            expect(useArtifactStore.getState().isEditing).toBe(false);
        });
    });

    describe('updateArtifactContent', () => {
        it('updates content and timestamp', async () => {
            vi.useFakeTimers();
            const { openArtifact, updateArtifactContent } = useArtifactStore.getState();
            const beforeUpdate = new Date();

            openArtifact(mockArtifact);

            // Wait 1ms to ensure timestamp difference
            vi.advanceTimersByTime(1);

            updateArtifactContent('New content');

            const state = useArtifactStore.getState();
            expect(state.artifact?.content).toBe('New content');
            expect(state.artifact?.updatedAt.getTime()).toBeGreaterThan(beforeUpdate.getTime());

            vi.useRealTimers();
        });

        it('does nothing if no artifact is open', () => {
            const { updateArtifactContent } = useArtifactStore.getState();
            updateArtifactContent('New content');

            expect(useArtifactStore.getState().artifact).toBeNull();
        });
    });
});
