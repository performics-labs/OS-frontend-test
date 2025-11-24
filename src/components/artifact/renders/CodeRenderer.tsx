import { EditorView } from '@codemirror/view';
import { EditorState, Transaction, Compartment } from '@codemirror/state';
import type { Extension } from '@codemirror/state';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { basicSetup } from 'codemirror';
import { vscodeLight, vscodeDark } from '@uiw/codemirror-theme-vscode';
import { memo, useEffect, useRef, useMemo } from 'react';
import { useThemeContext } from '@/hooks/useThemeContext';
import type { Artifact } from '@/types/artifacts';

interface CodeRendererProps {
    artifact: Artifact;
    onContentChange?: (content: string) => void;
    status?: 'streaming' | 'idle';
}

/**
 * Get CodeMirror language extension based on artifact language
 */
function getLanguageExtension(language?: string): Extension {
    if (!language) return python();

    const lang = language.toLowerCase();

    if (lang === 'python' || lang === 'py') {
        return python();
    }

    if (
        lang === 'javascript' ||
        lang === 'js' ||
        lang === 'jsx' ||
        lang === 'typescript' ||
        lang === 'ts' ||
        lang === 'tsx'
    ) {
        return javascript({
            jsx: lang === 'jsx' || lang === 'tsx',
            typescript: lang === 'typescript' || lang === 'ts' || lang === 'tsx',
        });
    }

    return python();
}

function PureCodeRenderer({ artifact, status = 'idle' }: CodeRendererProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<EditorView | null>(null);
    const themeCompartment = useRef(new Compartment());
    const { theme } = useThemeContext();

    const languageExtension = useMemo(
        () => getLanguageExtension(artifact.language),
        [artifact.language]
    );

    useEffect(() => {
        if (containerRef.current && !editorRef.current) {
            const themeExtension = theme === 'dark' ? vscodeDark : vscodeLight;

            const startState = EditorState.create({
                doc: artifact.content,
                extensions: [
                    basicSetup,
                    languageExtension,
                    themeCompartment.current.of(themeExtension),
                ],
            });

            editorRef.current = new EditorView({
                state: startState,
                parent: containerRef.current,
            });
        }

        return () => {
            if (editorRef.current) {
                editorRef.current.destroy();
                editorRef.current = null;
            }
        };
    }, [artifact.content, languageExtension, theme]);

    useEffect(() => {
        if (editorRef.current) {
            const themeExtension = theme === 'dark' ? vscodeDark : vscodeLight;
            editorRef.current.dispatch({
                effects: themeCompartment.current.reconfigure(themeExtension),
            });
        }
    }, [theme]);

    useEffect(() => {
        if (editorRef.current && artifact.content) {
            const currentContent = editorRef.current.state.doc.toString();

            if (status === 'streaming' || currentContent !== artifact.content) {
                const transaction = editorRef.current.state.update({
                    changes: {
                        from: 0,
                        to: currentContent.length,
                        insert: artifact.content,
                    },
                    annotations: [Transaction.remote.of(true)],
                });

                editorRef.current.dispatch(transaction);
            }
        }
    }, [artifact.content, status]);

    return (
        <div className="flex flex-col overflow-x-auto px-1">
            <div className="relative min-w-0 text-sm" ref={containerRef} />
        </div>
    );
}

function areEqual(prevProps: CodeRendererProps, nextProps: CodeRendererProps) {
    if (prevProps.status === 'streaming' && nextProps.status === 'streaming') return false;
    if (prevProps.artifact.content !== nextProps.artifact.content) return false;
    if (prevProps.artifact.updatedAt !== nextProps.artifact.updatedAt) return false;

    return true;
}

export const CodeRenderer = memo(PureCodeRenderer, areEqual);
export default CodeRenderer;
