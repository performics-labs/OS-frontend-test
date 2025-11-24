import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FileText, Trash2 } from 'lucide-react';
import type { KBTreeNode } from '@/types/knowledgeBase';
import { cn } from '@/lib/utils';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type TreeNodeProps = {
    node: KBTreeNode;
    level: number;
    isExpanded: boolean;
    isSelected: boolean;
    onToggle: (nodeId: string) => void;
    onSelect: (node: KBTreeNode) => void;
};

function TreeNode({ node, level, isExpanded, isSelected, onToggle, onSelect }: TreeNodeProps) {
    const hasChildren = node.children && node.children.length > 0;
    const isFolder = node.is_folder;

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isFolder && hasChildren) {
            onToggle(node.id);
        }
    };

    const handleSelect = () => {
        if (!isFolder) {
            onSelect(node);
        }
    };

    return (
        <div>
            <button
                onClick={handleSelect}
                className={cn(
                    'hover:bg-accent flex w-full items-center gap-1 rounded px-2 py-1 text-left text-sm transition-colors',
                    isSelected && 'bg-accent text-accent-foreground',
                    isFolder && 'cursor-default'
                )}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
            >
                {isFolder && hasChildren && (
                    <button
                        onClick={handleToggle}
                        className="hover:bg-accent-foreground/10 flex h-4 w-4 shrink-0 items-center justify-center rounded"
                        aria-label={isExpanded ? 'Collapse folder' : 'Expand folder'}
                    >
                        {isExpanded ? (
                            <ChevronDown className="h-3 w-3" />
                        ) : (
                            <ChevronRight className="h-3 w-3" />
                        )}
                    </button>
                )}
                {isFolder && !hasChildren && <div className="h-4 w-4 shrink-0" />}
                {!isFolder && <div className="h-4 w-4 shrink-0" />}

                {isFolder ? (
                    <Folder className="text-muted-foreground h-4 w-4 shrink-0" />
                ) : (
                    <FileText className="text-muted-foreground h-4 w-4 shrink-0" />
                )}

                <span className="truncate">{node.title}</span>
            </button>

            {isFolder && hasChildren && isExpanded && (
                <div>
                    {node.children.map((child) => (
                        <TreeNodeWrapper
                            key={child.id}
                            node={child}
                            level={level + 1}
                            onToggle={onToggle}
                            onSelect={onSelect}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

type TreeNodeWrapperProps = {
    node: KBTreeNode;
    level: number;
    onToggle: (nodeId: string) => void;
    onSelect: (node: KBTreeNode) => void;
};

function TreeNodeWrapper({ node, level, onToggle, onSelect }: TreeNodeWrapperProps) {
    const [expandedFolders, setExpandedFolders] = React.useState<Set<string>>(new Set());
    const [selectedId, setSelectedId] = React.useState<string | null>(null);

    const handleToggle = (nodeId: string) => {
        setExpandedFolders((prev) => {
            const next = new Set(prev);
            if (next.has(nodeId)) {
                next.delete(nodeId);
            } else {
                next.add(nodeId);
            }
            return next;
        });
        onToggle(nodeId);
    };

    const handleSelect = (selectedNode: KBTreeNode) => {
        setSelectedId(selectedNode.id);
        onSelect(selectedNode);
    };

    return (
        <TreeNode
            node={node}
            level={level}
            isExpanded={expandedFolders.has(node.id)}
            isSelected={selectedId === node.id}
            onToggle={handleToggle}
            onSelect={handleSelect}
        />
    );
}

type TreeViewProps = {
    tree: KBTreeNode[];
    expandedFolders: Set<string>;
    selectedDocumentId: string | null;
    onToggleFolder: (folderId: string) => void;
    onSelectDocument: (node: KBTreeNode) => void;
    onDelete?: (node: KBTreeNode) => void;
};

export function TreeView({
    tree,
    expandedFolders,
    selectedDocumentId,
    onToggleFolder,
    onSelectDocument,
    onDelete,
}: TreeViewProps) {
    if (tree.length === 0) {
        return (
            <div className="text-muted-foreground flex items-center justify-center p-8 text-sm">
                No documents found
            </div>
        );
    }

    return (
        <div className="space-y-0.5">
            {tree.map((node) => (
                <TreeNodeComponent
                    key={node.id}
                    node={node}
                    level={0}
                    expandedFolders={expandedFolders}
                    selectedDocumentId={selectedDocumentId}
                    onToggleFolder={onToggleFolder}
                    onSelectDocument={onSelectDocument}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}

type TreeNodeComponentProps = {
    node: KBTreeNode;
    level: number;
    expandedFolders: Set<string>;
    selectedDocumentId: string | null;
    onToggleFolder: (folderId: string) => void;
    onSelectDocument: (node: KBTreeNode) => void;
    onDelete?: (node: KBTreeNode) => void;
};

function TreeNodeComponent({
    node,
    level,
    expandedFolders,
    selectedDocumentId,
    onToggleFolder,
    onSelectDocument,
    onDelete,
}: TreeNodeComponentProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const hasChildren = node.children && node.children.length > 0;
    const isFolder = node.is_folder;
    const isExpanded = expandedFolders.has(node.id);
    const isSelected = selectedDocumentId === node.id;

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isFolder && hasChildren) {
            onToggleFolder(node.id);
        }
    };

    const handleSelect = () => {
        if (!isFolder) {
            onSelectDocument(node);
        }
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDeleteDialog(true);
    };

    const handleConfirmDelete = () => {
        if (onDelete) {
            onDelete(node);
        }
        setShowDeleteDialog(false);
    };

    return (
        <div>
            <div className="group relative">
                <button
                    onClick={handleSelect}
                    className={cn(
                        'hover:bg-accent flex w-full items-center gap-1 rounded px-2 py-1 text-left text-sm transition-colors',
                        isSelected && 'bg-accent text-accent-foreground',
                        isFolder && 'cursor-default'
                    )}
                    style={{ paddingLeft: `${level * 12 + 8}px` }}
                >
                    {isFolder && hasChildren && (
                        <button
                            onClick={handleToggle}
                            className="hover:bg-accent-foreground/10 flex h-4 w-4 shrink-0 items-center justify-center rounded"
                            aria-label={isExpanded ? 'Collapse folder' : 'Expand folder'}
                        >
                            {isExpanded ? (
                                <ChevronDown className="h-3 w-3" />
                            ) : (
                                <ChevronRight className="h-3 w-3" />
                            )}
                        </button>
                    )}
                    {isFolder && !hasChildren && <div className="h-4 w-4 shrink-0" />}
                    {!isFolder && <div className="h-4 w-4 shrink-0" />}

                    {isFolder ? (
                        <Folder className="text-muted-foreground h-4 w-4 shrink-0" />
                    ) : (
                        <FileText className="text-muted-foreground h-4 w-4 shrink-0" />
                    )}

                    <span className="truncate">{node.title}</span>
                </button>

                {onDelete && (
                    <button
                        onClick={handleDeleteClick}
                        className="hover:bg-destructive/10 absolute top-1/2 right-1 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100"
                        aria-label={`Delete ${isFolder ? 'folder' : 'document'}`}
                    >
                        <Trash2 className="text-destructive h-3.5 w-3.5" />
                    </button>
                )}
            </div>

            {isFolder && hasChildren && isExpanded && (
                <div>
                    {node.children.map((child) => (
                        <TreeNodeComponent
                            key={child.id}
                            node={child}
                            level={level + 1}
                            expandedFolders={expandedFolders}
                            selectedDocumentId={selectedDocumentId}
                            onToggleFolder={onToggleFolder}
                            onSelectDocument={onSelectDocument}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete {isFolder ? 'folder' : 'document'}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete{' '}
                            <strong>{node.title}</strong>
                            {isFolder && hasChildren && ' and all its contents'}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
