/**
 * Legacy client-side mock responses (currently unused).
 *
 * This file provides a fallback pattern for client-side mocking if the backend
 * uses a non-standard streaming protocol or if we need to move away from AI SDK.
 *
 * Current implementation uses MSW mock with AI SDK (see src/mocks/handlers/chat.handlers.ts).
 * Keep this file as a reference implementation for non-AI SDK patterns.
 *
 * See: src/mocks/data/chat-responses.ts for current mock data
 * See: docs/mock-chat-api.md for current implementation docs
 */

const mockResponses = [
    (userMessage: string) =>
        `
Thanks for your message: "${userMessage}"

Here's a **markdown-enabled** response demonstrating lists:

## Key Features
- ✅ Bold and *italic* text
- ✅ Bullet points
- ✅ Nested lists
  - Sub-item one
  - Sub-item two

This is a mock response. Full chat functionality will be implemented in a future iteration.
    `.trim(),

    (userMessage: string) =>
        `
Received: "${userMessage}"

Here's an example with **code blocks**:

\`\`\`typescript
function greet(name: string): string {
    return \`Hello, \${name}!\`;
}
\`\`\`

\`\`\`javascript
const result = greet("World");
console.log(result);
\`\`\`

Mock response with syntax highlighting support.
    `.trim(),

    (userMessage: string) =>
        `
Your message: "${userMessage}"

Here's a **table example**:

| Feature | Status | Notes |
|---------|--------|-------|
| Markdown | ✅ | Fully supported |
| Tables | ✅ | GFM format |
| Formatting | ✅ | Bold, italic, code |

Mock response demonstrating table rendering.
    `.trim(),
];

export function getMockResponse(userMessage: string): string {
    const randomIndex = Math.floor(Math.random() * mockResponses.length);
    return mockResponses[randomIndex](userMessage);
}
