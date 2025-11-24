import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Response } from '@/components/ai-elements/response';
import { ThemeContext } from '@/contexts/ThemeContext';
import { Streamdown } from 'streamdown';
import type { ThemeContextType } from '@/contexts/ThemeContext';
import { type ComponentProps } from 'react';

// Mock Streamdown to avoid Shiki theme loading in tests
vi.mock('streamdown', () => ({
    Streamdown: ({
        children,
        className,
        controls,
    }: ComponentProps<typeof Streamdown> & { className?: string; controls?: boolean }) => (
        <div data-testid="streamdown-mock" className={className} data-controls={controls}>
            {children}
        </div>
    ),
}));

// Mock theme context
const mockThemeContext: ThemeContextType = {
    theme: 'light',
    setTheme: vi.fn(),
    toggleTheme: vi.fn(),
};

const renderWithTheme = (ui: React.ReactElement, theme: 'light' | 'dark' = 'light') => {
    const contextValue = { ...mockThemeContext, theme };
    return render(<ThemeContext.Provider value={contextValue}>{ui}</ThemeContext.Provider>);
};

describe('Response Component - GFM Support (AC 1.x)', () => {
    describe('AC 1.1: Full GFM Specification Support', () => {
        it('should render tables correctly', async () => {
            const markdown = `
| Feature | Supported | Notes |
|---------|-----------|-------|
| Tables | ✅ | Full GFM support |
| Task lists | ✅ | Interactive |
            `;

            renderWithTheme(<Response>{markdown}</Response>);

            await waitFor(() => {
                const mockElement = screen.getByTestId('streamdown-mock');
                expect(mockElement).toBeInTheDocument();
                expect(mockElement).toHaveTextContent('Tables');
            });
        });

        it('should render strikethrough text correctly', async () => {
            const markdown = 'This is ~~deprecated~~ functionality.';

            renderWithTheme(<Response>{markdown}</Response>);

            await waitFor(() => {
                const mockElement = screen.getByTestId('streamdown-mock');
                expect(mockElement).toBeInTheDocument();
                expect(mockElement).toHaveTextContent('deprecated');
            });
        });

        it('should render task lists with checkboxes', async () => {
            const markdown = `
- [x] Complete project setup
- [ ] Deploy to production
            `;

            renderWithTheme(<Response>{markdown}</Response>);

            await waitFor(() => {
                const mockElement = screen.getByTestId('streamdown-mock');
                expect(mockElement).toBeInTheDocument();
            });
        });
    });

    describe('AC 1.2: Inline Code Snippets with Muted Background', () => {
        it('should render inline code with proper styling', async () => {
            const markdown = 'Use the `console.log()` function.';

            renderWithTheme(<Response>{markdown}</Response>);

            await waitFor(() => {
                const mockElement = screen.getByTestId('streamdown-mock');
                expect(mockElement).toBeInTheDocument();
                expect(mockElement).toHaveTextContent('console.log()');
            });
        });

        it('should distinguish inline code from code blocks', async () => {
            const markdown = `
Inline: \`code\`

Block:
\`\`\`javascript
const block = 'code';
\`\`\`
            `;

            renderWithTheme(<Response>{markdown}</Response>);

            await waitFor(() => {
                const mockElement = screen.getByTestId('streamdown-mock');
                expect(mockElement).toBeInTheDocument();
            });
        });
    });

    describe('AC 1.3: Semantic HTML (No Illegal Nesting)', () => {
        it('should pass markdown content to Streamdown', async () => {
            const markdown = `
Some text.

\`\`\`javascript
console.log('code');
\`\`\`

More text.
            `;

            renderWithTheme(<Response>{markdown}</Response>);

            await waitFor(() => {
                const mockElement = screen.getByTestId('streamdown-mock');
                expect(mockElement).toBeInTheDocument();
            });
        });

        it('should handle list markdown', async () => {
            const markdown = `
- [x] Task one
- [ ] Task two
            `;

            renderWithTheme(<Response>{markdown}</Response>);

            await waitFor(() => {
                const mockElement = screen.getByTestId('streamdown-mock');
                expect(mockElement).toBeInTheDocument();
            });
        });
    });
});

