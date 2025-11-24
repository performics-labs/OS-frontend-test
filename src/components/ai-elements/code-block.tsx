/**
 * CodeBlock component using react-syntax-highlighter (Prism).
 *
 * NOTE: This component is for STANDALONE code block usage outside of markdown content.
 * For markdown rendering (including code blocks), use the Response component which
 * leverages Streamdown's built-in Shiki syntax highlighting.
 *
 * Use this component when you need to display code blocks independently,
 * not as part of markdown content (e.g., in documentation, tutorials, or UI examples).
 */

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckIcon, CopyIcon } from 'lucide-react';
import type { ComponentProps, HTMLAttributes, ReactNode } from 'react';
import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

export type CodeBlockProps = HTMLAttributes<HTMLDivElement> & {
    code: string;
    language: string;
    showLineNumbers?: boolean;
    theme?: 'light' | 'dark';
    children?: ReactNode;
};

export const CodeBlock = ({
    code,
    language,
    showLineNumbers = false,
    theme = 'light',
    className,
    children,
    ...props
}: CodeBlockProps) => {
    const style = theme === 'dark' ? oneDark : oneLight;

    return (
        <div
            className={cn(
                'bg-background text-foreground relative w-full overflow-hidden rounded-md border',
                className
            )}
            role="region"
            aria-label={`Code block in ${language}`}
            {...props}
        >
            <div className="relative">
                <SyntaxHighlighter
                    className="overflow-hidden"
                    codeTagProps={{
                        className: 'font-mono text-sm',
                    }}
                    customStyle={{
                        margin: 0,
                        padding: '1rem',
                        fontSize: '0.875rem',
                        background: 'hsl(var(--background))',
                        color: 'hsl(var(--foreground))',
                    }}
                    language={language}
                    lineNumberStyle={{
                        color: 'hsl(var(--muted-foreground))',
                        paddingRight: '1rem',
                        minWidth: '2.5rem',
                    }}
                    showLineNumbers={showLineNumbers}
                    style={style}
                >
                    {code}
                </SyntaxHighlighter>
                {children && (
                    <div className="absolute top-2 right-2 flex items-center gap-2">{children}</div>
                )}
            </div>
        </div>
    );
};

export type CodeBlockCopyButtonProps = Omit<ComponentProps<typeof Button>, 'onClick'> & {
    code: string;
    onCopy?: () => void;
    onError?: (error: Error) => void;
    timeout?: number;
};

export const CodeBlockCopyButton = ({
    code,
    onCopy,
    onError,
    timeout = 2000,
    children,
    className,
    ...props
}: CodeBlockCopyButtonProps) => {
    const [isCopied, setIsCopied] = useState(false);

    const copyToClipboard = async () => {
        if (typeof window === 'undefined' || !navigator.clipboard.writeText) {
            onError?.(new Error('Clipboard API not available'));
            return;
        }

        try {
            await navigator.clipboard.writeText(code);
            setIsCopied(true);
            onCopy?.();
            setTimeout(() => setIsCopied(false), timeout);
        } catch (error) {
            onError?.(error as Error);
        }
    };

    const Icon = isCopied ? CheckIcon : CopyIcon;

    return (
        <Button
            className={cn('shrink-0', className)}
            onClick={copyToClipboard}
            size="icon"
            variant="ghost"
            aria-label={isCopied ? 'Code copied!' : 'Copy code to clipboard'}
            aria-live="polite"
            {...props}
        >
            {children ?? <Icon size={14} />}
        </Button>
    );
};
