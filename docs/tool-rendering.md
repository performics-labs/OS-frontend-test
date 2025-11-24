# Tool Rendering System

## Overview

The tool rendering system displays AI tool invocations and results within the chat conversation. It handles special rendering for specific tools (like `createArtifact`) and provides a generic fallback for others.

## Architecture

**Flow:** AI invokes tool → Message contains tool call → ToolRenderer dispatches → Specialized renderer or ToolPart fallback

**Key Components:**

- `ToolRenderer` - Dispatcher for tool-specific rendering
- `ToolPart` - Generic fallback display with expandable JSON
- `ArtifactPreview` - Inline artifact preview for `createArtifact` tool

## File Structure

```
src/
├── components/
│   └── ai-elements/
│       ├── tool-renderer.tsx              # Tool dispatcher
│       ├── tool-part.tsx                  # Generic tool display + RAG special case
│       ├── conversation-messages.tsx      # Message rendering with tool detection
│       ├── artifact-preview.tsx           # Artifact tool result handler
│       ├── artifact-inline-preview.tsx    # Inline artifact preview card
│       ├── artifact-loading-indicator.tsx # Artifact streaming indicator
│       └── WeatherCard.tsx                # Weather tool custom card
├── stores/
│   └── artifact-store.ts                  # Zustand store for artifacts
└── types/
    ├── tools.ts                           # Tool state and props types
    ├── chat.ts                            # Message parts and RAG types
    └── artifact-tool.ts                   # Artifact tool schemas
```

## Tool Types

### Campaign Tools (Special Rendering Flow)

Campaign tools use a unique two-phase rendering approach:

**Campaign Tools:**
- `budget_allocator` - Platform budget allocation with pie and bar charts
- `pricing_optimizer` - Bid adjustments with line chart
- `audience_creator` - Audience segments with pie chart
- `brand_lift_predictor` - Brand metrics with radar chart
- `client_profiler`, `roas_projector`, `platform_configurator`, `creative_designer`, `export_generator`

**Rendering Flow:**

1. **During Streaming** (`input-streaming` / `input-available`):
   - Shows loading card with tool name and status
   - Example: "Using budget_allocator"

2. **When Complete** (`output-available`):
   - Replaces loading card with charts directly
   - Charts render instantly with `isAnimationActive={false}`
   - Backend sends chart-ready data (no frontend transformations)

**Key Implementation Detail:**
Campaign tools bypass ToolPart entirely when complete. The loading card is shown during streaming, then replaced with charts when output is available. This prevents charts from being hidden inside collapsed cards.

See `docs/campaign-tools.md` for detailed implementation.

### Specialized Tools

| Tool Name          | Renderer              | Description                                    |
| ------------------ | --------------------- | ---------------------------------------------- |
| `createArtifact`   | ArtifactPreview       | Displays inline artifact card with open action |
| `ragRetrievalTool` | ToolPart (special)    | Document cards with relevance scores           |
| `get_weather`      | WeatherCard           | Weather card with temp, range, sunrise/sunset  |
| Campaign Tools     | CampaignToolOutput    | Marketing campaign visualization with Recharts |

### Generic Tools

All other tools use `ToolPart` fallback:

- Expandable/collapsible display
- Shows tool name, status, and arguments
- JSON-formatted result

## How It Works

### 1. Message Rendering

```typescript
// src/components/ai-elements/conversation-messages.tsx
{message.parts
  .filter((part) => part.type.startsWith('tool-'))
  .map((part, index) => {
    const toolName = part.type.replace('tool-', '');
    const toolState = determineToolState(part);

    const input = 'input' in part ? part.input : 'args' in part ? part.args : undefined;
    const output = 'output' in part ? part.output : 'result' in part ? part.result : undefined;

    // Try custom renderer first
    const customRenderer = ToolRenderer({ toolName, state: toolState, input, output, error });

    // If custom renderer returns null, fall back to ToolPart
    if (customRenderer !== null) {
      return customRenderer;
    }

    return <ToolPart toolName={toolName} status={...} input={input} output={output} />;
  })}
```

### 2. Tool Dispatching

