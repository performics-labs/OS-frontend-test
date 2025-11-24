import { useState } from 'react';
import { Library, Plus, X } from 'lucide-react';
import type { ProjectDocument } from '@/types';
import { DocumentList } from './DocumentList';
import { DocumentUploadZone } from './DocumentUploadZone';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';

type ProjectKnowledgePanelProps = {
    documents: ProjectDocument[];
    selectedDocumentIds?: string[];
    onToggleSelect?: (documentId: string) => void;
    onDeleteDocument?: (documentId: string) => void;
    onUploadDocuments?: (files: File[]) => void;
    onDownloadDocument?: (documentId: string) => void;
    isUploading?: boolean;
    showCheckbox?: boolean;
    maxFiles?: number;
    maxFileSize?: number;
};

export function ProjectKnowledgePanel({
    documents,
    selectedDocumentIds = [],
    onToggleSelect,
    onDeleteDocument,
    onUploadDocuments,
    onDownloadDocument,
    isUploading = false,
    showCheckbox = false,
    maxFiles = 5,
    maxFileSize = 10,
}: ProjectKnowledgePanelProps) {
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    const handleUpload = (files: File[]) => {
        onUploadDocuments?.(files);
        setIsUploadOpen(false);
    };

    return (
        <Card className="flex h-full flex-col">
            <div className="border-light-grey-200 dark:border-warm-black-700 border-b p-4">
                <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Library className="text-disrupt-500 size-5" />
                        <h2 className="text-warm-black-500 dark:text-light-grey-500 text-lg font-semibold">
                            Project Knowledge
                        </h2>
                    </div>
                    {onUploadDocuments && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsUploadOpen(!isUploadOpen)}
                            className="size-8 p-0"
                            aria-label={isUploadOpen ? 'Close upload' : 'Upload documents'}
                        >
                            {isUploadOpen ? <X className="size-4" /> : <Plus className="size-4" />}
                        </Button>
                    )}
                </div>
                <p className="text-warm-black-300 dark:text-light-grey-300 text-sm">
                    {documents.length} document{documents.length !== 1 ? 's' : ''}
                    {showCheckbox &&
                        selectedDocumentIds.length > 0 &&
                        ` · ${selectedDocumentIds.length} selected`}
                </p>
            </div>

            <div className="flex-1 overflow-hidden">
                <Collapsible open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                    <CollapsibleContent>
                        <div className="border-light-grey-200 dark:border-warm-black-700 border-b p-4">
                            <DocumentUploadZone
                                onUpload={handleUpload}
                                isUploading={isUploading}
                                maxFiles={maxFiles}
                                maxFileSize={maxFileSize}
                            />
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                <div className="h-full overflow-hidden p-4">
                    <DocumentList
                        documents={documents}
                        selectedDocumentIds={selectedDocumentIds}
                        onToggleSelect={onToggleSelect}
                        onDelete={onDeleteDocument}
                        onDownload={onDownloadDocument}
                        showCheckbox={showCheckbox}
                        maxHeight={isUploadOpen ? '300px' : '600px'}
                    />
                </div>
            </div>
        </Card>
    );
}
