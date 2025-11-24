import { useState, useEffect } from 'react';
import { navMain, navSecondary } from '@/config/navigation';
import { NavSimple } from './NavSimple';
import { NavSecondary } from './NavSecondary';
import { EntitySwitcher } from './EntitySwitcher';
import { SidebarUserNav } from './SidebarUserNav';
import { SidebarHistory } from './SidebarHistory';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { IS_DEV } from '@/constants';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
    useSidebar,
} from '@/components/ui/sidebar';

export function OSSidebar(props: React.ComponentProps<typeof Sidebar>) {
    const [showHistory, setShowHistory] = useState(false);
    const { setOpen, state } = useSidebar();

    useEffect(() => {
        if (state === 'collapsed') {
            setShowHistory((prev) => (prev ? false : prev));
        }
    }, [state]);

    // Filter out dev-only items in production
    const filteredNavSecondary = IS_DEV
        ? navSecondary
        : navSecondary.filter(
              (item) => item.title !== 'Design System' && item.title !== 'Tools Showcase'
          );

    const navSecondaryWithHandler = filteredNavSecondary.map((item) => {
        if (item.title === 'History') {
            return {
                ...item,
                isActive: showHistory,
                onClick: (e: React.MouseEvent) => {
                    e.preventDefault();
                    const newShowHistory = !showHistory;
                    setShowHistory(newShowHistory);
                    if (newShowHistory && state === 'collapsed') {
                        setOpen(true);
                    }
                },
            };
        }
        return item;
    });

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <EntitySwitcher />
            </SidebarHeader>
            <SidebarContent className="flex flex-col">
                <div className="shrink-0">
                    <NavSimple items={navMain} />
                </div>
                {showHistory && state === 'expanded' && (
                    <div className="flex-1 overflow-auto">
                        <ErrorBoundary
                            fallback={
                                <div className="text-muted-foreground p-4 text-center text-sm">
                                    Failed to load chat history
                                </div>
                            }
                        >
                            <SidebarHistory />
                        </ErrorBoundary>
                    </div>
                )}
                <div className="mt-auto shrink-0">
                    <NavSecondary items={navSecondaryWithHandler} />
                </div>
            </SidebarContent>
            <SidebarFooter>
                <SidebarUserNav />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
