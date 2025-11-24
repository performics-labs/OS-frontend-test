import { useEffect, memo } from 'react';
import { z } from 'zod';
import { useStickToBottomContext } from 'use-stick-to-bottom';
import { ConversationContent } from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageAvatar } from '@/components/ai-elements/message';
import { Response } from '@/components/ai-elements/response';
import { ToolRenderer } from '@/components/ai-elements/tool-renderer';
import { MessageActions } from '@/components/ai-elements/message-actions';
import { EditableMessage } from '@/components/ai-elements/editable-message';
import { MessageAttachments } from '@/components/ai-elements/message-attachments';
import { ArtifactLoadingIndicator } from '@/components/ai-elements/artifact-loading-indicator';
import type { ChatMessage, FeedbackStatus } from '@/types/chat';
import { extractFileParts, hasFileAttachments } from '@/types/chat';
import { extractTextContent } from '@/utils/message';
import type { ToolState } from '@/types/tools';
import { useDataStream } from '@/hooks/useDataStream';

type ConversationMessagesProps = {
    messages: ChatMessage[];
    streamingContent?: Record<string, string>;
    onRegenerate?: (messageId: string) => void;
    onCopy?: (messageId: string, content: string) => void;
    onFeedback?: (messageId: string, feedback: FeedbackStatus) => void;
    onEdit?: (messageId: string) => void;
    onEditConfirm?: (messageId: string, newContent: string) => void;
    onEditCancel?: () => void;
    copiedMessageId?: string | null;
    feedbackState?: Record<string, FeedbackStatus>;
    editingMessageId?: string | null;
};

const toolPartSchema = z.object({
    error: z.unknown().optional(),
    state: z.string().optional(),
    output: z.unknown().optional(),
    result: z.unknown().optional(),
    input: z.unknown().optional(),
    args: z.unknown().optional(),
});

function determineToolState(toolPart: Record<string, unknown>): ToolState {
    const validated = toolPartSchema.safeParse(toolPart);
    if (!validated.success) return 'input-streaming';

    const data = validated.data;

    // Check for error states
    if (data.error !== undefined && data.error !== null) return 'output-error';
    if (data.state === 'output-error') return 'output-error';

    // Check for output/result availability
    if (data.output !== undefined) return 'output-available';
    if (data.result !== undefined) return 'output-available';

    // Check for input/args availability
    if (data.input !== undefined) return 'input-available';
    if (data.args !== undefined) return 'input-available';

    // Default to streaming state
    return 'input-streaming';
}

const ConversationMessagesComponent = ({
    messages,
    streamingContent = {},
    onRegenerate,
    onCopy,
    onFeedback,
    onEdit,
    onEditConfirm,
    onEditCancel,
    copiedMessageId,
    feedbackState = {},
    editingMessageId,
}: ConversationMessagesProps) => {
    const { scrollToBottom } = useStickToBottomContext();
    const { dataStream } = useDataStream();

    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages, scrollToBottom]);

    useEffect(() => {
        if (Object.keys(streamingContent).length > 0) {
            scrollToBottom({ preserveScrollPosition: true });
        }
    }, [streamingContent, scrollToBottom]);

    return (
        <ConversationContent className="space-y-0">
            {messages.map((message) => {
                const isStreaming = !!streamingContent[message.id];
                const textContent = isStreaming
                    ? streamingContent[message.id]
                    : extractTextContent(message);
                const isEditing = editingMessageId === message.id;

                const fileParts = extractFileParts(message);
                const hasFiles = hasFileAttachments(message);

                // Show artifact loading when we have artifact data but tool hasn't completed yet
                const artifactTitle = dataStream.find((e) => e.type === 'data-title')?.data;
                const hasToolParts = message.parts.some((p) => p.type.startsWith('tool-'));
                const showArtifactLoading =
                    artifactTitle && !hasToolParts && message.role === 'assistant';

                return (
                    <Message key={message.id} from={message.role} className="group/message">
                        {message.role === 'assistant' && (
                            <MessageAvatar src="/images/logo.svg" name="OneSuite" />
                        )}
                        <MessageContent variant="contained">
                            {hasFiles && <MessageAttachments files={fileParts} className="mb-2" />}

                            {/* Show artifact creation indicator during streaming BEFORE tool parts exist */}
                            {showArtifactLoading && (
                                <ArtifactLoadingIndicator title={artifactTitle as string} />
                            )}

                            {message.parts
                                .filter((part) => part.type.startsWith('tool-'))
                                .map((part, index) => {
                                    const key = `${message.id}-part-${index}`;
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
                                    const errorMsg =
                                        'error' in part && typeof part.error === 'string'
                                            ? part.error
                                            : 'errorText' in part &&
                                                typeof part.errorText === 'string'
                                              ? part.errorText
                                              : undefined;

                                    // Render custom tool renderer
                                    return (
                                        <ToolRenderer
                                            key={key}
                                            toolName={toolName}
                                            state={toolState}
                                            input={input}
                                            output={output}
                                            error={errorMsg}
                                        />
                                    );
                                })}

                            {isEditing && message.role === 'user' ? (
                                <EditableMessage
                                    initialValue={textContent}
                                    onConfirm={(newContent) =>
                                        onEditConfirm?.(message.id, newContent)
                                    }
                                    onCancel={() => onEditCancel?.()}
                                />
                            ) : (
                                textContent && <Response>{textContent}</Response>
                            )}

                            {!isEditing && message.role !== 'user' && (
                                <div className="mt-1 flex items-center justify-between gap-2">
                                    {message.metadata?.createdAt && (
                                        <p className="text-muted-foreground grow text-xs whitespace-nowrap">
                                            {new Date(
                                                message.metadata.createdAt
                                            ).toLocaleTimeString()}
                                        </p>
                                    )}
                                </div>
                            )}
                            <MessageActions
                                message={message}
                                isStreaming={isStreaming}
                                onCopy={onCopy}
                                isCopied={copiedMessageId === message.id}
                                onFeedback={onFeedback}
                                feedbackStatus={feedbackState[message.id] || 'none'}
                                onRegenerate={onRegenerate}
                                onEdit={onEdit}
                            />
                        </MessageContent>
                    </Message>
                );
            })}
        </ConversationContent>
    );
};

// Memoize to prevent unnecessary re-renders (Vercel best practice)
export const ConversationMessages = memo(
    ConversationMessagesComponent,
    (prevProps, nextProps) => {
        // Only re-render if messages or streaming content actually changed
        return (
            prevProps.messages === nextProps.messages &&
            prevProps.streamingContent === nextProps.streamingContent &&
            prevProps.editingMessageId === nextProps.editingMessageId &&
            prevProps.copiedMessageId === nextProps.copiedMessageId
        );
    }
);
