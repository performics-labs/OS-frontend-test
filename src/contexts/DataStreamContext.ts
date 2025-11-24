import { createContext } from 'react';
import type { ValidatedArtifactDataEvent } from '@/utils/data-stream-validation';

export type DataStreamContextValue = {
    dataStream: ValidatedArtifactDataEvent[];
    setDataStream: (updater: (prev: ValidatedArtifactDataEvent[]) => ValidatedArtifactDataEvent[]) => void;
    clearDataStream: () => void;
};

export const DataStreamContext = createContext<DataStreamContextValue | null>(null);
