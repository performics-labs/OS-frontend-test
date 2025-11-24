import { describe, it, expect } from 'vitest';
import { server } from '@/mocks/server';
import { chatHandlers } from '@/mocks/handlers/chat.handlers';
import { API_ROUTES } from '@/constants';

describe('Mock Chat API', () => {
    it('should stream response with proper SSE format and headers', async () => {
        server.use(...chatHandlers);

        const response = await fetch(API_ROUTES.CHAT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'hello' }],
            }),
        });

        expect(response.ok).toBe(true);
        expect(response.headers.get('content-type')).toBe('text/event-stream');
        expect(response.headers.get('x-vercel-ai-data-stream')).toBe('v1');

        const text = await response.text();

        expect(text).toContain('data: {"type":"text-start"');
        expect(text).toContain('data: {"type":"text-delta"');
        expect(text).toContain('data: {"type":"text-end"');
        expect(text).toContain('data: {"type":"finish"');
        expect(text).toContain('data: [DONE]');
    });

    it('should respond to different keywords with appropriate content', async () => {
        server.use(...chatHandlers);

        const testCases = [
            { input: 'hello', expectedInResponse: 'assist' },
            { input: 'joke', expectedInResponse: 'developers' },
        ];

        for (const { input, expectedInResponse } of testCases) {
            const response = await fetch(API_ROUTES.CHAT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: input }],
                }),
            });

            const text = await response.text();
            expect(text).toMatch(new RegExp(expectedInResponse, 'i'));
        }
    }, 10000);

    it('should handle default response for unrecognized keywords', async () => {
        server.use(...chatHandlers);

        const response = await fetch(API_ROUTES.CHAT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'random unrecognized input' }],
            }),
        });

        const text = await response.text();
        // Should echo the user's input
        expect(text).toContain('"delta":"You"');
        expect(text).toContain('"delta":" said:"');

        // Should include example usage instructions
        expect(text).toContain('mock');
        expect(text).toContain('Artifacts');
        expect(text).toContain('button');
        expect(text).toContain('Search');
        expect(text).toContain('Knowledge');
    }, 10000);

    it('should include finish-step and finish events', async () => {
        server.use(...chatHandlers);

        const response = await fetch(API_ROUTES.CHAT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'hello' }],
            }),
        });

        const text = await response.text();

        expect(text).toContain('"type":"finish-step"');
        expect(text).toContain('"type":"finish"');
        expect(text).toContain('data: [DONE]');
    });
});
