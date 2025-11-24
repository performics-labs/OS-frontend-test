import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ProjectHeaderProps = {
    name: string;
    description?: string;
    onEdit?: () => void;
    onDelete?: () => void;
};

export function ProjectHeader({ name, description, onEdit, onDelete }: ProjectHeaderProps) {
    return (
        <div className="mb-6 flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
                <h1 className="text-warm-black-500 mb-2 truncate text-3xl font-semibold dark:text-white">
                    {name}
                </h1>
                {description && (
                    <p className="text-medium-grey-500 dark:text-light-grey-500 text-base">
                        {description}
                    </p>
                )}
            </div>
            <div className="flex flex-shrink-0 items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Project actions"
                            className="h-8 w-8"
                        >
                            <MoreHorizontal className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onEdit}>Edit project</DropdownMenuItem>
                        <DropdownMenuItem onClick={onDelete} className="text-red-600">
                            Delete project
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
