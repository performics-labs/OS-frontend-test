# Artifact Feature

## Overview

The Artifact feature displays AI-generated content (code, text, images, spreadsheets) in a dedicated side panel alongside the chat interface. Content streams in real-time as the AI generates it through the `createArtifact` tool, with support for multiple artifact types and responsive layouts.

## Architecture

**Flow:** User message → AI SDK (`useChat`) → Stream validation → DataStreamContext → DataStreamHandler → Artifact store → UI update

**Key Components:**

- `ChatInterface` - AI SDK integration with `useChat` hook, validates incoming data stream events (src/components/ChatInterface.tsx:36-50)
- `DataStreamProvider` - Context provider managing streaming data state (src/contexts/DataStreamProvider.tsx)
- `DataStreamHandler` - Processes validated stream events and updates artifact store (src/components/DataStreamHandler.tsx)
- `ArtifactStore` - Zustand store managing artifact state and UI visibility (src/stores/artifact-store.ts)
- `Artifact` - Main side panel component using Radix Dialog in non-modal mode (src/components/artifact/Artifact.tsx)
- `ToolRenderer` - Routes tool calls to appropriate preview components (src/components/ai-elements/tool-renderer.tsx)
- `ArtifactPreview` - Handles artifact tool states, validation, and loading (src/components/ai-elements/artifact-preview.tsx)
- `ArtifactInlinePreview` - Inline preview card in chat with expand button (src/components/ai-elements/artifact-inline-preview.tsx)
- `ArtifactLoadingIndicator` - Loading state during artifact creation (src/components/ai-elements/artifact-loading-indicator.tsx)
- Type-specific renderers - CodeRenderer, TextRenderer, ImageRenderer, SpreadsheetRenderer (src/components/artifact/renders/)

## File Structure

```
src/
├── components/
│   ├── ChatInterface.tsx          # AI SDK useChat integration
│   ├── DataStreamHandler.tsx      # Stream event processor
│   ├── artifact/
│   │   ├── Artifact.tsx           # Main side panel component
│   │   └── renders/               # Type-specific renderers
│   │       ├── CodeRenderer.tsx
│   │       ├── TextRenderer.tsx
│   │       ├── ImageRenderer.tsx
│   │       └── SpreadsheetRenderer.tsx
│   └── ai-elements/
│       ├── tool-renderer.tsx              # Tool call router
│       ├── artifact-preview.tsx           # Tool state handler
│       ├── artifact-inline-preview.tsx    # Inline preview card
│       └── artifact-loading-indicator.tsx # Loading indicator
├── stores/
│   └── artifact-store.ts          # Zustand state management
├── contexts/
│   ├── DataStreamContext.ts       # Context definition
│   └── DataStreamProvider.tsx     # Context provider
├── hooks/
│   ├── useArtifact.ts             # Artifact store hook
│   └── useDataStream.ts           # Data stream context hook
├── types/
│   ├── artifacts.ts               # Internal artifact types
│   └── artifact-tool.ts           # Tool result/input schemas
├── utils/
│   └── data-stream-validation.ts  # Zod schemas for stream events
├── constants/
│   └── artifacts.ts               # Constants (types, breakpoints, animation, z-index)
└── pages/
    └── ChatPage.tsx               # Layout integration
```

## Artifact Types

The system uses **two type representations** for artifacts:

1. **Tool API** (external): Uses `kind` field with simple string values
2. **Internal**: Uses `type` field with the same string values

| Type        | Value           | Renderer            | Description                                          |
| ----------- | --------------- | ------------------- | ---------------------------------------------------- |
| Text        | `'text'`        | TextRenderer        | Plain text or markdown content                       |
| Code        | `'code'`        | CodeRenderer        | Syntax-highlighted code (language in separate field) |
| Image       | `'image'`       | ImageRenderer       | SVG or base64-encoded images                         |
| Spreadsheet | `'spreadsheet'` | SpreadsheetRenderer | Tabular CSV data with editing                        |

**Language support (for code artifacts):** `typescript`, `javascript`, `python`, `java`, and others via CodeMirror extensions.

**Type mapping:** The `ArtifactPreview` component maps tool results (`kind` field) to internal artifacts (`type` field) at src/components/ai-elements/artifact-preview.tsx:44-45.

## Data Flow

### 1. Stream Events

AI SDK emits data events during streaming. These events have the `data-*` prefix:

