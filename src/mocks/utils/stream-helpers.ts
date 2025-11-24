import type { MockResponseConfig } from '@/mocks/data/chat-responses';
import type { ArtifactResponse } from '@/mocks/data/artifact-responses';

type StreamController = ReadableStreamDefaultController<Uint8Array>;

// Streaming delay constants (in milliseconds)
const TOOL_EXECUTION_DELAY_MS = 500;
const TOOL_COMPLETE_DELAY_MS = 200;
const WORD_STREAM_DELAY_MS = 50;
const ARTIFACT_START_DELAY_MS = 300;
const ARTIFACT_CHUNK_DELAY_MS = 40;
const ARTIFACT_END_DELAY_MS = 200;

export async function streamToolEvents(
    controller: StreamController,
    encoder: TextEncoder,
    config: MockResponseConfig
): Promise<void> {
    if (config.type !== 'rag-success' && config.type !== 'rag-error') {
        return;
    }

    const toolCallId = `call_${Date.now()}`;

    const toolInput = { query: 'user search query' };

    // Tool input start
    controller.enqueue(
        encoder.encode(
            `data: ${JSON.stringify({
                type: 'tool-input-start',
                toolCallId,
                toolName: 'ragRetrievalTool',
            })}\n\n`
        )
    );

    // Tool input available (complete input)
    controller.enqueue(
        encoder.encode(
            `data: ${JSON.stringify({
                type: 'tool-input-available',
                toolCallId,
                toolName: 'ragRetrievalTool',
                input: toolInput,
            })}\n\n`
        )
    );

    // Simulate tool execution delay
    await new Promise((resolve) => setTimeout(resolve, TOOL_EXECUTION_DELAY_MS));

    // Tool output available
    if (config.type === 'rag-success' && config.ragData) {
        controller.enqueue(
            encoder.encode(
                `data: ${JSON.stringify({
                    type: 'tool-output-available',
                    toolCallId,
                    output: config.ragData,
                })}\n\n`
            )
        );
    } else if (config.type === 'rag-error') {
        controller.enqueue(
            encoder.encode(
                `data: ${JSON.stringify({
                    type: 'tool-output-available',
                    toolCallId,
                    output: {
                        error: config.ragError || 'Tool execution failed',
                    },
                })}\n\n`
            )
        );
    }

    await new Promise((resolve) => setTimeout(resolve, TOOL_COMPLETE_DELAY_MS));

    // Send finish-step event to complete the tool call step
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'finish-step' })}\n\n`));
}

export async function streamTextResponse(
    controller: StreamController,
    encoder: TextEncoder,
    text: string
): Promise<void> {
    const messageId = `msg_${Date.now()}`;

    controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'text-start', id: messageId })}\n\n`)
    );

    const words = text.split(' ');
    for (let i = 0; i < words.length; i++) {
        const delta = i === 0 ? words[i] : ` ${words[i]}`;
        controller.enqueue(
            encoder.encode(
                `data: ${JSON.stringify({ type: 'text-delta', id: messageId, delta })}\n\n`
            )
        );
        await new Promise((resolve) => setTimeout(resolve, WORD_STREAM_DELAY_MS));
    }

    controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'text-end', id: messageId })}\n\n`)
    );
}

export async function streamArtifactResponse(
    controller: StreamController,
    encoder: TextEncoder,
    artifactData: ArtifactResponse
): Promise<string> {
    const artifactId = `doc_${Date.now()}`;
    const toolCallId = `call_${Date.now()}`;

    // PHASE 1: Send data stream events for progressive streaming
    // Send artifact ID (AI SDK data-* format)
    controller.enqueue(
        encoder.encode(
            `data: ${JSON.stringify({
                type: 'data-id',
                data: artifactId,
            })}\n\n`
        )
    );

    // Send artifact title
    controller.enqueue(
        encoder.encode(
            `data: ${JSON.stringify({
                type: 'data-title',
                data: artifactData.title,
            })}\n\n`
        )
    );

    // Send artifact kind
    controller.enqueue(
        encoder.encode(
            `data: ${JSON.stringify({
                type: 'data-kind',
                data: artifactData.kind,
            })}\n\n`
        )
    );

    // Send language if it's a code artifact
    if (artifactData.kind === 'code' && artifactData.language) {
        controller.enqueue(
            encoder.encode(
                `data: ${JSON.stringify({
                    type: 'data-language',
                    data: artifactData.language,
                })}\n\n`
            )
        );
    }

    await new Promise((resolve) => setTimeout(resolve, ARTIFACT_START_DELAY_MS));

    // Determine delta type based on kind
    const deltaType = `data-${artifactData.kind}Delta`; // e.g., "data-codeDelta", "data-textDelta"

    // Stream content progressively (by lines for better visual effect)
    const lines = artifactData.content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const delta = i === lines.length - 1 ? lines[i] : `${lines[i]}\n`;

        controller.enqueue(
            encoder.encode(
                `data: ${JSON.stringify({
                    type: deltaType,
                    data: delta,
                })}\n\n`
            )
        );

        await new Promise((resolve) => setTimeout(resolve, ARTIFACT_CHUNK_DELAY_MS));
    }

    await new Promise((resolve) => setTimeout(resolve, ARTIFACT_END_DELAY_MS));

    // PHASE 2: Send tool call events for message persistence
    // Tool input start
    controller.enqueue(
        encoder.encode(
            `data: ${JSON.stringify({
                type: 'tool-input-start',
                toolCallId,
                toolName: 'createArtifact',
            })}\n\n`
        )
    );

    // Tool input available
    controller.enqueue(
        encoder.encode(
            `data: ${JSON.stringify({
                type: 'tool-input-available',
                toolCallId,
                toolName: 'createArtifact',
                input: {
                    title: artifactData.title,
                    kind: artifactData.kind,
                    ...(artifactData.language && { language: artifactData.language }),
                },
            })}\n\n`
        )
    );

    // Tool output available (with same artifact ID from data stream!)
    controller.enqueue(
        encoder.encode(
            `data: ${JSON.stringify({
                type: 'tool-output-available',
                toolCallId,
                output: {
                    id: artifactId,
                    title: artifactData.title,
                    kind: artifactData.kind,
                    content: artifactData.content,
                    ...(artifactData.language && { language: artifactData.language }),
                },
            })}\n\n`
        )
    );

    // Send finish event as the final event
    controller.enqueue(
        encoder.encode(
            `data: ${JSON.stringify({
                type: 'data-finish',
                data: null,
            })}\n\n`
        )
    );

    return artifactId;
}

export function streamFinish(controller: StreamController, encoder: TextEncoder): void {
    // Send finish-step event (marks step completion - minimal format)
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'finish-step' })}\n\n`));

    // Send finish event (marks message completion - minimal format)
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'finish' })}\n\n`));

    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
    controller.close();
}
