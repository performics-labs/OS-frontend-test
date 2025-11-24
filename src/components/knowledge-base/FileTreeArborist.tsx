import { useRef } from 'react';
import { Tree, type NodeRendererProps, type TreeApi, type NodeApi } from 'react-arborist';
import { ChevronRight, ChevronDown, Folder, FileText, GripVertical } from 'lucide-react';
import type { KBTreeNode } from '@/types/knowledgeBase';
import { cn } from '@/lib/utils';

type FileTreeArboristProps = {
    tree: KBTreeNode[];
    selectedDocumentId: string | null;
    onSelectDocument: (node: KBTreeNode) => void;
    onDelete?: (node: KBTreeNode) => void;
    onMove?: (nodeId: string, newParentId: string | null, index: number) => void;
};

function Node({ node, style, dragHandle }: NodeRendererProps<KBTreeNode>) {
    const isFolder = node.data.is_folder;
    const isSelected = node.isSelected;

    return (
        <div
            style={style}
            className={cn(
                'hover:bg-accent group flex items-center gap-1 rounded px-2 py-1 text-sm transition-colors',
                isSelected && 'bg-accent text-accent-foreground'
            )}
            onClick={() => {
                if (!isFolder) {
                    node.select();
                }
            }}
        >
            <div
                ref={dragHandle}
                className="hover:bg-accent-foreground/10 flex h-4 w-4 shrink-0 cursor-grab items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
            >
                <GripVertical className="h-3 w-3" />
            </div>

            {isFolder && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        node.toggle();
                    }}
                    className="hover:bg-accent-foreground/10 flex h-4 w-4 shrink-0 items-center justify-center rounded"
                    aria-label={node.isOpen ? 'Collapse folder' : 'Expand folder'}
                >
                    {node.isOpen ? (
                        <ChevronDown className="h-3 w-3" />
                    ) : (
                        <ChevronRight className="h-3 w-3" />
                    )}
                </button>
            )}
            {!isFolder && <div className="h-4 w-4 shrink-0" />}

            {isFolder ? (
                <Folder className="text-muted-foreground h-4 w-4 shrink-0" />
            ) : (
                <FileText className="text-muted-foreground h-4 w-4 shrink-0" />
            )}

            <span className="truncate">{node.data.title}</span>
        </div>
    );
}

export function FileTreeArborist({
    tree,
    selectedDocumentId,
    onSelectDocument,
    onMove,
}: FileTreeArboristProps) {
    const treeRef = useRef<TreeApi<KBTreeNode> | null>(null);

    const handleMove = (args: { dragIds: string[]; parentId: string | null; index: number }) => {
        if (onMove && args.dragIds.length > 0) {
            onMove(args.dragIds[0], args.parentId, args.index);
        }
    };

    const handleSelect = (nodes: NodeApi<KBTreeNode>[]) => {
        if (nodes.length > 0 && !nodes[0].data.is_folder) {
            onSelectDocument(nodes[0].data);
        }
    };

    if (tree.length === 0) {
        return (
            <div className="text-muted-foreground flex items-center justify-center p-8 text-sm">
                No documents found
            </div>
        );
    }

    return (
        <Tree
            ref={treeRef}
            data={tree}
            openByDefault={false}
            width="100%"
            height={600}
            indent={12}
            rowHeight={32}
            overscanCount={8}
            padding={8}
            selection={selectedDocumentId || undefined}
            onSelect={handleSelect}
            onMove={handleMove}
            disableDrag={() => false}
            disableDrop={(args) => {
                const dragNode = args.dragNodes[0];
                const parentNode = args.parentNode;

                if (!parentNode || !parentNode.data.is_folder) {
                    return true;
                }

                if (dragNode.data.id === parentNode.data.id) {
                    return true;
                }

                return false;
            }}
        >
            {Node}
        </Tree>
    );
}