```typescript
// Artifact initialization
{ type: 'data-id', data: 'artifact-123' }
{ type: 'data-title', data: 'Example Code' }
{ type: 'data-kind', data: 'code' }  // Simple string, not MIME type

// Content streaming (type-specific deltas)
{ type: 'data-codeDelta', data: 'const foo' }
{ type: 'data-codeDelta', data: ' = "bar";' }

// Or for other types:
{ type: 'data-textDelta', data: 'Some text content' }
{ type: 'data-imageDelta', data: '<svg>...</svg>' }
{ type: 'data-spreadsheetDelta', data: 'col1,col2\n' }

// Control events
{ type: 'data-clear', data: null }    // Clear content
{ type: 'data-finish', data: null }   // Streaming complete
```

**Event types:**

- `data-id` - Artifact unique identifier
- `data-title` - Artifact display title
- `data-kind` - Artifact type (`'text'`, `'code'`, `'image'`, `'spreadsheet'`)
- `data-codeDelta` - Code content chunk
- `data-textDelta` - Text content chunk
- `data-imageDelta` - Image content chunk
- `data-spreadsheetDelta` - Spreadsheet content chunk
- `data-clear` - Clear accumulated content
- `data-finish` - Mark streaming complete

### 2. Validation

Events are validated at ChatInterface level using Zod schemas:

**File:** src/utils/data-stream-validation.ts

```typescript
// Individual event schemas
export const dataStreamSchemas = {
    'data-id': baseDataEventSchema.extend({
        type: z.literal('data-id'),
        data: z.string(),
    }),
    'data-title': baseDataEventSchema.extend({
        type: z.literal('data-title'),
        data: z.string(),
    }),
    'data-kind': baseDataEventSchema.extend({
        type: z.literal('data-kind'),
        data: artifactTypeSchema, // 'text' | 'code' | 'image' | 'spreadsheet'
    }),
    'data-codeDelta': baseDataEventSchema.extend({
        type: z.literal('data-codeDelta'),
        data: z.string(),
    }),
    // ... other delta types
};

export function validateDataStreamEvent(dataPart: unknown): ValidatedArtifactDataEvent | null {
    const result = artifactDataEventSchema.safeParse(dataPart);
    if (!result.success) {
        console.warn('[DataStream] Invalid data event received:', {
            data: dataPart,
            issues: result.error.issues,
        });
        return null;
    }
    return result.data;
}
```

**Validation happens in ChatInterface:**

```typescript
// src/components/ChatInterface.tsx:36-50
useChat({
    onData: (dataPart) => {
        // Clear stream on new message
        if (typeof dataPart === 'object' && dataPart !== null && 'type' in dataPart) {
            const type = (dataPart as { type: unknown }).type;
            if (type === 'start') {
                clearDataStream();
            }
        }

        // Validate and store
        const validatedEvent = validateDataStreamEvent(dataPart);
        if (validatedEvent) {
            setDataStream((ds) => [...ds, validatedEvent]);
        }
    },
});
```

### 3. State Management via Context

Validated events are stored in `DataStreamContext`:

**File:** src/contexts/DataStreamProvider.tsx

```typescript
export function DataStreamProvider({ children }: { children: ReactNode }) {
    const [dataStream, setDataStream] = useState<ValidatedArtifactDataEvent[]>([]);

    const clearDataStream = useCallback(() => {
        setDataStream([]);
    }, []);

    const value = useMemo(
        () => ({ dataStream, setDataStream, clearDataStream }),
        [dataStream, clearDataStream]
    );

    return <DataStreamContext.Provider value={value}>{children}</DataStreamContext.Provider>;
}
```

**Mounted at app root:** src/main.tsx:36-39

### 4. Event Processing

`DataStreamHandler` processes events from context:

**File:** src/components/DataStreamHandler.tsx:29-96

