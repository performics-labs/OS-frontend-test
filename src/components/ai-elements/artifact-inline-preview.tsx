import { memo, useCallback, useRef, type MouseEvent, type KeyboardEvent } from 'react';
import { FileTextIcon, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Loader } from '@/components/ai-elements/loader';
import { Editor } from '@/components/text-editor';
import { CodeRenderer } from '@/components/artifact/renders/CodeRenderer';
import { SpreadsheetRenderer } from '@/components/artifact/renders/SpreadsheetRenderer';
import { ImageRenderer } from '@/components/artifact/renders/ImageRenderer';
import { useArtifactStore } from '@/stores/artifact-store';
import type { Artifact } from '@/stores/artifact-store';
import { Button } from '@/components/ui/button';

type ArtifactInlinePreviewProps = {
    artifact: Artifact;
    isStreaming?: boolean;
};

export function ArtifactInlinePreview({
    artifact,
    isStreaming = false,
}: ArtifactInlinePreviewProps) {
    const { openArtifact, isOpen, artifact: currentArtifact } = useArtifactStore();
    const hitboxRef = useRef<HTMLDivElement | null>(null);

    const isThisArtifactOpen = isOpen && currentArtifact?.id === artifact.id;

    const handleClick = useCallback(
        (event: MouseEvent<HTMLDivElement | HTMLButtonElement>) => {
            event.preventDefault();
            event.stopPropagation();

            if (!isThisArtifactOpen) {
                openArtifact(artifact);
            }
        },
        [artifact, isThisArtifactOpen, openArtifact]
    );

    if (!artifact) return null;

    // When artifact is open, show compact button instead of full preview (matches POC behavior)
    if (isOpen) {
        return (
            <Button
                variant="outline"
                size="default"
                onClick={handleClick}
                disabled={isThisArtifactOpen}
                className="flex h-auto w-fit flex-row items-start gap-3 rounded-xl px-3 py-2 whitespace-normal"
            >
                <div className="text-muted-foreground mt-1 shrink-0">
                    <FileTextIcon className="size-4" />
                </div>
                <div className="text-left break-words">Created &quot;{artifact.title}&quot;</div>
            </Button>
        );
    }

    return (
        <div className="relative w-full cursor-pointer">
            <HitboxLayer hitboxRef={hitboxRef} onClick={handleClick} isOpen={isThisArtifactOpen} />

            <PreviewHeader title={artifact.title} isStreaming={isStreaming} />

            <PreviewContent artifact={artifact} isStreaming={isStreaming} />
        </div>
    );
}

const HitboxLayer = memo(
    ({
        hitboxRef,
        onClick,
        isOpen,
    }: {
        hitboxRef: React.RefObject<HTMLDivElement | null>;
        onClick: (event: MouseEvent<HTMLDivElement>) => void;
        isOpen: boolean;
    }) => {
        const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                // Simulate a mouse click event for keyboard interaction
                const syntheticEvent = {
                    preventDefault: () => {},
                    stopPropagation: () => {},
                } as MouseEvent<HTMLDivElement>;
                onClick(syntheticEvent);
            }
        };

        return (
            <div
                ref={hitboxRef}
                onClick={onClick}
                className={cn('absolute inset-0 z-10 rounded-xl', isOpen && 'pointer-events-none')}
                role="button"
                tabIndex={0}
                onKeyDown={handleKeyDown}
                aria-label="Open artifact in full screen"
            >
                <div className="flex w-full items-center justify-end p-4">
                    <div
                        className={cn(
                            'absolute top-[13px] right-[9px] rounded-md p-2 transition-colors',
                            'hover:bg-light-grey-100 dark:hover:bg-warm-black-600'
                        )}
                    >
                        <Maximize2 className="text-muted-foreground size-4" />
                    </div>
                </div>
            </div>
        );
    }
);

HitboxLayer.displayName = 'HitboxLayer';

const PreviewHeader = memo(({ title, isStreaming }: { title: string; isStreaming: boolean }) => (
    <div
        className={cn(
            'flex flex-row items-start justify-between gap-2 rounded-t-2xl border border-b-0 p-4',
            'bg-muted border-light-grey-500 dark:border-warm-black-400',
            'sm:items-center'
        )}
    >
        <div className="flex flex-row items-start gap-3 sm:items-center">
            <div className="text-muted-foreground">
                {isStreaming ? <Loader size={16} /> : <FileTextIcon className="size-4" />}
            </div>
            <div className="-translate-y-1 font-medium sm:translate-y-0">{title}</div>
        </div>
        <div className="w-8" />
    </div>
));

PreviewHeader.displayName = 'PreviewHeader';

const PreviewContent = memo(
    ({ artifact, isStreaming }: { artifact: Artifact; isStreaming: boolean }) => {
        const containerClassName = cn(
            'h-[257px] overflow-y-scroll rounded-b-2xl border border-t-0',
            'bg-muted border-light-grey-500 dark:border-warm-black-400',
            {
                'p-4 sm:px-14 sm:py-16': artifact.type === 'text',
                'p-0':
                    artifact.type === 'code' ||
                    artifact.type === 'spreadsheet' ||
                    artifact.type === 'image',
            }
        );

        if (artifact.type === 'text') {
            return (
                <div className={containerClassName}>
                    <Editor
                        content={artifact.content}
                        onSaveContent={() => {}}
                        status={isStreaming ? 'streaming' : 'idle'}
                        isCurrentVersion={true}
                        currentVersionIndex={0}
                        suggestions={[]}
                    />
                </div>
            );
        }

        if (artifact.type === 'code') {
            return (
                <div className={containerClassName}>
                    <div className="relative flex w-full flex-1">
                        <div className="absolute inset-0">
                            <CodeRenderer
                                artifact={artifact}
                                status={isStreaming ? 'streaming' : 'idle'}
                            />
                        </div>
                    </div>
                </div>
            );
        }

        if (artifact.type === 'image') {
            return (
                <div className={containerClassName}>
                    <div className="relative flex w-full flex-1">
                        <div className="absolute inset-0">
                            <ImageRenderer artifact={artifact} />
                        </div>
                    </div>
                </div>
            );
        }

        if (artifact.type === 'spreadsheet') {
            return (
                <div className={containerClassName}>
                    <div className="relative flex w-full flex-1">
                        <div className="absolute inset-0">
                            <SpreadsheetRenderer
                                artifact={artifact}
                                status={isStreaming ? 'streaming' : 'idle'}
                            />
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className={containerClassName}>
                <div className="p-4">
                    <div className="text-muted-foreground mb-2 text-sm">
                        Type: <span className="font-medium">{artifact.type}</span>
                    </div>
                    <pre className="bg-muted overflow-auto rounded p-4 text-xs break-words whitespace-pre-wrap">
                        {artifact.content}
                    </pre>
                </div>
            </div>
        );
    }
);

PreviewContent.displayName = 'PreviewContent';
