import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router';
import { SidebarHistory } from '@/components/sidebar/SidebarHistory';

// Mock IntersectionObserver
class IntersectionObserverMock {
    constructor() {}
    disconnect() {}
    observe() {}
    takeRecords(): IntersectionObserverEntry[] {
        return [];
    }
    unobserve() {}
}

global.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver;

vi.mock('@/hooks/useThreadHistory', () => ({
    useThreadHistory: vi.fn(),
}));

vi.mock('@/components/ui/sidebar', () => ({
    useSidebar: vi.fn(() => ({
        setOpenMobile: vi.fn(),
    })),
    SidebarGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    SidebarGroupLabel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    SidebarGroupContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    SidebarMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/sidebar/SidebarHistoryItem', () => ({
    SidebarHistoryItem: ({ thread }: { thread: { title: string } }) => <div>{thread.title}</div>,
}));

import { useThreadHistory } from '@/hooks/useThreadHistory';

const mockUseThreadHistory = useThreadHistory as ReturnType<typeof vi.fn>;

describe('SidebarHistory', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render loading skeleton when loading', () => {
        mockUseThreadHistory.mockReturnValue({
            threads: [],
            isLoading: true,
            isFetchingNextPage: false,
            hasNextPage: false,
            error: null,
            fetchNextPage: vi.fn(),
            deleteThread: vi.fn(),
            isDeleting: false,
            createThread: vi.fn(),
            isCreating: false,
        });

        render(
            <BrowserRouter>
                <SidebarHistory />
            </BrowserRouter>
        );

        expect(screen.getByText('Recent Chats')).toBeInTheDocument();
    });

    it('should render error state when there is an error', () => {
        mockUseThreadHistory.mockReturnValue({
            threads: [],
            isLoading: false,
            isFetchingNextPage: false,
            hasNextPage: false,
            error: new Error('Test error'),
            fetchNextPage: vi.fn(),
            deleteThread: vi.fn(),
            isDeleting: false,
            createThread: vi.fn(),
            isCreating: false,
        });

        render(
            <BrowserRouter>
                <SidebarHistory />
            </BrowserRouter>
        );

        expect(screen.getByText('Failed to load chat history')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('should render empty state when no threads', () => {
        mockUseThreadHistory.mockReturnValue({
            threads: [],
            isLoading: false,
            isFetchingNextPage: false,
            hasNextPage: false,
            error: null,
            fetchNextPage: vi.fn(),
            deleteThread: vi.fn(),
            isDeleting: false,
            createThread: vi.fn(),
            isCreating: false,
        });

        render(
            <BrowserRouter>
                <SidebarHistory />
            </BrowserRouter>
        );

        expect(screen.getByText('No chat history yet')).toBeInTheDocument();
    });

    it('should render threads grouped by date', () => {
        const mockThreads = [
            {
                id: 'thread-1',
                user_id: 'test-user',
                title: 'Today Thread',
                metadata: {},
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                project_id: null,
            },
            {
                id: 'thread-2',
                user_id: 'test-user',
                title: 'Yesterday Thread',
                metadata: {},
                created_at: new Date(Date.now() - 86400000).toISOString(),
                updated_at: new Date(Date.now() - 86400000).toISOString(),
                project_id: null,
            },
        ];

        mockUseThreadHistory.mockReturnValue({
            threads: mockThreads,
            isLoading: false,
            isFetchingNextPage: false,
            hasNextPage: false,
            error: null,
            fetchNextPage: vi.fn(),
            deleteThread: vi.fn(),
            isDeleting: false,
            createThread: vi.fn(),
            isCreating: false,
        });

        render(
            <BrowserRouter>
                <SidebarHistory />
            </BrowserRouter>
        );

        expect(screen.getByText('Today')).toBeInTheDocument();
        expect(screen.getByText('Yesterday')).toBeInTheDocument();
        expect(screen.getByText('Today Thread')).toBeInTheDocument();
        expect(screen.getByText('Yesterday Thread')).toBeInTheDocument();
    });

    it('should show end message when no more pages', () => {
        const mockThreads = [
            {
                id: 'thread-1',
                user_id: 'test-user',
                title: 'Test Thread',
                metadata: {},
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                project_id: null,
            },
        ];

        mockUseThreadHistory.mockReturnValue({
            threads: mockThreads,
            isLoading: false,
            isFetchingNextPage: false,
            hasNextPage: false,
            error: null,
            fetchNextPage: vi.fn(),
            deleteThread: vi.fn(),
            isDeleting: false,
            createThread: vi.fn(),
            isCreating: false,
        });

        render(
            <BrowserRouter>
                <SidebarHistory />
            </BrowserRouter>
        );

        expect(screen.getByText('End of chat history')).toBeInTheDocument();
    });
});
