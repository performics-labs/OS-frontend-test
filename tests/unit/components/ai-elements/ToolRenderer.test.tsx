import { screen } from '@testing-library/react';
import { render } from '@tests/__setup__/render';
import { ToolRenderer } from '@/components/ai-elements/tool-renderer';
import { useArtifactStore } from '@/stores/artifact-store';

// Mock the artifact store
vi.mock('@/stores/artifact-store', () => ({
    useArtifactStore: vi.fn(),
}));

describe('ToolRenderer', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useArtifactStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            artifact: null,
            isOpen: false,
            openArtifact: vi.fn(),
        });
    });

    describe('createArtifact tool', () => {
        it('should render ArtifactPreview for createArtifact tool', () => {
            const result = {
                id: 'artifact-123',
                title: 'Button Component',
                kind: 'code',
                content: 'export function Button() {}',
            };

            render(
                <ToolRenderer
                    toolName="createArtifact"
                    state="output-available"
                    input={undefined}
                    output={result}
                />
            );

            // Should render inline preview with title in header
            expect(screen.getByText('Button Component')).toBeInTheDocument();
            // Should have clickable hitbox layer for opening artifact
            expect(
                screen.getByRole('button', { name: /Open artifact in full screen/ })
            ).toBeInTheDocument();
        });

        it('should pass all props to ArtifactPreview', () => {
            const input = { title: 'Test', kind: 'code' };
            const result = {
                id: 'artifact-123',
                title: 'Test',
                kind: 'code',
                content: 'test',
            };

            render(
                <ToolRenderer
                    toolName="createArtifact"
                    state="output-available"
                    input={input}
                    output={result}
                    error="Test error"
                />
            );

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should handle input-streaming state', () => {
            const input = { title: 'Button', kind: 'code' };

            render(
                <ToolRenderer
                    toolName="createArtifact"
                    state="input-streaming"
                    input={input}
                    output={undefined}
                />
            );

            expect(screen.getByText('Creating "Button"')).toBeInTheDocument();
        });

        it('should handle output-error state', () => {
            render(
                <ToolRenderer
                    toolName="createArtifact"
                    state="output-error"
                    input={undefined}
                    output={undefined}
                    error="Network timeout"
                />
            );

            expect(
                screen.getByText('Failed to create artifact: Network timeout')
            ).toBeInTheDocument();
        });

        it('should handle unknown data gracefully', () => {
            render(
                <ToolRenderer
                    toolName="createArtifact"
                    state="output-available"
                    input={{ invalid: 'data' }}
                    output={{ invalid: 'data' }}
                />
            );

            // ArtifactPreview should validate and return null for invalid data
            expect(screen.queryByRole('button')).not.toBeInTheDocument();
        });
    });

    describe('unknown tools', () => {
        it('should render nothing for unknown tool names', () => {
            const { container } = render(
                <ToolRenderer
                    toolName="unknownTool"
                    state="output-available"
                    input={{ test: 'data' }}
                    output={{ result: 'success' }}
                />
            );

            expect(container.firstChild).toBeNull();
        });

        it('should return null for empty tool name', () => {
            const { container } = render(
                <ToolRenderer
                    toolName=""
                    state="output-available"
                    input={undefined}
                    output={undefined}
                />
            );

            expect(container.firstChild).toBeNull();
        });
    });

    describe('future tool extensibility', () => {
        it('should be extensible for future tools', () => {
            // This test documents that the component is designed to be extended
            // Future tools can be added by checking toolName and returning appropriate component
            const { container } = render(
                <ToolRenderer
                    toolName="futureTool"
                    state="output-available"
                    input={{ data: 'test' }}
                    output={{ result: 'test' }}
                />
            );

            // Currently returns null, but can be extended without breaking changes
            expect(container.firstChild).toBeNull();
        });
    });
});
