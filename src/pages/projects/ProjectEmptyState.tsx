import { FolderOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectsEmptyStateProps {
    onCreateClick: () => void;
}

export function ProjectsEmptyState({ onCreateClick }: ProjectsEmptyStateProps) {
    return (
        <div className="flex size-full flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="text-muted-foreground">
                <FolderOpen className="size-16" strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
                <h3 className="text-sm font-medium">No projects yet</h3>
                <p className="text-muted-foreground text-sm">
                    Create your first project to get started with AI-powered collaboration
                </p>
            </div>
            <Button onClick={onCreateClick} className="mt-2">
                <Plus className="mr-2 size-4" />
                Create Project
            </Button>
        </div>
    );
}
