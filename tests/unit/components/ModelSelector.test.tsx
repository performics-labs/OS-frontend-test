import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ModelSelector } from '@/components/ModelSelector';
import { useModel } from '@/hooks';
import { DEFAULT_MODEL_OPTION } from '@/constants';

// Mock the useModel hook
vi.mock('@/hooks', () => ({
    useModel: vi.fn(),
}));

const mockModels = [
    {
        id: 'model-1',
        name: 'Test Model 1',
        description: 'Test Description 1',
        provider: 'test',
        badge: 'new',
    },
    DEFAULT_MODEL_OPTION,
];

describe('ModelSelector', () => {
    const mockSetCurrentModel = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useModel as ReturnType<typeof vi.fn>).mockReturnValue({
            models: mockModels,
            isLoading: false,
            currentModel: DEFAULT_MODEL_OPTION,
            setCurrentModel: mockSetCurrentModel,
        });
    });

    it('renders with current model name', () => {
        render(<ModelSelector />);
        // ModelSelector displays model name
        expect(screen.getByText(DEFAULT_MODEL_OPTION.name)).toBeInTheDocument();
    });

    it('handles model selection', async () => {
        render(<ModelSelector />);

        // Open dropdown
        fireEvent.click(screen.getByRole('combobox'));

        // Select new model
        const modelOption = screen.getByText('Test Model 1');
        fireEvent.click(modelOption);

        expect(mockSetCurrentModel).toHaveBeenCalledWith(mockModels[0]);
    });
});
