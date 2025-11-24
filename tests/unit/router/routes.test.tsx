import { routes } from '@/router';
import { APP_ROUTES } from '@/constants';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';
import type { JSX } from 'react';

describe('Router Configuration', () => {
    it('should have two main route groups', () => {
        expect(routes).toHaveLength(2);
    });

    describe('Protected Routes', () => {
        const protectedGroup = routes[0];

        it('should wrap protected routes with ErrorBoundary and ProtectedRoute', () => {
            expect(protectedGroup.element).toBeDefined();
            const element = protectedGroup.element as JSX.Element;

            expect(element.type).toBe(ErrorBoundary);
            expect(element.props.children.type).toBe(ProtectedRoute);
        });

        it('should include chat new route', () => {
            const appLayout = protectedGroup.children?.[0];
            const chatNewRoute = appLayout?.children?.find(
                (route) => route.path === APP_ROUTES.CHAT_NEW
            );
            expect(chatNewRoute).toBeDefined();
        });

        it('should redirect root to chat new', () => {
            const appLayout = protectedGroup.children?.[0];
            const rootRoute = appLayout?.children?.find((route) => route.path === '/');
            expect(rootRoute).toBeDefined();
        });

        it('should include showcase route in development', () => {
            const appLayout = protectedGroup.children?.[0];
            const showcaseRoute = appLayout?.children?.find(
                (route) => route.path === APP_ROUTES.COMPONENT_SHOWCASE
            );
            expect(showcaseRoute).toBeDefined();
        });
    });

    describe('Public Routes', () => {
        const publicGroup = routes[1];

        it('should wrap public routes with ErrorBoundary', () => {
            expect(publicGroup.element).toBeDefined();
            const element = publicGroup.element as JSX.Element;

            expect(element.type).toBe(ErrorBoundary);
        });

        it('should include login route', () => {
            const loginRoute = publicGroup.children?.find(
                (route) => route.path === APP_ROUTES.LOGIN
            );
            expect(loginRoute).toBeDefined();
        });

        it('should have a catch-all 404 route', () => {
            const notFoundRoute = publicGroup.children?.find((route) => route.path === '*');
            expect(notFoundRoute).toBeDefined();
        });
    });
});
