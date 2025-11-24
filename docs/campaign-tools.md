# Campaign Tools

Marketing campaign visualization tools with chart-based rendering.

## Overview

Campaign tools are a specialized set of AI tools that generate marketing campaign data and display it using interactive charts. They follow a unique rendering pattern optimized for data visualization.

## Architecture

**Data Flow:**
```
Backend (Agent) → Chart-Ready Data → Frontend → Recharts Visualization
```

**Key Principle:** Backend owns data structure, frontend owns presentation.

- Backend sends data in chart-compatible format (correct field names, colors, sorted)
- Frontend receives data and passes directly to Recharts components
- No data transformations in frontend

## Campaign Tools

| Tool Name               | Charts                  | Description                           |
| ----------------------- | ----------------------- | ------------------------------------- |
| `budget_allocator`      | Pie + Bar               | Platform budget allocation            |
| `pricing_optimizer`     | Line                    | Hourly bid adjustments                |
| `audience_creator`      | Pie                     | Audience segment distribution         |
| `brand_lift_predictor`  | Radar                   | Brand awareness metrics               |
| `client_profiler`       | Table                   | Client profile summary                |
| `roas_projector`        | Bar                     | ROAS projections                      |
| `platform_configurator` | Table                   | Platform settings                     |
| `creative_designer`     | Cards                   | Creative asset recommendations        |
| `export_generator`      | Download                | Campaign export generation            |

## Rendering Flow

### 1. Tool Invocation (Streaming Phase)

When AI invokes a campaign tool:

```typescript
// State: 'input-streaming' or 'input-available'
// Shows: ToolPart loading card

<ToolPart
  toolName="budget_allocator"
  toolCallId="budget_allocator-abc123"
  status="streaming"
  input={{ budget: 10000, duration: 30 }}
  output={undefined}
  error={undefined}
/>

// Visual:
// ┌──────────────────────────────────┐
// │ 🔧 Using budget_allocator        │
// │ Input: { budget: 10000, ... }    │
// └──────────────────────────────────┘
```

### 2. Tool Completion (Output Phase)

When tool execution completes:

```typescript
// State: 'output-available'
// Shows: Charts directly (bypasses ToolPart)

<CampaignToolOutput
  toolName="budget_allocator"
  output={chartReadyData}
/>

// Visual:
// ┌──────────────────────────────────┐
// │ Platform Budget Allocation       │
// │ [Pie Chart] [Bar Chart]          │
// │ Meta: $4,000 (40%)               │
// │ Google: $3,500 (35%)             │
// └──────────────────────────────────┘
```

### 3. Why This Pattern?

**Problem:** Charts hidden inside collapsed ToolPart cards
**Solution:** Two-phase rendering

- **Phase 1 (Streaming):** Show loading card with tool name
- **Phase 2 (Complete):** Replace with charts directly

This ensures charts are always visible and don't require expanding a card.

## Implementation

### File Structure

```
src/
├── components/
│   ├── ai-elements/
│   │   ├── tool-renderer.tsx          # Dispatches to CampaignToolOutput
│   │   └── tool-part.tsx              # Loading/error states
│   └── campaign/
│       ├── campaign-tool-output.tsx   # Routes to specific tool component
│       ├── budget-allocation.tsx      # Budget allocator charts
│       ├── pricing-optimizer.tsx      # Pricing optimizer charts
│       ├── audience-creator.tsx       # Audience creator charts
│       └── brand-lift-predictor.tsx   # Brand lift predictor charts
```

### Tool Renderer Logic

`src/components/ai-elements/tool-renderer.tsx:15-50`

```typescript
const isCampaignTool = [
  'client_profiler', 'budget_allocator', 'roas_projector',
  'platform_configurator', 'pricing_optimizer', 'creative_designer',
  'brand_lift_predictor', 'audience_creator', 'export_generator'
].includes(toolName);

if (isCampaignTool) {
  // Phase 1: Show loading card during streaming
  if (state === 'input-streaming' || state === 'input-available') {
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

  // Phase 2: Show charts when complete
  if (state === 'output-available' && output && typeof output === 'object') {
    return <CampaignToolOutput toolName={toolName} output={output} />;
  }

  // Error state
  if (state === 'output-error') {
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
```

### Campaign Tool Output Router

`src/components/campaign/campaign-tool-output.tsx`

Routes tool output to specific visualization component:

