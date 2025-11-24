import type { ProjectDocument } from '@/types';
import { DocumentCard } from './DocumentCard';
import { EmptyDocumentsState } from './EmptyDocumentsState';

type DocumentListProps = {
    documents: ProjectDocument[];
    selectedDocumentIds?: string[];
    onToggleSelect?: (documentId: string) => void;
    onDelete?: (documentId: string) => void;
    onDownload?: (documentId: string) => void;
    showCheckbox?: boolean;
    maxHeight?: string;
};

export function DocumentList({
    documents,
    selectedDocumentIds = [],
    onToggleSelect,
    onDelete,
    onDownload,
    showCheckbox = false,
    maxHeight = '500px',
}: DocumentListProps) {
    if (documents.length === 0) {
        return <EmptyDocumentsState />;
    }

    return (
        <div className="w-full overflow-y-auto" style={{ maxHeight }}>
            <div className="space-y-2 pr-1">
                {documents.map((document) => (
                    <DocumentCard
                        key={document.id}
                        document={document}
                        isSelected={selectedDocumentIds.includes(document.id)}
                        onToggleSelect={onToggleSelect}
                        onDelete={onDelete}
                        onDownload={onDownload}
                        showCheckbox={showCheckbox}
                    />
                ))}
            </div>
        </div>
    );
}
