import { useEffect, useState } from 'react';
import { useAuthStore, useKBStore } from '@/stores';
import {
    fetchKBDocumentsTree,
    fetchKBDocument,
    createKBDocument,
    updateKBDocument,
    deleteKBDocument,
    publishKBDocument,
    unpublishKBDocument,
} from '@/services/knowledge-base/knowledge-base-service';
import { FileTreeArborist } from '@/components/knowledge-base/FileTreeArborist';
import { EditorPanel } from '@/components/knowledge-base/EditorPanel';
import { KBDocumentForm, type FormData } from '@/components/knowledge-base/KBDocumentForm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { AlertCircle, FolderPlus, FileText } from 'lucide-react';
import type { KBTreeNode, KBDocument } from '@/types/knowledgeBase';
import { toast } from 'sonner';

type DialogMode = 'create-document' | 'create-folder' | 'edit' | null;

export function KnowledgeBasePage() {
    const user = useAuthStore((state) => state.user);

    const {
        tree,
        selectedDocument,
        isLoading,
        error,
        setTree,
        setSelectedDocument,
        setLoading,
        setError,
    } = useKBStore();

    const [dialogMode, setDialogMode] = useState<DialogMode>(null);
    const [editingDocument, setEditingDocument] = useState<KBDocument | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishConfirmOpen, setPublishConfirmOpen] = useState(false);
    const [publishAction, setPublishAction] = useState<{
        document: KBDocument;
        newStatus: 'published' | 'draft';
    } | null>(null);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState<KBDocument | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function loadTree() {
            if (!user?.user_id) return;

            setLoading(true);
            setError(null);

            try {
                const response = await fetchKBDocumentsTree({
                    includeDrafts: true,
                });

                if (isMounted) {
                    setTree(response.tree);
                }
            } catch (err) {
                if (!isMounted) return;

                const errorMessage =
                    err instanceof Error ? err.message : 'Failed to load knowledge base';
                setError(errorMessage);
                toast.error('Failed to load knowledge base', {
                    description: errorMessage,
                });
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        loadTree();

        return () => {
            isMounted = false;
        };
    }, [user?.user_id, setTree, setLoading, setError]);

    const reloadTree = async () => {
        if (!user?.user_id) return;

        try {
            const response = await fetchKBDocumentsTree({
                includeDrafts: true,
            });
            setTree(response.tree);
        } catch (err) {
            console.error('Failed to reload tree:', err);
        }
    };

    const handleSelectDocument = async (node: KBTreeNode) => {
        if (node.is_folder) return;

        try {
            const document = await fetchKBDocument(node.id);
            setSelectedDocument(document);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load document';
            toast.error('Failed to load document', {
                description: errorMessage,
            });
        }
    };

    const handleOpenCreateDialog = (mode: 'create-document' | 'create-folder') => {
        setEditingDocument(null);
        setDialogMode(mode);
    };

    const handleCloseDialog = () => {
        setDialogMode(null);
        setEditingDocument(null);
    };

    const handleFormSubmit = async (formData: FormData) => {
        if (!user?.user_id) return;

        setIsSubmitting(true);

        try {
            if (dialogMode === 'edit' && editingDocument) {
                await updateKBDocument(editingDocument.id, {
                    updated_by_user_id: user.user_id,
                    title: formData.title,
                    content: formData.content,
                    category: formData.category,
                    priority: formData.priority,
                    tags: formData.tags.length > 0 ? formData.tags : undefined,
                    applies_to: formData.applies_to.length > 0 ? formData.applies_to : undefined,
                    context_triggers:
                        formData.context_triggers.length > 0
                            ? formData.context_triggers
                            : undefined,
                });

                toast.success('Document updated successfully');

                const updated = await fetchKBDocument(editingDocument.id);
                setSelectedDocument(updated);
            } else {
                const created = await createKBDocument({
                    created_by_user_id: user.user_id,
                    title: formData.title,
                    content: formData.content,
                    category: formData.category,
                    priority: formData.priority,
                    tags: formData.tags.length > 0 ? formData.tags : undefined,
                    applies_to: formData.applies_to.length > 0 ? formData.applies_to : undefined,
                    context_triggers:
                        formData.context_triggers.length > 0
                            ? formData.context_triggers
                            : undefined,
                    parent_id: formData.parent_id || undefined,
                    is_folder: formData.is_folder,
                    sort_order: 0,
                    status: 'draft',
                });

                toast.success(`${formData.is_folder ? 'Folder' : 'Document'} created successfully`);

                if (!formData.is_folder) {
                    setSelectedDocument(created);
                }
            }

            await reloadTree();
            handleCloseDialog();
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : `Failed to ${dialogMode === 'edit' ? 'update' : 'create'} ${formData.is_folder ? 'folder' : 'document'}`;
            toast.error(
                dialogMode === 'edit'
                    ? 'Update failed'
                    : `${formData.is_folder ? 'Folder' : 'Document'} creation failed`,
                {
                    description: errorMessage,
                }
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (node: KBTreeNode) => {
        try {
            await deleteKBDocument(node.id);
            toast.success(`${node.is_folder ? 'Folder' : 'Document'} deleted successfully`);

            if (selectedDocument?.id === node.id) {
                setSelectedDocument(null);
            }

            await reloadTree();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete';
            toast.error('Delete failed', {
                description: errorMessage,
            });
        }
    };

    const handleTogglePublish = (document: KBDocument, currentStatus: 'draft' | 'published') => {
        if (!user?.user_id) return;

        const newStatus = currentStatus === 'published' ? 'draft' : 'published';

        // Open confirmation dialog
        setPublishAction({ document, newStatus });
        setPublishConfirmOpen(true);
    };

    const confirmPublishToggle = async () => {
        if (!publishAction || !user?.user_id) return;

        const { document, newStatus } = publishAction;
        const previousStatus = document.status;

        try {
            setIsPublishing(true);

            // Optimistic update
            setSelectedDocument({ ...document, status: newStatus });

            if (newStatus === 'published') {
                await publishKBDocument(document.id, {
                    updated_by_user_id: user.user_id,
                });
                toast.success('Document published successfully');
            } else {
                await unpublishKBDocument(document.id, {
                    updated_by_user_id: user.user_id,
                });
                toast.success('Document unpublished');
            }

            // Fetch latest to ensure sync
            const updated = await fetchKBDocument(document.id);
            setSelectedDocument(updated);

            await reloadTree();
        } catch (err) {
            // Rollback on error
            setSelectedDocument({ ...document, status: previousStatus });

            const errorMessage =
                err instanceof Error
                    ? err.message
                    : `Failed to ${newStatus === 'published' ? 'publish' : 'unpublish'}`;
            toast.error(newStatus === 'published' ? 'Publish failed' : 'Unpublish failed', {
                description: errorMessage,
            });
        } finally {
            setIsPublishing(false);
            setPublishConfirmOpen(false);
            setPublishAction(null);
        }
    };

    const handleMove = async (nodeId: string, newParentId: string | null, index: number) => {
        if (!user?.user_id) return;

        try {
            await updateKBDocument(nodeId, {
                updated_by_user_id: user.user_id,
                parent_id: newParentId || null,
                sort_order: index,
            });

            await reloadTree();

            if (selectedDocument?.id === nodeId) {
                const updated = await fetchKBDocument(nodeId);
                setSelectedDocument(updated);
            }

            toast.success('Document moved successfully');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to move document';
            toast.error('Move failed', {
                description: errorMessage,
            });
        }
    };

    const handleContentUpdate = async (newContent: string) => {
        if (!selectedDocument || !user?.user_id || selectedDocument.status !== 'draft') return;

        setSaveStatus('saving');

        try {
            await updateKBDocument(selectedDocument.id, {
                updated_by_user_id: user.user_id,
                content: newContent,
            });

            setSelectedDocument({ ...selectedDocument, content: newContent });
            setSaveStatus('saved');

            setTimeout(() => {
                setSaveStatus('idle');
            }, 2000);
        } catch (err) {
            setSaveStatus('error');
            const errorMessage = err instanceof Error ? err.message : 'Failed to save changes';
            toast.error('Auto-save failed', {
                description: errorMessage,
            });

            setTimeout(() => {
                setSaveStatus('idle');
            }, 3000);
        }
    };

    const handleDeleteClick = (document: KBDocument) => {
        setDocumentToDelete(document);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!documentToDelete) return;

        try {
            await deleteKBDocument(documentToDelete.id);
            toast.success('Document deleted successfully');

            setSelectedDocument(null);
            setDeleteConfirmOpen(false);
            setDocumentToDelete(null);

            await reloadTree();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete document';
            toast.error('Delete failed', {
                description: errorMessage,
            });
        }
    };

    if (isLoading && tree.length === 0) {
        return (
            <div className="flex h-full gap-4 p-6">
                <div className="w-80 shrink-0">
                    <Card className="h-full p-4">
                        <Skeleton className="mb-4 h-6 w-32" />
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-full" />
                        </div>
                    </Card>
                </div>
                <div className="flex-1">
                    <Skeleton className="h-full w-full" />
                </div>
            </div>
        );
    }

    if (error && tree.length === 0) {
        return (
            <div className="flex h-full items-center justify-center p-6">
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="flex h-full overflow-hidden">
            <div className="border-border w-80 shrink-0 border-r">
                <div className="flex h-full flex-col">
                    <div className="border-border bg-background border-b p-4">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenCreateDialog('create-document')}
                                className="flex-1"
                            >
                                <FileText className="mr-1.5 h-4 w-4" />
                                New Doc
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenCreateDialog('create-folder')}
                                className="flex-1"
                            >
                                <FolderPlus className="mr-1.5 h-4 w-4" />
                                New Folder
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2">
                        <FileTreeArborist
                            tree={tree}
                            selectedDocumentId={selectedDocument?.id || null}
                            onSelectDocument={handleSelectDocument}
                            onDelete={handleDelete}
                            onMove={handleMove}
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <EditorPanel
                    document={selectedDocument}
                    isLoading={false}
                    isPublishing={isPublishing}
                    saveStatus={saveStatus}
                    onContentUpdate={handleContentUpdate}
                    onTogglePublish={handleTogglePublish}
                    onDelete={handleDeleteClick}
                />
            </div>

            <AlertDialog open={publishConfirmOpen} onOpenChange={setPublishConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {publishAction?.newStatus === 'published'
                                ? 'Publish Document'
                                : 'Unpublish Document'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {publishAction?.newStatus === 'published'
                                ? 'Publishing this document will make it visible in the Knowledge Base and sync it to AWS for retrieval. This action can be reversed.'
                                : 'Unpublishing this document will remove it from the Knowledge Base and AWS index. It will return to draft status.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPublishing}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmPublishToggle} disabled={isPublishing}>
                            {isPublishing
                                ? 'Processing...'
                                : publishAction?.newStatus === 'published'
                                  ? 'Publish'
                                  : 'Unpublish'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Document</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{documentToDelete?.title}"? This action
                            cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog
                open={dialogMode !== null}
                onOpenChange={(open) => !open && handleCloseDialog()}
            >
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {dialogMode === 'edit'
                                ? 'Edit Document'
                                : dialogMode === 'create-folder'
                                  ? 'Create New Folder'
                                  : 'Create New Document'}
                        </DialogTitle>
                        <DialogDescription>
                            {dialogMode === 'edit'
                                ? 'Update the document details below.'
                                : dialogMode === 'create-folder'
                                  ? 'Create a new folder to organize your documents.'
                                  : 'Create a new knowledge base document.'}
                        </DialogDescription>
                    </DialogHeader>
                    <KBDocumentForm
                        document={editingDocument}
                        isFolder={dialogMode === 'create-folder'}
                        onSubmit={handleFormSubmit}
                        onCancel={handleCloseDialog}
                        isSubmitting={isSubmitting}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
export default KnowledgeBasePage;
