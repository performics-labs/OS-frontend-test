import { screen, fireEvent, waitFor, render } from '@testing-library/react';
import { MessageActions } from '@/components/ai-elements/message-actions';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { ChatMessage } from '@/types/chat';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ThemeContext, type ThemeContextType } from '@/contexts/ThemeContext';

const mockThemeContext: ThemeContextType = {
    theme: 'light',
    setTheme: vi.fn(),
    toggleTheme: vi.fn(),
};

const renderWithTheme = (ui: React.ReactElement, theme: 'light' | 'dark' = 'light') => {
    const contextValue = { ...mockThemeContext, theme };
    return render(
        <ThemeContext.Provider value={contextValue}>
            <TooltipProvider>{ui}</TooltipProvider>
        </ThemeContext.Provider>
    );
};

describe('MessageActions', () => {
    const mockAssistantMessage: ChatMessage = {
        id: 'msg-1',
        role: 'assistant',
        parts: [
            { type: 'text', text: 'First paragraph' },
            { type: 'text', text: 'Second paragraph' },
        ],
    };

    const mockUserMessage: ChatMessage = {
        id: 'msg-2',
        role: 'user',
        parts: [{ type: 'text', text: 'User question' }],
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Assistant Messages', () => {
        it('should render all action buttons for assistant messages', () => {
            renderWithTheme(
                <MessageActions
                    message={mockAssistantMessage}
                    onCopy={vi.fn()}
                    onFeedback={vi.fn()}
                    onRegenerate={vi.fn()}
                />
            );

            // All 4 buttons should be present: copy, regenerate, thumbs up, thumbs down
            const buttons = screen.getAllByRole('button');
            expect(buttons).toHaveLength(4);
        });

        it('should call onCopy with extracted text when copy button clicked', () => {
            const onCopy = vi.fn();
            renderWithTheme(<MessageActions message={mockAssistantMessage} onCopy={onCopy} />);

            const buttons = screen.getAllByRole('button');
            fireEvent.click(buttons[0]); // First button is copy

            expect(onCopy).toHaveBeenCalledWith('msg-1', 'First paragraph\n\nSecond paragraph');
        });

        it('should show regenerate confirmation dialog', async () => {
            const onRegenerate = vi.fn();
            renderWithTheme(
                <MessageActions message={mockAssistantMessage} onRegenerate={onRegenerate} />
            );

            const buttons = screen.getAllByRole('button');
            fireEvent.click(buttons[1]); // Second button is regenerate

            await waitFor(() => {
                expect(screen.getByText('Regenerate Response?')).toBeInTheDocument();
            });
        });

        it('should handle thumbs up feedback', () => {
            const onFeedback = vi.fn();
            renderWithTheme(
                <MessageActions message={mockAssistantMessage} onFeedback={onFeedback} />
            );

            const buttons = screen.getAllByRole('button');
            fireEvent.click(buttons[2]); // Third button is thumbs up

            expect(onFeedback).toHaveBeenCalledWith('msg-1', 'up');
        });

        it('should handle thumbs down feedback', () => {
            const onFeedback = vi.fn();
            renderWithTheme(
                <MessageActions message={mockAssistantMessage} onFeedback={onFeedback} />
            );

            const buttons = screen.getAllByRole('button');
            fireEvent.click(buttons[3]); // Fourth button is thumbs down

            expect(onFeedback).toHaveBeenCalledWith('msg-1', 'down');
        });

        it('should toggle feedback when clicked twice', () => {
            const onFeedback = vi.fn();
            renderWithTheme(
                <MessageActions message={mockAssistantMessage} onFeedback={onFeedback} />
            );

            const buttons = screen.getAllByRole('button');
            fireEvent.click(buttons[2]); // Thumbs up
            expect(onFeedback).toHaveBeenCalledWith('msg-1', 'up');

            fireEvent.click(buttons[2]); // Thumbs up again
            expect(onFeedback).toHaveBeenCalledWith('msg-1', 'none');
        });

        it('should show check icon when message is copied', () => {
            renderWithTheme(<MessageActions message={mockAssistantMessage} isCopied={true} />);

            // Check icon should be present instead of copy icon
            const checkIcon = screen.getByTestId('check-icon');
            expect(checkIcon).toBeInTheDocument();
        });

        it('should not show edit button for assistant messages', () => {
            renderWithTheme(<MessageActions message={mockAssistantMessage} />);

            // Should have 4 buttons, not including edit
            const buttons = screen.getAllByRole('button');
            expect(buttons).toHaveLength(4);

            // Verify no Edit2Icon is present by checking button content
            buttons.forEach((button) => {
                expect(button.querySelector('.lucide-pen')).not.toBeInTheDocument();
            });
        });
    });

    describe('User Messages', () => {
        it('should render regenerate and edit buttons for user messages', () => {
            renderWithTheme(
                <MessageActions message={mockUserMessage} onRegenerate={vi.fn()} onEdit={vi.fn()} />
            );

            // User messages should have 2 buttons: regenerate and edit
            const buttons = screen.getAllByRole('button');
            expect(buttons).toHaveLength(2);
        });

        it('should not show copy button for user messages', () => {
            const onCopy = vi.fn();
            renderWithTheme(<MessageActions message={mockUserMessage} onCopy={onCopy} />);

            const buttons = screen.getAllByRole('button');

            // Click all buttons and verify copy was never called
            buttons.forEach((button) => fireEvent.click(button));
            expect(onCopy).not.toHaveBeenCalled();
        });

        it('should not show feedback buttons for user messages', () => {
            const onFeedback = vi.fn();
            renderWithTheme(<MessageActions message={mockUserMessage} onFeedback={onFeedback} />);

            const buttons = screen.getAllByRole('button');

            // Click all buttons and verify feedback was never called
            buttons.forEach((button) => fireEvent.click(button));
            expect(onFeedback).not.toHaveBeenCalled();
        });

        it('should call onEdit when edit button clicked', () => {
            const onEdit = vi.fn();
            renderWithTheme(<MessageActions message={mockUserMessage} onEdit={onEdit} />);

            const buttons = screen.getAllByRole('button');
            const editButton = buttons.find((btn) => btn.querySelector('.lucide-pen'));

            expect(editButton).toBeInTheDocument();
            fireEvent.click(editButton!);

            expect(onEdit).toHaveBeenCalledWith('msg-2');
        });

        it('should show regenerate dialog for user messages', async () => {
            const onRegenerate = vi.fn();
            renderWithTheme(
                <MessageActions message={mockUserMessage} onRegenerate={onRegenerate} />
            );

            const buttons = screen.getAllByRole('button');
            const regenerateButton = buttons.find((btn) => btn.querySelector('.lucide-rotate-ccw'));

            expect(regenerateButton).toBeInTheDocument();
            fireEvent.click(regenerateButton!);

            await waitFor(() => {
                expect(screen.getByText('Regenerate Response?')).toBeInTheDocument();
            });
        });
    });

    describe('Streaming State', () => {
        it('should disable all buttons when streaming', () => {
            renderWithTheme(<MessageActions message={mockAssistantMessage} isStreaming={true} />);

            const buttons = screen.getAllByRole('button');
            buttons.forEach((button) => {
                expect(button).toBeDisabled();
            });
        });

        it('should disable edit button for user messages when streaming', () => {
            renderWithTheme(<MessageActions message={mockUserMessage} isStreaming={true} />);

            const buttons = screen.getAllByRole('button');
            buttons.forEach((button) => {
                expect(button).toBeDisabled();
            });
        });
    });

    describe('Feedback State', () => {
        it('should highlight thumbs up button when feedback is up', () => {
            renderWithTheme(<MessageActions message={mockAssistantMessage} feedbackStatus="up" />);

            const buttons = screen.getAllByRole('button');
            const thumbsUpButton = buttons[2];

            expect(thumbsUpButton).toHaveClass('bg-primary/10', 'text-primary');
        });

        it('should highlight thumbs down button when feedback is down', () => {
            renderWithTheme(
                <MessageActions message={mockAssistantMessage} feedbackStatus="down" />
            );

            const buttons = screen.getAllByRole('button');
            const thumbsDownButton = buttons[3];

            expect(thumbsDownButton).toHaveClass('bg-destructive/10', 'text-destructive');
        });

        it('should not highlight feedback buttons when status is none', () => {
            renderWithTheme(
                <MessageActions message={mockAssistantMessage} feedbackStatus="none" />
            );

            const buttons = screen.getAllByRole('button');
            const thumbsUpButton = buttons[2];
            const thumbsDownButton = buttons[3];

            expect(thumbsUpButton).not.toHaveClass('bg-primary/10');
            expect(thumbsDownButton).not.toHaveClass('bg-destructive/10');
        });
    });

    describe('Regenerate Dialog', () => {
        it('should show proper dialog content', async () => {
            renderWithTheme(<MessageActions message={mockAssistantMessage} />);

            const buttons = screen.getAllByRole('button');
            fireEvent.click(buttons[1]); // Regenerate button

            await waitFor(() => {
                expect(screen.getByText('Regenerate Response?')).toBeInTheDocument();
                expect(screen.getByText(/This will create a new response/i)).toBeInTheDocument();
            });
        });

        it('should call onRegenerate when confirmed', async () => {
            const onRegenerate = vi.fn();
            renderWithTheme(
                <MessageActions message={mockAssistantMessage} onRegenerate={onRegenerate} />
            );

            const buttons = screen.getAllByRole('button');
            fireEvent.click(buttons[1]); // Open dialog

            await waitFor(() => {
                const regenerateButton = screen.getByRole('button', { name: /regenerate/i });
                fireEvent.click(regenerateButton);
            });

            expect(onRegenerate).toHaveBeenCalledWith('msg-1');
        });

        it('should not call onRegenerate when cancelled', async () => {
            const onRegenerate = vi.fn();
            renderWithTheme(
                <MessageActions message={mockAssistantMessage} onRegenerate={onRegenerate} />
            );

            const buttons = screen.getAllByRole('button');
            fireEvent.click(buttons[1]); // Open dialog

            await waitFor(() => {
                const cancelButton = screen.getByRole('button', { name: /cancel/i });
                fireEvent.click(cancelButton);
            });

            expect(onRegenerate).not.toHaveBeenCalled();
        });
    });
});
