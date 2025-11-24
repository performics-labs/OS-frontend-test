import type { Project } from '@/types';
import { memo } from 'react';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Edit2, MoreVertical, Trash2 } from 'lucide-react';

type ProjectCardProps = {
    project: Project;
    onEdit: (project: Project) => void;
    onDelete: (projectId: string) => void;
    onClick: (projectId: string) => void;
};

export const ProjectCard = memo(({ project, onEdit, onDelete, onClick }: ProjectCardProps) => {
    const formatDate = (date: string) => {
        const now = new Date();
        const createdDate = new Date(date);
        const diffTime = Math.abs(now.getTime() - createdDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return `${Math.floor(diffDays / 30)} months ago`;
    };

    const handleCardClick = () => {
        onClick(project.id);
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit(project);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(project.id);
    };

    return (
        <Card
            role="listitem"
            className="group cursor-pointer transition-shadow hover:shadow-md"
            onClick={handleCardClick}
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick();
                }
            }}
            aria-label={`Project: ${project.name}. ${project.description}. Created ${formatDate(project.created_at)}`}
        >
            <CardHeader>
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-1">
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                            {project.description}
                        </CardDescription>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 opacity-0 transition-opacity group-hover:opacity-100"
                                aria-label={`Options for ${project.name}`}
                                data-testid={`project-options-${project.id}`}
                            >
                                <MoreVertical className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={handleEdit}
                                data-testid={`edit-project-${project.id}`}
                            >
                                <Edit2 className="mr-2 size-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={handleDelete}
                                className="text-destructive"
                                data-testid={`delete-project-${project.id}`}
                            >
                                <Trash2 className="mr-2 size-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardFooter className="flex items-center justify-between">
                <p className="text-muted-foreground text-xs">
                    Created {formatDate(project.created_at)}
                </p>
            </CardFooter>
        </Card>
    );
});

ProjectCard.displayName = 'ProjectCard';
