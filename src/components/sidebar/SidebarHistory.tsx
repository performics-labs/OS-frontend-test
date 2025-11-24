import { useParams, useNavigate } from 'react-router';
import { useRef } from 'react';
import { isToday, isYesterday, subMonths, subWeeks } from 'date-fns';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useThreadHistory } from '@/hooks/useThreadHistory';
import { SidebarHistoryItem } from './SidebarHistoryItem';
import { useSidebar } from '@/components/ui/sidebar';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarGroupLabel,
} from '@/components/ui/sidebar';
import type { Thread } from '@/schemas/threads.schema';

interface GroupedThreads {
    today: Thread[];
    yesterday: Thread[];
    lastWeek: Thread[];
    lastMonth: Thread[];
    older: Thread[];
}

const groupThreadsByDate = (threads: Thread[]): GroupedThreads => {
    const now = new Date();
    const oneWeekAgo = subWeeks(now, 1);
    const oneMonthAgo = subMonths(now, 1);

    return threads.reduce(
        (groups, thread) => {
            const threadDate = new Date(thread.updated_at);

            if (isToday(threadDate)) {
                groups.today.push(thread);
            } else if (isYesterday(threadDate)) {
                groups.yesterday.push(thread);
            } else if (threadDate > oneWeekAgo) {
                groups.lastWeek.push(thread);
            } else if (threadDate > oneMonthAgo) {
                groups.lastMonth.push(thread);
            } else {
                groups.older.push(thread);
            }

            return groups;
        },
        {
            today: [],
            yesterday: [],
            lastWeek: [],
            lastMonth: [],
            older: [],
        } as GroupedThreads
    );
};