```typescript
export function CampaignToolOutput({ toolName, output }: CampaignToolOutputProps) {
  switch (toolName) {
    case 'budget_allocator':
      return <BudgetAllocation output={output} />;
    case 'pricing_optimizer':
      return <PricingOptimizer output={output} />;
    case 'audience_creator':
      return <AudienceCreator output={output} />;
    case 'brand_lift_predictor':
      return <BrandLiftPredictor output={output} />;
    // ... other tools
    default:
      return null;
  }
}
```

## Chart Implementation Best Practices

### 1. Backend Sends Chart-Ready Data

Backend must format data exactly as Recharts expects:

```python
# ✅ Backend (agent/src/tools/campaign/budget_allocator.py)
PLATFORM_COLORS = {
    "Meta": "#1877f2",
    "Google": "#4285f4",
    "LinkedIn": "#0077b5",
}

platform_allocations = [
    {
        "name": "Meta",           # Recharts uses 'name' for labels
        "value": 4000,            # Recharts uses 'value' for pie dataKey
        "budget": 4000,
        "dailyBudget": 133,
        "fill": "#1877f2"         # Pre-assigned color
    },
    # ... more platforms
]

return {
    "platformAllocations": platform_allocations,
    "totalBudget": 10000,
    # ... other data
}
```

### 2. Frontend Passes Data Directly to Recharts

No transformations, sorting, or field renaming:

```typescript
// ✅ Frontend (src/components/campaign/budget-allocation.tsx)
interface BudgetAllocationProps {
  output: {
    platformAllocations: Array<{
      name: string;        // Matches backend
      value: number;       // Matches backend
      budget: number;
      dailyBudget: number;
      fill: string;
    }>;
    totalBudget: number;
  };
}

export function BudgetAllocation({ output }: BudgetAllocationProps) {
  const { platformAllocations, totalBudget } = output;

  return (
    <PieChart>
      <Pie
        data={platformAllocations}  // Direct pass-through
        dataKey="value"              // Backend uses 'value'
        nameKey="name"               // Backend uses 'name'
      >
        {platformAllocations.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.fill} />
        ))}
      </Pie>
    </PieChart>
  );
}
```

### 3. Disable Chart Animations

All charts must disable animations for instant rendering:

```typescript
// ✅ Instant rendering
<Line
  dataKey="multiplier"
  isAnimationActive={false}  // No animation
/>

<Pie
  dataKey="value"
  isAnimationActive={false}  // No animation
/>

<Radar
  dataKey="value"
  isAnimationActive={false}  // No animation
/>

<Bar
  dataKey="budget"
  isAnimationActive={false}  // No animation
/>
```

**Why?** Without this, charts re-animate during text streaming, causing visual distraction.

### 4. Use Stable Component Keys

When rendering ToolPart during streaming, use stable IDs to prevent re-mounting:

```typescript
// ✅ Stable ID prevents re-mounting
const stableId = `${toolName}-${JSON.stringify(input)?.substring(0, 20) || 'default'}`;

<ToolPart
  toolName={toolName}
  toolCallId={stableId}  // Stable across re-renders
  status="streaming"
/>
```

**Why?** Without stable keys, React re-mounts the component on each update, causing flashing.

## Data Contract Examples

### Budget Allocator

**Backend Output:**
```python
{
    "platformAllocations": [
        {
            "name": "Meta",
            "platform": "Meta",
            "value": 4000,           # Percentage (40%)
            "budget": 4000,          # Dollar amount
            "dailyBudget": 133,
            "fill": "#1877f2"
        },
        # ... more platforms
    ],
    "hourlyBidAdjustments": [
        { "hour": "12:00 AM", "multiplier": 0.8 },
        { "hour": "1:00 AM", "multiplier": 0.7 },
        # ... 24 hours
    ],
    "totalBudget": 10000,
    "duration": 30,
    "reservedBudget": 1000
}
```

### Pricing Optimizer

**Backend Output:**
```python
{
    "hourlyBidAdjustments": [
        { "hour": "12:00 AM", "multiplier": 0.8 },
        { "hour": "1:00 AM", "multiplier": 0.7 },
        # ... 24 hours (sorted by time)
    ],
    "baseBid": 2.50,
    "strategy": "ROAS-focused with peak-hour optimization"
}
```

### Audience Creator

**Backend Output:**
```python
{
    "audienceSegments": [
        {
            "name": "Young Professionals",
            "value": 45000,          # Size (for pie chart)
            "reach": 52000,          # Estimated reach
            "characteristics": {...},
            "platforms": ["Meta", "LinkedIn"],
            "engagementScore": 87
        },
        # ... more segments
    ],
    "totalReach": 150000
}
```

