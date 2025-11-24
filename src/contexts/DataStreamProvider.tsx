import { useCallback, useMemo, useState, useEffect, useRef, type ReactNode } from 'react';
import { DataStreamContext } from './DataStreamContext';
import type { ValidatedArtifactDataEvent } from '@/utils/data-stream-validation';

const MAX_STREAM_SIZE = 1000; // Prevent unbounded memory growth
const CLEANUP_DELAY = 5000; // Clear completed streams after 5s

export function DataStreamProvider({ children }: { children: ReactNode }) {
    const [dataStream, setDataStream] = useState<ValidatedArtifactDataEvent[]>([]);
    const cleanupTimerRef = useRef<NodeJS.Timeout | null>(null);

    const clearDataStream = useCallback(() => {
        setDataStream([]);
        // Clear any pending cleanup timer
        if (cleanupTimerRef.current) {
            clearTimeout(cleanupTimerRef.current);
            cleanupTimerRef.current = null;
        }
    }, []);

    // Auto-cleanup completed streams to prevent memory leaks
    useEffect(() => {
        if (dataStream.length > 0) {
            // Clear previous timer
            if (cleanupTimerRef.current) {
                clearTimeout(cleanupTimerRef.current);
            }

            // Set new cleanup timer
            cleanupTimerRef.current = setTimeout(() => {
                setDataStream([]);
                cleanupTimerRef.current = null;
            }, CLEANUP_DELAY);
        }

        return () => {
            if (cleanupTimerRef.current) {
                clearTimeout(cleanupTimerRef.current);
            }
        };
    }, [dataStream.length]);

    // Limit stream size to prevent memory issues
    const addToDataStream = useCallback(
        (updater: (prev: ValidatedArtifactDataEvent[]) => ValidatedArtifactDataEvent[]) => {
            setDataStream((prev) => {
                const updated = updater(prev);
                // Keep only the last MAX_STREAM_SIZE events
                return updated.length > MAX_STREAM_SIZE
                    ? updated.slice(updated.length - MAX_STREAM_SIZE)
                    : updated;
            });
        },
        []
    );

    const value = useMemo(
        () => ({
            dataStream,
            setDataStream: addToDataStream,
            clearDataStream,
        }),
        [dataStream, addToDataStream, clearDataStream]
    );

    return <DataStreamContext.Provider value={value}>{children}</DataStreamContext.Provider>;
}
