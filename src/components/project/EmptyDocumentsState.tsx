import { FileUp } from 'lucide-react';

type EmptyDocumentsStateProps = {
    message?: string;
};

export function EmptyDocumentsState({
    message = 'No documents yet. Upload files to add project knowledge.',
}: EmptyDocumentsStateProps) {
    return (
        <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <div className="bg-light-grey-100 dark:bg-warm-black-700 mb-4 rounded-full p-4">
                <FileUp className="text-warm-black-300 dark:text-light-grey-300 size-8" />
            </div>
            <h3 className="text-warm-black-500 dark:text-light-grey-500 mb-1 text-sm font-medium">
                No documents
            </h3>
            <p className="text-warm-black-300 dark:text-light-grey-300 max-w-xs text-sm">
                {message}
            </p>
        </div>
    );
}
