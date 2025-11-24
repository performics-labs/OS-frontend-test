import { describe, it, expect } from 'vitest';
import { extractTextContent } from '@/utils/message';
import type { ChatMessage } from '@/types/chat';

describe('extractTextContent', () => {
    it('should extract text from a message with single text part', () => {
        const message: ChatMessage = {
            id: 'msg-1',
            role: 'assistant',
            parts: [{ type: 'text', text: 'Hello, world!' }],
        };

        const result = extractTextContent(message);

        expect(result).toBe('Hello, world!');
    });

    it('should extract and join multiple text parts', () => {
        const message: ChatMessage = {
            id: 'msg-2',
            role: 'assistant',
            parts: [
                { type: 'text', text: 'First part' },
                { type: 'text', text: 'Second part' },
                { type: 'text', text: 'Third part' },
            ],
        };

        const result = extractTextContent(message);

        expect(result).toBe('First partSecond partThird part');
    });

    it('should use custom separator when provided', () => {
        const message: ChatMessage = {
            id: 'msg-3',
            role: 'assistant',
            parts: [
                { type: 'text', text: 'First' },
                { type: 'text', text: 'Second' },
            ],
        };

        const result = extractTextContent(message, '\n\n');

        expect(result).toBe('First\n\nSecond');
    });

    it('should filter out non-text parts', () => {
        const message: ChatMessage = {
            id: 'msg-4',
            role: 'assistant',
            parts: [
                { type: 'text', text: 'Before tool' },
                {
                    type: 'tool-ragRetrievalTool',
                    toolCallId: 'call-1',
                    state: 'output-available',
                    input: {},
                    output: { documents: [] },
                },
                { type: 'text', text: 'After tool' },
            ],
        };

        const result = extractTextContent(message);

        expect(result).toBe('Before toolAfter tool');
    });

    it('should return empty string when no text parts exist', () => {
        const message: ChatMessage = {
            id: 'msg-5',
            role: 'assistant',
            parts: [
                {
                    type: 'tool-ragRetrievalTool',
                    toolCallId: 'call-1',
                    state: 'output-available',
                    input: {},
                    output: { documents: [] },
                },
            ],
        };

        const result = extractTextContent(message);

        expect(result).toBe('');
    });

    it('should return empty string when parts array is empty', () => {
        const message: ChatMessage = {
            id: 'msg-6',
            role: 'user',
            parts: [],
        };

        const result = extractTextContent(message);

        expect(result).toBe('');
    });

    it('should handle messages with empty text parts', () => {
        const message: ChatMessage = {
            id: 'msg-7',
            role: 'assistant',
            parts: [
                { type: 'text', text: '' },
                { type: 'text', text: 'Content' },
                { type: 'text', text: '' },
            ],
        };

        const result = extractTextContent(message);

        expect(result).toBe('Content');
    });
});
