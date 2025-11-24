import { useState } from 'react';
import { ChevronDown, ChevronRight, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RagOutput } from '@/types/chat';
import {
    ClientAnalysis,
    BudgetAllocation,
    RoasProjector,
    PlatformConfiguration,
    PricingOptimizer,
    CreativeDesigner,
    BrandLiftPredictor,
    AudienceCreator,
    ExportGenerator,
} from '@/components/campaign';

type ToolPartProps = {
    toolName: string;
    toolCallId: string;
    status?: 'streaming' | 'complete' | 'error';
    input?: unknown;
    output?: unknown;
    error?: string;
};

export function ToolPart({ toolName, status = 'complete', input, output, error }: ToolPartProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const isLoading = status === 'streaming';
    const isError = status === 'error' || !!error;
    const isComplete = status === 'complete' && !error;

    const StatusIcon = isLoading ? Loader2 : isError ? AlertCircle : CheckCircle;
    const iconClassName = cn(
        'size-4',
        isLoading && 'animate-spin text-warm-black-500',
        isError && 'text-red-500',
        isComplete && 'text-green-600'
    );

    const displayName = toolName
        .replace(/([A-Z])/g, ' $1')
        .replace(/Tool$/, '')
        .trim();

    return (
        <div className="border-border overflow-hidden rounded-lg border">
            <div
                className={cn(
                    'flex cursor-pointer items-center gap-2 p-3 transition-colors',
                    'bg-muted/50 hover:bg-muted',
                    isError && 'bg-destructive/10'
                )}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <StatusIcon className={iconClassName} />

                <span className="flex-1 text-sm font-medium">{displayName}</span>

                {(isComplete || isError) && (output || error) && (
                    <button className="hover:bg-background rounded p-1" type="button">
                        {isExpanded ? (
                            <ChevronDown className="size-4" />
                        ) : (
                            <ChevronRight className="size-4" />
                        )}
                    </button>
                )}
            </div>

            {isExpanded && (
                <div className="bg-background space-y-3 p-3 text-sm">
                    {input ? (
                        <div>
                            <p className="text-muted-foreground mb-1 text-xs font-medium">Input:</p>
                            <pre className="bg-muted overflow-x-auto rounded p-2 text-xs">
                                {typeof input === 'string' ? input : JSON.stringify(input, null, 2)}
                            </pre>
                        </div>
                    ) : null}

                    {isComplete && output ? (
                        <div>
                            <p className="text-muted-foreground mb-1 text-xs font-medium">
                                Output:
                            </p>
                            <div className="space-y-2">{renderToolOutput(toolName, output)}</div>
                        </div>
                    ) : null}

                    {isError && error && (
                        <div>
                            <p className="text-destructive mb-1 text-xs font-medium">Error:</p>
                            <p className="text-destructive bg-destructive/10 rounded p-2 text-xs">
                                {error}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function renderToolOutput(toolName: string, output: unknown) {
    // RAG Retrieval Tool
    if (toolName === 'ragRetrievalTool' && typeof output === 'object' && output !== null) {
        const data = output as RagOutput;

        if (data.documents && Array.isArray(data.documents)) {
            return (
                <div className="space-y-2">
                    {data.documents.map((doc, index) => (
                        <div key={index} className="border-border bg-card rounded border p-2">
                            <div className="mb-1 flex items-start justify-between gap-2">
                                <p className="text-xs font-medium">{doc.title}</p>
                                <span className="text-muted-foreground shrink-0 text-xs">
                                    {(doc.relevance * 100).toFixed(0)}% match
                                </span>
                            </div>
                            <p className="text-muted-foreground mb-1 text-xs">{doc.snippet}</p>
                            {doc.source && (
                                <p className="text-muted-foreground text-xs">
                                    Source: {doc.source}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            );
        }
    }

    // Campaign Tools - Render charts when output is available
    if (typeof output === 'object' && output !== null) {
        const data = output as Record<string, unknown>;

        // Client Profiler Tool
        if (toolName === 'client_profiler' && 'clientProfile' in data) {
            // @ts-expect-error - Data structure alignment in progress
            return <ClientAnalysis {...data} />;
        }

        // Budget Allocator Tool
        if (toolName === 'budget_allocator' && 'platformAllocations' in data) {
            return (
                <BudgetAllocation
                    platformAllocations={data.platformAllocations as any}
                    phaseAllocations={data.phaseAllocations as any}
                    reserveBudget={data.reserveBudget as number}
                />
            );
        }

        // ROAS Projector Tool
        if (toolName === 'roas_projector' && 'projections' in data) {
            return (
                <RoasProjector
                    projections={data.projections as any}
                    weeklyProjections={data.weeklyProjections as any}
                    confidenceScore={data.confidenceScore as number}
                />
            );
        }

        // Platform Configurator Tool
        if (toolName === 'platform_configurator' && 'configurations' in data) {
            // @ts-expect-error - Data structure alignment in progress
            return <PlatformConfiguration {...data} />;
        }

        // Pricing Optimizer Tool
        if (toolName === 'pricing_optimizer' && 'pricingStrategy' in data) {
            // @ts-expect-error - Data structure alignment in progress
            return <PricingOptimizer {...data} />;
        }

        // Creative Designer Tool
        if (toolName === 'creative_designer' && 'creativeAssets' in data) {
            // @ts-expect-error - Data structure alignment in progress
            return <CreativeDesigner {...data} />;
        }

        // Brand Lift Predictor Tool
        if (toolName === 'brand_lift_predictor' && 'brandLiftMetrics' in data) {
            return <BrandLiftPredictor {...(data as any)} />;
        }

        // Audience Creator Tool
        if (toolName === 'audience_creator' && 'segments' in data) {
            // @ts-expect-error - Data structure alignment in progress
            return <AudienceCreator {...data} />;
        }

        // Export Generator Tool
        if (toolName === 'export_generator' && 'campaignSummary' in data) {
            // @ts-expect-error - Data structure alignment in progress
            return <ExportGenerator {...data} />;
        }
    }

    // Default: Show JSON output
    return (
        <pre className="bg-muted overflow-x-auto rounded p-2 text-xs">
            {JSON.stringify(output, null, 2)}
        </pre>
    );
}
