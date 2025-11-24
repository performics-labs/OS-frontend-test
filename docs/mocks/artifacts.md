# Artifact Mocking

Mock system for simulating AI-generated artifacts (code, documents, images) in the chat interface during development.

## Overview

Artifacts are AI-generated content displayed in a dedicated panel. The mock system streams artifact events via Server-Sent Events (SSE) compatible with the AI SDK UI data stream protocol.

**Event Flow:**

```
User Message → MSW Handler → Stream Response
                               ├─ artifact-start
                               ├─ artifact-content-delta (streamed line-by-line)
                               ├─ artifact-end
                               └─ text-delta (AI explanation)
```

## Event Protocol

### artifact-start

```typescript
{
  type: 'artifact-start',
  artifactId: 'doc_1234567890',  // Generated: doc_${Date.now()}
  kind: 'code' | 'text' | 'image',
  title: string,
  language?: string  // For code artifacts only
}
```

### artifact-content-delta

```typescript
{
  type: 'artifact-content-delta',
  artifactId: 'doc_1234567890',
  delta: string  // Single line of content (includes \n except last line)
}
```

### artifact-end

```typescript
{
  type: 'artifact-end',
  artifactId: 'doc_1234567890',
  content: string  // Full content for verification
}
```

## Architecture

### Files

- **`src/mocks/data/artifact-responses.ts`** - Mock artifact data and trigger logic
- **`src/mocks/utils/stream-helpers.ts`** - Streaming implementation (`streamArtifactResponse`)
- **`src/mocks/data/chat-responses.ts`** - Response routing (checks artifacts before RAG)
- **`src/mocks/handlers/chat.handlers.ts`** - MSW handler integration

### Trigger System

Keyword-based pattern matching determines which artifact to generate:

| Pattern                                        | Artifact            | Kind | Language |
| ---------------------------------------------- | ------------------- | ---- | -------- |
| `button.*component\|create.*button`            | Button Component    | code | tsx      |
| `table.*component\|data.*table\|create.*table` | DataTable Component | code | tsx      |
| `documentation\|document.*component\|guide`    | Component Guide     | text | -        |
| `hook\|custom.*hook\|api.*hook\|use[A-Z]`      | useAPI Hook         | code | tsx      |

**Implementation:** `getArtifactByTrigger()` in `artifact-responses.ts`

### Streaming Behavior

**Timing Constants:**

- `ARTIFACT_START_DELAY_MS = 300` - Delay before streaming content
- `ARTIFACT_CHUNK_DELAY_MS = 40` - Delay between each line
- `ARTIFACT_END_DELAY_MS = 200` - Delay before end event

**Content Delivery:**

- Content split by newlines (`\n`)
- Each line streamed as separate delta event
- Final line omits trailing newline
- Full content included in end event for verification

**Design Rationale:**

- Line-by-line streaming creates realistic visual effect
- Simplifies mock implementation vs. token-based streaming
- Production backend will use token-based streaming

## Usage

### Trigger Examples

```
"Create a button component"          → Button Component (code/tsx)
"Build a data table"                 → DataTable Component (code/tsx)
"Generate component documentation"   → Markdown Guide (text)
"Create a custom API hook"           → useAPI Hook (code/tsx)
```

### Response Format

When artifact trigger detected:

```typescript
{
  type: 'artifact',
  text: "I've created a code artifact: 'Button Component'. A reusable button...",
  artifactData: {
    kind: 'code',
    title: 'Button Component',
    content: '...',
    language: 'tsx',
    description: '...'
  }
}
```

### Testing

Enable mocks in `.env`:

```bash
VITE_USE_MOCKS=true
```

**Unit Tests:**

- `tests/unit/mocks/artifact-responses.test.ts` - Trigger logic and data validation
- `tests/unit/mocks/stream-helpers.test.ts` - Streaming behavior and event sequence

**Manual Testing:**

1. Start dev server: `npm run dev`
2. Send artifact trigger prompts in chat
3. Verify artifact panel opens and content streams
4. Check AI explanation appears in chat

## Adding New Artifacts

1. Add artifact data to `MOCK_ARTIFACT_RESPONSES` in `artifact-responses.ts`:

```typescript
'new-artifact': {
  kind: 'code',
  language: 'tsx',
  title: 'New Component',
  description: 'Brief description',
  content: '...'
}
```

2. Update `getArtifactByTrigger()` with new pattern:

```typescript
if (/new.*pattern|trigger.*words/i.test(lowerPrompt)) {
    return MOCK_ARTIFACT_RESPONSES['new-artifact'];
}
```

3. Add test cases in `artifact-responses.test.ts`

## Backend Integration

When connecting to the Python/FastAPI backend, ensure it implements the same SSE event format:

**Required Headers:**

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
X-Vercel-AI-Data-Stream: v1
```

**Event Format:**

```
data: {"type":"artifact-start","artifactId":"doc_123","kind":"code","title":"..."}\n\n
data: {"type":"artifact-content-delta","artifactId":"doc_123","delta":"..."}\n\n
data: {"type":"artifact-end","artifactId":"doc_123","content":"..."}\n\n
```

See `docs/backend-integration.md` for detailed FastAPI examples.

## Troubleshooting

**Artifacts not appearing:**

- Check browser console for SSE parsing errors
- Verify `VITE_USE_MOCKS=true` in `.env`
- Check Network tab for event stream
- Confirm trigger pattern matches in `getArtifactByTrigger()`

**Slow streaming:**
Adjust timing in `stream-helpers.ts`:

```typescript
const ARTIFACT_CHUNK_DELAY_MS = 20; // Faster
```

**Content rendering issues:**

- Verify JSON escaping in artifact content
- Check syntax highlighting language support
- Ensure content is valid for artifact kind

## Resources

- [AI SDK UI Streaming](https://sdk.vercel.ai/docs/ai-sdk-ui/streaming-data)
- [Server-Sent Events Spec](https://html.spec.whatwg.org/multipage/server-sent-events.html)
- [MSW Documentation](https://mswjs.io/)
