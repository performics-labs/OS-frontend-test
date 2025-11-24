import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CheckIcon, XIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type EditableMessageProps = {
    initialValue: string;
    onConfirm: (newContent: string) => void;
    onCancel: () => void;
};

export function EditableMessage({ initialValue, onConfirm, onCancel }: EditableMessageProps) {
    const [value, setValue] = useState(initialValue);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(value.length, value.length);
        }
    }, [value.length]);

    const handleConfirm = () => {
        const trimmedValue = value.trim();
        if (trimmedValue && trimmedValue !== initialValue) {
            onConfirm(trimmedValue);
        } else if (!trimmedValue) {
            return;
        } else {
            onCancel();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleConfirm();
        }
        if (e.key === 'Escape') {
            e.preventDefault();
            onCancel();
        }
    };

    return (
        <div className="space-y-2">
            <Textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[100px] min-w-[360px] resize-none"
                placeholder="Edit your message..."
            />
            <div className="mt-4 flex items-center justify-end gap-2">
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={onCancel}
                    className="size-8 p-0"
                    type="button"
                >
                    <XIcon />
                </Button>
                <Button
                    variant="default"
                    size="sm"
                    className="size-8 p-0"
                    onClick={handleConfirm}
                    disabled={!value.trim() || value.trim() === initialValue.trim()}
                    type="button"
                >
                    <CheckIcon />
                </Button>
            </div>
        </div>
    );
}
