import { useEffect, useRef } from 'react';
import { useDataStream } from '@/hooks/useDataStream';
import { useArtifactStore } from '@/stores/artifact-store';
import { isValidArtifactType, type ArtifactType } from '@/types/artifacts';

export function DataStreamHandler() {
    const { dataStream } = useDataStream();
    const { artifact, openArtifact, updateArtifactContent } = useArtifactStore();
    const lastProcessedIndex = useRef(-1);
    const accumulatedContent = useRef('');
    const pendingArtifact = useRef<{
        id?: string;
        title?: string;
        type?: ArtifactType;
    }>({});

    useEffect(() => {
        if (!dataStream?.length) return;

        // Reset index when stream is cleared (e.g., new message starts)
        // This happens when ChatInterface calls clearDataStream() but the ref hasn't been notified
        if (lastProcessedIndex.current >= dataStream.length) {
            lastProcessedIndex.current = -1;
        }

        const newDeltas = dataStream.slice(lastProcessedIndex.current + 1);
        lastProcessedIndex.current = dataStream.length - 1;

        newDeltas.forEach((delta) => {
            try {
                switch (delta.type) {
                    case 'data-id':
                        accumulatedContent.current = '';
                        pendingArtifact.current = { id: delta.data };
                        break;

                    case 'data-title':
                        pendingArtifact.current.title = delta.data;
                        break;

                    case 'data-kind':
                        if (!isValidArtifactType(delta.data)) {
                            console.error(
                                `[DataStreamHandler] Invalid artifact type received: ${delta.data}`
                            );
                            break;
                        }

                        pendingArtifact.current.type = delta.data;

                        if (
                            pendingArtifact.current.id &&
                            pendingArtifact.current.title &&
                            pendingArtifact.current.type
                        ) {
                            openArtifact({
                                id: pendingArtifact.current.id,
                                type: pendingArtifact.current.type,
                                title: pendingArtifact.current.title,
                                content: '',
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            });
                        }
                        break;

                    case 'data-codeDelta':
                    case 'data-textDelta':
                    case 'data-imageDelta':
                    case 'data-spreadsheetDelta':
                        accumulatedContent.current += delta.data;
                        if (artifact) {
                            updateArtifactContent(accumulatedContent.current);
                        }
                        break;

                    case 'data-clear':
                        accumulatedContent.current = '';
                        if (artifact) {
                            updateArtifactContent('');
                        }
                        break;

                    case 'data-finish':
                        accumulatedContent.current = '';
                        pendingArtifact.current = {};
                        break;

                    default:
                        // Ignore non-artifact data events
                        break;
                }
            } catch (error) {
                console.error('[DataStreamHandler] Error processing delta:', error, delta);
            }
        });
    }, [dataStream, artifact, openArtifact, updateArtifactContent]);

    return null;
}

DataStreamHandler.displayName = 'DataStreamHandler';
