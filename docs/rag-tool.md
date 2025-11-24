# RAG Tool Display

## Overview

The RAG (Retrieval-Augmented Generation) tool retrieves relevant documents from a knowledge base and displays them as formatted cards in the chat interface. Unlike other tools that show generic JSON output, RAG results get special rendering with relevance scores, snippets, and source links.

## Architecture

**Flow:** AI invokes ragRetrievalTool → ConversationMessages dispatches → ToolPart renders with custom RAG cards

**Key Components:**

- `ConversationMessages` - Dispatches tools to specialized or generic renderers
- `ToolRenderer` - Handles specialized tools (returns null for RAG)
- `ToolPart` - Generic tool container with RAG-specific rendering logic
- `renderToolOutput()` - Detects and formats RAG documents
- `RagOutput` type - Structured document data

## File Structure

```
src/
├── components/
│   └── ai-elements/
│       ├── conversation-messages.tsx  # Tool dispatcher logic
│       ├── tool-renderer.tsx          # Specialized tool handlers
│       └── tool-part.tsx              # Generic tool + RAG rendering
└── types/
    └── chat.ts                        # RagDocument, RagOutput types
```

## Data Structure

**Types:** `src/types/chat.ts`

```typescript
type RagDocument = {
    title: string; // Document title
    snippet: string; // Relevant excerpt
    relevance: number; // Score 0.0-1.0
    source?: string; // Optional source identifier
};

type RagOutput = {
    documents: RagDocument[];
};
```

**Example Output:**

```json
{
    "documents": [
        {
            "title": "API Authentication Guide",
            "snippet": "Use OAuth 2.0 for secure API access. Include bearer tokens in Authorization header...",
            "relevance": 0.92,
            "source": "docs/api/auth.md"
        },
        {
            "title": "Security Best Practices",
            "snippet": "Never store credentials in code. Use environment variables for sensitive data...",
            "relevance": 0.78,
            "source": "docs/security.md"
        }
    ]
}
```

## How It Works

### 1. Tool Invocation

AI SDK calls `ragRetrievalTool` during conversation:

```typescript
// AI system invokes tool
{
  toolName: 'ragRetrievalTool',
  toolCallId: 'call_abc123',
  state: 'result',
  args: { query: 'how to authenticate API' },
  result: {
    documents: [...]
  }
}
```

### 2. ConversationMessages Dispatch

```typescript
// src/components/ai-elements/conversation-messages.tsx
// Try specialized renderer first
const customRenderer = ToolRenderer({
  toolName,
  state: toolState,
  input,
  output,
  error: errorMsg,
});

// ToolRenderer returns null for RAG (not a specialized tool)
if (customRenderer !== null) {
  return customRenderer; // e.g., ArtifactPreview for createArtifact
}

// Fall back to generic ToolPart for RAG and other standard tools
return <ToolPart toolName={toolName} ... />
```

**Note:** `ToolRenderer` only handles specialized tools like `createArtifact`. It returns `null` for RAG, which triggers the fallback to `ToolPart`.

### 3. RAG Detection & Rendering in ToolPart

```typescript
// src/components/ai-elements/tool-part.tsx
function renderToolOutput(toolName: string, output: unknown) {
  if (toolName === 'ragRetrievalTool' && typeof output === 'object') {
    const data = output as RagOutput

    if (data.documents && Array.isArray(data.documents)) {
      return (
        <div className="space-y-2">
          {data.documents.map((doc, index) => (
            <DocumentCard key={index} doc={doc} />
          ))}
        </div>
      )
    }
  }

  // Fallback to generic JSON
  return <pre>{JSON.stringify(output, null, 2)}</pre>
}
```

## Visual Design

### Document Card

```
┌────────────────────────────────────────┐
│ API Authentication Guide      92% match│ ← Title + Relevance
├────────────────────────────────────────┤
│ Use OAuth 2.0 for secure API access.  │ ← Snippet
│ Include bearer tokens in Authorization │
│ header...                              │
│                                        │
│ Source: docs/api/auth.md               │ ← Source (optional)
└────────────────────────────────────────┘
```

**Styling:**

- Border and card background
- Title bold at top with relevance percentage right-aligned
- Snippet in muted text color
- Source at bottom in smaller text
- Responsive spacing

## ToolPart Integration

RAG rendering uses the generic `ToolPart` component, which provides expandable/collapsible UI for all standard tools. RAG gets custom document card rendering within this container.

**Why ToolPart for RAG?**

