import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '@tests/__setup__/render';
import { ImageRenderer } from '@/components/artifact/renders/ImageRenderer';
import type { Artifact } from '@/types/artifacts';

describe('ImageRenderer', () => {
    const mockSvgArtifact: Artifact = {
        id: 'test-image-1',
        type: 'image',
        title: 'Test SVG Image',
        content:
            '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#00D68F" width="100" height="100"/></svg>',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockBase64Artifact: Artifact = {
        id: 'test-image-2',
        type: 'image',
        title: 'Test PNG Image',
        content:
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    it('renders SVG image without crashing', () => {
        const { container } = render(<ImageRenderer artifact={mockSvgArtifact} />);
        const svgElement = container.querySelector('svg');
        expect(svgElement).toBeDefined();
    });

    it('renders base64 PNG image without crashing', () => {
        render(<ImageRenderer artifact={mockBase64Artifact} />);
        const img = screen.getByAltText('Test PNG Image');
        expect(img).toBeDefined();
    });

    it('displays loading state when streaming', () => {
        render(<ImageRenderer artifact={mockSvgArtifact} status="streaming" />);
        expect(screen.getByText(/Generating image/)).toBeDefined();
    });

    it('displays loading state when content is empty', () => {
        const emptyArtifact: Artifact = {
            ...mockSvgArtifact,
            content: '',
        };
        render(<ImageRenderer artifact={emptyArtifact} />);
        expect(screen.getByText(/Generating image/)).toBeDefined();
    });

    it('renders SVG content with proper styling', () => {
        const { container } = render(<ImageRenderer artifact={mockSvgArtifact} />);
        const svgElement = container.querySelector('svg');
        const svgParent = svgElement?.parentElement;
        expect(svgParent).toBeDefined();
        expect(svgParent?.className).toContain('justify-center');
        expect(svgParent?.className).toContain('max-w-[800px]');
    });

    it('renders base64 image with proper src format', () => {
        render(<ImageRenderer artifact={mockBase64Artifact} />);
        const img = screen.getByAltText('Test PNG Image') as HTMLImageElement;
        expect(img.src).toContain('data:image/png;base64,');
    });

    it('sets correct alt text for images', () => {
        render(<ImageRenderer artifact={mockBase64Artifact} />);
        const img = screen.getByAltText('Test PNG Image');
        expect(img).toBeDefined();
    });

    it('handles SVG with special characters', () => {
        const specialSvgArtifact: Artifact = {
            ...mockSvgArtifact,
            content: '<svg xmlns="http://www.w3.org/2000/svg"><text>Test & "quotes"</text></svg>',
        };
        const { container } = render(<ImageRenderer artifact={specialSvgArtifact} />);
        const svgElement = container.querySelector('svg');
        expect(svgElement).toBeDefined();
    });

    it('distinguishes between SVG and base64 content correctly', () => {
        const { container: svgContainer } = render(<ImageRenderer artifact={mockSvgArtifact} />);
        const { container: base64Container } = render(
            <ImageRenderer artifact={mockBase64Artifact} />
        );

        expect(svgContainer.querySelector('svg')).toBeDefined();
        expect(base64Container.querySelector('img')).toBeDefined();
    });

    it('shows idle state after streaming completes', () => {
        const { rerender, container } = render(
            <ImageRenderer artifact={mockSvgArtifact} status="streaming" />
        );
        expect(screen.getByText(/Generating image/)).toBeDefined();

        rerender(<ImageRenderer artifact={mockSvgArtifact} status="idle" />);
        expect(screen.queryByText(/Generating image/)).toBeNull();
        expect(container.querySelector('svg')).toBeDefined();
    });
});
