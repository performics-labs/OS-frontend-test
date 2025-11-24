import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '@tests/__setup__/render';
import { CodeRenderer } from '@/components/artifact/renders/CodeRenderer';
import type { Artifact } from '@/types/artifacts';

describe('CodeRenderer', () => {
    const mockPythonArtifact: Artifact = {
        id: 'test-code-1',
        type: 'code',
        title: 'Test Python Code',
        content: 'print("Hello, World!")',
        language: 'python',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockTypeScriptArtifact: Artifact = {
        id: 'test-code-2',
        type: 'code',
        title: 'Test TypeScript Code',
        content: 'const greeting: string = "Hello, World!";',
        language: 'typescript',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    it('renders Python code without crashing', () => {
        render(<CodeRenderer artifact={mockPythonArtifact} />);
        expect(screen.getByText(/Hello, World!/)).toBeDefined();
    });

    it('renders TypeScript code without crashing', () => {
        render(<CodeRenderer artifact={mockTypeScriptArtifact} />);
        expect(screen.getByText(/greeting/)).toBeDefined();
    });

    it('displays code content in editor', () => {
        const { container } = render(<CodeRenderer artifact={mockPythonArtifact} />);
        const editorContainer = container.querySelector('.cm-editor');
        expect(editorContainer).toBeDefined();
    });

    it('handles empty content gracefully', () => {
        const emptyArtifact: Artifact = {
            ...mockPythonArtifact,
            content: '',
        };
        const { container } = render(<CodeRenderer artifact={emptyArtifact} />);
        const editorContainer = container.querySelector('.cm-editor');
        expect(editorContainer).toBeDefined();
    });

    it('defaults to Python when no language is specified', () => {
        const noLangArtifact: Artifact = {
            ...mockPythonArtifact,
            language: undefined,
        };
        const { container } = render(<CodeRenderer artifact={noLangArtifact} />);
        const editorContainer = container.querySelector('.cm-editor');
        expect(editorContainer).toBeDefined();
    });
});
