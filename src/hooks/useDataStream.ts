import { useContext } from 'react';
import { DataStreamContext } from '@/contexts/DataStreamContext';

export function useDataStream() {
    const context = useContext(DataStreamContext);
    if (!context) {
        throw new Error('useDataStream must be used within DataStreamProvider');
    }
    return context;
}
