import type { ToolRendererProps } from '@/types/tools';
import { ArtifactPreview } from './artifact-preview';
import { WeatherCard } from './WeatherCard';
import { ToolPart } from './tool-part';
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

export function ToolRenderer({ toolName, state, input, output, error, fallback }: ToolRendererProps) {
    // Artifact tool - custom rendering
    if (toolName === 'createArtifact') {
        return <ArtifactPreview result={output} input={input} state={state} error={error} />;
    }

    // Weather tool - custom rendering
    if (toolName === 'get_weather' || toolName === 'weather') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return <WeatherCard output={output as any} state={state} error={error} />;
    }

    // Campaign tools - show loading card during streaming, then charts when complete
    const isCampaignTool = [
        'client_profiler',
        'budget_allocator',
        'roas_projector',
        'platform_configurator',
        'pricing_optimizer',
        'creative_designer',
        'brand_lift_predictor',
        'audience_creator',
        'export_generator'
    ].includes(toolName);

    if (isCampaignTool) {
        // During streaming or input phase, show loading card
        if (state === 'input-streaming' || state === 'input-available') {
            const stableId = `${toolName}-${JSON.stringify(input)?.substring(0, 20) || 'default'}`;
            return (
                <ToolPart
                    toolName={toolName}
                    toolCallId={stableId}
                    status="streaming"
                    input={input}
                    output={undefined}
                    error={undefined}
                />
            );
        }

        // When output is available, render charts directly
        if (state === 'output-available' && output && typeof output === 'object') {
            return <CampaignToolOutput toolName={toolName} output={output} />;
        }

        // On error, show error card
        if (state === 'output-error') {
            const stableId = `${toolName}-${JSON.stringify(input)?.substring(0, 20) || 'default'}`;
            return (
                <ToolPart
                    toolName={toolName}
                    toolCallId={stableId}
                    status="error"
                    input={input}
                    output={output}
                    error={error}
                />
            );
        }
    }

    // For other tools, use fallback behavior
    return fallback || null;
}

// Campaign tool chart renderer
function CampaignToolOutput({ toolName, output }: { toolName: string; output: unknown }) {
    if (typeof output !== 'object' || !output) return null;
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

    return null;
}
