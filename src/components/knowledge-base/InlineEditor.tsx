import { useEffect, useRef, useCallback, useState } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from '@tiptap/markdown';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Code,
    Quote,
    Undo,
    Redo,
    Table as TableIcon,
    AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type InlineEditorProps = {
    content: string;
    onUpdate: (content: string) => void;
    placeholder?: string;
    editable?: boolean;
    className?: string;
};

function EditorToolbar({ editor }: { editor: Editor | null }) {
    if (!editor) return null;

    return (
        <div className="border-border bg-background/95 sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b p-2 backdrop-blur">
            <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={cn(editor.isActive('bold') && 'bg-accent')}
                aria-label="Bold"
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={cn(editor.isActive('italic') && 'bg-accent')}
                aria-label="Italic"
            >
                <Italic className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => editor.chain().focus().toggleCode().run()}
                disabled={!editor.can().chain().focus().toggleCode().run()}
                className={cn(editor.isActive('code') && 'bg-accent')}
                aria-label="Inline code"
            >
                <Code className="h-4 w-4" />
            </Button>

            <div className="border-border mx-1 h-6 w-px border-l" />

            <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn(editor.isActive('bulletList') && 'bg-accent')}
                aria-label="Bullet list"
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn(editor.isActive('orderedList') && 'bg-accent')}
                aria-label="Numbered list"
            >
                <ListOrdered className="h-4 w-4" />
            </Button>

            <div className="border-border mx-1 h-6 w-px border-l" />

            <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={cn(editor.isActive('codeBlock') && 'bg-accent')}
                aria-label="Code block"
            >
                <Code className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={cn(editor.isActive('blockquote') && 'bg-accent')}
                aria-label="Quote"
            >
                <Quote className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()}
                aria-label="Insert table"
            >
                <TableIcon className="h-4 w-4" />
            </Button>

            <div className="border-border mx-1 h-6 w-px border-l" />

            <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                aria-label="Undo"
            >
                <Undo className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                aria-label="Redo"
            >
                <Redo className="h-4 w-4" />
            </Button>
        </div>
    );
}

export function InlineEditor({
    content,
    onUpdate,
    placeholder = 'Start writing...',
    editable = true,
    className,
}: InlineEditorProps) {
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const [parseError, setParseError] = useState<string | null>(null);

    const handleUpdate = useCallback(
        (editor: Editor) => {
            try {
                // @ts-ignore - getMarkdown is added by Markdown extension
                const markdown = editor.getMarkdown();

                if (debounceTimerRef.current) {
                    clearTimeout(debounceTimerRef.current);
                }

                debounceTimerRef.current = setTimeout(() => {
                    onUpdate(markdown);
                }, 2000);
            } catch (error) {
                console.error('Error getting markdown:', error);
            }
        },
        [onUpdate]
    );

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: {
                    HTMLAttributes: {
                        class: 'bg-muted rounded p-4 font-mono text-sm',
                    },
                },
                code: {
                    HTMLAttributes: {
                        class: 'bg-muted rounded px-1.5 py-0.5 font-mono text-sm',
                    },
                },
                blockquote: {
                    HTMLAttributes: {
                        class: 'border-l-4 border-border pl-4 italic',
                    },
                },
            }),
            Markdown,
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: 'border-collapse table-auto w-full border border-border',
                },
            }),
            TableRow.configure({
                HTMLAttributes: {
                    class: 'border-b border-border',
                },
            }),
            TableCell.configure({
                HTMLAttributes: {
                    class: 'border border-border p-2',
                },
            }),
            TableHeader.configure({
                HTMLAttributes: {
                    class: 'border border-border bg-muted p-2 font-semibold',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
            TextStyle,
            Color,
        ],
        content: '',
        editable,
        onUpdate: ({ editor }) => handleUpdate(editor),
        editorProps: {
            attributes: {
                class: cn(
                    'prose prose-sm dark:prose-invert max-w-none',
                    'focus:outline-none min-h-[200px] p-4',
                    'leading-normal [&_p]:leading-normal [&_li]:leading-normal',
                    '[&_table]:my-2 [&_td]:py-0 [&_td]:px-2 [&_th]:py-0 [&_th]:px-2',
                    className
                ),
            },
        },
    });

    useEffect(() => {
        if (editor && content) {
            try {
                // @ts-ignore - getMarkdown is added by Markdown extension
                const currentMarkdown = editor.getMarkdown();
                if (content !== currentMarkdown) {
                    // Set content as markdown directly
                    editor.commands.setContent(content, { contentType: 'markdown' });
                    setParseError(null);
                }
            } catch (error) {
                console.error('Error setting markdown content:', error);
                setParseError('Unable to parse markdown. Showing as plain text.');
                // Fallback: show as code block
                try {
                    editor.commands.setContent({
                        type: 'doc',
                        content: [
                            {
                                type: 'codeBlock',
                                content: [
                                    {
                                        type: 'text',
                                        text: content,
                                    },
                                ],
                            },
                        ],
                    });
                } catch (fallbackError) {
                    console.error('Error setting fallback content:', fallbackError);
                }
            }
        }
    }, [content, editor]);

    useEffect(() => {
        if (editor) {
            editor.setEditable(editable);
        }
    }, [editable, editor]);

    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    if (!editor) {
        return null;
    }

    return (
        <div className="border-border flex flex-col rounded-lg border">
            {parseError && (
                <div className="bg-destructive/10 text-destructive border-destructive/20 flex items-start gap-2 border-b p-3 text-sm">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <div>
                        <p className="font-medium">Markdown Parsing Error</p>
                        <p className="text-muted-foreground mt-1 text-xs">{parseError}</p>
                    </div>
                </div>
            )}
            {editable && <EditorToolbar editor={editor} />}
            <EditorContent editor={editor} />
        </div>
    );
}