```typescript
export function DataStreamHandler() {
    const { dataStream } = useDataStream();
    const { artifact, openArtifact, updateArtifactContent } = useArtifactStore();
    const accumulatedContent = useRef('');
    const pendingArtifact = useRef<{
        id?: string;
        title?: string;
        type?: ArtifactType;
    }>({});

    useEffect(() => {
        // Process new deltas incrementally
        const newDeltas = dataStream.slice(lastProcessedIndex.current + 1);

        newDeltas.forEach((delta) => {
            switch (delta.type) {
                case 'data-id':
                    accumulatedContent.current = '';
                    pendingArtifact.current = { id: delta.data };
                    break;

                case 'data-title':
                    pendingArtifact.current.title = delta.data;
                    break;

                case 'data-kind':
                    pendingArtifact.current.type = delta.data;

                    // Open artifact when metadata complete
                    if (
                        pendingArtifact.current.id &&
                        pendingArtifact.current.title &&
                        pendingArtifact.current.type
                    ) {
                        openArtifact({
                            id: pendingArtifact.current.id,
                            type: pendingArtifact.current.type,
                            title: pendingArtifact.current.title,
                            content: '',
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        });
                    }
                    break;

                case 'data-codeDelta':
                case 'data-textDelta':
                case 'data-imageDelta':
                case 'data-spreadsheetDelta':
                    // Accumulate and update
                    accumulatedContent.current += delta.data;
                    if (artifact) {
                        updateArtifactContent(accumulatedContent.current);
                    }
                    break;

                case 'data-clear':
                    accumulatedContent.current = '';
                    if (artifact) {
                        updateArtifactContent('');
                    }
                    break;

                case 'data-finish':
                    accumulatedContent.current = '';
                    pendingArtifact.current = {};
                    break;
            }
        });
    }, [dataStream, artifact, openArtifact, updateArtifactContent]);

    return null; // Renders nothing
}
```

### 5. Artifact Store Updates

Store manages artifact data and UI state:

**File:** src/stores/artifact-store.ts

```typescript
interface ArtifactState {
    // State
    artifact: Artifact | null;
    isOpen: boolean;
    isEditing: boolean;

    // Actions
    openArtifact: (artifact: Artifact) => void;
    closeArtifact: () => void;
    toggleEditMode: () => void;
    setEditMode: (editing: boolean) => void;
    updateArtifactContent: (content: string) => void;
}
```

**Key behaviors:**

- `openArtifact()` - Sets artifact data, opens panel, resets edit mode
- `closeArtifact()` - Closes panel, delays clearing artifact for exit animation (300ms)
- `updateArtifactContent()` - Updates content and `updatedAt` timestamp

### 6. Rendering

`Artifact.tsx` component renders the side panel:

**File:** src/components/artifact/Artifact.tsx:125-145

```typescript
{artifact && (
    <>
        {artifact.type === 'text' ? (
            <TextRenderer artifact={artifact} />
        ) : artifact.type === 'code' ? (
            <CodeRenderer artifact={artifact} />
        ) : artifact.type === 'image' ? (
            <ImageRenderer artifact={artifact} />
        ) : artifact.type === 'spreadsheet' ? (
            <SpreadsheetRenderer artifact={artifact} />
        ) : (
            // Fallback renderer for unknown types
            <div className="p-4">
                <div className="text-muted-foreground mb-2 text-sm">
                    Type: <span className="font-medium">{artifact.type}</span>
                </div>
                <pre className="bg-muted overflow-auto rounded p-4 text-xs break-words whitespace-pre-wrap">
                    {artifact.content}
                </pre>
            </div>
        )}
    </>
)}
```

## Type Definitions

### Internal Artifact Type

**File:** src/types/artifacts.ts

```typescript
export interface Artifact {
    id: string;
    type: ArtifactType; // 'text' | 'code' | 'image' | 'spreadsheet'
    title: string;
    content: string;
    language?: string; // For code artifacts
    createdAt: Date;
    updatedAt: Date;
}

export type ArtifactType = (typeof ARTIFACT_TYPES)[keyof typeof ARTIFACT_TYPES];

// Type guards
export function isTextArtifact(artifact: Artifact): boolean {
    return artifact.type === 'text';
}

export function isCodeArtifact(artifact: Artifact): boolean {
    return artifact.type === 'code';
}

export function isImageArtifact(artifact: Artifact): boolean {
    return artifact.type === 'image';
}

export function isSpreadsheetArtifact(artifact: Artifact): boolean {
    return artifact.type === 'spreadsheet';
}
```

### Tool API Types

**File:** src/types/artifact-tool.ts

```typescript
// Tool result from AI (uses "kind" field)
export const artifactResultSchema = z.object({
    id: z.string(),
    title: z.string(),
    kind: z.enum(['text', 'code', 'image', 'spreadsheet']),
    content: z.string().optional(),
    language: z.string().optional(),
});

export const artifactInputSchema = z.object({
    title: z.string(),
    kind: z.enum(['text', 'code', 'image', 'spreadsheet']),
});

export type ArtifactResult = z.infer<typeof artifactResultSchema>;
export type ArtifactInput = z.infer<typeof artifactInputSchema>;
```

