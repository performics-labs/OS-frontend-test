import type { ToolState } from '@/types/tools';
import { artifactResultSchema, artifactInputSchema } from '@/types/artifact-tool';
import { ArtifactLoadingIndicator } from './artifact-loading-indicator';
import { ArtifactInlinePreview } from './artifact-inline-preview';
import type { Artifact } from '@/stores/artifact-store';

type ArtifactPreviewProps = {
    result?: unknown;
    input?: unknown;
    state: ToolState;
    error?: string;
};

export function ArtifactPreview({ result, input, state, error }: ArtifactPreviewProps) {
    // Loading states - show during streaming or when input is available but no result yet
    if (state === 'input-streaming' || state === 'input-available') {
        const validatedInput = input ? artifactInputSchema.safeParse(input) : null;

        if (validatedInput?.success) {
            return <ArtifactLoadingIndicator title={validatedInput.data.title} />;
        }

        // Fallback for invalid or missing input
        return <div className="text-muted-foreground text-xs">Creating artifact...</div>;
    }

    // Error state
    if (state === 'output-error') {
        return (
            <div className="text-sm text-red-500 dark:text-red-400">
                Failed to create artifact{error ? `: ${error}` : ''}
            </div>
        );
    }

    // Validate result
    const validatedResult = result ? artifactResultSchema.safeParse(result) : null;

    // Success - show inline preview
    if (validatedResult?.success) {
        const resultData = validatedResult.data;

        const artifactData: Artifact = {
            id: resultData.id,
            type: resultData.kind,
            title: resultData.title,
            content: resultData.content || '',
            language: resultData.language,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        return <ArtifactInlinePreview artifact={artifactData} isStreaming={false} />;
    }

    return null;
}
