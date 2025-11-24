import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    streamToolEvents,
    streamTextResponse,
    streamFinish,
    streamArtifactResponse,
} from '@/mocks/utils/stream-helpers';
import type { MockResponseConfig } from '@/mocks/data/chat-responses';
import type { ArtifactResponse } from '@/mocks/data/artifact-responses';

describe('stream-helpers', () => {
    let mockController: ReadableStreamDefaultController<Uint8Array>;
    let mockEncoder: TextEncoder;
    let enqueuedData: string[];

    beforeEach(() => {
        vi.clearAllMocks();
        enqueuedData = [];

        mockEncoder = new TextEncoder();
        mockController = {
            enqueue: vi.fn((data: Uint8Array) => {
                enqueuedData.push(new TextDecoder().decode(data));
            }),
            close: vi.fn(),
        } as unknown as ReadableStreamDefaultController<Uint8Array>;
    });

    describe('streamToolEvents', () => {
        it('should not stream anything for text-only responses', async () => {
            const config: MockResponseConfig = {
                type: 'text',
                text: 'Hello',
            };

            await streamToolEvents(mockController, mockEncoder, config);

            expect(mockController.enqueue).not.toHaveBeenCalled();
        });

        it('should stream tool events for RAG success', async () => {
            const config: MockResponseConfig = {
                type: 'rag-success',
                text: 'Response text',
                ragData: {
                    documents: [
                        {
                            title: 'Test Doc',
                            snippet: 'Test snippet',
                            relevance: 0.9,
                        },
                    ],
                },
            };

            await streamToolEvents(mockController, mockEncoder, config);

            expect(mockController.enqueue).toHaveBeenCalled();
            expect(enqueuedData.some((d) => d.includes('tool-input-start'))).toBe(true);
            expect(enqueuedData.some((d) => d.includes('tool-input-available'))).toBe(true);
            expect(enqueuedData.some((d) => d.includes('tool-output-available'))).toBe(true);
            expect(enqueuedData.some((d) => d.includes('finish-step'))).toBe(true);
        });

        it('should include tool call ID in events', async () => {
            const config: MockResponseConfig = {
                type: 'rag-success',
                text: 'Response',
                ragData: { documents: [] },
            };

            await streamToolEvents(mockController, mockEncoder, config);

            const toolStartEvent = enqueuedData.find((d) => d.includes('tool-input-start'));
            expect(toolStartEvent).toBeDefined();
            expect(toolStartEvent).toContain('toolCallId');
            expect(toolStartEvent).toContain('call_');
        });

        it('should include tool name as ragRetrievalTool', async () => {
            const config: MockResponseConfig = {
                type: 'rag-success',
                text: 'Response',
                ragData: { documents: [] },
            };

            await streamToolEvents(mockController, mockEncoder, config);

            const toolEvent = enqueuedData.find((d) => d.includes('ragRetrievalTool'));
            expect(toolEvent).toBeDefined();
        });

        it('should include RAG documents in output', async () => {
            const config: MockResponseConfig = {
                type: 'rag-success',
                text: 'Response',
                ragData: {
                    documents: [
                        {
                            title: 'Document 1',
                            snippet: 'Snippet',
                            relevance: 0.95,
                        },
                    ],
                },
            };

            await streamToolEvents(mockController, mockEncoder, config);

            const outputEvent = enqueuedData.find((d) => d.includes('tool-output-available'));
            expect(outputEvent).toBeDefined();
            expect(outputEvent).toContain('Document 1');
            expect(outputEvent).toContain('Snippet');
        });

        it('should stream error for RAG error responses', async () => {
            const config: MockResponseConfig = {
                type: 'rag-error',
                text: 'Error occurred',
                ragError: 'Connection timeout',
            };

            await streamToolEvents(mockController, mockEncoder, config);

            const outputEvent = enqueuedData.find((d) => d.includes('tool-output-available'));
            expect(outputEvent).toBeDefined();
            expect(outputEvent).toContain('Connection timeout');
        });

        it('should use default error message if ragError not provided', async () => {
            const config: MockResponseConfig = {
                type: 'rag-error',
                text: 'Error occurred',
            };

            await streamToolEvents(mockController, mockEncoder, config);

            const outputEvent = enqueuedData.find((d) => d.includes('tool-output-available'));
            expect(outputEvent).toContain('Tool execution failed');
        });
    });

    describe('streamTextResponse', () => {
        it('should stream text word by word', async () => {
            const text = 'Hello world test';

            await streamTextResponse(mockController, mockEncoder, text);

            expect(enqueuedData.some((d) => d.includes('text-start'))).toBe(true);
            expect(enqueuedData.some((d) => d.includes('text-delta'))).toBe(true);
            expect(enqueuedData.some((d) => d.includes('text-end'))).toBe(true);
        });

        it('should stream correct number of words', async () => {
            const text = 'One Two Three';

            await streamTextResponse(mockController, mockEncoder, text);

            const deltaEvents = enqueuedData.filter((d) => d.includes('text-delta'));
            expect(deltaEvents).toHaveLength(3);
        });

        it('should include message ID in all events', async () => {
            const text = 'Test';

            await streamTextResponse(mockController, mockEncoder, text);

            const startEvent = enqueuedData.find((d) => d.includes('text-start'));
            const deltaEvent = enqueuedData.find((d) => d.includes('text-delta'));
            const endEvent = enqueuedData.find((d) => d.includes('text-end'));

            expect(startEvent).toContain('msg_');
            expect(deltaEvent).toContain('msg_');
            expect(endEvent).toContain('msg_');
        });

        it('should handle single word', async () => {
            const text = 'Hello';

            await streamTextResponse(mockController, mockEncoder, text);

            const deltaEvents = enqueuedData.filter((d) => d.includes('text-delta'));
            expect(deltaEvents).toHaveLength(1);
            expect(deltaEvents[0]).toContain('Hello');
        });

        it('should add space before subsequent words', async () => {
            const text = 'First Second';

            await streamTextResponse(mockController, mockEncoder, text);

            const deltaEvents = enqueuedData.filter((d) => d.includes('text-delta'));
            expect(deltaEvents[0]).toContain('"delta":"First"');
            expect(deltaEvents[1]).toContain('"delta":" Second"');
        });

        it('should handle empty string', async () => {
            const text = '';

            await streamTextResponse(mockController, mockEncoder, text);

            const deltaEvents = enqueuedData.filter((d) => d.includes('text-delta'));
            expect(deltaEvents).toHaveLength(1);
            expect(deltaEvents[0]).toContain('""');
        });
    });

    describe('streamFinish', () => {
        it('should enqueue finish-step event', () => {
            streamFinish(mockController, mockEncoder);

            expect(enqueuedData.some((d) => d.includes('"type":"finish-step"'))).toBe(true);
        });

        it('should enqueue finish event', () => {
            streamFinish(mockController, mockEncoder);

            expect(enqueuedData.some((d) => d.includes('"type":"finish"'))).toBe(true);
        });

        it('should enqueue [DONE] marker', () => {
            streamFinish(mockController, mockEncoder);

            expect(enqueuedData.some((d) => d.includes('[DONE]'))).toBe(true);
        });

        it('should close the controller', () => {
            streamFinish(mockController, mockEncoder);

            expect(mockController.close).toHaveBeenCalledTimes(1);
        });

        it('should send minimal finish-step event without extra fields', () => {
            streamFinish(mockController, mockEncoder);

            const finishStepEvent = enqueuedData.find((d) => d.includes('"type":"finish-step"'));
            expect(finishStepEvent).not.toContain('finishReason');
            expect(finishStepEvent).not.toContain('usage');
        });

        it('should send events in correct order', () => {
            streamFinish(mockController, mockEncoder);

            const finishStepIndex = enqueuedData.findIndex((d) =>
                d.includes('"type":"finish-step"')
            );
            const finishIndex = enqueuedData.findIndex((d) => d.includes('"type":"finish"'));
            const doneIndex = enqueuedData.findIndex((d) => d.includes('[DONE]'));

            expect(finishStepIndex).toBeLessThan(finishIndex);
            expect(finishIndex).toBeLessThan(doneIndex);
        });
    });

    describe('streamArtifactResponse', () => {
        it('should stream artifact events in correct order', async () => {
            const artifact: ArtifactResponse = {
                kind: 'code',
                title: 'Test Component',
                content: 'function test() {}',
                language: 'tsx',
            };

            await streamArtifactResponse(mockController, mockEncoder, artifact);

            const events = enqueuedData
                .map((chunk) => {
                    const match = chunk.match(/data: ({.*})/);
                    return match ? JSON.parse(match[1]) : null;
                })
                .filter(Boolean);

            expect(events[0].type).toBe('data-id');
            expect(events[events.length - 1].type).toBe('data-finish');
        });

        it('should include artifact metadata in start event', async () => {
            const artifact: ArtifactResponse = {
                kind: 'code',
                title: 'Button Component',
                content: 'const btn = () => {}',
                language: 'tsx',
                description: 'A button',
            };

            await streamArtifactResponse(mockController, mockEncoder, artifact);

            const idEvent = enqueuedData.find((d) => d.includes('data-id'));
            expect(idEvent).toBeDefined();
            expect(idEvent).toContain('doc_');

            const titleEvent = enqueuedData.find((d) => d.includes('data-title'));
            expect(titleEvent).toBeDefined();
            expect(titleEvent).toContain('Button Component');

            const kindEvent = enqueuedData.find((d) => d.includes('data-kind'));
            expect(kindEvent).toBeDefined();
            expect(kindEvent).toContain('code');
        });

        it('should stream content as deltas', async () => {
            const artifact: ArtifactResponse = {
                kind: 'code',
                title: 'Test',
                content: 'line1\nline2\nline3',
                language: 'tsx',
            };

            await streamArtifactResponse(mockController, mockEncoder, artifact);

            const contentDeltas = enqueuedData.filter((d) => d.includes('data-codeDelta'));
            expect(contentDeltas.length).toBeGreaterThan(0);
        });

        it('should include full content in end event', async () => {
            const artifact: ArtifactResponse = {
                kind: 'text',
                title: 'Documentation',
                content: 'This is a test document',
            };

            await streamArtifactResponse(mockController, mockEncoder, artifact);

            const finishEvent = enqueuedData.find((d) => d.includes('data-finish'));
            expect(finishEvent).toBeDefined();

            const contentDeltas = enqueuedData.filter((d) => d.includes('data-textDelta'));
            const fullContent = contentDeltas
                .map((chunk) => {
                    const match = chunk.match(/data: ({.*})/);
                    return match ? JSON.parse(match[1]).data : '';
                })
                .join('');
            expect(fullContent).toBe('This is a test document');
        });

        it('should use consistent artifactId across events', async () => {
            const artifact: ArtifactResponse = {
                kind: 'code',
                title: 'Test',
                content: 'test',
                language: 'tsx',
            };

            await streamArtifactResponse(mockController, mockEncoder, artifact);

            const idEvent = enqueuedData.find((d) => d.includes('data-id'));
            expect(idEvent).toBeDefined();

            const match = idEvent?.match(/data: ({.*})/);
            const parsedEvent = match ? JSON.parse(match[1]) : null;
            expect(parsedEvent?.data).toMatch(/^doc_\d+$/);
        });

        it('should handle multiline content', async () => {
            const artifact: ArtifactResponse = {
                kind: 'code',
                title: 'Multiline',
                content: 'line1\nline2\nline3\nline4',
                language: 'tsx',
            };

            await streamArtifactResponse(mockController, mockEncoder, artifact);

            const contentDeltas = enqueuedData
                .map((chunk) => {
                    const match = chunk.match(/data: ({.*})/);
                    return match ? JSON.parse(match[1]) : null;
                })
                .filter((e) => e && e.type === 'data-codeDelta');

            expect(contentDeltas.length).toBe(4);
        });

        it('should handle text artifacts without language', async () => {
            const artifact: ArtifactResponse = {
                kind: 'text',
                title: 'Markdown Doc',
                content: '# Title\n\nContent',
            };

            await streamArtifactResponse(mockController, mockEncoder, artifact);

            const titleEvent = enqueuedData.find((d) => d.includes('data-title'));
            expect(titleEvent).toBeDefined();
            expect(titleEvent).toContain('Markdown Doc');

            const kindEvent = enqueuedData.find((d) => d.includes('data-kind'));
            expect(kindEvent).toBeDefined();
            expect(kindEvent).toContain('text');
        });

        it('should add delays between chunks', async () => {
            const artifact: ArtifactResponse = {
                kind: 'code',
                title: 'Test',
                content: 'line1\nline2',
                language: 'tsx',
            };

            const startTime = Date.now();
            await streamArtifactResponse(mockController, mockEncoder, artifact);
            const duration = Date.now() - startTime;

            // Should have delays: start (300ms) + 2 chunks (40ms each) + end (200ms) = ~580ms
            expect(duration).toBeGreaterThanOrEqual(500);
        });
    });

    describe('integration', () => {
        it('should properly format SSE data prefix', async () => {
            const config: MockResponseConfig = {
                type: 'rag-success',
                text: 'Test',
                ragData: { documents: [] },
            };

            await streamToolEvents(mockController, mockEncoder, config);

            enqueuedData.forEach((data) => {
                if (!data.includes('[DONE]')) {
                    expect(data).toMatch(/^data: /);
                }
            });
        });

        it('should use proper delays between events', async () => {
            const config: MockResponseConfig = {
                type: 'rag-success',
                text: 'Test',
                ragData: { documents: [] },
            };

            const startTime = Date.now();
            await streamToolEvents(mockController, mockEncoder, config);
            const duration = Date.now() - startTime;

            // Should have delays totaling at least 700ms (500ms + 200ms)
            expect(duration).toBeGreaterThanOrEqual(650);
        });
    });
});