```typescript
// src/components/ai-elements/tool-renderer.tsx
export function ToolRenderer({ toolName, state, input, output, error }: ToolRendererProps) {
  // Campaign tools - show loading card during streaming, then charts when complete
  const isCampaignTool = [
    'client_profiler', 'budget_allocator', 'roas_projector',
    'platform_configurator', 'pricing_optimizer', 'creative_designer',
    'brand_lift_predictor', 'audience_creator', 'export_generator'
  ].includes(toolName);

  if (isCampaignTool) {
    if (state === 'input-streaming' || state === 'input-available') {
      // Show loading card during streaming
      const stableId = `${toolName}-${JSON.stringify(input)?.substring(0, 20) || 'default'}`;
      return (
        <ToolPart
          toolName={toolName}
          toolCallId={stableId}
          status="streaming"
          input={input}
          output={undefined}
          error={undefined}
        />
      );
    }

    if (state === 'output-available' && output && typeof output === 'object') {
      // Render charts directly when complete
      return <CampaignToolOutput toolName={toolName} output={output} />;
    }

    if (state === 'output-error') {
      // Show error card
      const stableId = `${toolName}-${JSON.stringify(input)?.substring(0, 20) || 'default'}`;
      return (
        <ToolPart
          toolName={toolName}
          toolCallId={stableId}
          status="error"
          input={input}
          output={output}
          error={error}
        />
      );
    }
  }

  if (toolName === 'createArtifact') {
    return <ArtifactPreview result={output} input={input} state={state} error={error} />;
  }

  // Future: other specialized tools can be added here
  return null; // Falls back to ToolPart in conversation-messages.tsx
}
```

### 3. Tool State

Tool state is determined from message parts and converted to internal state:

```typescript
// src/types/tools.ts
type ToolState = 'input-streaming' | 'input-available' | 'output-available' | 'output-error';
```

**States:**

- `input-streaming` - Tool input/args are being streamed
- `input-available` - Tool has complete input, awaiting execution
- `output-available` - Tool execution complete with result
- `output-error` - Tool execution failed with error

**State determination logic (conversation-messages.tsx:42-62):**

1. Check for error states first (`error` field present or `state === 'output-error'`)
2. Check for output/result availability
3. Check for input/args availability
4. Default to `input-streaming`

## ToolPart (Generic Display)

**Features:**

- Expandable/collapsible with keyboard support
- Tool name and status badge
- Formatted arguments
- Special RAG document rendering
- JSON result display

**File:** `src/components/ai-elements/tool-part.tsx`

### Visual Structure

```
┌─────────────────────────────────────┐
│ [Icon] Tool Name          [Chevron] │ ← Header (clickable)
├─────────────────────────────────────┤
│ Input:                              │
│ { key: "value" }                    │
│                                     │
│ Output:                             │
│ { result: "data" }                  │ ← Content (when expanded)
└─────────────────────────────────────┘
```

### RAG Tool Special Rendering

When `toolName === 'ragRetrievalTool'`, displays document cards:

```typescript
// src/components/ai-elements/tool-part.tsx (lines 94-127)
function renderToolOutput(toolName: string, output: unknown) {
  if (toolName === 'ragRetrievalTool' && typeof output === 'object' && output !== null) {
    const data = output as RagOutput;

    if (data.documents && Array.isArray(data.documents)) {
      return data.documents.map((doc, index) => (
        <div key={index} className="border-border bg-card rounded border p-2">
          <div className="mb-1 flex items-start justify-between gap-2">
            <p className="text-xs font-medium">{doc.title}</p>
            <span className="text-muted-foreground shrink-0 text-xs">
              {(doc.relevance * 100).toFixed(0)}% match
            </span>
          </div>
          <p className="text-muted-foreground mb-1 text-xs">{doc.snippet}</p>
          {doc.source && (
            <p className="text-muted-foreground text-xs">Source: {doc.source}</p>
          )}
        </div>
      ));
    }
  }

  // Generic JSON fallback for all other tools
  return <pre className="bg-muted overflow-x-auto rounded p-2 text-xs">
    {JSON.stringify(output, null, 2)}
  </pre>;
}
```

**Note:** RAG documents use `relevance` (0-1 number) not `score`, and `source` (optional string) not `url`.

See [RAG Tool Display](./rag-tool.md) for details.

## ArtifactPreview (createArtifact)

**Purpose:** Show inline preview of artifact in chat with action to open full view

**Flow:**

1. AI calls `createArtifact` tool
2. ToolRenderer detects tool name and passes result to ArtifactPreview
3. ArtifactPreview validates input/result with Zod schemas
4. During streaming (`input-streaming`/`input-available`): shows ArtifactLoadingIndicator
5. On success (`output-available`): constructs Artifact object and renders ArtifactInlinePreview
6. On error (`output-error`): displays error message
7. User clicks preview → calls `useArtifactStore().openArtifact()` → Opens full Artifact panel

**Files:**

