import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import { FormDialog, DeleteConfirmationDialog } from '@/components/dialogs';
import { useProjects } from '@/hooks/useProjects';
import type { Project } from '@/types';
import { toast } from 'sonner';
import { ProjectsEmptyState } from './ProjectEmptyState';
import { Plus, Search } from 'lucide-react';
import { ProjectCard } from './ProjectCard';

export function ProjectListPage() {
    const navigate = useNavigate();
    const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [projectName, setProjectTitle] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

    const {
        projects,
        isLoading,
        createProject,
        updateProject,
        deleteProject: deleteProjectMutation,
        isCreating,
        isUpdating,
        isDeleting,
    } = useProjects();

    const isEditMode = editingProjectId !== null;

    const handleOpenCreateDialog = () => {
        setEditingProjectId(null);
        setProjectTitle('');
        setProjectDescription('');
        setIsFormDialogOpen(true);
    };

    const handleOpenEditDialog = (project: Project) => {
        setEditingProjectId(project.id);
        setProjectTitle(project.name);
        setProjectDescription(project.description || '');
        setIsFormDialogOpen(true);
    };

    const handleOpenDeleteDialog = (projectId: string) => {
        setDeletingProjectId(projectId);
        setIsDeleteDialogOpen(true);
    };

    const handleSaveProject = async () => {
        try {
            if (isEditMode) {
                await updateProject({
                    id: editingProjectId,
                    data: {
                        name: projectName,
                        description: projectDescription,
                    },
                });
                toast.success('Project updated successfully');
            } else {
                await createProject({
                    name: projectName,
                    description: projectDescription,
                });
                toast.success('Project created successfully');
            }

            setIsFormDialogOpen(false);
            setEditingProjectId(null);
            setProjectTitle('');
            setProjectDescription('');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            toast.error(`Failed to ${isEditMode ? 'update' : 'create'} project`, {
                description: message,
            });
            console.error(`Project ${isEditMode ? 'update' : 'creation'} failed:`, error);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingProjectId) return;

        try {
            await deleteProjectMutation(deletingProjectId);
            toast.success('Project deleted successfully');
            setIsDeleteDialogOpen(false);
            setDeletingProjectId(null);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            toast.error('Failed to delete project', {
                description: message,
            });
            console.error('Project deletion failed:', error);
        }
    };

    const handleProjectClick = (projectId: string) => {
        navigate(`/projects/${projectId}`);
    };

    const handleFormDialogOpenChange = (open: boolean) => {
        setIsFormDialogOpen(open);
        if (!open) {
            setEditingProjectId(null);
            setProjectTitle('');
            setProjectDescription('');
        }
    };

    const filteredProjects = projects.filter(
        (project) =>
            project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (project.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const deletingProject = projects.find((p) => p.id === deletingProjectId);

    if (isLoading) {
        return (
            <>
                <div className="mx-auto w-full max-w-4xl space-y-6 p-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="relative flex-1">
                            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                            <Input
                                placeholder="Search projects..."
                                className="pl-10"
                                disabled
                                aria-label="Search projects"
                            />
                        </div>
                        <Button disabled>
                            <Plus className="mr-2 size-4" />
                            Create Project
                        </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="animate-pulse">
                                <CardHeader>
                                    <div className="space-y-2">
                                        <div className="bg-muted h-5 w-3/4 rounded" />
                                        <div className="bg-muted h-4 w-full rounded" />
                                        <div className="bg-muted h-4 w-5/6 rounded" />
                                    </div>
                                </CardHeader>
                                <CardFooter>
                                    <div className="bg-muted h-4 w-1/4 rounded" />
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="mx-auto w-full max-w-4xl space-y-6 p-4">
                {/* Header with Search and Create */}
                <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1">
                        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                        <Input
                            placeholder="Search projects..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            aria-label="Search projects"
                        />
                    </div>
                    <Button onClick={handleOpenCreateDialog}>
                        <Plus className="mr-2 size-4" />
                        Create Project
                    </Button>
                </div>

                {/* Projects Grid or Empty State */}
                {filteredProjects.length > 0 ? (
                    <div
                        className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                        role="list"
                        aria-label="Projects list"
                    >
                        {filteredProjects.map((project: Project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onEdit={handleOpenEditDialog}
                                onDelete={handleOpenDeleteDialog}
                                onClick={handleProjectClick}
                            />
                        ))}
                    </div>
                ) : searchQuery ? (
                    <div className="flex size-full flex-col items-center justify-center gap-3 p-8 text-center">
                        <div className="text-muted-foreground">
                            <Search className="size-16" strokeWidth={1.5} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm font-medium">No projects found</h3>
                            <p className="text-muted-foreground text-sm">
                                Try adjusting your search or create a new project
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setSearchQuery('')}
                            className="mt-2"
                        >
                            Clear search
                        </Button>
                    </div>
                ) : (
                    <ProjectsEmptyState onCreateClick={handleOpenCreateDialog} />
                )}

                {/* Create/Edit Project Dialog */}
                <FormDialog
                    open={isFormDialogOpen}
                    onOpenChange={handleFormDialogOpenChange}
                    title={isEditMode ? 'Edit project' : 'Create a new project'}
                    description={
                        isEditMode
                            ? 'Update your project details'
                            : 'Create a new project to organize your documents and chats'
                    }
                    onSubmit={handleSaveProject}
                    submitLabel={isEditMode ? 'Save Changes' : 'Create Project'}
                    isSubmitting={isCreating || isUpdating}
                    isSubmitDisabled={!projectName.trim()}
                >
                    <div className="space-y-2">
                        <label htmlFor="project-title" className="text-foreground text-sm font-medium">
                            Project Title
                        </label>
                        <Input
                            id="project-title"
                            placeholder="Enter project title"
                            value={projectName}
                            onChange={(e) => setProjectTitle(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="space-y-2">
                        <label
                            htmlFor="project-description"
                            className="text-foreground text-sm font-medium"
                        >
                            Description
                        </label>
                        <Textarea
                            id="project-description"
                            placeholder="Enter project description"
                            value={projectDescription}
                            onChange={(e) => setProjectDescription(e.target.value)}
                            className="min-h-[100px] resize-none"
                        />
                    </div>
                </FormDialog>

                {/* Delete Confirmation Dialog */}
                <DeleteConfirmationDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                    onConfirm={handleConfirmDelete}
                    title="Delete Project"
                    description={`Are you sure you want to delete "${deletingProject?.name}"? This action cannot be undone and will permanently remove all associated documents and chats.`}
                    isDeleting={isDeleting}
                />
            </div>
        </>
    );
}

export default ProjectListPage;
