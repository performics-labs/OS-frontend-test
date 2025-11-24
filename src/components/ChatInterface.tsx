import { useState, useEffect, useRef, useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { ChatInterfaceProps, ChatMessage, FeedbackStatus } from '@/types';
import { PromptInput, type PromptInputHandle } from '@/components/ai-elements/prompt-input';
import { Conversation, ConversationScrollButton } from '@/components/ai-elements/conversation';
import { ConversationMessages } from '@/components/ai-elements/conversation-messages';
import { API_ROUTES } from '@/constants';
import { useMessageActions } from '@/hooks/useMessageActions';
import { toast } from 'sonner';
import { useDataStream } from '@/hooks/useDataStream';
import { validateDataStreamEvent } from '@/utils/data-stream-validation';
import { useRandomPlaceholder } from '@/hooks';
import { useCurrentModel } from '@/stores/model-store';
import { useAuthStore } from '@/stores';
import { useParams } from 'react-router';
import { v4 as uuidv4 } from 'uuid';

export function ChatInterface({
    initialPrompt = '',
    onSubmit,
    initialMessages = [],
    projectId,
}: ChatInterfaceProps & { initialMessages?: ChatMessage[] }) {
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const inputRef = useRef<PromptInputHandle | null>(null);
    const hasSubmittedInitial = useRef(false);
    const { setDataStream, clearDataStream } = useDataStream();
    const placeholder = useRandomPlaceholder();
    const { id: chatId } = useParams();
    const threadId = useRef(chatId || uuidv4());

    // Use proper selectors instead of getState() (Zustand best practice)
    const currentModel = useCurrentModel();
    const user = useAuthStore((state) => state.user);

    const {
        messages: aiMessages,
        sendMessage,
        status,
        stop,
        regenerate,
    } = useChat<ChatMessage>({
        id: threadId.current,
        messages: initialMessages,
        transport: new DefaultChatTransport({
            api: `${import.meta.env.VITE_API_BASE_URL || ''}${API_ROUTES.CHAT}`,
            prepareSendMessagesRequest: ({ messages }) => {
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
                            chatId: threadId.current,
                            userId: user?.user_id,
                            projectId,
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
            // Clear stream after completion to prevent memory leaks
            clearDataStream();
        },
    });

    const { actionState, copyToClipboard, sendFeedback, handleRegenerate } = useMessageActions({
        onCopy: () => {
            toast.success('Message copied to clipboard');
        },
        onFeedback: (_messageId: string, feedback: FeedbackStatus) => {
            if (feedback !== 'none') {
                const emoji = feedback === 'up' ? '👍' : '👎';
                toast.success(`Feedback ${emoji} recorded`);
            } else {
                toast.info('Feedback removed');
            }
        },
        onRegenerate: () => {
            toast.success('Regenerating response...');
        },
        onError: (message: string) => {
            toast.error(message);
        },
        regenerate,
    });

    const handleEdit = (messageId: string) => {
        setEditingMessageId(messageId);
    };

    const handleEditCancel = () => {
        setEditingMessageId(null);
    };

    const handleEditConfirm = (messageId: string, newContent: string) => {
        // Find the index of the message being edited
        const messageIndex = aiMessages.findIndex((msg) => msg.id === messageId);

        if (messageIndex === -1) {
            toast.error('Message not found');
            return;
        }

        // Clear editing state
        setEditingMessageId(null);

        // Send the new message - the useChat hook will handle updating the conversation
        sendMessage({ text: newContent });
        onSubmit?.(newContent);

        toast.success('Message updated, generating new response...');
    };

    const streamingContent: Record<string, string> = useMemo(() => {
        const lastMessage = aiMessages[aiMessages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant' && status === 'streaming') {
            const textContent = lastMessage.parts
                .filter((part) => part.type === 'text')
                .map((part) => (part.type === 'text' ? part.text : ''))
                .join('');
            return { [lastMessage.id]: textContent };
        }
        return {};
    }, [aiMessages, status]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }

            if (e.key === 'Escape' && status === 'streaming') {
                e.preventDefault();
                stop();
                toast.info('Generation stopped');
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [status, stop]);

    useEffect(() => {
        if (initialPrompt && !hasSubmittedInitial.current && aiMessages.length === 0) {
            hasSubmittedInitial.current = true;
            sendMessage({ text: initialPrompt });
            onSubmit?.(initialPrompt);
        }
    }, [initialPrompt, sendMessage, aiMessages.length, onSubmit]);

    // Focus input after streaming completes
    useEffect(() => {
        if (status === 'ready' && aiMessages.length > 0) {
            const timeoutId = setTimeout(() => {
                inputRef.current?.focus();
            }, 0);
            return () => clearTimeout(timeoutId);
        }
    }, [status, aiMessages.length]);

    function handlePromptSubmit(text: string, files: File[]) {
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

        onSubmit?.(text);
    }

    return (
        <div className="flex h-full flex-col">
            {aiMessages.length === 0 ? (
                // Empty State - Centered Input Only
                <div className="flex flex-1 flex-col items-center justify-center px-4">
                    <div className="w-full max-w-5xl">
                        <PromptInput
                            ref={inputRef}
                            onSubmit={handlePromptSubmit}
                            onStop={stop}
                            placeholder={placeholder}
                            isStreaming={status === 'streaming' || status === 'submitted'}
                            name="message"
                            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                            maxFiles={5}
                            maxFileSize={10}
                            hasStarted={false}
                            minRows={4}
                        />
                    </div>
                </div>
            ) : (
                // Chat State - Normal Layout
                <>
                    <Conversation
                        targetScrollTop={(_, { contentElement }) => {
                            const lastUserMessage =
                                contentElement.children[contentElement.children.length - 2];
                            return lastUserMessage ? (lastUserMessage as HTMLElement).offsetTop : 0;
                        }}
                    >
                        <ConversationMessages
                            messages={aiMessages}
                            streamingContent={streamingContent}
                            onRegenerate={handleRegenerate}
                            onCopy={copyToClipboard}
                            onFeedback={sendFeedback}
                            onEdit={handleEdit}
                            onEditConfirm={handleEditConfirm}
                            onEditCancel={handleEditCancel}
                            copiedMessageId={actionState.copiedId}
                            feedbackState={actionState.feedbackState}
                            editingMessageId={editingMessageId}
                        />
                        <ConversationScrollButton />
                    </Conversation>

                    <div className="border-border bg-background sticky bottom-4 mx-4 mt-4">
                        <PromptInput
                            ref={inputRef}
                            onSubmit={handlePromptSubmit}
                            onStop={stop}
                            placeholder="Ask a follow-up question..."
                            isStreaming={status === 'streaming' || status === 'submitted'}
                            name="message"
                            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                            maxFiles={5}
                            maxFileSize={10}
                            hasStarted={true}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
