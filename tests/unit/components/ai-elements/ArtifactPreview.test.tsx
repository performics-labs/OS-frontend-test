import { screen, fireEvent } from '@testing-library/react';
import { render } from '@tests/__setup__/render';
import { ArtifactPreview } from '@/components/ai-elements/artifact-preview';
import { useArtifactStore } from '@/stores/artifact-store';
import type { ArtifactResult, ArtifactInput } from '@/types/artifact-tool';

// Mock the artifact store
vi.mock('@/stores/artifact-store', () => ({
    useArtifactStore: vi.fn(),
}));

describe('ArtifactPreview', () => {
    const mockOpenArtifact = vi.fn();

    const mockResult: ArtifactResult = {
        id: 'artifact-123',
        title: 'Button Component',
        kind: 'code',
        content: 'export function Button() {}',
        language: 'tsx',
    };

    const mockInput: ArtifactInput = {
        title: 'Button Component',
        kind: 'code',
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useArtifactStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            artifact: null,
            isOpen: false,
            openArtifact: mockOpenArtifact,
        });
    });

    describe('Streaming States', () => {
        it('should show creating message during input-streaming', () => {
            render(
                <ArtifactPreview state="input-streaming" input={mockInput} result={undefined} />
            );

            expect(screen.getByText('Creating "Button Component"')).toBeInTheDocument();
        });

        it('should show creating message during input-available', () => {
            render(
                <ArtifactPreview state="input-available" input={mockInput} result={undefined} />
            );

            expect(screen.getByText('Creating "Button Component"')).toBeInTheDocument();
        });

        it('should show generic creating message when input is missing title', () => {
            render(
                <ArtifactPreview state="input-streaming" input={undefined} result={undefined} />
            );

            expect(screen.getByText('Creating artifact...')).toBeInTheDocument();
        });

        it('should handle invalid input data gracefully', () => {
            render(
                <ArtifactPreview
                    state="input-streaming"
                    input={{ invalid: 'data' }}
                    result={undefined}
                />
            );

            expect(screen.getByText('Creating artifact...')).toBeInTheDocument();
        });
    });

    describe('Error State', () => {
        it('should show error message when state is output-error', () => {
            render(<ArtifactPreview state="output-error" input={undefined} result={undefined} />);

            expect(screen.getByText('Failed to create artifact')).toBeInTheDocument();
        });

        it('should show error message with details when error prop provided', () => {
            render(
                <ArtifactPreview
                    state="output-error"
                    input={undefined}
                    result={undefined}
                    error="Network timeout"
                />
            );

            expect(
                screen.getByText('Failed to create artifact: Network timeout')
            ).toBeInTheDocument();
        });
    });

    describe('Success State - Artifact Closed', () => {
        it('should show inline preview with hitbox when artifact is not open', () => {
            render(
                <ArtifactPreview state="output-available" input={undefined} result={mockResult} />
            );

            // Should render inline preview with title in header
            expect(screen.getByText('Button Component')).toBeInTheDocument();
            // Should have clickable hitbox layer
            const hitbox = screen.getByRole('button', { name: /Open artifact in full screen/ });
            expect(hitbox).toBeInTheDocument();
        });

        it('should call openArtifact when hitbox is clicked', () => {
            render(
                <ArtifactPreview state="output-available" input={undefined} result={mockResult} />
            );

            const hitbox = screen.getByRole('button', { name: /Open artifact in full screen/ });
            fireEvent.click(hitbox);

            expect(mockOpenArtifact).toHaveBeenCalledWith({
                id: 'artifact-123',
                type: 'code',
                title: 'Button Component',
                content: 'export function Button() {}',
                language: 'tsx',
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
            });
        });

        it('should render inline preview when artifact is closed', () => {
            render(
                <ArtifactPreview state="output-available" input={undefined} result={mockResult} />
            );

            // Should render inline preview with title in header
            expect(screen.getByText('Button Component')).toBeInTheDocument();
            // Should have clickable hitbox layer
            expect(
                screen.getByRole('button', { name: /Open artifact in full screen/ })
            ).toBeInTheDocument();
        });
    });

    describe('Success State - Artifact Open', () => {
        beforeEach(() => {
            (useArtifactStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
                artifact: {
                    id: 'artifact-123',
                    type: 'code',
                    title: 'Button Component',
                    content: 'export function Button() {}',
                    language: 'tsx',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                isOpen: true,
                openArtifact: mockOpenArtifact,
            });
        });

        it('should show compact button when any artifact is open', () => {
            render(
                <ArtifactPreview state="output-available" input={undefined} result={mockResult} />
            );

            expect(screen.getByText(/Created "Button Component"/)).toBeInTheDocument();
        });

        it('should disable button when this specific artifact is open', () => {
            render(
                <ArtifactPreview state="output-available" input={undefined} result={mockResult} />
            );

            const button = screen.getByRole('button');
            expect(button).toBeDisabled();
        });

        it('should not call openArtifact when clicking disabled button', () => {
            render(
                <ArtifactPreview state="output-available" input={undefined} result={mockResult} />
            );

            const button = screen.getByRole('button');
            fireEvent.click(button);

            expect(mockOpenArtifact).not.toHaveBeenCalled();
        });

        it('should show compact button with proper styling when artifact is open', () => {
            render(
                <ArtifactPreview state="output-available" input={undefined} result={mockResult} />
            );

            // Compact button exists and is disabled
            const button = screen.getByRole('button');
            expect(button).toBeDisabled();
            expect(screen.getByText(/Created "Button Component"/)).toBeInTheDocument();
        });
    });

    describe('Artifact Types', () => {
        it('should handle text artifacts', () => {
            const textResult: ArtifactResult = {
                id: 'text-123',
                title: 'Documentation',
                kind: 'text',
                content: '# Docs',
            };

            render(
                <ArtifactPreview state="output-available" input={undefined} result={textResult} />
            );

            // Click the hitbox layer to open artifact
            const button = screen.getByRole('button', { name: /Open artifact in full screen/ });
            fireEvent.click(button);

            expect(mockOpenArtifact).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'text',
                    title: 'Documentation',
                })
            );
        });

        it('should handle code artifacts with language', () => {
            render(
                <ArtifactPreview state="output-available" input={undefined} result={mockResult} />
            );

            const button = screen.getByRole('button', { name: /Open artifact in full screen/ });
            fireEvent.click(button);

            expect(mockOpenArtifact).toHaveBeenCalledWith(
                expect.objectContaining({
                    language: 'tsx',
                })
            );
        });

        it('should handle artifacts without language', () => {
            const resultNoLang: ArtifactResult = {
                id: 'artifact-456',
                title: 'Plain Text',
                kind: 'text',
                content: 'Content',
            };

            render(
                <ArtifactPreview state="output-available" input={undefined} result={resultNoLang} />
            );

            const button = screen.getByRole('button', { name: /Open artifact in full screen/ });
            fireEvent.click(button);

            expect(mockOpenArtifact).toHaveBeenCalledWith(
                expect.objectContaining({
                    language: undefined,
                })
            );
        });
    });

    describe('Data Validation', () => {
        it('should render nothing when result validation fails', () => {
            const { container } = render(
                <ArtifactPreview
                    state="output-available"
                    input={undefined}
                    result={{ invalid: 'data' }}
                />
            );

            expect(container.firstChild).toBeNull();
        });

        it('should handle missing result gracefully', () => {
            const { container } = render(
                <ArtifactPreview state="output-available" input={undefined} result={undefined} />
            );

            expect(container.firstChild).toBeNull();
        });

        it('should handle result with missing required fields', () => {
            const { container } = render(
                <ArtifactPreview
                    state="output-available"
                    input={undefined}
                    result={{ id: '123', title: 'Missing kind field' }}
                />
            );

            expect(container.firstChild).toBeNull();
        });

        it('should handle result with invalid kind value', () => {
            const { container } = render(
                <ArtifactPreview
                    state="output-available"
                    input={undefined}
                    result={{
                        id: '123',
                        title: 'Test',
                        kind: 'invalid-kind',
                        content: 'test',
                    }}
                />
            );

            expect(container.firstChild).toBeNull();
        });
    });

    describe('Multiple Artifacts', () => {
        it('should show compact button when a different artifact is open', () => {
            (useArtifactStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
                artifact: {
                    id: 'artifact-999',
                    type: 'code',
                    title: 'Other Component',
                    content: 'code',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                isOpen: true,
                openArtifact: mockOpenArtifact,
            });

            render(
                <ArtifactPreview state="output-available" input={undefined} result={mockResult} />
            );

            // When another artifact is open, should show compact button (not disabled)
            expect(screen.getByText(/Created "Button Component"/)).toBeInTheDocument();
            const button = screen.getByRole('button');
            expect(button).not.toBeDisabled();
        });
    });
});
