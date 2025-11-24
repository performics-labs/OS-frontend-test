import { render as rtlRender, type RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '@/components/ThemeProvider';
import type { ReactElement } from 'react';

/**
 * Custom render function that wraps components with necessary providers
 */
export function render(ui: ReactElement, options?: RenderOptions) {
    return rtlRender(<ThemeProvider>{ui}</ThemeProvider>, options);
}
