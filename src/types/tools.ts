export type ToolState = 'input-streaming' | 'input-available' | 'output-available' | 'output-error';

export type ToolRendererProps = {
    toolName: string;
    state: ToolState;
    input?: unknown;
    output?: unknown;
    error?: string;
    fallback?: React.ReactNode;
};
