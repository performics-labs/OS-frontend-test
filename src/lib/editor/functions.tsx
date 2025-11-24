import { defaultMarkdownParser, defaultMarkdownSerializer } from 'prosemirror-markdown';
import { type Node } from 'prosemirror-model';
import type { Transaction } from 'prosemirror-state';
import { Decoration, DecorationSet, type EditorView } from 'prosemirror-view';
import type { MutableRefObject } from 'react';

import { createSuggestionWidget, type UISuggestion } from './suggestions';
import { documentSchema } from './config';

export const buildDocumentFromContent = (content: string) => {
    try {
        const doc = defaultMarkdownParser.parse(content);
        return doc || documentSchema.node('doc', null, [documentSchema.node('paragraph')]);
    } catch (error) {
        console.error('Failed to parse markdown content:', error);
        return documentSchema.node('doc', null, [documentSchema.node('paragraph')]);
    }
};

export const buildContentFromDocument = (document: Node) => {
    return defaultMarkdownSerializer.serialize(document);
};

export const handleTransaction = ({
    transaction,
    editorRef,
    onSaveContent,
}: {
    transaction: Transaction;
    editorRef: MutableRefObject<EditorView | null>;
    onSaveContent: (updatedContent: string, debounce?: boolean) => void;
}) => {
    if (!editorRef || !editorRef.current) return;

    const newState = editorRef.current.state.apply(transaction);
    editorRef.current.updateState(newState);

    if (transaction.docChanged && !transaction.getMeta('no-save')) {
        const updatedContent = buildContentFromDocument(newState.doc);

        if (transaction.getMeta('no-debounce')) {
            onSaveContent(updatedContent, false);
        } else {
            onSaveContent(updatedContent, true);
        }
    }
};

export const createDecorations = (suggestions: Array<UISuggestion>, view: EditorView) => {
    const decorations: Array<Decoration> = [];

    for (const suggestion of suggestions) {
        decorations.push(
            Decoration.inline(
                suggestion.selectionStart,
                suggestion.selectionEnd,
                {
                    class: 'suggestion-highlight',
                },
                {
                    suggestionId: suggestion.id,
                    type: 'highlight',
                }
            )
        );

        decorations.push(
            Decoration.widget(
                suggestion.selectionStart,
                (view) => {
                    const { dom } = createSuggestionWidget(suggestion, view);
                    return dom;
                },
                {
                    suggestionId: suggestion.id,
                    type: 'widget',
                }
            )
        );
    }

    return DecorationSet.create(view.state.doc, decorations);
};
