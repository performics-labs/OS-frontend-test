import { memo } from 'react';
import DOMPurify from 'dompurify';
import type { Artifact } from '@/types/artifacts';
import { Loader2 } from 'lucide-react';

interface ImageRendererProps {
    artifact: Artifact;
    status?: 'streaming' | 'idle';
}

function PureImageRenderer({ artifact, status = 'idle' }: ImageRendererProps) {
    const isStreaming = status === 'streaming' || !artifact.content;
    const isSvg = artifact.content.trim().startsWith('<svg');

    return (
        <div className="flex size-full items-center justify-center p-4">
            {isStreaming ? (
                <div className="text-muted-foreground flex items-center gap-3">
                    <Loader2 className="size-5 animate-spin" />
                    <span>Generating image...</span>
                </div>
            ) : isSvg ? (
                <div
                    className="flex h-fit w-full max-w-[800px] justify-center"
                    dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(artifact.content, {
                            USE_PROFILES: { svg: true, svgFilters: true },
                            ADD_TAGS: ['use'],
                            ADD_ATTR: ['target']
                        })
                    }}
                />
            ) : (
                <img
                    className="h-fit w-full max-w-[800px] rounded"
                    src={`data:image/png;base64,${artifact.content}`}
                    alt={artifact.title}
                />
            )}
        </div>
    );
}

function areEqual(prevProps: ImageRendererProps, nextProps: ImageRendererProps) {
    if (prevProps.status === 'streaming' && nextProps.status === 'streaming') return false;
    if (prevProps.artifact.content !== nextProps.artifact.content) return false;
    if (prevProps.artifact.updatedAt !== nextProps.artifact.updatedAt) return false;

    return true;
}

export const ImageRenderer = memo(PureImageRenderer, areEqual);
export default ImageRenderer;
