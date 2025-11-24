import { cn } from '@/lib/utils';
import { getFileType, isImageFile } from '@/utils/file-helpers';
import type { FileUIPart } from 'ai';
import { FileIcon, FileTextIcon, ImageIcon } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

export type MessageAttachmentsProps = HTMLAttributes<HTMLDivElement> & {
    files: FileUIPart[];
};

export const MessageAttachments = ({ files, className, ...props }: MessageAttachmentsProps) => {
    if (!files.length) return null;

    return (
        <div className={cn('flex flex-wrap gap-2', className)} {...props}>
            {files.map((file, index) => {
                const key = `attachment-${index}`;
                if (isImageFile(file.mediaType, file.filename)) {
                    return <MessageAttachmentImage key={key} file={file} />;
                }
                return <MessageAttachmentFile key={key} file={file} />;
            })}
        </div>
    );
};

export type MessageAttachmentImageProps = {
    file: FileUIPart;
    className?: string;
};

export const MessageAttachmentImage = ({ file, className }: MessageAttachmentImageProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        'group border-border hover:border-primary focus:ring-ring relative overflow-hidden rounded-lg border-2 transition-all focus:ring-2 focus:ring-offset-2 focus:outline-none',
                        className
                    )}
                    aria-label={`View image: ${file.filename || 'attachment'}`}
                >
                    <img
                        src={file.url}
                        alt={file.filename || 'attachment'}
                        className="h-48 w-auto max-w-xs object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                    />
                    {file.filename && (
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                            {file.filename}
                        </div>
                    )}
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
                <div className="flex flex-col items-center gap-4">
                    <img
                        src={file.url}
                        alt={file.filename || 'attachment'}
                        className="max-h-[80vh] w-auto max-w-full rounded-lg"
                    />
                    {file.filename && (
                        <p className="text-muted-foreground text-sm">{file.filename}</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export type MessageAttachmentFileProps = {
    file: FileUIPart;
    className?: string;
};

export const MessageAttachmentFile = ({ file, className }: MessageAttachmentFileProps) => {
    const fileType = getFileType(file.mediaType, file.filename);
    const displayName = file.filename || 'Unknown file';

    const getIcon = () => {
        switch (fileType) {
            case 'pdf':
                return <FileTextIcon className="size-5 text-red-500" />;
            case 'document':
                return <FileTextIcon className="size-5 text-blue-500" />;
            case 'image':
                return <ImageIcon className="size-5 text-green-500" />;
            default:
                return <FileIcon className="text-muted-foreground size-5" />;
        }
    };

    return (
        <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                'group border-border bg-secondary hover:border-primary hover:bg-secondary/80 focus:ring-ring flex items-center gap-3 rounded-lg border px-4 py-3 transition-all focus:ring-2 focus:ring-offset-2 focus:outline-none',
                className
            )}
            aria-label={`Download ${displayName}`}
        >
            <div className="shrink-0">{getIcon()}</div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{displayName}</p>
                {file.mediaType && (
                    <p className="text-muted-foreground text-xs">{fileType.toUpperCase()}</p>
                )}
            </div>
            <div className="text-muted-foreground shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                </svg>
            </div>
        </a>
    );
};