- `src/components/ai-elements/artifact-preview.tsx` - Result handler with state logic
- `src/components/ai-elements/artifact-inline-preview.tsx` - Preview card component
- `src/components/ai-elements/artifact-loading-indicator.tsx` - Streaming state indicator

### Visual Structure

**Loading State (ArtifactLoadingIndicator):**

```
┌─────────────────────────────────────┐
│ [FileText] Creating "Title" [Spin]  │ ← Compact inline indicator
└─────────────────────────────────────┘
```

**Complete State (ArtifactInlinePreview):**

```
┌─────────────────────────────────────┐
│ [FileText] Artifact Title [Maximize]│ ← Header with icon
├─────────────────────────────────────┤
│                                     │
│  [Rendered content preview]         │ ← Type-specific renderer
│  - Text: Editor preview             │   (257px height, scrollable)
│  - Code: CodeRenderer               │
│  - Image: ImageRenderer             │
│  - Spreadsheet: SpreadsheetRenderer │
│                                     │
└─────────────────────────────────────┘
```

Full card is clickable to open artifact panel.

## Type Definitions

**Tool Props:** `src/types/tools.ts`

```typescript
export type ToolState = 'input-streaming' | 'input-available' | 'output-available' | 'output-error';

export type ToolRendererProps = {
    toolName: string;
    state: ToolState;
    input?: unknown;
    output?: unknown;
    error?: string;
};
```

**Tool Part Props:** Defined inline in `src/components/ai-elements/tool-part.tsx`

```typescript
type ToolPartProps = {
    toolName: string;
    toolCallId: string;
    status?: 'streaming' | 'complete' | 'error';
    input?: unknown;
    output?: unknown;
    error?: string;
};
```

**RAG Types:** `src/types/chat.ts`

```typescript
export type RagDocument = {
    title: string;
    snippet: string;
    relevance: number; // 0-1 float, displayed as percentage
    source?: string;
};

export type RagOutput = {
    documents: RagDocument[];
};
```

**Artifact Types:** `src/types/artifact-tool.ts`

```typescript
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

## Adding New Tool Renderers

This guide shows how to create custom tool cards using the WeatherCard as a complete example.

### Complete Example: WeatherCard

#### 1. Create the Component

Create a new file `src/components/ai-elements/WeatherCard.tsx`:

```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Cloud, Thermometer, Sunrise, Sunset } from 'lucide-react';
import type { ToolState } from '@/types/tools';

// Define the data structure expected from the backend tool
type OpenMeteoWeatherData = {
    latitude: number;
    longitude: number;
    timezone: string;
    current?: {
        temperature_2m?: number;
    };
    current_units?: {
        temperature_2m?: string;
    };
    hourly?: {
        temperature_2m?: unknown[];
    };
    daily?: {
        sunrise?: unknown[];
        sunset?: unknown[];
    };
    cityName?: string;
};

type WeatherCardProps = {
    output?: OpenMeteoWeatherData | string;  // Support both object and string formats
    state: ToolState;
    error?: string;
};

