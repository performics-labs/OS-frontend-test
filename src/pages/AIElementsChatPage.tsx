import { Badge } from '@/components/ui/badge';
import { PageContainer } from '@/components/PageContainer';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage, type FileUIPart } from 'ai';
import { useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router';
import { nanoid } from 'nanoid';
import { type ToolState } from '@/types/tools';

// AI SDK Elements components
import {
    Message,
    MessageContent,
    MessageResponse,
    MessageActions,
    MessageAction,
    MessageBranch,
    MessageBranchContent,
    MessageBranchSelector,
    MessageBranchPrevious,
    MessageBranchNext,
    MessageBranchPage,
    MessageAttachments,
    MessageAttachment,
} from '@/components/ai-sdk-elements/message';

// Current components
import { PromptInput } from '@/components/ai-elements/prompt-input';
import { Conversation, ConversationScrollButton } from '@/components/ai-elements/conversation';
import { ToolPart } from '@/components/ai-elements/tool-part';
import { ToolRenderer } from '@/components/ai-elements/tool-renderer';
import { Artifact } from '@/components/artifact/Artifact';

// Hooks and utilities
import { API_BASE_URL, API_ROUTES } from '@/constants';
import { useModelStore, useAuthStore, useArtifactStore } from '@/stores';
import { useThreadMessages } from '@/hooks/useThreadMessages';
import { useDataStream } from '@/hooks/useDataStream';
import { validateDataStreamEvent } from '@/utils/data-stream-validation';
import { type ChatMessage } from '@/types/chat';

import { CopyIcon, CheckIcon, ThumbsUpIcon, ThumbsDownIcon, RefreshCcwIcon } from 'lucide-react';
import { toast } from 'sonner';

type MessageFeedback = 'like' | 'dislike' | null;
type MessageAlternatives = Record<string, UIMessage[]>;

// Helper function to extract text content from UIMessage
function extractTextContent(message: UIMessage): string {
    return message.parts
        .filter((part) => part.type === 'text')
        .map((part) => (part.type === 'text' ? part.text : ''))
        .join('');
}

// Determine tool state from tool part
function determineToolState(toolPart: Record<string, unknown>): ToolState {
    if (toolPart.error !== undefined && toolPart.error !== null) return 'output-error';
    if (toolPart.output !== undefined || toolPart.result !== undefined) return 'output-available';
    if (toolPart.input !== undefined || toolPart.args !== undefined) return 'input-available';
    return 'input-streaming';
}

export function AIElementsChatPage() {
    const { id: threadIdParam } = useParams();
    const threadId = useRef(threadIdParam || nanoid()).current;
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<Record<string, MessageFeedback>>({});
    const [messageAlternatives, setMessageAlternatives] = useState<MessageAlternatives>({});
    const [regeneratingMessageId, setRegeneratingMessageId] = useState<string | null>(null);

    // Load existing thread messages if available
    const { data: threadMessages, isLoading: loadingThread } = useThreadMessages(threadIdParam);

    // Artifact and data stream management
    const { setDataStream, clearDataStream } = useDataStream();
    const { artifact, isOpen: artifactOpen } = useArtifactStore();

    const { messages, sendMessage, status, stop, regenerate } = useChat({
        id: threadId,
        messages: threadMessages as ChatMessage[] | undefined,
        transport: new DefaultChatTransport({
            api: `${API_BASE_URL}${API_ROUTES.CHAT}`,
            prepareSendMessagesRequest: ({ messages }) => {
                const currentModel = useModelStore.getState().currentModel;
                const user = useAuthStore.getState().user;

                // Extract only the last message (backend loads history from DB)
                const lastMessage = messages[messages.length - 1];

                // Extract text content from message parts
                const messageText = lastMessage.parts
                    .filter((part) => part.type === 'text')
                    .map((part) => ('text' in part ? part.text : ''))
                    .join('');

                return {
                    body: {
                        message: messageText,
                        context: {
                            agentTemplate: currentModel?.id || 'default',
                            chatId: threadId,
                            userId: user?.user_id,
                        },
                    },
                };
            },
        }),
        onData: (dataPart) => {
            // Clear previous message's data stream when starting a new message
            if (typeof dataPart === 'object' && dataPart !== null && 'type' in dataPart) {
                const type = (dataPart as { type: unknown }).type;
                if (type === 'start') {
                    clearDataStream();
                }
            }

            // Validate incoming data stream events with Zod
            const validatedEvent = validateDataStreamEvent(dataPart);
            if (validatedEvent) {
                setDataStream((ds) => [...ds, validatedEvent]);
            }
        },
        onFinish: () => {
            clearDataStream();
        },
        onError: (error) => {
            toast.error('Failed to send message', {
                description: error.message,
            });
        },
    });

    const isLoading = status === 'streaming';

    const handleCopy = useCallback((messageId: string, content: string) => {
        navigator.clipboard.writeText(content);
        setCopiedMessageId(messageId);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopiedMessageId(null), 2000);
    }, []);

    const handleFeedback = useCallback((messageId: string, type: MessageFeedback) => {
        setFeedback((prev) => ({
            ...prev,
            [messageId]: prev[messageId] === type ? null : type,
        }));
        toast.success(type === 'like' ? 'Thanks for the feedback!' : 'Feedback recorded');
    }, []);

    const handleRegenerate = useCallback(
        async (messageId: string) => {
            const messageIndex = messages.findIndex((m) => m.id === messageId);
            if (messageIndex === -1) return;

            // Store the current message as an alternative
            const currentMessage = messages[messageIndex];
            setMessageAlternatives((prev) => ({
                ...prev,
                [messageId]: [...(prev[messageId] || []), currentMessage],
            }));

            setRegeneratingMessageId(messageId);

            // Trigger regeneration
            await regenerate();

            setRegeneratingMessageId(null);
        },
        [messages, regenerate]
    );

    const handlePromptSubmit = useCallback(
        (text: string, files: File[]) => {
            if (!text.trim() && files.length === 0) return;

            if (files.length > 0) {
                const fileParts = files.map((file) => ({
                    type: 'file' as const,
                    url: URL.createObjectURL(file),
                    filename: file.name,
                    mediaType: file.type,
                }));

                sendMessage({
                    text: text || '',
                    files: fileParts,
                });
            } else {
                sendMessage({ text });
            }
        },
        [sendMessage]
    );

    // Show loading state while fetching thread
    if (threadIdParam && loadingThread) {
        return (
            <PageContainer className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <div className="text-center">
                    <div className="border-primary mb-4 inline-block size-8 animate-spin rounded-full border-4 border-t-transparent" />
                    <p className="text-muted-foreground">Loading conversation...</p>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer className="flex h-[calc(100vh-4rem)] flex-col">
            <div className="mb-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold">AI Elements Chat</h1>
                    <Badge variant="default">Full Implementation</Badge>
                    {threadIdParam && (
                        <Badge variant="outline">Thread: {threadIdParam.slice(0, 8)}...</Badge>
                    )}
                </div>
                <p className="text-muted-foreground mt-2">
                    Complete implementation with threads, artifacts, tools, and files
                </p>
            </div>

            <div className="flex flex-1 gap-4 overflow-hidden">
                {/* Chat Panel */}
                <div
                    className={`flex flex-col overflow-hidden rounded-lg border transition-all ${
                        artifactOpen ? 'w-[400px]' : 'flex-1'
                    }`}
                >
                    <Conversation>
                        <ChatMessages
                            messages={messages}
                            messageAlternatives={messageAlternatives}
                            copiedMessageId={copiedMessageId}
                            feedback={feedback}
                            regeneratingMessageId={regeneratingMessageId}
                            isLoading={isLoading}
                            onCopy={handleCopy}
                            onFeedback={handleFeedback}
                            onRegenerate={handleRegenerate}
                        />
                        <ConversationScrollButton />
                    </Conversation>

                    <div className="border-t p-4">
                        <PromptInput
                            onSubmit={handlePromptSubmit}
                            placeholder="Ask me anything..."
                            isStreaming={isLoading}
                            disabled={isLoading}
                            hasStarted={messages.length > 0}
                            onStop={stop}
                        />
                    </div>
                </div>

                {/* Artifact Panel */}
                {artifactOpen && artifact && (
                    <div className="flex-1 overflow-hidden">
                        <Artifact />
                    </div>
                )}
            </div>

            <div className="bg-muted/50 mt-4 rounded-lg p-4">
                <h3 className="mb-2 text-sm font-semibold">Features Active:</h3>
                <div className="grid gap-2 text-xs md:grid-cols-3 lg:grid-cols-4">
                    <FeatureIndicator active label="Thread Persistence" />
                    <FeatureIndicator active label="AI Elements Messages" />
                    <FeatureIndicator active label="Message Branching" />
                    <FeatureIndicator active label="Artifact System" />
                    <FeatureIndicator active label="Tool Execution" />
                    <FeatureIndicator active label="File Uploads" />
                    <FeatureIndicator active label="Message Actions" />
                    <FeatureIndicator active label="Model Selection" />
                </div>
            </div>
        </PageContainer>
    );
}

type ChatMessagesProps = {
    messages: UIMessage[];
    messageAlternatives: MessageAlternatives;
    copiedMessageId: string | null;
    feedback: Record<string, MessageFeedback>;
    regeneratingMessageId: string | null;
    isLoading: boolean;
    onCopy: (id: string, content: string) => void;
    onFeedback: (id: string, type: MessageFeedback) => void;
    onRegenerate: (id: string) => void;
};

function ChatMessages({
    messages,
    messageAlternatives,
    copiedMessageId,
    feedback,
    regeneratingMessageId,
    isLoading,
    onCopy,
    onFeedback,
    onRegenerate,
}: ChatMessagesProps) {
    if (messages.length === 0) {
        return (
            <div className="flex flex-1 items-center justify-center p-8">
                <div className="text-center">
                    <h2 className="text-muted-foreground mb-2 text-lg font-medium">
                        No messages yet
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Start a conversation using the input below
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-6 p-6">
            {messages.map((message, index) => {
                const alternatives = messageAlternatives[message.id] || [];
                const hasAlternatives = alternatives.length > 0;
                const isRegenerating = regeneratingMessageId === message.id;
                const isLastMessage = index === messages.length - 1;
                const isStreaming = isLoading && isLastMessage;

                // Extract file attachments
                const fileParts = message.parts.filter((p) => p.type === 'file');
                const hasFiles = fileParts.length > 0;

                // Extract tool parts
                const toolParts = message.parts.filter((p) => p.type.startsWith('tool-'));

                return (
                    <div key={message.id}>
                        {message.role === 'user' ? (
                            <Message from="user">
                                <MessageContent>
                                    {hasFiles && (
                                        <MessageAttachments>
                                            {fileParts.map((file, idx) => (
                                                <MessageAttachment
                                                    key={idx}
                                                    data={file as FileUIPart}
                                                />
                                            ))}
                                        </MessageAttachments>
                                    )}
                                    <MessageResponse>{extractTextContent(message)}</MessageResponse>
                                </MessageContent>
                            </Message>
                        ) : hasAlternatives ? (
                            <MessageBranch>
                                <Message from="assistant">
                                    <MessageContent>
                                        <MessageBranchContent>
                                            {alternatives.map((alt) => (
                                                <div key={alt.id}>
                                                    <MessageResponse>
                                                        {extractTextContent(alt)}
                                                    </MessageResponse>
                                                </div>
                                            ))}
                                            <div>
                                                {/* Render tool parts */}
                                                {toolParts.map((part, idx) => {
                                                    const toolName = part.type.replace('tool-', '');
                                                    const toolState = determineToolState(part);
                                                    const input =
                                                        'input' in part
                                                            ? part.input
                                                            : 'args' in part
                                                              ? part.args
                                                              : undefined;
                                                    const output =
                                                        'output' in part
                                                            ? part.output
                                                            : 'result' in part
                                                              ? part.result
                                                              : undefined;
                                                    const error =
                                                        'error' in part &&
                                                        typeof part.error === 'string'
                                                            ? part.error
                                                            : undefined;

                                                    const customRenderer = ToolRenderer({
                                                        toolName,
                                                        state: toolState,
                                                        input,
                                                        output,
                                                        error,
                                                    });

                                                    if (customRenderer) {
                                                        return (
                                                            <div key={idx} className="my-2">
                                                                {customRenderer}
                                                            </div>
                                                        );
                                                    }

                                                    return (
                                                        <ToolPart
                                                            key={idx}
                                                            toolName={toolName}
                                                            toolCallId={
                                                                'toolCallId' in part
                                                                    ? String(part.toolCallId)
                                                                    : ''
                                                            }
                                                            status={
                                                                toolState === 'output-error'
                                                                    ? 'error'
                                                                    : toolState ===
                                                                        'output-available'
                                                                      ? 'complete'
                                                                      : 'streaming'
                                                            }
                                                            input={input}
                                                            output={output}
                                                            error={error}
                                                        />
                                                    );
                                                })}
                                                <MessageResponse>
                                                    {extractTextContent(message)}
                                                </MessageResponse>
                                            </div>
                                        </MessageBranchContent>

                                        <div className="mt-3 flex items-center justify-between">
                                            <MessageBranchSelector from="assistant">
                                                <MessageBranchPrevious />
                                                <MessageBranchPage />
                                                <MessageBranchNext />
                                            </MessageBranchSelector>

                                            <AssistantActions
                                                messageId={message.id}
                                                content={extractTextContent(message)}
                                                copiedMessageId={copiedMessageId}
                                                feedback={feedback}
                                                isRegenerating={isRegenerating}
                                                isStreaming={isStreaming}
                                                onCopy={onCopy}
                                                onFeedback={onFeedback}
                                                onRegenerate={onRegenerate}
                                            />
                                        </div>
                                    </MessageContent>
                                </Message>
                            </MessageBranch>
                        ) : (
                            <Message from="assistant">
                                <MessageContent>
                                    {/* Render tool parts */}
                                    {toolParts.map((part, idx) => {
                                        const toolName = part.type.replace('tool-', '');
                                        const toolState = determineToolState(part);
                                        const input =
                                            'input' in part
                                                ? part.input
                                                : 'args' in part
                                                  ? part.args
                                                  : undefined;
                                        const output =
                                            'output' in part
                                                ? part.output
                                                : 'result' in part
                                                  ? part.result
                                                  : undefined;
                                        const error =
                                            'error' in part && typeof part.error === 'string'
                                                ? part.error
                                                : undefined;

                                        const customRenderer = ToolRenderer({
                                            toolName,
                                            state: toolState,
                                            input,
                                            output,
                                            error,
                                        });

                                        if (customRenderer) {
                                            return (
                                                <div key={idx} className="my-2">
                                                    {customRenderer}
                                                </div>
                                            );
                                        }

                                        return (
                                            <ToolPart
                                                key={idx}
                                                toolName={toolName}
                                                toolCallId={
                                                    'toolCallId' in part
                                                        ? String(part.toolCallId)
                                                        : ''
                                                }
                                                status={
                                                    toolState === 'output-error'
                                                        ? 'error'
                                                        : toolState === 'output-available'
                                                          ? 'complete'
                                                          : 'streaming'
                                                }
                                                input={input}
                                                output={output}
                                                error={error}
                                            />
                                        );
                                    })}

                                    <MessageResponse>{extractTextContent(message)}</MessageResponse>

                                    {!isStreaming && (
                                        <AssistantActions
                                            messageId={message.id}
                                            content={extractTextContent(message)}
                                            copiedMessageId={copiedMessageId}
                                            feedback={feedback}
                                            isRegenerating={isRegenerating}
                                            isStreaming={isStreaming}
                                            onCopy={onCopy}
                                            onFeedback={onFeedback}
                                            onRegenerate={onRegenerate}
                                        />
                                    )}
                                </MessageContent>
                            </Message>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

type AssistantActionsProps = {
    messageId: string;
    content: string;
    copiedMessageId: string | null;
    feedback: Record<string, MessageFeedback>;
    isRegenerating: boolean;
    isStreaming: boolean;
    onCopy: (id: string, content: string) => void;
    onFeedback: (id: string, type: MessageFeedback) => void;
    onRegenerate: (id: string) => void;
};

function AssistantActions({
    messageId,
    content,
    copiedMessageId,
    feedback,
    isRegenerating,
    isStreaming,
    onCopy,
    onFeedback,
    onRegenerate,
}: AssistantActionsProps) {
    const isCopied = copiedMessageId === messageId;
    const messageFeedback = feedback[messageId];

    return (
        <MessageActions>
            <MessageAction
                tooltip={isCopied ? 'Copied!' : 'Copy'}
                label="Copy message"
                onClick={() => onCopy(messageId, content)}
            >
                {isCopied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
            </MessageAction>

            <MessageAction
                tooltip="Like"
                label="Like"
                variant={messageFeedback === 'like' ? 'default' : 'ghost'}
                onClick={() => onFeedback(messageId, 'like')}
            >
                <ThumbsUpIcon size={14} />
            </MessageAction>

            <MessageAction
                tooltip="Dislike"
                label="Dislike"
                variant={messageFeedback === 'dislike' ? 'default' : 'ghost'}
                onClick={() => onFeedback(messageId, 'dislike')}
            >
                <ThumbsDownIcon size={14} />
            </MessageAction>

            <MessageAction
                tooltip="Regenerate response"
                label="Regenerate"
                onClick={() => onRegenerate(messageId)}
                disabled={isRegenerating || isStreaming}
            >
                <RefreshCcwIcon size={14} className={isRegenerating ? 'animate-spin' : ''} />
            </MessageAction>
        </MessageActions>
    );
}

type FeatureIndicatorProps = {
    active: boolean;
    label: string;
};

function FeatureIndicator({ active, label }: FeatureIndicatorProps) {
    return (
        <div className="flex items-start gap-2">
            <span className={active ? 'text-green-600' : 'text-muted-foreground'}>
                {active ? '✓' : '○'}
            </span>
            <span className="text-muted-foreground">{label}</span>
        </div>
    );
}
export default AIElementsChatPage;
