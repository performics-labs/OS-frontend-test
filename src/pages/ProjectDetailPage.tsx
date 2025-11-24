import { useParams, useNavigate } from 'react-router';
import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { ProjectKnowledgePanel } from '@/components/project/ProjectKnowledgePanel';
import { ProjectHeader } from '@/components/project/ProjectHeader';
import { PromptInput } from '@/components/ai-elements/prompt-input';
import { useProjectStore, useCurrentProject, useProjectDocuments } from '@/stores/project-store';
import { useProjectThreads } from '@/hooks/useProjectThreads';
import { updateProject, deleteProject } from '@/services';
import { apiClient } from '@/lib/api-client';
import { API_ROUTES } from '@/constants/routes';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, MessageSquare, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { ProjectWithDocuments, ProjectDocument } from '@/types';

export function ProjectDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const currentProject = useCurrentProject();
    const documentsRecord = useProjectDocuments();
    const documents = useMemo(() => Object.values(documentsRecord), [documentsRecord]);
    const {
        selectedDocumentIds,
        isLoading,
        isUploadingDocument,
        error,
        setCurrentProject,
        toggleDocumentSelection,
        removeDocument,
        addDocument,
        setLoading,
        setUploadingDocument,
        setError,
    } = useProjectStore();

    const { threads, isLoading: isLoadingThreads, error: threadsError } = useProjectThreads(id);

    useEffect(() => {
        let isMounted = true;

        async function fetchProject() {
            if (!id) return;

            setLoading(true);
            setError(null);

            try {
                const response = await apiClient.get<{ project: ProjectWithDocuments }>(
                    API_ROUTES.PROJECT(id)
                );
                if (isMounted) {
                    setCurrentProject(response.data.project);
                }
            } catch (err) {
                if (!isMounted) return;

                let errorMessage = 'Failed to load project';

                if (err && typeof err === 'object' && 'response' in err) {
                    const error = err as { response?: { status?: number }; message?: string };
                    if (error.response?.status) {
                        switch (error.response.status) {
                            case 404:
                                errorMessage = 'Project not found';
                                break;
                            case 403:
                                errorMessage = 'You do not have permission to view this project';
                                break;
                            case 500:
                                errorMessage = 'Server error occurred';
                                break;
                            default:
                                errorMessage = error.message || errorMessage;
                        }
                    }
                } else if (err && typeof err === 'object' && 'request' in err) {
                    errorMessage = 'Network error - please check your connection';
                } else if (err instanceof Error) {
                    errorMessage = err.message;
                }

                setError(errorMessage);
                toast.error('Failed to load project', {
                    description: errorMessage,
                });
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchProject();

        return () => {
            isMounted = false;
        };
    }, [id, setCurrentProject, setLoading, setError]);

    const handleUploadDocuments = async (files: File[]) => {
        if (!id) return;

        setUploadingDocument(true);
        const uploadResults: { file: string; success: boolean }[] = [];

        for (const file of files) {
            try {
                const formData = new FormData();
                formData.append('file', file);

                const response = await apiClient.post<{ document: ProjectDocument }>(
                    API_ROUTES.PROJECT_DOCUMENTS(id),
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );

                addDocument(response.data.document);
                uploadResults.push({ file: file.name, success: true });
                toast.success('Document uploaded', {
                    description: `${file.name} was uploaded successfully`,
                });
            } catch (err) {
                uploadResults.push({ file: file.name, success: false });
                const errorMessage = err instanceof Error ? err.message : 'Upload failed';
                toast.error(`Failed to upload ${file.name}`, {
                    description: errorMessage,
                });
            }
        }

        setUploadingDocument(false);

        const successCount = uploadResults.filter((r) => r.success).length;
        const failCount = uploadResults.filter((r) => !r.success).length;

        if (files.length > 1) {
            if (successCount === files.length) {
                toast.success(`All ${successCount} documents uploaded successfully`);
            } else if (successCount > 0) {
                toast.warning(`Uploaded ${successCount} of ${files.length} documents`, {
                    description: `${failCount} document(s) failed to upload`,
                });
            }
        }
    };

    const handleDeleteDocument = async (documentId: string) => {
        if (!id) return;

        try {
            await apiClient.delete(API_ROUTES.PROJECT_DOCUMENT(id, documentId));
            removeDocument(documentId);
            toast.success('Document deleted successfully');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete document';
            toast.error('Delete failed', {
                description: errorMessage,
            });
        }
    };

    const handleDownloadDocument = (documentId: string) => {
        const doc = documents.find((d) => d.id === documentId);
        if (doc?.content) {
            const blob = new Blob([doc.content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = window.document.createElement('a');
            a.href = url;
            a.download = doc.name;
            a.click();
            URL.revokeObjectURL(url);
        } else {
            toast.info('Document download not available');
        }
    };

    const handleStartChat = (text: string, files: File[]) => {
        if (!text.trim()) return;

        const chatId = crypto.randomUUID();
        navigate(`/chat/${chatId}`, {
            state: {
                initialMessage: text,
                sourceProjectPath: `/projects/${id}`,
                sourceProject: {
                    id: currentProject?.id,
                    name: currentProject?.name,
                },
                selectedDocumentIds,
                files: files.length > 0 ? files : undefined,
            },
        });
    };

    const handleOpenEditDialog = () => {
        if (!currentProject) return;
        setEditName(currentProject.name);
        setEditDescription(currentProject.description || '');
        setIsEditDialogOpen(true);
    };

    const handleOpenDeleteDialog = () => {
        setIsDeleteDialogOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!id) return;

        setIsUpdating(true);
        try {
            const updated = await updateProject(id, {
                name: editName,
                description: editDescription,
            });
            setCurrentProject({ ...currentProject!, ...updated, documents });
            toast.success('Project updated successfully');
            setIsEditDialogOpen(false);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update project';
            toast.error('Update failed', {
                description: errorMessage,
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!id) return;

        setIsDeleting(true);
        try {
            await deleteProject(id);
            toast.success('Project deleted successfully');
            navigate('/projects');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete project';
            toast.error('Delete failed', {
                description: errorMessage,
            });
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-full flex-col p-6">
                <Skeleton className="mb-4 h-10 w-96" />
                <Skeleton className="mb-8 h-6 w-64" />
                <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <Skeleton className="mb-4 h-32 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                    <div className="lg:col-span-1">
                        <Skeleton className="h-96 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !currentProject) {
        return (
            <div className="flex h-full items-center justify-center p-6">
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error || 'Project not found'}</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="flex h-full overflow-hidden p-6">
            <div className="grid h-full flex-1 grid-cols-1 gap-6 overflow-hidden lg:grid-cols-3">
                <div className="order-2 flex min-h-0 flex-col gap-4 lg:order-1 lg:col-span-2">
                    <ProjectHeader
                        name={currentProject.name}
                        description={currentProject.description || undefined}
                        onEdit={handleOpenEditDialog}
                        onDelete={handleOpenDeleteDialog}
                    />

                    <PromptInput
                        onSubmit={handleStartChat}
                        placeholder="Send a message..."
                        name="project-message"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                        maxFiles={5}
                        maxFileSize={10}
                        hasStarted={false}
                    />

                    <div className="mx-auto flex-1 w-full max-w-[851px]">
                        <Card className="h-full overflow-hidden">
                            <CardHeader>
                                <CardTitle className="text-base">Recent Chats</CardTitle>
                            </CardHeader>
                            <CardContent className="h-full overflow-y-auto pb-4">
                            {isLoadingThreads ? (
                                <div className="text-muted-foreground flex items-center justify-center gap-2 p-8">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-sm">Loading chats...</span>
                                </div>
                            ) : threadsError ? (
                                <div className="flex flex-col items-center justify-center gap-2 p-8">
                                    <AlertCircle className="text-destructive h-8 w-8" />
                                    <h3 className="text-sm font-semibold">Failed to load chats</h3>
                                    <p className="text-muted-foreground text-center text-xs">
                                        {threadsError instanceof Error
                                            ? threadsError.message
                                            : 'An error occurred while loading chats'}
                                    </p>
                                </div>
                            ) : threads.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-2 p-8">
                                    <MessageSquare className="text-muted-foreground h-8 w-8" />
                                    <h3 className="text-sm font-semibold">No chats yet</h3>
                                    <p className="text-muted-foreground text-center text-xs">
                                        Type a message above to start a new chat
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {threads.map((thread) => (
                                        <button
                                            key={thread.id}
                                            onClick={() => navigate(`/chat/${thread.id}`)}
                                            className="hover:bg-accent flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors"
                                        >
                                            <MessageSquare className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-sm font-medium">
                                                    {thread.title}
                                                </div>
                                                <div className="text-muted-foreground text-xs">
                                                    {formatDistanceToNow(
                                                        new Date(thread.updated_at),
                                                        {
                                                            addSuffix: true,
                                                        }
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    </div>
                </div>

                <div className="order-1 min-h-0 overflow-y-auto lg:order-2 lg:col-span-1">
                    <ProjectKnowledgePanel
                        documents={documents}
                        selectedDocumentIds={selectedDocumentIds}
                        onToggleSelect={toggleDocumentSelection}
                        onDeleteDocument={handleDeleteDocument}
                        onUploadDocuments={handleUploadDocuments}
                        onDownloadDocument={handleDownloadDocument}
                        isUploading={isUploadingDocument}
                        showCheckbox={true}
                        maxFiles={5}
                        maxFileSize={10}
                    />
                </div>
            </div>

            {/* Edit Project Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit project</DialogTitle>
                        <DialogDescription>Update your project details</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label
                                htmlFor="edit-title"
                                className="text-foreground text-sm font-medium"
                            >
                                Project Title
                            </label>
                            <Input
                                id="edit-title"
                                placeholder="Enter project title"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <label
                                htmlFor="edit-description"
                                className="text-foreground text-sm font-medium"
                            >
                                Description
                            </label>
                            <Textarea
                                id="edit-description"
                                placeholder="Enter project description"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                className="min-h-[100px] resize-none"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setIsEditDialogOpen(false)}
                            disabled={isUpdating}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSaveEdit} disabled={!editName.trim() || isUpdating}>
                            {isUpdating ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Project</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{currentProject?.name}"? This action
                            cannot be undone and will permanently remove all associated documents
                            and chats.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
export default ProjectDetailPage;
