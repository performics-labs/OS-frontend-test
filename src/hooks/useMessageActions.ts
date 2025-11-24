import { useCallback, useRef, useState } from 'react';
import { getErrorMessage } from '@/utils';
import type { FeedbackStatus } from '@/types/chat';

export type MessageActionState = {
    copiedId: string | null;
    feedbackState: Record<string, FeedbackStatus>;
    isRegenerating: boolean;
};

export type UseMessageActionsOptions = {
    onCopy?: () => void;
    onFeedback?: (messageId: string, feedback: FeedbackStatus) => void;
    onRegenerate?: () => void;
    onError?: (message: string) => void;
    regenerate?: (options: { messageId: string }) => void;
};

export function useMessageActions({
    onCopy,
    onFeedback,
    onRegenerate,
    onError,
    regenerate,
}: UseMessageActionsOptions) {
    const [actionState, setActionState] = useState<MessageActionState>({
        copiedId: null,
        feedbackState: {},
        isRegenerating: false,
    });

    const copyTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    const copyToClipboard = useCallback(
        async (messageId: string, content: string) => {
            try {
                if (!navigator.clipboard?.writeText) {
                    throw new Error('Clipboard API is not available');
                }

                await navigator.clipboard.writeText(content);

                setActionState((prev) => ({
                    ...prev,
                    copiedId: messageId,
                }));

                const currentTimeout = copyTimeoutsRef.current.get(messageId);
                if (currentTimeout) {
                    clearTimeout(currentTimeout);
                }

                const timeout = setTimeout(() => {
                    setActionState((prev) => ({
                        ...prev,
                        copiedId: prev.copiedId === messageId ? null : prev.copiedId,
                    }));
                    copyTimeoutsRef.current.delete(messageId);
                }, 2000);

                copyTimeoutsRef.current.set(messageId, timeout);
                onCopy?.();
            } catch (error) {
                const message = getErrorMessage(error);
                onError?.(message);
            }
        },
        [onCopy, onError]
    );

    const handleRegenerate = useCallback(
        async (messageId: string) => {
            setActionState((prev) => ({
                ...prev,
                isRegenerating: true,
            }));

            try {
                regenerate?.({ messageId });
                onRegenerate?.();
            } catch (error) {
                const message = getErrorMessage(error);
                onError?.(message);
            } finally {
                setActionState((prev) => ({
                    ...prev,
                    isRegenerating: false,
                }));
            }
        },
        [regenerate, onRegenerate, onError]
    );

    const sendFeedback = useCallback(
        (messageId: string, feedback: FeedbackStatus) => {
            try {
                setActionState((prev) => ({
                    ...prev,
                    feedbackState: {
                        ...prev.feedbackState,
                        [messageId]: feedback,
                    },
                }));

                onFeedback?.(messageId, feedback);

                // TODO: Persist to backend
                // apiClient.post('/api/feedback', { messageId, feedback });
            } catch (error) {
                const message = getErrorMessage(error);
                onError?.(message);
            }
        },
        [onFeedback, onError]
    );

    return {
        actionState,
        copyToClipboard,
        sendFeedback,
        handleRegenerate,
    };
}
