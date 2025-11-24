import { http, HttpResponse } from 'msw';
import type { UIMessage } from 'ai';
import { isTextUIPart } from 'ai';
import { getMockResponse, type MockResponseConfig } from '@/mocks/data/chat-responses';
import {
    streamToolEvents,
    streamTextResponse,
    streamFinish,
    streamArtifactResponse,
} from '@/mocks/utils/stream-helpers';

function createStreamingResponse(config: MockResponseConfig): ReadableStream<Uint8Array> {
    const encoder = new TextEncoder();

    return new ReadableStream({
        async start(controller) {
            // Send message start with metadata (timestamp)
            controller.enqueue(
                encoder.encode(
                    `data: ${JSON.stringify({
                        type: 'start',
                        messageMetadata: {
                            createdAt: Date.now(),
                        },
                    })}\n\n`
                )
            );

            // Stream tool events if this is a RAG response
            await streamToolEvents(controller, encoder, config);

            // Stream artifact if artifact response
            if (config.type === 'artifact' && config.artifactData) {
                await streamArtifactResponse(controller, encoder, config.artifactData);
            }

            // Stream text response
            await streamTextResponse(controller, encoder, config.text);

            // Finish stream
            streamFinish(controller, encoder);
        },
    });
}

export const chatHandlers = [
    http.post('/api/chat', async ({ request }) => {
        const { messages } = (await request.json()) as {
            messages: (UIMessage | { role: string; content: string })[];
        };

        const userMessages = messages?.filter((msg) => msg.role === 'user') ?? [];
        const lastUserMessage = userMessages[userMessages.length - 1];

        let userMessageText = '';
        let hasFileAttachments = false;
        let fileCount = 0;

        if (lastUserMessage) {
            if ('parts' in lastUserMessage) {
                userMessageText =
                    lastUserMessage.parts
                        ?.filter(isTextUIPart)
                        .map((part) => part.text)
                        .join('') ?? '';

                fileCount =
                    lastUserMessage.parts?.filter((part) => part.type === 'file').length ?? 0;
                hasFileAttachments = fileCount > 0;
            } else if ('content' in lastUserMessage) {
                userMessageText = lastUserMessage.content;
            }
        }

        let responseConfig: MockResponseConfig;
        if (hasFileAttachments) {
            responseConfig = {
                type: 'text',
                text: `I can see you've attached ${fileCount} file${fileCount > 1 ? 's' : ''}. ${userMessageText ? `Regarding "${userMessageText}": ` : ''}While I can acknowledge your attachments in this demo, actual file processing would be handled by the backend AI service. The files have been received and would normally be analyzed based on their content.`,
            };
        } else {
            responseConfig = getMockResponse(userMessageText);
        }

        await new Promise((resolve) => setTimeout(resolve, 300));

        const stream = createStreamingResponse(responseConfig);

        return new HttpResponse(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
                'X-Vercel-AI-Data-Stream': 'v1',
            },
        });
    }),
];