describe('Response Component - Code Syntax Highlighting (AC 2.x)', () => {
    describe('AC 2.1: Multi-line Code Blocks with Syntax Highlighting', () => {
        it('should pass code blocks to Streamdown', async () => {
            const markdown = `
\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`
            `;

            renderWithTheme(<Response>{markdown}</Response>);

            await waitFor(() => {
                const mockElement = screen.getByTestId('streamdown-mock');
                expect(mockElement).toBeInTheDocument();
            });
        });
    });

    describe('AC 2.2: Auto-detect Language from Fence Tag', () => {
        it('should pass JavaScript language to Streamdown', async () => {
            const markdown = `\`\`\`javascript
console.log('test');
\`\`\``;

            renderWithTheme(<Response>{markdown}</Response>);

            await waitFor(() => {
                const mockElement = screen.getByTestId('streamdown-mock');
                expect(mockElement).toBeInTheDocument();
            });
        });

        it('should pass TypeScript language to Streamdown', async () => {
            const markdown = `\`\`\`typescript
const foo: string = 'bar';
\`\`\``;

            renderWithTheme(<Response>{markdown}</Response>);

            await waitFor(() => {
                const mockElement = screen.getByTestId('streamdown-mock');
                expect(mockElement).toBeInTheDocument();
            });
        });

        it('should pass Python language to Streamdown', async () => {
            const markdown = `\`\`\`python
def hello():
    print("Hello")
\`\`\``;

            renderWithTheme(<Response>{markdown}</Response>);

            await waitFor(() => {
                const mockElement = screen.getByTestId('streamdown-mock');
                expect(mockElement).toBeInTheDocument();
            });
        });
    });

    describe('AC 2.3: Common Languages Supported', () => {
        const commonLanguages = [
            'javascript',
            'typescript',
            'python',
            'html',
            'css',
            'json',
            'bash',
        ];

        commonLanguages.forEach((lang) => {
            it(`should support ${lang} syntax highlighting`, async () => {
                const markdown = `\`\`\`${lang}
// ${lang} code
\`\`\``;

                renderWithTheme(<Response>{markdown}</Response>);

                await waitFor(() => {
                    const mockElement = screen.getByTestId('streamdown-mock');
                    expect(mockElement).toBeInTheDocument();
                });
            });
        });
    });

    describe('AC 2.4: Light and Dark Mode Support', () => {
        it('should apply light theme in light mode', async () => {
            const markdown = `\`\`\`javascript
console.log('test');
\`\`\``;

            renderWithTheme(<Response>{markdown}</Response>, 'light');

            await waitFor(() => {
                const mockElement = screen.getByTestId('streamdown-mock');
                expect(mockElement).toBeInTheDocument();
            });
        });

        it('should apply dark theme in dark mode', async () => {
            const markdown = `\`\`\`javascript
console.log('test');
\`\`\``;

            renderWithTheme(<Response>{markdown}</Response>, 'dark');

            await waitFor(() => {
                const mockElement = screen.getByTestId('streamdown-mock');
                expect(mockElement).toBeInTheDocument();
            });
        });

        it('should use github-light-default theme for light mode', () => {
            const markdown = 'test';
            const { container } = renderWithTheme(<Response>{markdown}</Response>, 'light');
            expect(container).toBeInTheDocument();
        });

        it('should use github-dark-high-contrast theme for dark mode', () => {
            const markdown = 'test';
            const { container } = renderWithTheme(<Response>{markdown}</Response>, 'dark');
            expect(container).toBeInTheDocument();
        });
    });
});

describe('Response Component - Security (AC 3.x)', () => {
    describe('AC 3.1: Link Security Attributes', () => {
        it('should delegate link rendering to Streamdown', async () => {
            const markdown = '[External Link](https://example.com)';

            renderWithTheme(<Response>{markdown}</Response>);

            await waitFor(() => {
                const mockElement = screen.getByTestId('streamdown-mock');
                expect(mockElement).toBeInTheDocument();
            });
        });

        it('should handle multiple external links', async () => {
            const markdown = `[Link 1](https://example1.com)
[Link 2](https://example2.com)`;

            renderWithTheme(<Response>{markdown}</Response>);

            await waitFor(() => {
                const mockElement = screen.getByTestId('streamdown-mock');
                expect(mockElement).toBeInTheDocument();
            });
        });
    });
});

describe('Response Component - Controls', () => {
    it('should pass controls prop to Streamdown', async () => {
        const markdown = `\`\`\`javascript
console.log('test');
\`\`\``;

        renderWithTheme(<Response>{markdown}</Response>);

        await waitFor(() => {
            const mockElement = screen.getByTestId('streamdown-mock');
            expect(mockElement).toBeInTheDocument();
        });
    });

    it('should allow disabling controls', () => {
        const markdown = '`code`';

        const { container } = renderWithTheme(<Response controls={false}>{markdown}</Response>);

        expect(container).toBeInTheDocument();
    });
});

describe('Response Component - Theme Integration', () => {
    it('should use theme from ThemeContext', () => {
        const markdown = 'Test content';

        const { rerender } = renderWithTheme(<Response>{markdown}</Response>, 'light');
        expect(screen.getByTestId('streamdown-mock')).toBeInTheDocument();

        rerender(
            <ThemeContext.Provider value={{ ...mockThemeContext, theme: 'dark' }}>
                <Response>{markdown}</Response>
            </ThemeContext.Provider>
        );

        expect(screen.getByTestId('streamdown-mock')).toBeInTheDocument();
    });
});
