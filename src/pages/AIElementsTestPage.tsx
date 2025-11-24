import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

import { PageContainer } from '@/components/PageContainer';

// Your current implementation
import {
    Message as CurrentMessage,
    MessageAvatar as CurrentMessageAvatar,
    MessageContent as CurrentMessageContent,
} from '@/components/ai-elements/message';
import {
    CodeBlock as CurrentCodeBlock,
    CodeBlockCopyButton,
} from '@/components/ai-elements/code-block';
import { PromptInput as CurrentPromptInput } from '@/components/ai-elements/prompt-input';
import { Response as CurrentResponse } from '@/components/ai-elements/response';

// AI SDK Elements implementation
import {
    Message as ElementsMessage,
    MessageAction,
    MessageActions,
    MessageBranch,
    MessageBranchContent,
    MessageBranchNext,
    MessageBranchPage,
    MessageBranchPrevious,
    MessageBranchSelector,
    MessageContent as ElementsMessageContent,
    MessageResponse,
} from '@/components/ai-sdk-elements/message';
import { CopyIcon, ThumbsDownIcon, ThumbsUpIcon, RefreshCcwIcon } from 'lucide-react';

const sampleMessage = 'Can you explain how React hooks work?';

const sampleResponse1 = `React hooks are functions that let you "hook into" React features like state and lifecycle methods from function components.

**Common hooks:**

- \`useState\` - Adds state to function components
- \`useEffect\` - Handles side effects
- \`useContext\` - Consumes context values

They follow two main rules:
1. Only call hooks at the top level
2. Only call hooks from React functions`;

const sampleResponse2 = `Hooks are special functions in React that allow you to use state and other React features without writing a class.

**Key Benefits:**

- Simpler code organization
- Better code reuse with custom hooks
- Easier to test
- No \`this\` keyword confusion

**Most Used Hooks:**
- \`useState()\` for local state
- \`useEffect()\` for side effects
- \`useRef()\` for references`;

const sampleCode = `function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}`;

