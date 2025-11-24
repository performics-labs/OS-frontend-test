import { Outlet, useLocation, useParams } from 'react-router';
import { OSSidebar } from '@/components/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { ProjectBreadcrumb } from '@/components/project/ProjectBreadcrumb';
import { BaseHeader } from '@/components/BaseHeader';
import { useCurrentProject } from '@/stores/project-store';

export function AppLayout() {
    const location = useLocation();
    const params = useParams<{ id: string }>();
    const currentProject = useCurrentProject();

    const isProjectDetailRoute = location.pathname.startsWith('/projects/') && params.id;
    const shouldShowProjectBreadcrumb = isProjectDetailRoute && currentProject;
    const isKnowledgeBaseRoute = location.pathname === '/knowledge-base';

    return (
        <SidebarProvider>
            <OSSidebar />
            <SidebarInset>
                <BaseHeader>
                    {shouldShowProjectBreadcrumb && <ProjectBreadcrumb project={currentProject} />}
                    {isKnowledgeBaseRoute && (
                        <h1 className="text-lg font-semibold">Knowledge Base</h1>
                    )}
                </BaseHeader>
                <div className="h-[calc(100vh-3rem)]">
                    <Outlet />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
