# AI SDK Dynamic Parameters

Guide for passing dynamic parameters to the chat API using the AI SDK's `useChat` hook.

## Problem

When using `useChat` with dynamic values (like selected model, user preferences, etc.), you need to ensure the latest values are sent with each request, not the values captured when the component mounted.

## Solution: `prepareSendMessagesRequest`

Use `DefaultChatTransport` with `prepareSendMessagesRequest` to read dynamic values at request time.

## Implementation

### 1. Store Setup

Use Zustand (or similar) with `getState()` method for accessing store values outside React components:

```typescript
// src/stores/model-store.ts
import { create } from 'zustand';

export const useModelStore = create<ModelStore>()((set) => ({
    currentModel: DEFAULT_MODEL,
    setCurrentModel: (model) => set({ currentModel: model }),
}));
```

### 2. Chat Component Setup

```typescript
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useModelStore } from '@/stores';

export function ChatInterface() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: `${API_BASE_URL}/api/chat`,
      prepareSendMessagesRequest: ({ messages }) => {
        // ✅ Read from store at REQUEST time (not mount time)
        const currentModel = useModelStore.getState().currentModel;

        return {
          body: {
            messages,
            data: {
              agentTemplate: currentModel?.id || 'default',
              // Add other dynamic parameters here
            },
          },
        };
      },
    }),
  });

  return (
    // Your chat UI
  );
}
```

### 3. Backend Expected Format

The backend expects this request structure:

```json
{
    "messages": [{ "role": "user", "content": "Hello" }],
    "data": {
        "agentTemplate": "customer_support",
        "userId": "user-123",
        "chatId": "chat-456"
    }
}
```

## Key Points

### ✅ DO

- **Read dynamic values inside `prepareSendMessagesRequest`**

    ```typescript
    prepareSendMessagesRequest: ({ messages }) => {
        const currentModel = useModelStore.getState().currentModel; // ✅
        return { body: { messages, data: { agentTemplate: currentModel.id } } };
    };
    ```

- **Use `.getState()` to access store values**
    - Works from anywhere, not just React components
    - Always returns the current value

- **Structure body to match backend expectations**
    - Nest custom parameters in `data` field
    - Include `messages` array at top level

### ❌ DON'T

- **Capture values from component scope**

    ```typescript
    const currentModel = useModelStore((state) => state.currentModel); // ❌

    prepareSendMessagesRequest: ({ messages }) => {
        // This captures the value at mount time!
        return { body: { messages, data: { agentTemplate: currentModel.id } } };
    };
    ```

- **Use static `body` parameter**
    ```typescript
    useChat({
        body: { agentTemplate: 'default' }, // ❌ Never updates
    });
    ```

## Alternative: Per-Message Body

If you control the `sendMessage` call directly, you can pass body per message:

```typescript
const { sendMessage } = useChat({ api: '/api/chat' });

// Later when sending:
sendMessage(message, {
    body: {
        agentTemplate: useModelStore.getState().currentModel.id,
    },
});
```

**Limitation**: Requires modifying every `sendMessage` call. Not ideal for reusable components.

## Testing

### Test Dynamic Values are Sent

1. Add backend logging to verify received data:

    ```python
    logger.info(f"Received data: {request.data}")
    ```

2. Test different selections:
    - Select Model A → Send message → Verify Model A in logs
    - Select Model B → Send message → Verify Model B in logs

### Expected Backend Logs

```
Received chat request with data: {'agentTemplate': 'customer_support'}
Loading template: customer_support for user: None
```

## Common Issues

### Issue: Always uses initial value

**Cause**: Capturing value from component scope

**Fix**: Read from store inside `prepareSendMessagesRequest`:

```typescript
const currentModel = useModelStore.getState().currentModel;
```

### Issue: Backend receives empty `data: {}`

**Cause**: Not nesting `agentTemplate` in `data` field

**Fix**: Structure body correctly:

```typescript
return {
    body: {
        messages,
        data: { agentTemplate: '...' }, // ← nest in data
    },
};
```

## Related

- [AI SDK Transport Documentation](https://ai-sdk.dev/docs/ai-sdk-ui/transport)
- [AI SDK useChat Reference](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat)
- `src/stores/model-store.ts` - Model store implementation
- `src/components/ChatInterface.tsx` - Example usage
