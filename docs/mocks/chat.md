# Mock Chat API

Mock streaming chat API endpoint for development and testing.

## Overview

The `/api/chat` endpoint provides a mock implementation that fully adheres to the AI SDK's Data Stream Protocol (v1), including SSE streaming and proper event sequencing for compatibility with `useChat` and other AI SDK React hooks.

## Quick Start

The mock is already configured and runs automatically in development mode. Just send requests to `/api/chat`.

### Using with AI SDK's useChat Hook

```tsx
import { useChat } from '@ai-sdk/react';
import { API_ROUTES } from '@/constants';

function ChatComponent() {
    const { messages, input, handleInputChange, handleSubmit } = useChat({
        api: API_ROUTES.CHAT,
    });

    return (
        <form onSubmit={handleSubmit}>
            {messages.map((m) => (
                <div key={m.id}>
                    {m.role}: {m.content}
                </div>
            ))}
            <input value={input} onChange={handleInputChange} />
            <button type="submit">Send</button>
        </form>
    );
}
```

## Testing Scenarios

```typescript
// Test short response
"hello"
→ "Hey there! How can I assist you today?"

// Test markdown rendering
"show me markdown"
→ Full markdown with headers, bold, code blocks, lists

// Test code syntax highlighting
"give me a code example"
→ React component with proper TypeScript syntax

// Test long streaming content
"give me a long explanation"
→ Multiple paragraphs with structured content

// Test default behavior
"random message"
→ Echo response with available keywords
```

## Stream Protocol

The mock implements the AI SDK's Data Stream Protocol (v1):

- Uses Server-Sent Events (SSE) format
- Each message: `data: {JSON}\n\n`
- Event sequence: `text-start` → `text-delta` (multiple) → `text-end` → `finish` → `[DONE]`
- The `finish` event includes `finishReason` and token `usage` metadata
- Streams word-by-word (not character-by-character) for better readability

Example stream output:

```
data: {"type":"text-start","id":"msg_123"}

data: {"type":"text-delta","id":"msg_123","delta":"Hello"}

data: {"type":"text-delta","id":"msg_123","delta":" world"}

data: {"type":"text-end","id":"msg_123"}

data: {"type":"finish","finishReason":"stop","usage":{"promptTokens":10,"completionTokens":2}}

data: [DONE]
```

## Configuration

Stream timing is configured in `src/mocks/handlers/chat.handlers.ts`:

```typescript
// In createStreamingResponse function
await new Promise((resolve) => setTimeout(resolve, 50)); // Adjust delay per word

// Initial response delay
await new Promise((resolve) => setTimeout(resolve, 300)); // Adjust before streaming starts
```

## Implementation Files

- **Handler**: `src/mocks/handlers/chat.handlers.ts`
- **Mock Data**: `src/mocks/data/chat-responses.ts`
- **Service**: `src/services/chat/chat-service.ts`
- **Route constant**: `src/constants/routes.ts`
- **Types**: `src/types/chat.ts`

## Adding New Response Types

Edit `MOCK_RESPONSES` and `getMockResponse` in `src/mocks/data/chat-responses.ts`:

```typescript
export const MOCK_RESPONSES = {
    // Add new response
    error: 'This simulates an error response',
    // ... other responses
};

export function getMockResponse(userPrompt: string): string {
    const prompt = userPrompt.toLowerCase();

    // Add keyword detection
    if (/error|fail/i.test(prompt)) {
        return MOCK_RESPONSES.error;
    }
    // ... other conditions
}
```

## Testing

The handler is automatically registered and works in both browser dev mode and Vitest test environments.

Example test:

```typescript
import { server } from '@/mocks/server';
import { chatHandlers } from '@/mocks/handlers/chat.handlers';
import { API_ROUTES } from '@/constants';

it('should stream chat responses with proper protocol', async () => {
    server.use(...chatHandlers);

    const response = await fetch(API_ROUTES.CHAT, {
        method: 'POST',
        body: JSON.stringify({
            messages: [{ role: 'user', content: 'hello' }],
        }),
    });

    expect(response.headers.get('x-vercel-ai-data-stream')).toBe('v1');

    const text = await response.text();
    expect(text).toContain('"type":"finish"');
    expect(text).toContain('"finishReason":"stop"');
});
```

See `tests/unit/chat-mock.test.ts` for complete examples.

## Real Backend Integration

When the backend team delivers the real endpoint:

1. Remove `chatHandlers` from `src/mocks/handlers/index.ts`
2. Remove or archive `src/mocks/handlers/chat.handlers.ts`
3. Update `API_ROUTES.CHAT` if endpoint path changes
4. Components using `useChat` remain unchanged - the mock follows the exact AI SDK protocol