**Note:** Tool API uses `kind` field, internal representation uses `type` field. The mapping happens at src/components/ai-elements/artifact-preview.tsx:44-45.

## Constants

**File:** src/constants/artifacts.ts

```typescript
// Artifact types
export const ARTIFACT_TYPES = {
    TEXT: 'text',
    CODE: 'code',
    IMAGE: 'image',
    SPREADSHEET: 'spreadsheet',
} as const;

export const VALID_ARTIFACT_TYPES = Object.values(ARTIFACT_TYPES);

// Breakpoints (matches Tailwind)
export const ARTIFACT_BREAKPOINTS = {
    MOBILE_MAX: 768, // Mobile: < 768px
    DESKTOP_MIN: 768, // Desktop: >= 768px (Tailwind md:)
} as const;

// Layout dimensions
export const ARTIFACT_LAYOUT = {
    CHAT_PANEL_WIDTH: 400, // Desktop chat panel width
    MOBILE_FULL_SCREEN: '100%',
} as const;

// Animation configuration
export const ARTIFACT_ANIMATION = {
    spring: {
        stiffness: 200,
        damping: 30,
    },
    duration: 300, // milliseconds
    ease: 'easeInOut',
} as const;

// Z-index layering
export const ARTIFACT_Z_INDEX = {
    BACKGROUND_OVERLAY: 50,
    ARTIFACT_PANEL: 51,
    CLOSE_BUTTON: 52,
} as const;
```

## Layout Modes

### Desktop (≥768px - Tailwind `md:`)

Side-by-side layout:

- Chat panel: Fixed 400px width (when artifact open)
- Artifact panel: Flexible width (fills remaining space)
- Artifact slides in from right with Framer Motion animation
- Uses Radix Dialog in **non-modal mode** (`modal={false}`)

**Implementation:** src/pages/ChatPage.tsx:30-49

```typescript
<div className="relative flex w-full flex-1 flex-row overflow-hidden">
    {/* Chat panel - fixed 400px when artifact open */}
    <div className={`flex w-full flex-col pt-4 pb-4 transition-all duration-300
                     ${isOpen ? 'hidden md:flex md:w-[400px]' : ''}`}>
        <ChatInterface ... />
    </div>

    {/* Artifact container - flexible width */}
    <div ref={setArtifactContainer}
         className={`relative overflow-hidden ${showContainer ? 'flex-1' : 'hidden'}`} />
</div>

{/* Artifact portals into container */}
<Artifact portalContainer={artifactContainer} />
```

### Mobile (<768px)

Modal-like overlay:

- Artifact appears over chat interface
- Chat panel hidden when artifact open
- Close button returns to chat
- Uses Radix Dialog portal rendering

## Store API

**Hook:** `useArtifact()` - Returns all store state and actions

**File:** src/hooks/useArtifact.ts

```typescript
export function useArtifact() {
    return useArtifactStore(); // Returns entire store
}
```

**Available state and actions:**

```typescript
// State
const { artifact, isOpen, isEditing } = useArtifact();

// Actions
const {
    openArtifact, // (artifact: Artifact) => void
    closeArtifact, // () => void
    toggleEditMode, // () => void
    setEditMode, // (editing: boolean) => void
    updateArtifactContent, // (content: string) => void
} = useArtifact();
```

**Important behaviors:**

1. **openArtifact()** - Opens panel and sets artifact
    - Clears any pending cleanup timers
    - Resets edit mode
    - Sets `isOpen: true`

2. **closeArtifact()** - Closes panel with animation delay
    - Sets `isOpen: false` immediately
    - Waits 300ms (animation duration) before clearing artifact data
    - Allows smooth exit animation

3. **updateArtifactContent()** - Updates content and timestamp
    - Updates `content` field
    - Updates `updatedAt` to current time
    - Used by DataStreamHandler during streaming

## Renderers

### CodeRenderer

**File:** src/components/artifact/renders/CodeRenderer.tsx

**Features:**

- CodeMirror editor integration
- Syntax highlighting for multiple languages
- VSCode light/dark themes
- Read-only view
- Language detection from `artifact.language` field
- Streaming status support

**Language support:** JavaScript, TypeScript, Python, and more via CodeMirror language packages.

### TextRenderer

**File:** src/components/artifact/renders/TextRenderer.tsx

**Features:**

- Plain text or markdown display
- Rich text editor component
- Copy and download actions
- Simple textarea for editing

### ImageRenderer

