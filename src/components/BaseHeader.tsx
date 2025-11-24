import { SidebarTrigger } from '@/components/ui/sidebar';

interface BaseHeaderProps {
    children?: React.ReactNode;
}

export function BaseHeader({ children }: BaseHeaderProps) {
    return (
        <header className="bg-background sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 px-2">
            <SidebarTrigger className="border-input border" />
            {children}
        </header>
    );
}
