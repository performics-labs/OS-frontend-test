import type { Node } from 'prosemirror-model';
import { Plugin, PluginKey } from 'prosemirror-state';
import { type Decoration, DecorationSet, type EditorView } from 'prosemirror-view';
import { createRoot } from 'react-dom/client';

import type { Suggestion } from '@/types/suggestion';

export type UISuggestion = Suggestion & {
    selectionStart: number;
    selectionEnd: number;
};

type Position = {
    start: number;
    end: number;
};

function findPositionsInDoc(doc: Node, searchText: string): Position | null {
    let positions: { start: number; end: number } | null = null;

    doc.nodesBetween(0, doc.content.size, (node, pos) => {
        if (node.isText && node.text) {
            const index = node.text.indexOf(searchText);

            if (index !== -1) {
                positions = {
                    start: pos + index,
                    end: pos + index + searchText.length,
                };

                return false;
            }
        }

        return true;
    });

    return positions;
}

export function projectWithPositions(
    doc: Node,
    suggestions: Array<Suggestion>
): Array<UISuggestion> {
    return suggestions.map((suggestion) => {
        const positions = findPositionsInDoc(doc, suggestion.originalText);

        if (!positions) {
            return {
                ...suggestion,
                selectionStart: 0,
                selectionEnd: 0,
            };
        }

        return {
            ...suggestion,
            selectionStart: positions.start,
            selectionEnd: positions.end,
        };
    });
}

export function createSuggestionWidget(
    suggestion: UISuggestion,
    view: EditorView
): { dom: HTMLElement; destroy: () => void } {
    const dom = document.createElement('span');
    const root = createRoot(dom);

    dom.addEventListener('mousedown', (event) => {
        event.preventDefault();
        view.dom.blur();
    });

    const onApply = () => {
        const { state, dispatch } = view;

        const decorationTransaction = state.tr;
        const currentState = suggestionsPluginKey.getState(state);
        const currentDecorations = currentState?.decorations;

        if (currentDecorations) {
            const newDecorations = DecorationSet.create(
                state.doc,
                currentDecorations.find().filter((decoration: Decoration) => {
                    return decoration.spec.suggestionId !== suggestion.id;
                })
            );

            decorationTransaction.setMeta(suggestionsPluginKey, {
                decorations: newDecorations,
                selected: null,
            });
            dispatch(decorationTransaction);
        }

        const textTransaction = view.state.tr.replaceWith(
            suggestion.selectionStart,
            suggestion.selectionEnd,
            state.schema.text(suggestion.suggestedText)
        );

        textTransaction.setMeta('no-debounce', true);

        dispatch(textTransaction);
    };

    // For now, render a simple suggestion widget
    // TODO: Create a proper Suggestion component when implementing suggestions feature
    root.render(
        <div className="inline-flex items-center gap-1 rounded bg-yellow-100 px-2 py-1 text-xs dark:bg-yellow-900">
            <span>{suggestion.description}</span>
            <button
                onClick={onApply}
                className="rounded bg-green-500 px-2 py-0.5 text-white hover:bg-green-600"
            >
                Apply
            </button>
        </div>
    );

    return {
        dom,
        destroy: () => {
            setTimeout(() => {
                root.unmount();
            }, 0);
        },
    };
}

export const suggestionsPluginKey = new PluginKey('suggestions');
export const suggestionsPlugin = new Plugin({
    key: suggestionsPluginKey,
    state: {
        init() {
            return { decorations: DecorationSet.empty, selected: null };
        },
        apply(tr, state) {
            const newDecorations = tr.getMeta(suggestionsPluginKey);
            if (newDecorations) return newDecorations;

            return {
                decorations: state.decorations.map(tr.mapping, tr.doc),
                selected: state.selected,
            };
        },
    },
    props: {
        decorations(state) {
            return this.getState(state)?.decorations ?? DecorationSet.empty;
        },
    },
});
