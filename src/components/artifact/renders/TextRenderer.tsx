import { Editor } from '@/components/text-editor';
import { useCallback } from 'react';
import type { Artifact } from '@/types/artifacts';

interface TextRendererProps {
    artifact: Artifact;
    onContentChange?: (content: string) => void;
}

export function TextRenderer({ artifact, onContentChange }: TextRendererProps) {
    const handleSaveContent = useCallback(
        (updatedContent: string) => {
            onContentChange?.(updatedContent);
        },
        [onContentChange]
    );

    return (
        <div className="flex flex-row px-4 py-8 md:p-20">
            <Editor
                content={artifact.content}
                suggestions={[]}
                isCurrentVersion={true}
                currentVersionIndex={0}
                status="idle"
                onSaveContent={handleSaveContent}
            />
        </div>
    );
}
