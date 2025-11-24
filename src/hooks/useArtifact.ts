import { useArtifactStore } from '@/stores/artifact-store';

export function useArtifact() {
    return useArtifactStore();
}
