import { useState } from 'react';
import { Link } from 'react-router';
import { Trash2 } from 'lucide-react';
import type { Thread } from '@/schemas/threads.schema';
import { SidebarMenuItem, SidebarMenuButton, SidebarMenuAction } from '@/components/ui/sidebar';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SidebarHistoryItemProps {
    thread: Thread;
    isActive: boolean;
    onDelete: (threadId: string) => void;
    setOpenMobile: (open: boolean) => void;
}

export function SidebarHistoryItem({
    thread,
    isActive,
    onDelete,
    setOpenMobile,
}: SidebarHistoryItemProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowDeleteDialog(true);
    };

    const handleConfirmDelete = () => {
        onDelete(thread.id);
        setShowDeleteDialog(false);
    };

    return (
        <>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive}>
                    <Link to={`/chat/${thread.id}`} onClick={() => setOpenMobile(false)}>
                        <span className="truncate" title={thread.title}>
                            {thread.title}
                        </span>
                    </Link>
                </SidebarMenuButton>

                <SidebarMenuAction
                    showOnHover
                    onClick={handleDeleteClick}
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground mr-0.5"
                >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete chat</span>
                </SidebarMenuAction>
            </SidebarMenuItem>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete chat?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your chat and
                            remove it from your history.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
