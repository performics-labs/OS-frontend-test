import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { KBDocument, KBTreeNode } from '@/types/knowledgeBase';

export type KBState = {
    tree: KBTreeNode[];
    selectedDocument: KBDocument | null;
    expandedFolders: Set<string>;
    isLoading: boolean;
    error: string | null;
};

export type KBActions = {
    setTree: (tree: KBTreeNode[]) => void;
    setSelectedDocument: (document: KBDocument | null) => void;
    toggleFolder: (folderId: string) => void;
    expandFolder: (folderId: string) => void;
    collapseFolder: (folderId: string) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    resetKBState: () => void;
};

export type KBStore = KBState & KBActions;

const initialState: KBState = {
    tree: [],
    selectedDocument: null,
    expandedFolders: new Set<string>(),
    isLoading: false,
    error: null,
};

const useKBStore = create<KBStore>()(
    devtools(
        (set, get) => ({
            ...initialState,

            setTree: (tree: KBTreeNode[]) => {
                set({ tree });
            },

            setSelectedDocument: (document: KBDocument | null) => {
                set({ selectedDocument: document });
            },

            toggleFolder: (folderId: string) => {
                const { expandedFolders } = get();
                const newExpandedFolders = new Set(expandedFolders);

                if (newExpandedFolders.has(folderId)) {
                    newExpandedFolders.delete(folderId);
                } else {
                    newExpandedFolders.add(folderId);
                }

                set({ expandedFolders: newExpandedFolders });
            },

            expandFolder: (folderId: string) => {
                const { expandedFolders } = get();
                const newExpandedFolders = new Set(expandedFolders);
                newExpandedFolders.add(folderId);
                set({ expandedFolders: newExpandedFolders });
            },

            collapseFolder: (folderId: string) => {
                const { expandedFolders } = get();
                const newExpandedFolders = new Set(expandedFolders);
                newExpandedFolders.delete(folderId);
                set({ expandedFolders: newExpandedFolders });
            },

            setLoading: (isLoading: boolean) => {
                set({ isLoading });
            },

            setError: (error: string | null) => {
                set({ error });
            },

            resetKBState: () => {
                set(initialState);
            },
        }),
        {
            name: 'kb-store',
        }
    )
);

export { useKBStore };
