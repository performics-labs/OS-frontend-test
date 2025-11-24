import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
    CheckIcon,
    CopyIcon,
    Edit2Icon,
    RotateCcwIcon,
    ThumbsDownIcon,
    ThumbsUpIcon,
} from 'lucide-react';
import { cn } from '@/lib';
import type { FeedbackStatus, FeedbackType } from '@/types/chat';
import { useCallback, useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { ChatMessage } from '@/types/chat';

type MessageActionsProps = {
    message: ChatMessage;
    isStreaming?: boolean;
    onCopy?: (messageId: string, content: string) => void;
    isCopied?: boolean;
    onFeedback?: (messageId: string, feedback: FeedbackStatus) => void;
    feedbackStatus?: FeedbackStatus;
    onRegenerate?: (messageId: string) => void;
    onEdit?: (messageId: string) => void;
};

export function MessageActions({
    message,
    isStreaming = false,
    onCopy,
    isCopied = false,
    onFeedback,
    feedbackStatus = 'none',
    onRegenerate,
    onEdit,
}: MessageActionsProps) {
    const [localFeedback, setLocalFeedback] = useState<FeedbackStatus>(feedbackStatus);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleCopy = () => {
        if (!onCopy) return;

        // Extract text content from parts
        const textContent = message.parts
            .filter((part) => part.type === 'text')
            .map((part) => (part.type === 'text' ? part.text : ''))
            .join('\n\n');

        onCopy(message.id, textContent);
    };

    const handleEdit = () => {
        onEdit?.(message.id);
    };

    const handleRegenerate = () => {
        setIsDialogOpen(false);
        onRegenerate?.(message.id);
    };

    const handleFeedback = useCallback(
        (feedback: FeedbackType) => {
            const newFeedback: FeedbackStatus = localFeedback === feedback ? 'none' : feedback;
            setLocalFeedback(newFeedback);
            onFeedback?.(message.id, newFeedback);
        },
        [localFeedback, onFeedback, message.id]
    );

    return (
        <>
            <div className="text-accent-foreground absolute bottom-0 flex translate-y-[50%] items-center justify-end gap-1 pt-1.5 opacity-0 transition-opacity group-hover/message:opacity-100 group-[.is-assistant]:left-0 group-[.is-assistant]:ml-10 group-[.is-user]:right-0">
                {message.role === 'assistant' && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopy}
                                disabled={isStreaming}
                                className="bg-background dark:text-accent-foreground text-foreground size-8 p-0"
                                type="button"
                            >
                                {isCopied ? (
                                    <CheckIcon className="size-4" data-testid="check-icon" />
                                ) : (
                                    <CopyIcon className="size-4" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent
                            side="bottom"
                            className="bg-accent text-accent-foreground px-2 text-xs"
                        >
                            {isCopied ? 'Copied!' : 'Copy'}
                        </TooltipContent>
                    </Tooltip>
                )}

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsDialogOpen(true)}
                            disabled={isStreaming}
                            className="bg-background dark:text-accent-foreground text-foreground size-8 p-0"
                            type="button"
                        >
                            <RotateCcwIcon className="size-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent
                        side="bottom"
                        className="bg-accent text-accent-foreground px-2 text-xs"
                    >
                        Try again
                    </TooltipContent>
                </Tooltip>

                {message.role === 'assistant' && (
                    <>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleFeedback('up')}
                                    disabled={isStreaming}
                                    className={cn(
                                        'bg-background dark:text-accent-foreground text-foreground size-8 p-0',
                                        localFeedback === 'up' && 'bg-primary/10 text-primary'
                                    )}
                                    type="button"
                                >
                                    <ThumbsUpIcon className="size-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent
                                side="bottom"
                                className="bg-accent text-accent-foreground px-2 text-xs"
                            >
                                Good response
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleFeedback('down')}
                                    disabled={isStreaming}
                                    className={cn(
                                        'bg-background dark:text-accent-foreground text-foreground size-8 p-0',
                                        localFeedback === 'down' &&
                                            'bg-destructive/10 text-destructive'
                                    )}
                                    type="button"
                                >
                                    <ThumbsDownIcon className="size-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent
                                side="bottom"
                                className="bg-accent text-accent-foreground px-2 text-xs"
                            >
                                Bad response
                            </TooltipContent>
                        </Tooltip>
                    </>
                )}

                {message.role === 'user' && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleEdit}
                                disabled={isStreaming}
                                className={cn(
                                    'bg-background dark:text-accent-foreground text-foreground size-8 p-0',
                                    localFeedback === 'up' && 'bg-primary/10 text-primary'
                                )}
                                type="button"
                            >
                                <Edit2Icon className="size-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent
                            side="bottom"
                            className="bg-accent text-accent-foreground px-2 text-xs"
                        >
                            Edit
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>

            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Regenerate Response?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will create a new response and replace the current one. The
                            original response will be discarded. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRegenerate}>Regenerate</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
