import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { ThemeContext, type ThemeContextType } from '@/contexts/ThemeContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { DataStreamProvider } from '@/contexts/DataStreamProvider';

const mockThemeContext: ThemeContextType = {
    theme: 'light',
    setTheme: vi.fn(),
    toggleTheme: vi.fn(),
};

export const renderWithTheme = (ui: React.ReactElement, theme: 'light' | 'dark' = 'light') => {
    const contextValue = { ...mockThemeContext, theme };
    return render(
        <ThemeContext.Provider value={contextValue}>
            <DataStreamProvider>
                <TooltipProvider>{ui}</TooltipProvider>
            </DataStreamProvider>
        </ThemeContext.Provider>
    );
};
