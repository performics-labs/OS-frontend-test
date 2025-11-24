import { fireEvent, screen, waitFor, act } from '@testing-library/react';
import { ChatInterface } from '@/components/ChatInterface';
import { renderWithTheme } from '../../utils/test-utils';

describe('ChatInterface', () => {
    const mockOnSubmit = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render with empty state', () => {
        renderWithTheme(<ChatInterface />);

        // ChatInterface should render input and submit button
        expect(screen.getByLabelText('Chat message input')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();

        // No messages should be displayed initially
        expect(screen.queryByRole('article')).not.toBeInTheDocument();
    });

    it('should auto-submit initial prompt', async () => {
        const initialPrompt = 'Test initial prompt';

        await act(async () => {
            renderWithTheme(<ChatInterface initialPrompt={initialPrompt} />);
        });

        const input = screen.getByLabelText('Chat message input');
        expect(input).toHaveValue('');

        await waitFor(
            () => {
                expect(screen.getByText(initialPrompt)).toBeInTheDocument();
            },
            { timeout: 2000 }
        );
    });

    it('should update input value on change', () => {
        renderWithTheme(<ChatInterface />);

        const input = screen.getByLabelText('Chat message input');
        fireEvent.change(input, { target: { value: 'Hello, world!' } });

        expect(input).toHaveValue('Hello, world!');
    });

    it('should submit message and clear input', async () => {
        renderWithTheme(<ChatInterface onSubmit={mockOnSubmit} />);

        const input = screen.getByLabelText('Chat message input');
        const submitButton = screen.getByRole('button', { name: /send message/i });

        fireEvent.change(input, { target: { value: 'Test message' } });
        fireEvent.click(submitButton);

        expect(mockOnSubmit).toHaveBeenCalledWith('Test message');

        // Input should be cleared immediately after submission
        expect(input).toHaveValue('');
    });

    it('should display user message after submission', async () => {
        renderWithTheme(<ChatInterface />);

        const input = screen.getByLabelText('Chat message input');
        fireEvent.change(input, { target: { value: 'User message' } });
        fireEvent.click(screen.getByRole('button', { name: /send message/i }));

        await waitFor(() => {
            const messages = screen.getAllByText('User message');
            expect(messages.length).toBeGreaterThan(0);
        });
    });

    it('should display mock assistant response', async () => {
        renderWithTheme(<ChatInterface />);

        const input = screen.getByLabelText('Chat message input');
        fireEvent.change(input, { target: { value: 'Test question' } });
        fireEvent.click(screen.getByRole('button', { name: /send message/i }));

        await waitFor(
            () => {
                const messages = screen.getAllByText(/Test question/i);
                expect(messages.length).toBeGreaterThan(0);
            },
            { timeout: 2000 }
        );
    });

    it('should disable submit button when input is empty', () => {
        renderWithTheme(<ChatInterface />);

        const submitButton = screen.getByRole('button', { name: /send message/i });
        expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when input has text', () => {
        renderWithTheme(<ChatInterface />);

        const input = screen.getByLabelText('Chat message input');
        const submitButton = screen.getByRole('button', { name: /send message/i });

        fireEvent.change(input, { target: { value: 'Test' } });

        expect(submitButton).not.toBeDisabled();
    });

    it('should not submit empty messages', () => {
        renderWithTheme(<ChatInterface onSubmit={mockOnSubmit} />);

        const input = screen.getByLabelText('Chat message input');
        fireEvent.change(input, { target: { value: '   ' } });

        const submitButton = screen.getByRole('button', { name: /send message/i });
        fireEvent.click(submitButton);

        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should handle form submission with Enter key', () => {
        renderWithTheme(<ChatInterface onSubmit={mockOnSubmit} />);

        const input = screen.getByLabelText('Chat message input');
        fireEvent.change(input, { target: { value: 'Test message' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', shiftKey: false });

        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
        expect(mockOnSubmit).toHaveBeenCalledWith('Test message');
    });

    it('should have accessible form controls', () => {
        renderWithTheme(<ChatInterface />);

        const input = screen.getByLabelText('Chat message input');
        expect(input).toHaveAttribute('aria-label', 'Chat message input');

        const submitButton = screen.getByRole('button', { name: /send message/i });
        expect(submitButton).toHaveAttribute('aria-label', 'Send message');
    });
});