export function AIElementsTestPage() {
    const [selectedDemo, setSelectedDemo] = useState<'message' | 'branch' | 'input' | 'code'>(
        'message'
    );

    const handleSubmit = (text: string, files: File[]) => {
        console.log('Submitted:', { text, files });
    };

    return (
        <PageContainer>
            <div className="space-y-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold">AI SDK Elements Demo</h1>
                        <Badge variant="default">Dev Only</Badge>
                    </div>
                    <p className="text-muted-foreground mt-2">
                        Compare your current implementation with actual AI SDK Elements components
                    </p>
                </div>

                <Separator />

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => setSelectedDemo('message')}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                            selectedDemo === 'message'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80'
                        }`}
                    >
                        Message
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedDemo('branch')}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                            selectedDemo === 'branch'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80'
                        }`}
                    >
                        Message Branching ⭐
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedDemo('input')}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                            selectedDemo === 'input'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80'
                        }`}
                    >
                        Prompt Input
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedDemo('code')}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                            selectedDemo === 'code'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80'
                        }`}
                    >
                        Code Block
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Your Current Implementation */}
                    <div className="space-y-4">
                        <div className="rounded-lg border p-6">
                            <h2 className="mb-4 text-xl font-semibold">
                                Your Current Implementation
                            </h2>

                            {selectedDemo === 'message' && (
                                <div className="bg-muted/30 space-y-4 rounded-lg p-6">
                                    <CurrentMessage from="user">
                                        <CurrentMessageContent variant="contained">
                                            <CurrentResponse>{sampleMessage}</CurrentResponse>
                                        </CurrentMessageContent>
                                    </CurrentMessage>
                                    <CurrentMessage from="assistant">
                                        <CurrentMessageAvatar
                                            src="/images/logo.svg"
                                            name="OneSuite"
                                        />
                                        <CurrentMessageContent variant="contained">
                                            <CurrentResponse>{sampleResponse1}</CurrentResponse>
                                        </CurrentMessageContent>
                                    </CurrentMessage>
                                </div>
                            )}

                            {selectedDemo === 'branch' && (
                                <div className="bg-muted/30 rounded-lg p-6">
                                    <p className="text-muted-foreground text-center text-sm italic">
                                        Branching not available in current implementation
                                    </p>
                                    <p className="text-muted-foreground mt-2 text-center text-xs">
                                        See AI Elements version →
                                    </p>
                                </div>
                            )}

                            {selectedDemo === 'input' && (
                                <div className="bg-muted/30 rounded-lg p-6">
                                    <CurrentPromptInput
                                        onSubmit={handleSubmit}
                                        placeholder="Type a message..."
                                        hasStarted={false}
                                    />
                                </div>
                            )}

                            {selectedDemo === 'code' && (
                                <div className="bg-muted/30 rounded-lg p-6">
                                    <CurrentCodeBlock
                                        code={sampleCode}
                                        language="typescript"
                                        theme="dark"
                                    >
                                        <CodeBlockCopyButton code={sampleCode} />
                                    </CurrentCodeBlock>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* AI SDK Elements Implementation */}
                    <div className="space-y-4">
                        <div className="rounded-lg border p-6">
                            <h2 className="mb-4 text-xl font-semibold">AI SDK Elements</h2>

                            {selectedDemo === 'message' && (
                                <div className="bg-muted/30 space-y-4 rounded-lg p-6">
                                    <ElementsMessage from="user">
                                        <ElementsMessageContent>
                                            <MessageResponse>{sampleMessage}</MessageResponse>
                                        </ElementsMessageContent>
                                    </ElementsMessage>
                                    <ElementsMessage from="assistant">
                                        <ElementsMessageContent>
                                            <MessageResponse>{sampleResponse1}</MessageResponse>
                                            <MessageActions>
                                                <MessageAction tooltip="Copy" label="Copy message">
                                                    <CopyIcon size={14} />
                                                </MessageAction>
                                                <MessageAction tooltip="Like" label="Like">
                                                    <ThumbsUpIcon size={14} />
                                                </MessageAction>
                                                <MessageAction tooltip="Dislike" label="Dislike">
                                                    <ThumbsDownIcon size={14} />
                                                </MessageAction>
                                                <MessageAction
                                                    tooltip="Regenerate"
                                                    label="Regenerate"
                                                >
                                                    <RefreshCcwIcon size={14} />
                                                </MessageAction>
                                            </MessageActions>
                                        </ElementsMessageContent>
                                    </ElementsMessage>
                                </div>
                            )}

                            {selectedDemo === 'branch' && (
                                <div className="bg-muted/30 rounded-lg p-6">
                                    <ElementsMessage from="user">
                                        <ElementsMessageContent>
                                            <MessageResponse>{sampleMessage}</MessageResponse>
                                        </ElementsMessageContent>
                                    </ElementsMessage>

                                    <MessageBranch>
                                        <ElementsMessage from="assistant">
                                            <ElementsMessageContent>
                                                <MessageBranchContent>
                                                    <div>
                                                        <MessageResponse>
                                                            {sampleResponse1}
                                                        </MessageResponse>
                                                    </div>
                                                    <div>
                                                        <MessageResponse>
                                                            {sampleResponse2}
                                                        </MessageResponse>
                                                    </div>
                                                </MessageBranchContent>
                                                <MessageBranchSelector from="assistant">
                                                    <MessageBranchPrevious />
                                                    <MessageBranchPage />
                                                    <MessageBranchNext />
                                                </MessageBranchSelector>
                                            </ElementsMessageContent>
                                        </ElementsMessage>
                                    </MessageBranch>
                                </div>
                            )}

                            {selectedDemo === 'input' && (
                                <div className="bg-muted/30 rounded-lg p-6">
                                    <p className="text-muted-foreground text-center text-sm italic">
                                        Same core functionality as your implementation
                                    </p>
                                    <p className="text-muted-foreground mt-2 text-center text-xs">
                                        Main difference: Adds speech input button and more
                                        composable parts
                                    </p>
                                </div>
                            )}

                            {selectedDemo === 'code' && (
                                <div className="bg-muted/30 rounded-lg p-6">
                                    <p className="text-muted-foreground text-center text-sm italic">
                                        Uses Shiki instead of Prism
                                    </p>
                                    <p className="text-muted-foreground mt-2 text-center text-xs">
                                        More accurate highlighting, but larger bundle size
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Key Differences */}
                <div className="rounded-lg border p-6">
                    <h2 className="mb-4 text-xl font-semibold">Key Differences</h2>

                    {selectedDemo === 'message' && (
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <h3 className="mb-2 text-sm font-semibold">Your Implementation</h3>
                                <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                                    <li>Role-based styling (user/assistant)</li>
                                    <li>Avatar support with fallback</li>
                                    <li>Contained and flat variants</li>
                                    <li>Streamdown for markdown</li>
                                    <li>Custom message actions component</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="mb-2 text-sm font-semibold">AI Elements</h3>
                                <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                                    <li>Same role-based styling</li>
                                    <li>Same Streamdown markdown</li>
                                    <li>Built-in MessageAction with tooltips</li>
                                    <li>MessageBranch system (see next tab)</li>
                                    <li>More composable structure</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {selectedDemo === 'branch' && (
                        <div>
                            <div className="bg-disrupt-500/10 border-disrupt-500 mb-4 rounded-lg border p-4">
                                <h3 className="mb-2 font-semibold">
                                    ⭐ This is the killer feature
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                    MessageBranch allows users to navigate between multiple
                                    AI-generated response alternatives. Great for showing different
                                    response styles or regenerated answers.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-medium">How it works:</p>
                                <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                                    <li>
                                        Wrap messages in{' '}
                                        <code className="bg-muted rounded px-1">MessageBranch</code>
                                    </li>
                                    <li>
                                        Put alternatives in{' '}
                                        <code className="bg-muted rounded px-1">
                                            MessageBranchContent
                                        </code>
                                    </li>
                                    <li>
                                        Use{' '}
                                        <code className="bg-muted rounded px-1">
                                            MessageBranchSelector
                                        </code>{' '}
                                        for navigation
                                    </li>
                                    <li>Automatically hides if only one branch exists</li>
                                    <li>Try clicking the arrows in the demo above! ☝️</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {selectedDemo === 'input' && (
                        <div>
                            <p className="mb-2 text-sm font-medium">
                                Your implementation already has:
                            </p>
                            <ul className="text-muted-foreground mb-4 list-inside list-disc space-y-1 text-sm">
                                <li>Auto-resizing textarea</li>
                                <li>File upload with drag-and-drop</li>
                                <li>Model selector</li>
                                <li>Keyboard shortcuts</li>
                            </ul>
                            <p className="mb-2 text-sm font-medium">AI Elements adds:</p>
                            <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                                <li>PromptInputSpeechButton (Web Speech API)</li>
                                <li>More composable parts (Header/Body/Footer)</li>
                                <li>Global state via PromptInputProvider</li>
                                <li>External control hooks</li>
                            </ul>
                        </div>
                    )}

                    {selectedDemo === 'code' && (
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <h3 className="mb-2 text-sm font-semibold">Prism (Your Current)</h3>
                                <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                                    <li>Lighter bundle size (~30KB)</li>
                                    <li>Faster load time</li>
                                    <li>Good enough for most cases</li>
                                    <li>CSS-based themes</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="mb-2 text-sm font-semibold">Shiki (AI Elements)</h3>
                                <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                                    <li>Larger bundle (~500KB+)</li>
                                    <li>More accurate highlighting</li>
                                    <li>Uses VS Code grammars</li>
                                    <li>Better for complex code</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                {/* Recommendation */}
                <div className="bg-disrupt-500/10 border-disrupt-500 rounded-lg border p-6">
                    <h3 className="mb-3 text-lg font-semibold">💡 Recommendation</h3>
                    <div className="space-y-3 text-sm">
                        <p>
                            <strong>Your current implementation is excellent</strong> and covers 90%
                            of use cases. The main value AI SDK Elements provides is:
                        </p>
                        <ol className="list-inside list-decimal space-y-2">
                            <li>
                                <strong>MessageBranch</strong> - If you want users to navigate
                                between multiple AI response alternatives, this is a ready-made
                                solution.
                            </li>
                            <li>
                                <strong>Standardized patterns</strong> - Maintained by Vercel,
                                follows best practices, good for team consistency.
                            </li>
                            <li>
                                <strong>Future features</strong> - As AI patterns evolve, AI
                                Elements will get updates (reasoning panels, tool displays, etc.)
                            </li>
                        </ol>
                        <p className="text-muted-foreground italic">
                            Recommendation: Keep your current implementation. Only adopt
                            MessageBranch if you need response alternatives feature.
                        </p>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
export default AIElementsTestPage;
