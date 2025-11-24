import { FolderOpen } from 'lucide-react';
import { Link } from 'react-router';
import type { Project } from '@/types';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { APP_ROUTES } from '@/constants/routes';

type ProjectBreadcrumbProps = {
    project: Project;
};

export function ProjectBreadcrumb({ project }: ProjectBreadcrumbProps) {
    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link
                            to={APP_ROUTES.PROJECTS}
                            className="text-warm-black-300 dark:text-light-grey-300 hover:text-warm-black-500 dark:hover:text-light-grey-500 flex items-center gap-2"
                        >
                            <FolderOpen className="text-disrupt-500 size-4" />
                            All projects
                        </Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage className="text-warm-black-500 dark:text-light-grey-500 font-semibold">
                        {project.name}
                    </BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    );
}
