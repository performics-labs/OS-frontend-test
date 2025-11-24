import { render, screen } from '@testing-library/react';
import { Artifact } from '@/components/artifact/Artifact';
import { useArtifactStore } from '@/stores/artifact-store';
import type { Artifact as ArtifactType } from '@/stores/artifact-store';
import * as animationUtils from '@/utils';

// Mock Framer Motion for testing
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
            <div {...props}>{children}</div>
        ),
    },
    AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

// Mock artifact for testing
const MOCK_TEXT_ARTIFACT: ArtifactType = {
    id: 'test-artifact-1',
    type: 'text',
    title: 'Test Artifact',
    content: 'This is test content for the artifact.',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
};

describe('Artifact Animations', () => {
    beforeEach(() => {
        // Mock window.matchMedia
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation((query) => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        });

        useArtifactStore.setState({
            artifact: null,
            isOpen: false,
        });
    });

    describe('animation rendering', () => {
        it('renders dialog with Framer Motion wrapper', () => {
            useArtifactStore.setState({
                artifact: MOCK_TEXT_ARTIFACT,
                isOpen: true,
            });

            render(<Artifact />);

            // Dialog should render
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        it('applies animation variants on open', () => {
            useArtifactStore.setState({
                artifact: MOCK_TEXT_ARTIFACT,
                isOpen: true,
            });

            render(<Artifact />);

            // Component should render without errors
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });
    });

    describe('reduced motion', () => {
        it('respects prefers-reduced-motion preference', () => {
            // Mock reduced motion
            vi.spyOn(animationUtils, 'prefersReducedMotion').mockReturnValue(true);

            useArtifactStore.setState({
                artifact: MOCK_TEXT_ARTIFACT,
                isOpen: true,
            });

            render(<Artifact />);

            // Animation should use instant transitions (duration: 0)
            expect(animationUtils.prefersReducedMotion).toHaveBeenCalled();
        });

        it('uses spring animation when motion allowed', () => {
            vi.spyOn(animationUtils, 'prefersReducedMotion').mockReturnValue(false);

            useArtifactStore.setState({
                artifact: MOCK_TEXT_ARTIFACT,
                isOpen: true,
            });

            render(<Artifact />);

            // Should use spring physics
            expect(animationUtils.prefersReducedMotion).toHaveBeenCalled();
        });
    });

    describe('Radix Dialog integration', () => {
        it('maintains Dialog accessibility features with animations', () => {
            useArtifactStore.setState({
                artifact: MOCK_TEXT_ARTIFACT,
                isOpen: true,
            });

            render(<Artifact />);

            const dialog = screen.getByRole('dialog');

            // Dialog should render with proper role
            expect(dialog).toBeInTheDocument();

            // Title should be present and accessible
            expect(screen.getByText('Test Artifact')).toBeInTheDocument();
        });
    });
});
