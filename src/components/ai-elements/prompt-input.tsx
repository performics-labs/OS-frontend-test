import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Square, X, Paperclip } from 'lucide-react';
import {
    forwardRef,
    useCallback,
    useEffect,
    useState,
    useRef,
    useImperativeHandle,
    type ChangeEventHandler,
    type KeyboardEvent,
    type DragEvent,
} from 'react';
import { useAutoResize } from '@/hooks';
import { validateFileSize, validateFileType, isImageFile } from '@/utils/file-helpers';
import { ModelSelector } from '@/components/ModelSelector';
import type { FileUIPart } from 'ai';

type FileWithPreview = FileUIPart & {
    id: string;
    file: File;
};

type PromptInputProps = {
    onSubmit: (text: string, files: File[]) => void;
    onStop?: () => void;
    placeholder?: string;
    disabled?: boolean;
    isStreaming?: boolean;
    accept?: string;
    maxFiles?: number;
    maxFileSize?: number;
    name?: string;
    hasStarted?: boolean;
    minRows?: number;
};

export type PromptInputHandle = {
    focus: () => void;
    setValue: (value: string) => void;
};

export const PromptInput = forwardRef<PromptInputHandle, PromptInputProps>(
    (
        {
            onSubmit,
            onStop,
            placeholder = 'Type your message...',
            disabled = false,
            isStreaming = false,
            accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv',
            maxFiles = 5,
            maxFileSize = 10,
            name,
            hasStarted = false,
            minRows = 2,
        },
        ref
    ) => {
        const [value, setValue] = useState('');
        const [files, setFiles] = useState<FileWithPreview[]>([]);
        const [isDragging, setIsDragging] = useState(false);
        const textareaRef = useRef<HTMLTextAreaElement>(null);
        const fileInputRef = useRef<HTMLInputElement | null>(null);

        const { rows } = useAutoResize({
            ref: textareaRef,
            value,
            minRows,
            maxRows: 15,
        });

        useImperativeHandle(ref, () => ({
            focus: () => textareaRef.current?.focus(),
            setValue: (newValue: string) => setValue(newValue),
        }));

        const createFilePreview = useCallback(async (file: File): Promise<FileWithPreview> => {
            const url = URL.createObjectURL(file);
            return {
                type: 'file',
                id: `${Date.now()}-${file.name}`,
                url,
                filename: file.name,
                mediaType: file.type,
                file,
            };
        }, []);

        const addFiles = useCallback(
            async (newFiles: FileList | File[]) => {
                const fileArray = Array.from(newFiles);
                const validFiles: File[] = [];

                for (const file of fileArray) {
                    if (!validateFileType(file)) {
                        console.warn(`File type not supported: ${file.name}`);
                        continue;
                    }
                    if (!validateFileSize(file, maxFileSize)) {
                        console.warn(`File too large: ${file.name}`);
                        continue;
                    }
                    validFiles.push(file);
                }

                if (files.length + validFiles.length > maxFiles) {
                    console.warn(`Maximum ${maxFiles} files allowed`);
                    return;
                }

                const previews = await Promise.all(validFiles.map(createFilePreview));
                setFiles((prev) => [...prev, ...previews]);
            },
            [files.length, maxFiles, maxFileSize, createFilePreview]
        );

        const removeFile = useCallback((id: string) => {
            setFiles((prev) => {
                const file = prev.find((f) => f.id === id);
                if (file?.url) {
                    URL.revokeObjectURL(file.url);
                }
                return prev.filter((f) => f.id !== id);
            });
        }, []);

        const handleFileInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
            if (e.target.files && e.target.files.length > 0) {
                addFiles(e.target.files);
                e.target.value = '';
            }
        };

        const handleDragOver = (e: DragEvent) => {
            e.preventDefault();
            setIsDragging(true);
        };

        const handleDragLeave = (e: DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
        };

        const handleDrop = (e: DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                addFiles(e.dataTransfer.files);
            }
        };

        const handleSubmit = useCallback(() => {
            const sanitizedText = value.trim();
            const actualFiles = files.map((f) => f.file as File);

            if (!sanitizedText && actualFiles.length === 0) return;
            if (isStreaming || disabled) return;

            onSubmit(sanitizedText, actualFiles);
            setValue('');
            setFiles([]);

            // Keep focus on input after submission
            textareaRef.current?.focus();
        }, [value, files, isStreaming, disabled, onSubmit]);

        const handleChange: ChangeEventHandler<HTMLTextAreaElement> = useCallback((e) => {
            setValue(e.target.value);
        }, []);

        const handleKeyDown = useCallback(
            (e: KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                }

                if (e.key === 'Escape' && isStreaming && onStop) {
                    e.preventDefault();
                    onStop();
                }
            },
            [isStreaming, handleSubmit, onStop]
        );

        useEffect(() => {
            return () => {
                files.forEach((file) => {
                    if (file.url) URL.revokeObjectURL(file.url);
                });
            };
        }, [files]);

        return (
            <div className="mx-auto w-full max-w-4xl">
                <div
                    className={cn(
                        'bg-muted border-input focus-within:border-ring focus-within:ring-ring/20 relative flex flex-col gap-2 rounded-xl border p-3 transition-all focus-within:ring-2',
                        isDragging && 'border-primary bg-primary/5'
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={accept}
                        multiple
                        onChange={handleFileInputChange}
                        className="hidden"
                        aria-label="Upload files"
                    />

                    {files.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {files.map((file) => (
                                <FilePreview
                                    key={file.id}
                                    file={file}
                                    onRemove={() => removeFile(file.id)}
                                />
                            ))}
                        </div>
                    )}

                    <Textarea
                        ref={textareaRef}
                        value={value}
                        onChange={handleChange}
                        placeholder={placeholder}
                        disabled={disabled || isStreaming}
                        onKeyDown={handleKeyDown}
                        className="min-h-6 resize-none border-0 bg-transparent p-0 text-base shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        rows={rows}
                        name={name}
                        aria-label="Chat message input"
                    />

                    <div className="flex w-full items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={disabled || isStreaming || files.length >= maxFiles}
                            className="mr-auto h-8 w-8 bg-transparent p-0 hover:bg-black/5 dark:hover:bg-white/10"
                            aria-label="Attach files"
                        >
                            <Paperclip className="size-4" />
                        </Button>

                        <ModelSelector disabled={hasStarted} />

                        {isStreaming && onStop ? (
                            <Button
                                type="button"
                                onClick={onStop}
                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground h-8 w-8 p-0"
                                aria-label="Stop message"
                            >
                                <Square className="fill-current" />
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                disabled={disabled || (value === '' && files.length === 0)}
                                className="bg-primary hover:bg-primary/90 disabled:bg-primary/90 text-primary-foreground h-8 w-8 p-0"
                                onClick={handleSubmit}
                                aria-label="Send message"
                            >
                                <Send />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    }
);

PromptInput.displayName = 'PromptInput';

type FilePreviewProps = {
    file: FileWithPreview;
    onRemove: () => void;
};

function FilePreview({ file, onRemove }: FilePreviewProps) {
    const isImage = isImageFile(file.mediaType, file.filename);

    return (
        <div className="group relative">
            {isImage ? (
                <div className="border-border relative h-20 w-20 overflow-hidden rounded-lg border-2">
                    <img
                        src={file.url}
                        alt={file.filename || 'attachment'}
                        className="size-full object-cover"
                    />
                </div>
            ) : (
                <div className="border-border bg-secondary flex h-20 w-32 items-center gap-2 rounded-lg border-2 px-3">
                    <Paperclip className="text-muted-foreground size-4 shrink-0" />
                    <span className="truncate text-xs">{file.filename}</span>
                </div>
            )}
            <button
                type="button"
                onClick={onRemove}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground focus:ring-ring absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none"
                aria-label="Remove file"
            >
                <X className="size-3" />
            </button>
        </div>
    );
}