### Brand Lift Predictor

**Backend Output:**
```python
{
    "brandLiftMetrics": [
        { "metric": "Awareness", "value": 18.5 },
        { "metric": "Consideration", "value": 14.2 },
        { "metric": "Purchase Intent", "value": 10.8 },
        { "metric": "Brand Favorability", "value": 12.3 },
        { "metric": "Message Association", "value": 15.7 }
    ],
    "projectedLift": 14.3,
    "confidence": 0.85
}
```

## Troubleshooting

### Charts Not Visible

**Problem:** Charts hidden inside collapsed ToolPart

**Solution:** Ensure ToolRenderer returns `<CampaignToolOutput />` for `output-available` state, not ToolPart

```typescript
// ✅ Correct
if (state === 'output-available' && output && typeof output === 'object') {
  return <CampaignToolOutput toolName={toolName} output={output} />;
}

// ❌ Wrong - charts hidden in collapsed card
if (state === 'output-available') {
  return <ToolPart toolName={toolName} output={output} status="complete" />;
}
```

### Charts Re-animating During Streaming

**Problem:** Charts play animation every time text streams

**Solution:** Add `isAnimationActive={false}` to ALL chart components

```typescript
// ✅ No animation
<Line dataKey="value" isAnimationActive={false} />
<Pie dataKey="value" isAnimationActive={false} />
<Radar dataKey="value" isAnimationActive={false} />
<Bar dataKey="value" isAnimationActive={false} />
```

### TypeScript Type Errors

**Problem:** Field names don't match between backend and frontend

**Solution:** Update TypeScript interfaces to match backend exactly

```typescript
// ✅ Matches backend
interface PlatformAllocation {
  name: string;      // Backend uses 'name'
  value: number;     // Backend uses 'value' not 'percentage'
  budget: number;
  fill: string;
}

// ❌ Mismatch
interface PlatformAllocation {
  platform: string;  // Backend uses 'name'
  percentage: number; // Backend uses 'value'
  amount: number;     // Backend uses 'budget'
}
```

### Naming Conflicts

**Problem:** Component name conflicts (e.g., PieChart icon vs PieChart component)

**Solution:** Use import aliases

```typescript
// ✅ Alias avoids conflict
import { PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie } from 'recharts';

<PieChartIcon className="size-4" />  // Icon
<PieChart>                             // Chart component
  <Pie data={data} />
</PieChart>
```

## Adding New Campaign Tools

### 1. Create Component

Create new file in `src/components/campaign/your-tool.tsx`:

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface YourToolProps {
  output: {
    data: Array<{ name: string; value: number }>;
  };
}

export function YourTool({ output }: YourToolProps) {
  const { data } = output;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Tool Title</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="hsl(var(--chart-1))" isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

### 2. Register in Tool Renderer

Update `src/components/ai-elements/tool-renderer.tsx`:

```typescript
const isCampaignTool = [
  'client_profiler', 'budget_allocator', 'roas_projector',
  'platform_configurator', 'pricing_optimizer', 'creative_designer',
  'brand_lift_predictor', 'audience_creator', 'export_generator',
  'your_new_tool'  // Add here
].includes(toolName);
```

### 3. Add to Campaign Tool Output Router

Update `src/components/campaign/campaign-tool-output.tsx`:

```typescript
import { YourTool } from './your-tool';

export function CampaignToolOutput({ toolName, output }: CampaignToolOutputProps) {
  switch (toolName) {
    case 'your_new_tool':
      return <YourTool output={output} />;
    // ... other cases
  }
}
```

### 4. Update Backend

Ensure backend sends chart-ready data:

```python
# agent/src/tools/campaign/your_tool.py
from strands import tool

@tool
async def your_new_tool(param: str) -> dict:
    """Your tool description."""

    return {
        "data": [
            {"name": "Item 1", "value": 100},
            {"name": "Item 2", "value": 200},
            # ... chart-ready format
        ]
    }
```

## Related Documentation

- [Tool Rendering System](./tool-rendering.md) - General tool rendering architecture
- [Recharts Documentation](https://recharts.org) - Chart library reference
- Backend tools: `/agent/src/tools/campaign/` directory

---

_Campaign Tools Documentation v1.0 - Last updated: November 2024_
