import { useMemo } from 'react';
import { getRandomPlaceholder } from '@/utils/placeholders';

/**
 * Hook that returns a random placeholder text that remains stable
 * throughout the component's lifecycle
 */
export function useRandomPlaceholder(): string {
    // useMemo with empty deps ensures the placeholder is only
    // selected once when the component mounts
    return useMemo(() => getRandomPlaceholder(), []);
}
