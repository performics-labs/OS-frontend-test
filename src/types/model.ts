export type ModelBadge = 'new' | 'experimental' | 'updated';

export type Model = {
    id: string;
    name: string;
    agent?: string;
    description: string;
    capabilities?: string[];
    platforms?: string[];
    badge?: ModelBadge;
    provider: string;
};

export type ModelResponse = {
    models: Model[];
};

export type BadgeVariant = Record<
    ModelBadge,
    { label: string; variant: 'info' | 'default' | 'warning' }
>;