export function SidebarHistory() {
    const { setOpenMobile } = useSidebar();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isFetchingRef = useRef(false);

    const {
        threads,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        deleteThread,
        error,
    } = useThreadHistory();

    const handleDelete = async (threadId: string) => {
        const deletePromise = deleteThread(threadId);

        toast.promise(deletePromise, {
            loading: 'Deleting chat...',
            success: 'Chat deleted successfully',
            error: 'Failed to delete chat',
        });

        try {
            await deletePromise;

            if (threadId === id) {
                navigate('/');
            }
        } catch (error) {
            console.error('[SidebarHistory] Delete failed:', error);
        }
    };

    if (isLoading) {
        return (
            <SidebarGroup>
                <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
                <SidebarGroupContent>
                    <div className="flex flex-col">
                        {[44, 32, 28, 64, 52].map((width, index) => (
                            <div
                                key={index}
                                className="flex h-8 items-center gap-2 rounded-md px-2"
                            >
                                <div
                                    className="bg-sidebar-accent-foreground/10 h-4 max-w-[--skeleton-width] flex-1 rounded-md"
                                    style={
                                        {
                                            '--skeleton-width': `${width}%`,
                                        } as React.CSSProperties
                                    }
                                />
                            </div>
                        ))}
                    </div>
                </SidebarGroupContent>
            </SidebarGroup>
        );
    }

    if (error) {
        return (
            <SidebarGroup>
                <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
                <SidebarGroupContent>
                    <div className="text-muted-foreground flex flex-col items-center gap-2 px-2 py-4 text-center text-sm">
                        <AlertCircle className="h-5 w-5" />
                        <div>Failed to load chat history</div>
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="text-primary hover:underline"
                        >
                            Retry
                        </button>
                    </div>
                </SidebarGroupContent>
            </SidebarGroup>
        );
    }

    if (threads.length === 0) {
        return (
            <SidebarGroup>
                <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
                <SidebarGroupContent>
                    <div className="text-muted-foreground flex w-full flex-row items-center justify-center gap-2 px-2 text-sm">
                        No chat history yet
                    </div>
                </SidebarGroupContent>
            </SidebarGroup>
        );
    }

    const groupedThreads = groupThreadsByDate(threads);

    return (
        <>
            <SidebarGroup>
                <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <div className="flex flex-col gap-6">
                            {groupedThreads.today.length > 0 && (
                                <div>
                                    <div className="text-sidebar-foreground/50 px-2 py-1 text-xs">
                                        Today
                                    </div>
                                    {groupedThreads.today.map((thread) => (
                                        <SidebarHistoryItem
                                            key={thread.id}
                                            thread={thread}
                                            isActive={thread.id === id}
                                            onDelete={handleDelete}
                                            setOpenMobile={setOpenMobile}
                                        />
                                    ))}
                                </div>
                            )}

                            {groupedThreads.yesterday.length > 0 && (
                                <div>
                                    <div className="text-sidebar-foreground/50 px-2 py-1 text-xs">
                                        Yesterday
                                    </div>
                                    {groupedThreads.yesterday.map((thread) => (
                                        <SidebarHistoryItem
                                            key={thread.id}
                                            thread={thread}
                                            isActive={thread.id === id}
                                            onDelete={handleDelete}
                                            setOpenMobile={setOpenMobile}
                                        />
                                    ))}
                                </div>
                            )}

                            {groupedThreads.lastWeek.length > 0 && (
                                <div>
                                    <div className="text-sidebar-foreground/50 px-2 py-1 text-xs">
                                        Last 7 days
                                    </div>
                                    {groupedThreads.lastWeek.map((thread) => (
                                        <SidebarHistoryItem
                                            key={thread.id}
                                            thread={thread}
                                            isActive={thread.id === id}
                                            onDelete={handleDelete}
                                            setOpenMobile={setOpenMobile}
                                        />
                                    ))}
                                </div>
                            )}

                            {groupedThreads.lastMonth.length > 0 && (
                                <div>
                                    <div className="text-sidebar-foreground/50 px-2 py-1 text-xs">
                                        Last 30 days
                                    </div>
                                    {groupedThreads.lastMonth.map((thread) => (
                                        <SidebarHistoryItem
                                            key={thread.id}
                                            thread={thread}
                                            isActive={thread.id === id}
                                            onDelete={handleDelete}
                                            setOpenMobile={setOpenMobile}
                                        />
                                    ))}
                                </div>
                            )}

                            {groupedThreads.older.length > 0 && (
                                <div>
                                    <div className="text-sidebar-foreground/50 px-2 py-1 text-xs">
                                        Older
                                    </div>
                                    {groupedThreads.older.map((thread) => (
                                        <SidebarHistoryItem
                                            key={thread.id}
                                            thread={thread}
                                            isActive={thread.id === id}
                                            onDelete={handleDelete}
                                            setOpenMobile={setOpenMobile}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </SidebarMenu>

                    <motion.div
                        onViewportEnter={() => {
                            if (!isFetchingNextPage && hasNextPage && !isFetchingRef.current) {
                                isFetchingRef.current = true;
                                fetchNextPage();
                                setTimeout(() => {
                                    isFetchingRef.current = false;
                                }, 100);
                            }
                        }}
                    />

                    {isFetchingNextPage && (
                        <div className="px-2">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={`skeleton-${i}`}
                                    className="mb-1 flex h-8 items-center gap-2 rounded-md px-2"
                                >
                                    <div className="bg-sidebar-accent-foreground/10 h-4 w-3/4 animate-pulse rounded-md" />
                                </div>
                            ))}
                        </div>
                    )}

                    {!isFetchingNextPage && hasNextPage && (
                        <div className="text-muted-foreground mt-8 flex flex-row items-center gap-2 p-2 text-sm">
                            <div className="animate-spin">
                                <Loader2 className="h-4 w-4" />
                            </div>
                            <div>Loading chats...</div>
                        </div>
                    )}

                    {!hasNextPage && threads.length > 0 && (
                        <div className="text-muted-foreground mt-8 flex w-full flex-row items-center justify-center px-2 text-sm">
                            End of chat history
                        </div>
                    )}
                </SidebarGroupContent>
            </SidebarGroup>
        </>
    );
}