- RAG fits the "expandable tool output" pattern
- Doesn't need specialized UI like artifacts (which use ToolRenderer)
- Automatically inherits tool states (streaming/complete/error)
- Custom document cards render inside standard tool container

**Collapsed State:**

```
┌─────────────────────────────────────┐
│ [✓] Rag Retrieval        [>]        │ ← Collapsed
└─────────────────────────────────────┘
```

**Expanded State:**

```
┌─────────────────────────────────────┐
│ [✓] Rag Retrieval        [v]        │ ← Expanded
├─────────────────────────────────────┤
│ Input:                              │
│ { query: "how to authenticate" }    │
│                                     │
│ Output:                             │
│ [Document Card 1]                   │ ← Custom RAG cards
│ [Document Card 2]                   │
│ [Document Card 3]                   │
└─────────────────────────────────────┘
```

## Relevance Scoring

**Display Format:**

- Relevance stored as decimal (0.0 - 1.0)
- Displayed as percentage (0% - 100%)
- Rounded to nearest whole number

**Examples:**

- `0.92` → "92% match"
- `0.78` → "78% match"
- `0.54` → "54% match"

**Visual Styling:**

- All relevance scores use `text-muted-foreground` color
- No color-coding by relevance level (future enhancement candidate)
- Displayed right-aligned next to document title

## Tool States

RAG tool supports standard tool states:

**Streaming:**

```
[⟳] Rag Retrieval  ← Spinning loader
```

**Complete:**

```
[✓] Rag Retrieval  ← Green checkmark
```

**Error:**

```
[!] Rag Retrieval  ← Red alert icon
Error: Connection timeout
```

## Accessibility

- **Keyboard navigation:** Tab through cards, Enter/Space to interact
- **Screen readers:** Document titles, relevance scores, and sources announced
- **Semantic HTML:** Proper heading hierarchy, list structure
- **Focus indicators:** Visible focus states on interactive elements
- **ARIA labels:** Descriptive labels for relevance percentages

## Edge Cases

### Empty Results

```typescript
// No documents found
{
    documents: [];
}
```

**Display:** Shows empty "Output:" section with no cards

### Malformed Data

```typescript
// Missing required fields
{
    documents: [
        { title: 'Doc 1' }, // Missing snippet, relevance
    ];
}
```

**Behavior:** Falls back to generic JSON rendering

### Large Document Sets

**Current behavior:** Renders all documents (no pagination)

**Performance consideration:** May cause UI lag with 50+ documents

## Customization Examples

### Adding Click-to-Copy

```typescript
<div className="border-border bg-card rounded border p-2">
  <div className="mb-1 flex items-start justify-between gap-2">
    <p className="text-xs font-medium">{doc.title}</p>
    <button onClick={() => copyToClipboard(doc.snippet)}>
      <Copy className="size-3" />
    </button>
  </div>
  {/* ... */}
</div>
```

### Adding Source Links

```typescript
{doc.source && (
  <a
    href={doc.source}
    className="text-primary text-xs hover:underline"
    target="_blank"
    rel="noopener noreferrer"
  >
    View Source
  </a>
)}
```

### Color-Coding by Relevance

```typescript
const relevanceColor = doc.relevance > 0.8
  ? 'text-green-600'
  : doc.relevance > 0.5
  ? 'text-yellow-600'
  : 'text-red-600'

<span className={cn("text-xs", relevanceColor)}>
  {(doc.relevance * 100).toFixed(0)}% match
</span>
```

## Testing

**Location:** `tests/unit/components/ai-elements/`

**Coverage:**

- RAG document rendering
- Empty results handling
- Malformed data fallback
- Relevance score formatting
- Tool state transitions (streaming → complete)

## Known Limitations

- No pagination for large result sets
- Source field is optional (may be missing)
- Relevance scores use uniform muted color (no color-coding by value)
- No click-to-expand long snippets
- No sorting or filtering controls
- Documents render in API-provided order only
- RAG uses generic ToolPart rather than specialized renderer

## Future Enhancements

Potential improvements:

1. **Pagination** - Limit to 5-10 documents with "Show more"
2. **Sorting** - User can sort by relevance or title
3. **Filtering** - Filter by source or relevance threshold
4. **Expandable snippets** - Truncate long snippets with "Read more"
5. **Source links** - Make sources clickable if URLs
6. **Relevance visualization** - Progress bar or color coding
7. **Copy actions** - Copy snippet or full document

## Related Documentation

- [Tool Rendering System](./tool-rendering.md)
- [Artifact Feature](./artifact-feature.md)
- [Chat Types](../src/types/chat.ts)
