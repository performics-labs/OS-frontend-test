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

export type DeleteConfirmationDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title?: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDeleting?: boolean;
    variant?: 'default' | 'destructive';
};

/**
 * Reusable delete confirmation dialog
 *
 * Provides consistent confirmation UI for destructive actions.
 * Uses AlertDialog for accessibility and proper focus management.
 */
export function DeleteConfirmationDialog({
    open,
    onOpenChange,
    onConfirm,
    title = 'Are you sure?',
    description,
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
    isDeleting = false,
    variant = 'destructive',
}: DeleteConfirmationDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>{cancelLabel}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className={
                            variant === 'destructive'
                                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                                : ''
                        }
                    >
                        {isDeleting ? 'Deleting...' : confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
