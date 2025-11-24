import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { ReactNode } from 'react';

export type FormDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    onSubmit: () => void;
    onCancel?: () => void;
    submitLabel?: string;
    cancelLabel?: string;
    isSubmitting?: boolean;
    isSubmitDisabled?: boolean;
    children: ReactNode;
};

/**
 * Reusable form dialog component
 *
 * Provides consistent dialog structure for create/edit forms across the app.
 * Handles loading states, cancel/submit actions, and accessibility.
 */
export function FormDialog({
    open,
    onOpenChange,
    title,
    description,
    onSubmit,
    onCancel,
    submitLabel = 'Save',
    cancelLabel = 'Cancel',
    isSubmitting = false,
    isSubmitDisabled = false,
    children,
}: FormDialogProps) {
    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
                <div className="space-y-4 py-4">{children}</div>
                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        type="button"
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        onClick={onSubmit}
                        disabled={isSubmitDisabled || isSubmitting}
                        type="submit"
                    >
                        {isSubmitting ? 'Saving...' : submitLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
