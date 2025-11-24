import { FileText, X } from 'lucide-react';
import type { ProjectDocument } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type DocumentContextIndicatorProps = {
    documents: ProjectDocument[];
    selectedDocumentIds: string[];
    onRemoveDocument?: (documentId: string) => void;
    onClearAll?: () => void;
    className?: string;
};

export function DocumentContextIndicator({
    documents,
    selectedDocumentIds,
    onRemoveDocument,
    onClearAll,
    className,
}: DocumentContextIndicatorProps) {
    const selectedDocuments = documents.filter((doc) => selectedDocumentIds.includes(doc.id));

    if (selectedDocuments.length === 0) {
        return null;
    }

    return (
        <div
            className={cn(
                'bg-disrupt-50 dark:bg-disrupt-950 border-disrupt-200 dark:border-disrupt-800 flex items-center gap-2 rounded-lg border p-3',
                className
            )}
        >
            <FileText className="text-disrupt-500 size-4 flex-shrink-0" />
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                <span className="text-disrupt-700 dark:text-disrupt-300 text-xs font-medium">
                    Using {selectedDocuments.length} document
                    {selectedDocuments.length > 1 ? 's' : ''}:
                </span>
                {selectedDocuments.map((doc) => (
                    <Badge
                        key={doc.id}
                        variant="secondary"
                        className="dark:bg-warm-black-800 flex items-center gap-1 bg-white text-xs"
                    >
                        <span className="max-w-[150px] truncate">{doc.name}</span>
                        {onRemoveDocument && (
                            <button
                                onClick={() => onRemoveDocument(doc.id)}
                                className="hover:text-disrupt-600 ml-1"
                                aria-label={`Remove ${doc.name} from context`}
                            >
                                <X className="size-3" />
                            </button>
                        )}
                    </Badge>
                ))}
            </div>
            {onClearAll && selectedDocuments.length > 1 && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearAll}
                    className="h-7 px-2 text-xs"
                    aria-label="Clear all documents from context"
                >
                    Clear all
                </Button>
            )}
        </div>
    );
}
