import { fireEvent, render, screen } from '@testing-library/react';
import { PromptCard } from '@/components/PromptCard';
import type { ChatPrompt } from '@/types';

describe('PromptCard', () => {
    const mockPrompt: ChatPrompt = {
        id: '1',
        title: 'Test Prompt',
        description: 'This is a test description',
        prompt: 'Full test prompt text',
        icon: 'lightbulb',
    };

    const mockOnClick = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render prompt data correctly', () => {
        render(<PromptCard prompt={mockPrompt} onClick={mockOnClick} />);

        expect(screen.getByText('Test Prompt')).toBeInTheDocument();
        expect(screen.getByText('This is a test description')).toBeInTheDocument();
    });

    it('should render icon when provided', () => {
        render(<PromptCard prompt={mockPrompt} onClick={mockOnClick} />);

        const card = screen.getByRole('button');
        expect(card).toBeInTheDocument();
    });

    it('should handle click events', () => {
        render(<PromptCard prompt={mockPrompt} onClick={mockOnClick} />);

        const card = screen.getByRole('button');
        fireEvent.click(card);

        expect(mockOnClick).toHaveBeenCalledTimes(1);
        expect(mockOnClick).toHaveBeenCalledWith(mockPrompt);
    });

    it('should handle Enter key press', () => {
        render(<PromptCard prompt={mockPrompt} onClick={mockOnClick} />);

        const card = screen.getByRole('button');
        fireEvent.keyDown(card, { key: 'Enter' });

        expect(mockOnClick).toHaveBeenCalledTimes(1);
        expect(mockOnClick).toHaveBeenCalledWith(mockPrompt);
    });

    it('should handle Space key press', () => {
        render(<PromptCard prompt={mockPrompt} onClick={mockOnClick} />);

        const card = screen.getByRole('button');
        fireEvent.keyDown(card, { key: ' ' });

        expect(mockOnClick).toHaveBeenCalledTimes(1);
        expect(mockOnClick).toHaveBeenCalledWith(mockPrompt);
    });

    it('should be keyboard focusable', () => {
        render(<PromptCard prompt={mockPrompt} onClick={mockOnClick} />);

        const card = screen.getByRole('button');
        expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('should have accessible label', () => {
        render(<PromptCard prompt={mockPrompt} onClick={mockOnClick} />);

        const card = screen.getByRole('button');
        expect(card).toHaveAttribute(
            'aria-label',
            'Select prompt: Test Prompt This is a test description'
        );
    });

    it('should render without icon if not provided', () => {
        const promptWithoutIcon: ChatPrompt = {
            ...mockPrompt,
            icon: undefined,
        };

        render(<PromptCard prompt={promptWithoutIcon} onClick={mockOnClick} />);

        expect(screen.getByText('Test Prompt')).toBeInTheDocument();
    });

    it('should not call onClick when onClick is not provided', () => {
        render(<PromptCard prompt={mockPrompt} />);

        const card = screen.getByRole('button');
        fireEvent.click(card);

        expect(mockOnClick).not.toHaveBeenCalled();
    });
});
