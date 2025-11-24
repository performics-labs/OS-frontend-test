import { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router';
import { Navigate } from 'react-router';
import {
    ChatPage,
    ChatNewPage,
    AuthPage,
    NotFoundPage,
} from '@/pages';
import { APP_ROUTES, IS_DEV } from '@/constants';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AppLayout } from '@/layouts';
import { Loader2 } from 'lucide-react';

// Lazy load heavy pages for better performance
const ProjectListPage = lazy(() => import('@/pages/projects/ProjectListPage'));
const ProjectDetailPage = lazy(() => import('@/pages/ProjectDetailPage'));
const KnowledgeBasePage = lazy(() => import('@/pages/KnowledgeBasePage'));
const ComponentShowcase = lazy(() => import('@/pages/ComponentShowcase'));
const DesignSystemPage = lazy(() => import('@/pages/DesignSystemPage'));
const ToolsShowcasePage = lazy(() => import('@/pages/ToolsShowcasePage'));
const AIElementsTestPage = lazy(() => import('@/pages/AIElementsTestPage'));
const AIElementsChatPage = lazy(() => import('@/pages/AIElementsChatPage'));

// Loading fallback component
const PageLoader = () => (
    <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
);

// Wrapper to add Suspense boundary
const lazyRoute = (Component: React.LazyExoticComponent<React.ComponentType>) => (
    <Suspense fallback={<PageLoader />}>
        <Component />
    </Suspense>
);

export const routes: RouteObject[] = [
    {
        element: (
            <ErrorBoundary>
                <ProtectedRoute />
            </ErrorBoundary>
        ),
        children: [
            {
                element: <AppLayout />,
                children: [
                    {
                        path: '/',
                        element: <Navigate to={APP_ROUTES.CHAT_NEW} replace />,
                    },
                    {
                        path: APP_ROUTES.CHAT_NEW,
                        element: <ChatNewPage />,
                    },
                    {
                        path: APP_ROUTES.CHAT,
                        element: <ChatPage />,
                    },
                    {
                        path: APP_ROUTES.PROJECTS,
                        element: lazyRoute(ProjectListPage),
                    },
                    {
                        path: APP_ROUTES.PROJECT_DETAIL,
                        element: lazyRoute(ProjectDetailPage),
                    },
                    {
                        path: APP_ROUTES.KNOWLEDGE_BASE,
                        element: lazyRoute(KnowledgeBasePage),
                    },
                    {
                        path: APP_ROUTES.COMPONENT_SHOWCASE,
                        element: IS_DEV ? lazyRoute(ComponentShowcase) : <NotFoundPage />,
                    },
                    {
                        path: APP_ROUTES.DESIGN_SYSTEM,
                        element: IS_DEV ? lazyRoute(DesignSystemPage) : <NotFoundPage />,
                    },
                    {
                        path: APP_ROUTES.TOOLS_SHOWCASE,
                        element: IS_DEV ? lazyRoute(ToolsShowcasePage) : <NotFoundPage />,
                    },
                    {
                        path: APP_ROUTES.AI_ELEMENTS_TEST,
                        element: IS_DEV ? lazyRoute(AIElementsTestPage) : <NotFoundPage />,
                    },
                    {
                        path: APP_ROUTES.AI_ELEMENTS_CHAT_NEW,
                        element: IS_DEV ? lazyRoute(AIElementsChatPage) : <NotFoundPage />,
                    },
                    {
                        path: APP_ROUTES.AI_ELEMENTS_CHAT,
                        element: IS_DEV ? lazyRoute(AIElementsChatPage) : <NotFoundPage />,
                    },
                ],
            },
        ],
    },
    {
        element: <ErrorBoundary />,
        children: [
            {
                path: APP_ROUTES.LOGIN,
                element: <AuthPage />,
            },
            {
                path: '*',
                element: <NotFoundPage />,
            },
        ],
    },
];
