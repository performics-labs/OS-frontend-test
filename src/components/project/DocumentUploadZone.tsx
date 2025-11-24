import { useCallback, useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import { Upload, File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    validateFileSize,
    validateFileType,
    getAcceptedFileTypes,
    formatFileSize,
} from '@/utils/file-helpers';

type PendingFile = {
    id: string;
    file: File;
    preview?: string;
};

type DocumentUploadZoneProps = {
    onUpload: (files: File[]) => void;
    maxFiles?: number;
    maxFileSize?: number;
    isUploading?: boolean;
    disabled?: boolean;
    accept?: string;
};

export function DocumentUploadZone({
    onUpload,
    maxFiles = 5,
    maxFileSize = 10,
    isUploading = false,
    disabled = false,
    accept = getAcceptedFileTypes(),
}: DocumentUploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const addFiles = useCallback(
        (newFiles: FileList | File[]) => {
            const fileArray = Array.from(newFiles);
            const validFiles: PendingFile[] = [];

            for (const file of fileArray) {
                if (!validateFileType(file)) {
                    console.warn(`File type not supported: ${file.name}`);
                    continue;
                }
                if (!validateFileSize(file, maxFileSize)) {
                    console.warn(`File too large (max ${maxFileSize}MB): ${file.name}`);
                    continue;
                }
                validFiles.push({
                    id: `${Date.now()}-${Math.random()}-${file.name}`,
                    file,
                });
            }

            if (pendingFiles.length + validFiles.length > maxFiles) {
                console.warn(`Maximum ${maxFiles} files allowed`);
                return;
            }

            setPendingFiles((prev) => [...prev, ...validFiles]);
        },
        [pendingFiles.length, maxFiles, maxFileSize]
    );

    const removeFile = useCallback((id: string) => {
        setPendingFiles((prev) => prev.filter((f) => f.id !== id));
    }, []);

    const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            addFiles(e.target.files);
            e.target.value = '';
        }
    };

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            addFiles(e.dataTransfer.files);
        }
    };

    const handleUploadClick = () => {
        if (pendingFiles.length > 0) {
            onUpload(pendingFiles.map((pf) => pf.file));
            setPendingFiles([]);
        }
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    const isDisabled = disabled || isUploading;

    return (
        <div className="space-y-4">
            <div
                className={cn(
                    'relative rounded-lg border-2 border-dashed p-8 transition-colors',
                    isDragging
                        ? 'border-disrupt-500 bg-disrupt-50 dark:bg-disrupt-950'
                        : 'border-light-grey-300 dark:border-warm-black-600',
                    isDisabled && 'cursor-not-allowed opacity-50',
                    !isDisabled &&
                        'hover:border-disrupt-400 dark:hover:border-disrupt-600 cursor-pointer'
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={!isDisabled ? handleBrowseClick : undefined}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={accept}
                    onChange={handleFileInputChange}
                    disabled={isDisabled}
                    className="hidden"
                    aria-label="Upload documents"
                />

                <div className="flex flex-col items-center justify-center text-center">
                    <div className="bg-light-grey-100 dark:bg-warm-black-700 mb-3 rounded-full p-3">
                        <Upload className="text-disrupt-500 size-6" />
                    </div>
                    <p className="text-warm-black-500 dark:text-light-grey-500 mb-1 text-sm font-medium">
                        {isDragging ? 'Drop files here' : 'Drag and drop files here'}
                    </p>
                    <p className="text-warm-black-300 dark:text-light-grey-300 mb-3 text-xs">
                        or click to browse
                    </p>
                    <p className="text-warm-black-300 dark:text-light-grey-300 text-xs">
                        Supports PDF, Word, Excel, Text, CSV, Images (max {maxFileSize}MB)
                    </p>
                </div>
            </div>

            {pendingFiles.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h4 className="text-warm-black-500 dark:text-light-grey-500 text-sm font-medium">
                            Ready to upload ({pendingFiles.length})
                        </h4>
                        <Button
                            size="sm"
                            onClick={handleUploadClick}
                            disabled={isUploading}
                            className="bg-disrupt-500 hover:bg-disrupt-600 text-white"
                        >
                            {isUploading ? 'Uploading...' : 'Upload Files'}
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {pendingFiles.map((pendingFile) => (
                            <div
                                key={pendingFile.id}
                                className="bg-light-grey-100 dark:bg-warm-black-700 flex items-center justify-between rounded-lg p-3"
                            >
                                <div className="flex min-w-0 flex-1 items-center gap-3">
                                    <File className="text-disrupt-500 size-4 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-warm-black-500 dark:text-light-grey-500 truncate text-sm font-medium">
                                            {pendingFile.file.name}
                                        </p>
                                        <p className="text-warm-black-300 dark:text-light-grey-300 text-xs">
                                            {formatFileSize(pendingFile.file.size)}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile(pendingFile.id)}
                                    disabled={isUploading}
                                    className="size-8 p-0"
                                    aria-label={`Remove ${pendingFile.file.name}`}
                                >
                                    <X className="size-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
