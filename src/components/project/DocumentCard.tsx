import { FileText, Image, FileJson, File, Download, Trash2, CheckCircle } from 'lucide-react';
import type { ProjectDocument } from '@/types';
import { formatFileSize, formatRelativeTime } from '@/utils/file-helpers';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

type DocumentCardProps = {
    document: ProjectDocument;
    isSelected?: boolean;
    onToggleSelect?: (documentId: string) => void;
    onDelete?: (documentId: string) => void;
    onDownload?: (documentId: string) => void;
    showCheckbox?: boolean;
};

const getDocumentIcon = (type: ProjectDocument['type']) => {
    switch (type) {
        case 'pdf':
            return <FileText className="text-disrupt-500 size-5" />;
        case 'image':
            return <Image className="text-disrupt-500 size-5" />;
        case 'json':
            return <FileJson className="text-disrupt-500 size-5" />;
        case 'csv':
        case 'md':
        case 'txt':
        case 'docx':
            return <FileText className="text-disrupt-500 size-5" />;
        default:
            return <File className="text-warm-black-300 size-5" />;
    }
};

const getDocumentTypeLabel = (type: ProjectDocument['type']): string => {
    switch (type) {
        case 'pdf':
            return 'PDF';
        case 'image':
            return 'Image';
        case 'json':
            return 'JSON';
        case 'csv':
            return 'CSV';
        case 'md':
            return 'Markdown';
        case 'txt':
            return 'Text';
        case 'docx':
            return 'Document';
        default:
            return 'File';
    }
};

export function DocumentCard({
    document,
    isSelected = false,
    onToggleSelect,
    onDelete,
    onDownload,
    showCheckbox = false,
}: DocumentCardProps) {
    return (
        <Card className="hover:bg-light-grey-100 dark:hover:bg-warm-black-700 p-4 transition-colors">
            <div className="flex items-start gap-3">
                {showCheckbox && onToggleSelect && (
                    <div className="flex items-center pt-0.5">
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => onToggleSelect(document.id)}
                            aria-label={`Select ${document.name}`}
                        />
                    </div>
                )}

                <div className="flex-shrink-0 pt-0.5">{getDocumentIcon(document.type)}</div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            <h4 className="text-warm-black-500 dark:text-light-grey-500 truncate text-sm font-medium">
                                {document.name}
                            </h4>
                            <div className="mt-1 flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                    {getDocumentTypeLabel(document.type)}
                                </Badge>
                                <span className="text-warm-black-300 dark:text-light-grey-300 text-xs">
                                    {formatFileSize(document.size)}
                                </span>
                                <span className="text-warm-black-300 dark:text-light-grey-300 text-xs">
                                    {formatRelativeTime(document.uploaded_at)}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            {isSelected && (
                                <div className="mr-1">
                                    <CheckCircle className="text-disrupt-500 size-4" />
                                </div>
                            )}
                            {onDownload && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onDownload(document.id)}
                                    className="size-8 p-0"
                                    title="Download document"
                                >
                                    <Download className="size-4" />
                                </Button>
                            )}
                            {onDelete && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onDelete(document.id)}
                                    className="size-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                                    title="Delete document"
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {document.content && (
                        <p className="text-warm-black-300 dark:text-light-grey-300 mt-2 line-clamp-2 text-xs">
                            {document.content.substring(0, 150)}...
                        </p>
                    )}
                </div>
            </div>
        </Card>
    );
}
