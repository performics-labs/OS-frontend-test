import type { RagOutput } from '@/types/chat';
import { getArtifactByTrigger, type ArtifactResponse } from './artifact-responses';

// Mock RAG retrieval data
export const MOCK_RAG_DOCUMENTS: RagOutput = {
    documents: [
        {
            title: 'Q4 Campaign Performance Report',
            snippet:
                'Overall campaign performance increased by 23% compared to Q3. Key metrics show strong growth across all channels with improved engagement rates and conversion quality.',
            relevance: 0.95,
            source: 'campaign-report-q4-2024.pdf',
        },
        {
            title: 'Budget Analysis Q4',
            snippet:
                'Cost per acquisition decreased by 8% while maintaining conversion quality. ROI improved significantly with better targeting and optimization strategies.',
            relevance: 0.87,
            source: 'budget-analysis-q4.xlsx',
        },
        {
            title: 'Marketing Strategy Overview',
            snippet:
                'Strategic initiatives focused on customer retention and acquisition balance. Multi-channel approach yielded positive results across digital and traditional media.',
            relevance: 0.79,
            source: 'strategy-overview-2024.docx',
        },
    ],
};

export const MOCK_RAG_ERROR_DOCUMENTS: RagOutput = {
    documents: [],
};

export const MOCK_RESPONSES = {
    hello: 'Hey there! How can I assist you today?',
    joke: 'Why do developers love mock APIs? Because they always return success!',
    ragSuccess: `Based on the Q4 Campaign Performance Report, here are the key findings:

1. **Overall Growth:** Performance increased by 23% compared to Q3
2. **Cost Efficiency:** Cost per acquisition decreased by 8%
3. **ROI:** Significant improvement in return on investment
4. **Strategic Approach:** Multi-channel strategy yielded positive results

The data shows strong momentum heading into 2025 with improved engagement and conversion quality across all channels.`,
    ragError: `I apologize, but I encountered an error while searching the knowledge base. The retrieval service timed out. Please try your question again in a moment, or rephrase it for better results.`,
    markdown: `Thanks for your message!

Here's a **markdown-enabled** response demonstrating various features:

## Key Features
- ✅ Bold and *italic* text
- ✅ Bullet points
- ✅ Nested lists
  - Sub-item one
  - Sub-item two

## Code Example
\`\`\`typescript
function greet(name: string): string {
    return \`Hello, \${name}!\`;
}
\`\`\`

\`\`\`javascript
const result = greet("World");
console.log(result);
\`\`\`

## Table Example

| Feature | Status | Notes |
|---------|--------|-------|
| Markdown | ✅ | Fully supported |
| Tables | ✅ | GFM format |
| Formatting | ✅ | Bold, italic, code |

This is a mock response. Full chat functionality will be implemented in a future iteration.`,
    code: `Here's an example with **code blocks**:

\`\`\`typescript
function greet(name: string): string {
    return \`Hello, \${name}!\`;
}
\`\`\`

\`\`\`javascript
const result = greet("World");
console.log(result);
\`\`\`

Mock response with syntax highlighting support.`,
    table: `Here's a **table example**:

| Feature | Status | Notes |
|---------|--------|-------|
| Markdown | ✅ | Fully supported |
| Tables | ✅ | GFM format |
| Formatting | ✅ | Bold, italic, code |

Mock response demonstrating table rendering.`,
    explain: `Let me explain how this works in detail.

**Key Concepts:**
1. Components are the building blocks
2. Props pass data down
3. State manages internal data

For example, when you want to share data between components, you can:
- Use props for parent-to-child communication
- Use context for global state
- Use callbacks for child-to-parent communication

Does this help clarify things?`,
    long: `This is a longer response that simulates a more detailed explanation. It contains multiple paragraphs and helps test the streaming UI with more content.

The first paragraph introduces the topic and sets the stage for what's to come. It provides context and background information that helps the reader understand the main points.

The second paragraph dives deeper into specifics. Here we can discuss technical details, implementation strategies, and best practices. For instance, when building a chat interface, you want to consider things like:

1. Message rendering performance
2. Scroll behavior and auto-scrolling
3. Loading states and indicators
4. Error handling and retries

The third paragraph wraps things up with conclusions and next steps. We might suggest further reading, related topics to explore, or actions the user could take to apply what they've learned.

And finally, we end with a friendly note asking if there's anything else they'd like to know!`,
};

export type MockResponseType = 'text' | 'rag-success' | 'rag-error' | 'artifact';

export type MockResponseConfig = {
    type: MockResponseType;
    text: string;
    ragData?: RagOutput;
    ragError?: string;
    artifactData?: ArtifactResponse;
};

export function getMockResponse(userPrompt: string): MockResponseConfig {
    const prompt = userPrompt.toLowerCase();

    // Check for artifact generation triggers FIRST
    const artifact = getArtifactByTrigger(prompt);
    if (artifact) {
        return {
            type: 'artifact',
            text: `I've created a ${artifact.kind} artifact: "${artifact.title}". ${artifact.description || 'You can view and edit it in the artifact panel.'}`,
            artifactData: artifact,
        };
    }

    // Check for RAG tool triggers (search, find, lookup, retrieve)
    if (/search|find|lookup|retrieve|knowledge|document/i.test(prompt)) {
        // Simulate error condition for "error" keyword
        if (/error|fail|problem/i.test(prompt)) {
            return {
                type: 'rag-error',
                text: MOCK_RESPONSES.ragError,
                ragError: 'Failed to retrieve documents: Connection timeout',
            };
        }
        // Otherwise return successful RAG retrieval
        return {
            type: 'rag-success',
            text: MOCK_RESPONSES.ragSuccess,
            ragData: MOCK_RAG_DOCUMENTS,
        };
    }

    // Regular text responses
    if (/hello|hi|hey/i.test(prompt)) {
        return { type: 'text', text: MOCK_RESPONSES.hello };
    }
    if (/joke|funny/i.test(prompt)) {
        return { type: 'text', text: MOCK_RESPONSES.joke };
    }
    if (/markdown|format|list/i.test(prompt)) {
        return { type: 'text', text: MOCK_RESPONSES.markdown };
    }
    if (/table/i.test(prompt)) {
        return { type: 'text', text: MOCK_RESPONSES.table };
    }
    if (/code|example|component|syntax/i.test(prompt)) {
        return { type: 'text', text: MOCK_RESPONSES.code };
    }
    if (/explain|how|why|what/i.test(prompt)) {
        return { type: 'text', text: MOCK_RESPONSES.explain };
    }
    if (/long|detail|more/i.test(prompt)) {
        return { type: 'text', text: MOCK_RESPONSES.long };
    }

    return {
        type: 'text',
        text: `You said: \n\n${userPrompt}\n\n

This is a **mock AI response**. Try these examples to see different features:

**Generate Artifacts:**
- "create a button component" - React component
- "generate a python script" - Python code
- "build a data table" - TypeScript component
- "write a custom hook" - React hook
- "create a bar chart" - SVG visualization
- "generate an image" - AI-generated image
- "show me sales data" - Spreadsheet with Q1 sales
- "create a customer list" - Spreadsheet with contacts

**Inline Code Examples:**
- "code" - Shows code snippets inline in the message

**Search Knowledge Base (RAG):**
- "search documents" - Retrieves from knowledge base
- "find information about Q4" - Campaign data

**Other Responses:**
- "hello" - greeting
- "markdown" - formatted text
- "explain" - detailed response`,
    };
}
