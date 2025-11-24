/**
 * Client-side text streaming utilities (currently unused).
 *
 * This file provides utilities for simulating streaming text on the client side,
 * useful if the backend doesn't support SSE or if we need custom streaming behavior
 * outside of the AI SDK's built-in streaming.
 *
 * Current implementation uses AI SDK's native streaming via MSW (see src/mocks/handlers/chat.handlers.ts).
 * Keep this file as a reference for custom streaming patterns.
 *
 * See: docs/mock-chat-api.md for current SSE streaming implementation
 */

type StreamTextOptions = {
    chunkBy?: 'word' | 'char';
    delayMs?: number;
};

export async function streamText(
    text: string,
    onChunk: (accumulatedText: string) => void,
    options: StreamTextOptions = {}
): Promise<void> {
    const { chunkBy = 'word', delayMs = 30 } = options;

    let accumulated = '';
    let chunks: string[];

    if (chunkBy === 'word') {
        chunks = text.split(/(\s+)/);
    } else {
        chunks = text.split('');
    }

    for (let i = 0; i < chunks.length; i++) {
        accumulated += chunks[i];
        onChunk(accumulated);

        if (i < chunks.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }
}

export function createStreamController() {
    let shouldContinue = true;

    return {
        abort: () => {
            shouldContinue = false;
        },
        shouldContinue: () => shouldContinue,
    };
}
