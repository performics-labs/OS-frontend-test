import { cn } from '@/lib/utils';

type PageContainerProps = {
    children: React.ReactNode;
    className?: string;
    centered?: boolean;
    noPadding?: boolean;
};

export function PageContainer({
    children,
    className,
    centered = false,
    noPadding = false,
}: PageContainerProps) {
    return (
        <main
            className={cn(
                'h-full',
                !noPadding && 'p-4',
                centered && 'flex items-center justify-center',
                className
            )}
        >
            {children}
        </main>
    );
}
