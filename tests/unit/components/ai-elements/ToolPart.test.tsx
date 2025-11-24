import { render, screen, fireEvent } from '@testing-library/react';
import { ToolPart } from '@/components/ai-elements/tool-part';
import type { RagOutput } from '@/types/chat';

describe('ToolPart', () => {
    const mockRagOutput: RagOutput = {
        documents: [
            {
                title: 'Document 1',
                snippet: 'This is the first document snippet',
                relevance: 0.95,
                source: 'doc1.pdf',
            },
            {
                title: 'Document 2',
                snippet: 'This is the second document snippet',
                relevance: 0.87,
                source: 'doc2.pdf',
            },
        ],
    };

    it('should render tool name correctly', () => {
        render(<ToolPart toolName="ragRetrievalTool" toolCallId="call-1" status="complete" />);

        expect(screen.getByText('rag Retrieval')).toBeInTheDocument();
    });

    it('should show loading icon when status is streaming', () => {
        const { container } = render(
            <ToolPart toolName="ragRetrievalTool" toolCallId="call-1" status="streaming" />
        );

        const icon = container.querySelector('.animate-spin');
        expect(icon).toBeInTheDocument();
    });

    it('should show error icon when status is error', () => {
        const { container } = render(
            <ToolPart
                toolName="ragRetrievalTool"
                toolCallId="call-1"
                status="error"
                error="Failed to retrieve documents"
            />
        );

        // Error text is only visible when expanded
        const header = screen.getByText('rag Retrieval').closest('div');
        fireEvent.click(header!);

        expect(screen.getByText(/Failed to retrieve documents/)).toBeInTheDocument();

        // Check for error icon
        const errorIcon = container.querySelector('.text-red-500');
        expect(errorIcon).toBeInTheDocument();
    });

    it('should show success icon when status is complete', () => {
        render(
            <ToolPart
                toolName="ragRetrievalTool"
                toolCallId="call-1"
                status="complete"
                output={mockRagOutput}
            />
        );

        expect(screen.getByText('rag Retrieval')).toBeInTheDocument();
    });

    it('should expand and collapse when clicked', () => {
        render(
            <ToolPart
                toolName="ragRetrievalTool"
                toolCallId="call-1"
                status="complete"
                input={{ query: 'test query' }}
                output={mockRagOutput}
            />
        );

        expect(screen.queryByText('Input:')).not.toBeInTheDocument();

        const header = screen.getByText('rag Retrieval').closest('div');
        fireEvent.click(header!);

        expect(screen.getByText('Input:')).toBeInTheDocument();
        expect(screen.getByText('Output:')).toBeInTheDocument();
    });

    it('should display input when expanded', () => {
        const input = { query: 'search for documents' };

        render(
            <ToolPart
                toolName="ragRetrievalTool"
                toolCallId="call-1"
                status="complete"
                input={input}
                output={mockRagOutput}
            />
        );

        const header = screen.getByText('rag Retrieval').closest('div');
        fireEvent.click(header!);

        expect(screen.getByText('Input:')).toBeInTheDocument();
        expect(screen.getByText(/search for documents/)).toBeInTheDocument();
    });

    it('should display RAG documents with relevance scores', () => {
        render(
            <ToolPart
                toolName="ragRetrievalTool"
                toolCallId="call-1"
                status="complete"
                output={mockRagOutput}
            />
        );

        const header = screen.getByText('rag Retrieval').closest('div');
        fireEvent.click(header!);

        expect(screen.getByText('Document 1')).toBeInTheDocument();
        expect(screen.getByText('95% match')).toBeInTheDocument();
        expect(screen.getByText('This is the first document snippet')).toBeInTheDocument();
        expect(screen.getByText('Source: doc1.pdf')).toBeInTheDocument();

        expect(screen.getByText('Document 2')).toBeInTheDocument();
        expect(screen.getByText('87% match')).toBeInTheDocument();
    });

    it('should display error message when error exists', () => {
        render(
            <ToolPart
                toolName="ragRetrievalTool"
                toolCallId="call-1"
                status="error"
                error="Connection timeout"
            />
        );

        const header = screen.getByText('rag Retrieval').closest('div');
        fireEvent.click(header!);

        expect(screen.getByText('Error:')).toBeInTheDocument();
        expect(screen.getByText('Connection timeout')).toBeInTheDocument();
    });

    it('should not show expand/collapse icon when streaming', () => {
        render(<ToolPart toolName="ragRetrievalTool" toolCallId="call-1" status="streaming" />);

        const header = screen.getByText('rag Retrieval').closest('div');
        expect(header?.querySelector('button')).not.toBeInTheDocument();
    });

    it('should handle non-RAG tool output with JSON display', () => {
        const customOutput = { result: 'success', data: [1, 2, 3] };

        render(
            <ToolPart
                toolName="customTool"
                toolCallId="call-1"
                status="complete"
                output={customOutput}
            />
        );

        const header = screen.getByText('custom').closest('div');
        fireEvent.click(header!);

        expect(screen.getByText(/"result": "success"/)).toBeInTheDocument();
    });

    it('should apply error background color when error status', () => {
        const { container } = render(
            <ToolPart
                toolName="ragRetrievalTool"
                toolCallId="call-1"
                status="error"
                error="Test error"
            />
        );

        const header = container.querySelector('.bg-destructive\\/10');
        expect(header).toBeInTheDocument();
    });

    it('should handle document without source field', () => {
        const outputWithoutSource: RagOutput = {
            documents: [
                {
                    title: 'Document',
                    snippet: 'Snippet',
                    relevance: 0.9,
                },
            ],
        };

        render(
            <ToolPart
                toolName="ragRetrievalTool"
                toolCallId="call-1"
                status="complete"
                output={outputWithoutSource}
            />
        );

        const header = screen.getByText('rag Retrieval').closest('div');
        fireEvent.click(header!);

        expect(screen.getByText('Document')).toBeInTheDocument();
        expect(screen.queryByText(/Source:/)).not.toBeInTheDocument();
    });

    it('should format relevance score to nearest percentage', () => {
        const output: RagOutput = {
            documents: [
                {
                    title: 'Test',
                    snippet: 'Test snippet',
                    relevance: 0.876543,
                },
            ],
        };

        render(
            <ToolPart
                toolName="ragRetrievalTool"
                toolCallId="call-1"
                status="complete"
                output={output}
            />
        );

        const header = screen.getByText('rag Retrieval').closest('div');
        fireEvent.click(header!);

        expect(screen.getByText('88% match')).toBeInTheDocument();
    });
});
