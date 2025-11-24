import { useEffect, useState, type ReactNode } from 'react';
import { ThemeContext, type Theme } from '@/contexts/ThemeContext';

const THEME_STORAGE_KEY = 'onesuite-theme';
const DEFAULT_THEME: Theme = 'dark';

type ThemeProviderProps = {
    children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(() => {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        return (stored as Theme) || DEFAULT_THEME;
    });

    useEffect(() => {
        const root = document.documentElement;

        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
