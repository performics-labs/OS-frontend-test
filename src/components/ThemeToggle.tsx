import { useThemeContext } from '@/hooks/useThemeContext';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
    const { theme, toggleTheme } = useThemeContext();

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="flex items-center gap-2"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            {theme === 'dark' ? (
                <>
                    <span className="text-lg">☀</span>
                    <span>Light</span>
                </>
            ) : (
                <>
                    <span className="text-lg">☾</span>
                    <span>Dark</span>
                </>
            )}
        </Button>
    );
}
