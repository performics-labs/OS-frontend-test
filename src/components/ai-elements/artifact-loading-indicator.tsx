import { FileText } from 'lucide-react';
import { Loader } from './loader';

export type ArtifactLoadingIndicatorProps = {
    title: string;
    message?: string;
};

export function ArtifactLoadingIndicator({
    title,
    message = 'Creating',
}: ArtifactLoadingIndicatorProps) {
    return (
        <div className="border-border my-2 flex w-fit flex-row items-center gap-3 rounded-xl border px-3 py-2">
            <FileText className="text-muted-foreground size-4" />
            <div className="text-sm">
                {message} "{title}"
            </div>
            <Loader size={16} className="text-muted-foreground" />
        </div>
    );
}