export function WeatherCard({ output, state, error }: WeatherCardProps) {
    // 1. Handle error state
    if (state === 'output-error' || error) {
        return (
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="text-sm">Weather Error</CardTitle>
                    <CardDescription className="text-xs">
                        {error || 'Failed to fetch weather data'}
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    // 2. Handle loading state
    if (!output || state === 'input-streaming') {
        return (
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Cloud className="h-5 w-5 animate-pulse" />
                        Loading weather...
                    </CardTitle>
                </CardHeader>
            </Card>
        );
    }

    // 3. Parse output (handle both string and object formats)
    let weatherData: OpenMeteoWeatherData;
    if (typeof output === 'string') {
        try {
            // Try parsing as JSON first
            weatherData = JSON.parse(output);
        } catch {
            // Fallback: convert Python dict string to JSON
            try {
                const jsonString = output
                    .replace(/'/g, '"')
                    .replace(/None/g, 'null')
                    .replace(/True/g, 'true')
                    .replace(/False/g, 'false');
                weatherData = JSON.parse(jsonString);
            } catch (e) {
                console.error('Failed to parse weather data:', output, e);
                return (
                    <Card className="border-destructive">
                        <CardHeader>
                            <CardTitle className="text-sm">Weather Error</CardTitle>
                            <CardDescription className="text-xs">
                                Invalid weather data format
                            </CardDescription>
                        </CardHeader>
                    </Card>
                );
            }
        }
    } else {
        weatherData = output;
    }

    // 4. Extract and process data
    const location = weatherData.cityName || `${weatherData.latitude}°, ${weatherData.longitude}°`;
    const temperature = weatherData.current?.temperature_2m;
    const temperatureUnit = weatherData.current_units?.temperature_2m || '°C';

    const sunrise = weatherData.daily?.sunrise?.[0] as string | undefined;
    const sunset = weatherData.daily?.sunset?.[0] as string | undefined;

    const hourlyTemps = weatherData.hourly?.temperature_2m;
    let minTemp: number | undefined;
    let maxTemp: number | undefined;
    if (Array.isArray(hourlyTemps) && hourlyTemps.length > 0) {
        const todayTemps = hourlyTemps.slice(0, 24);
        minTemp = Math.min(...todayTemps.filter((t) => typeof t === 'number'));
        maxTemp = Math.max(...todayTemps.filter((t) => typeof t === 'number'));
    }

    // 5. Validate required data
    if (temperature === undefined) {
        return (
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="text-sm">Weather Error</CardTitle>
                    <CardDescription className="text-xs">
                        Temperature data not available
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    // 6. Render the card
    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Cloud className="h-5 w-5" />
                    {location}
                </CardTitle>
                <CardDescription className="text-xs">
                    {weatherData.timezone} • {new Date().toLocaleDateString()}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Current Temperature */}
                <div className="flex items-center gap-3">
                    <Thermometer className="text-muted-foreground h-8 w-8" />
                    <div>
                        <p className="text-4xl font-bold">
                            {Math.round(temperature)}
                            {temperatureUnit}
                        </p>
                        <p className="text-muted-foreground text-xs">Current temperature</p>
                    </div>
                </div>

                {/* Temperature Range */}
                {minTemp !== undefined && maxTemp !== undefined && (
                    <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Low</span>
                                <span className="font-semibold">
                                    {Math.round(minTemp)}
                                    {temperatureUnit}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">High</span>
                                <span className="font-semibold">
                                    {Math.round(maxTemp)}
                                    {temperatureUnit}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sunrise/Sunset */}
                {(sunrise || sunset) && (
                    <div className="flex items-center justify-around gap-4 border-t pt-3">
                        {sunrise && (
                            <div className="flex items-center gap-2">
                                <Sunrise className="text-muted-foreground h-4 w-4" />
                                <div>
                                    <p className="text-muted-foreground text-xs">Sunrise</p>
                                    <p className="text-sm font-medium">
                                        {new Date(sunrise).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </div>
                        )}
                        {sunset && (
                            <div className="flex items-center gap-2">
                                <Sunset className="text-muted-foreground h-4 w-4" />
                                <div>
                                    <p className="text-muted-foreground text-xs">Sunset</p>
                                    <p className="text-sm font-medium">
                                        {new Date(sunset).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
```

#### 2. Register in ToolRenderer

Update `src/components/ai-elements/tool-renderer.tsx`:

```typescript
import type { ToolRendererProps } from '@/types/tools';
import { ArtifactPreview } from './artifact-preview';
import { WeatherCard } from './WeatherCard';

export function ToolRenderer({ toolName, state, input, output, error }: ToolRendererProps) {
    if (toolName === 'createArtifact') {
        return <ArtifactPreview result={output} input={input} state={state} error={error} />;
    }

    // Weather tool from os-agent (supports both 'get_weather' and 'weather' names)
    if (toolName === 'get_weather' || toolName === 'weather') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return <WeatherCard output={output as any} state={state} error={error} />;
    }

    // Future: other tools can be added here
    return null;
}
```

**Note:** Type assertion (`as any`) is used because `ToolRendererProps.output` is `unknown`. The WeatherCard handles runtime validation and parsing internally.

### Key Patterns from WeatherCard

#### 1. Handle Multiple Data Formats

Backend tools may return data in different formats:

```typescript
type YourCardProps = {
    output?: YourDataType | string;  // Support both
    state: ToolState;
    error?: string;
};

// Parse output
let data: YourDataType;
if (typeof output === 'string') {
    try {
        data = JSON.parse(output);
    } catch {
        // Handle parsing errors
        return <ErrorCard message="Invalid data format" />;
    }
} else {
    data = output;
}
```

#### 2. State-Based Rendering

Always handle all four tool states:

```typescript
// Error state
if (state === 'output-error' || error) {
    return <ErrorDisplay error={error} />;
}

// Loading states
if (!output || state === 'input-streaming') {
    return <LoadingIndicator />;
}

// Success state
return <DataCard data={data} />;
```

#### 3. Graceful Degradation

Show partial data if some fields are missing:

```typescript
// Required field - show error if missing
if (!data.required) {
    return <ErrorCard message="Missing required data" />;
}

// Optional fields - only show if available
{data.optional && (
    <OptionalSection data={data.optional} />
)}
```

#### 4. Use Shadcn/ui Components

Leverage existing UI components for consistency:

```typescript
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CloudIcon, ThermometerIcon } from 'lucide-react';

return (
    <Card className="w-full max-w-md">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <CloudIcon className="h-5 w-5" />
                Title
            </CardTitle>
        </CardHeader>
        <CardContent>
            {/* Content */}
        </CardContent>
    </Card>
);
```

### Testing Your Custom Card

1. **Check browser console** - Add logging during development:

    ```typescript
    console.log('[WeatherCard] Rendering', { output, state });
    ```

2. **Test all states**:
    - Input streaming: Tool being called
    - Output available: Tool returned data
    - Output error: Tool failed
    - Invalid data: Malformed output

3. **Test data variations**:
    - String vs object output
    - Missing optional fields
    - Edge cases (empty arrays, null values)

### Backend Integration

Your backend tool should return data matching the expected format:

```python
# os-agent/src/tools/weather.py
@tool
async def get_weather(location: str) -> Dict[str, Any]:
    """Get weather data for a location."""
    # Fetch from API
    weather_data = await fetch_weather(location)

    # Return structured data (will be JSON serialized)
    return {
        "latitude": 25.125,
        "longitude": 55.25,
        "timezone": "Asia/Dubai",
        "current": {"temperature_2m": 32.5},
        "current_units": {"temperature_2m": "°C"},
        "cityName": "Dubai, United Arab Emirates"
    }
```

The data flows through:

1. Backend tool returns dict
2. Bedrock streams as SSE events
3. Frontend receives as `tool-output-available` event
4. ToolRenderer routes to your custom card
5. Your card parses and renders the data

## Tool Rendering Best Practices

1. **Keep it simple** - Most tools use ToolPart fallback (returns null from ToolRenderer)
2. **Only specialize when needed** - Custom renderers for unique UX requirements
3. **Handle all states** - Account for `input-streaming`, `input-available`, `output-available`, `output-error`
4. **Show loading states** - Indicate when tool is executing (input states)
5. **Error handling** - Display errors clearly if `state === 'output-error'`
6. **Validate with Zod** - Use schemas for input/output validation (see artifact-preview.tsx:17, 37)
7. **Accessibility** - Keyboard navigation, ARIA labels, semantic HTML

## Integration with Artifact Feature

The `createArtifact` tool bridges the tool system and artifact feature:

1. **Tool invocation** creates artifact via AI SDK tool execution
2. **ArtifactPreview** receives tool result and validates it
3. **ArtifactInlinePreview** displays validated artifact data
4. **User clicks preview** → Calls `useArtifactStore().openArtifact(artifact)`
5. **Artifact panel opens** with full content from `src/components/artifact/Artifact.tsx`

**Data flow:**

```
AI SDK executes createArtifact tool
  ↓
Tool result added to message.parts (type: 'tool-createArtifact')
  ↓
ConversationMessages extracts tool parts and calls ToolRenderer
  ↓
ToolRenderer routes to ArtifactPreview with output/input/state/error
  ↓
ArtifactPreview validates with Zod schemas (artifactResultSchema)
  ↓
ArtifactInlinePreview renders preview card with type-specific renderer
  ↓
User clicks preview → openArtifact(artifact) → useArtifactStore updates
  ↓
Artifact component renders full-screen view (reads from store)
```

**Important:** Artifacts are NOT stored persistently - they exist only in:

1. Message parts (source of truth)
2. Zustand store (temporary UI state for open artifact)

## Accessibility

- **Keyboard navigation:** Tab to tool, Enter/Space to expand
- **Screen readers:** Tool name, state, and result announced
- **Focus management:** Logical tab order through tools
- **ARIA attributes:** `aria-expanded`, `aria-label` for controls
- **Semantic HTML:** `<button>` for interactive elements

## Testing

**Location:** `tests/unit/components/ai-elements/`

**Coverage:**

- ToolRenderer dispatches correctly
- ToolPart expands/collapses
- ArtifactPreview shows inline card
- RAG document rendering
- Tool state transitions

## Known Limitations

- Tool results stored in message only (no separate persistence)
- Large JSON results may be truncated in display
- No retry mechanism for failed tools
- Tool execution is fire-and-forget (no cancellation)

## Related Documentation

- [Artifact Feature](./artifact-feature.md)
- [RAG Tool Display](./rag-tool.md)
- [AI SDK Integration](https://sdk.vercel.ai/docs)
