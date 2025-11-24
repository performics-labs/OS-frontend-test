import { cn } from '@/lib/utils';
import { useThemeContext } from '@/hooks/useThemeContext';
import { type ComponentProps, memo } from 'react';
import { Streamdown } from 'streamdown';
import type { BundledTheme } from 'shiki';

type ResponseProps = ComponentProps<typeof Streamdown>;

/**
 * Response component for rendering markdown content with GFM support and syntax highlighting.
 *
 * Features:
 * - Full GitHub Flavored Markdown support (tables, strikethrough, task lists)
 * - Syntax highlighting with Shiki (theme-aware)
 * - Built-in copy buttons for code blocks (via controls prop)
 * - Security: rehype-harden plugin adds rel="noopener noreferrer" to external links by default
 * - Streaming support for AI-generated content
 */
export const Response = memo(
    ({ className, shikiTheme, controls = true, ...props }: ResponseProps) => {
        const { theme } = useThemeContext();

        const defaultShikiTheme: [BundledTheme, BundledTheme] =
            theme === 'dark'
                ? ['github-dark-high-contrast', 'github-dark-high-contrast']
                : ['github-light-default', 'github-light-default'];

        return (
            <Streamdown
                className={cn('size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0', className)}
                shikiTheme={shikiTheme ?? defaultShikiTheme}
                controls={controls}
                {...props}
            />
        );
    },
    (prevProps, nextProps) => prevProps.children === nextProps.children
);

Response.displayName = 'Response';