**File:** src/components/artifact/renders/ImageRenderer.tsx

**Features:**

- SVG rendering
- Base64 image support
- Download capability
- Responsive scaling
- Pan and zoom (if implemented)

### SpreadsheetRenderer

**File:** src/components/artifact/renders/SpreadsheetRenderer.tsx

**Features:**

- React Data Grid integration
- CSV parsing
- Editable cells
- Download as CSV
- Row/column navigation
- Streaming status support

## Tool Integration

### ToolRenderer

Routes `createArtifact` tool calls to artifact preview:

**File:** src/components/ai-elements/tool-renderer.tsx

```typescript
export function ToolRenderer({ toolName, state, input, output, error }: ToolRendererProps) {
    if (toolName === 'createArtifact') {
        return <ArtifactPreview result={output} input={input} state={state} error={error} />;
    }

    return null;
}
```

### ArtifactPreview

Handles tool states and validation:

**File:** src/components/ai-elements/artifact-preview.tsx

**States:**

1. **Loading** (`input-streaming`, `input-available`) - Shows `ArtifactLoadingIndicator`
2. **Error** (`output-error`) - Displays error message
3. **Success** (`output-available`) - Shows `ArtifactInlinePreview`

**Type mapping:** Converts tool result `kind` field to internal `type` field:

```typescript
// src/components/ai-elements/artifact-preview.tsx:43-51
const artifactData: Artifact = {
    id: resultData.id,
    type: resultData.kind, // Maps "kind" to "type"
    title: resultData.title,
    content: resultData.content || '',
    language: resultData.language,
    createdAt: new Date(),
    updatedAt: new Date(),
};
```

### ArtifactInlinePreview

Displays inline preview card in chat:

**File:** src/components/ai-elements/artifact-inline-preview.tsx

**Features:**

- Preview card with expand button (Maximize2 icon)
- Shows appropriate renderer based on type
- Click to open full artifact panel
- Compact button mode when artifact already open
- Keyboard accessible (Enter/Space to expand)
- Streaming indicator during content loading

## Accessibility

- **Keyboard navigation:** Tab through controls, Enter/Space to expand preview, Esc to close
- **Focus management:** Radix Dialog manages focus automatically, prevented auto-focus on open
- **Screen readers:** ARIA labels on all interactive elements, Dialog.Description for context
- **Semantic HTML:** Uses Radix Dialog primitives for proper dialog role
- **Reduced motion:** Respects `prefers-reduced-motion` media query, disables animations
- **High contrast:** Color palette meets WCAG AA contrast requirements

**Implementation:** src/components/artifact/Artifact.tsx:91-95

```typescript
<Dialog.Description className="sr-only">
    {artifact?.type === 'code'
        ? `Code artifact in ${artifact.language || 'text'} format`
        : `${artifact?.type || 'Artifact'} viewer`}
</Dialog.Description>
```

## Testing

**Location:** tests/unit/components/artifacts/, tests/unit/stores/, tests/unit/utils/

**Coverage areas:**

- Artifact store state management
- Data stream validation
- Animation configuration
- Component rendering for each artifact type
- Tool rendering integration
- Inline preview interactions

## Adding New Artifact Types

1. **Add constant:** Update `ARTIFACT_TYPES` in src/constants/artifacts.ts
2. **Update type:** Add to validation in src/types/artifacts.ts
3. **Update schemas:**
    - Add to `artifactKindSchema` in src/types/artifact-tool.ts
    - Add `data-<newType>Delta` to src/utils/data-stream-validation.ts
4. **Add delta case:** Update switch statement in src/components/DataStreamHandler.tsx:67-75
5. **Create renderer:** Add new renderer in src/components/artifact/renders/
6. **Update Artifact.tsx:** Add case in src/components/artifact/Artifact.tsx:125-145
7. **Update ArtifactInlinePreview:** Add preview case in src/components/ai-elements/artifact-inline-preview.tsx:139-223
8. **Add tests:** Create unit tests in tests/unit/components/artifacts/renders/

## Known Limitations

- Single artifact visible at a time (no history or tabs)
- Content stored in memory only (resets on page refresh)
- No versioning or edit history
- Large artifacts (>1MB) may impact performance
- Limited editing capabilities (view-focused)

## Related Documentation

- [Tool Rendering System](./tool-rendering.md)
- [RAG Tool Display](./rag-tool.md)
- [Color Palette](./color-palette.md)
- AI SDK Documentation: https://sdk.vercel.ai/docs
