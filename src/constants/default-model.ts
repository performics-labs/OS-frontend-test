import type { Model } from '@/types';

export const DEFAULT_MODEL_OPTION: Model = {
    id: 'default',
    name: 'Default Assistant',
    agent: 'General Assistant',
    description: 'General-purpose AI assistant for conversations and tasks.',
    capabilities: [
        'General conversation',
        'Task assistance',
        'Information lookup',
        'Content creation',
    ],
    platforms: [],
    badge: undefined,
    provider: 'anthropic',
};
