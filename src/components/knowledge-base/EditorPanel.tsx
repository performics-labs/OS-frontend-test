import type { KBDocument } from '@/types/knowledgeBase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, Tag, FolderTree, Save, Loader2, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { InlineEditor } from './InlineEditor';
import { stripYamlFrontmatter, extractYamlFrontmatter, addYamlFrontmatter } from '@/utils';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

type EditorPanelProps = {
    document: KBDocument | null;
    isLoading?: boolean;
    isPublishing?: boolean;
    saveStatus?: SaveStatus;
    onContentUpdate?: (content: string) => void;
    onTogglePublish?: (document: KBDocument, currentStatus: 'draft' | 'published') => void;
    onDelete?: (document: KBDocument) => void;
};

export function EditorPanel({
    document,
    isLoading = false,
    isPublishing = false,
    saveStatus = 'idle',
    onContentUpdate,
    onTogglePublish,
    onDelete,
}: EditorPanelProps) {
    if (isLoading) {
        return (
            <div className="flex h-full flex-col gap-4 p-6">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="mt-4 h-96 w-full" />
            </div>
        );
    }

    if (!document) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
                <FileText className="text-muted-foreground h-16 w-16" />
                <div>
                    <h3 className="text-foreground mb-1 text-lg font-semibold">
                        No document selected
                    </h3>
                    <p className="text-muted-foreground text-sm">
                        Select a document from the sidebar to view its content
                    </p>
                </div>
            </div>
        );
    }

    const getSaveStatusText = () => {
        switch (saveStatus) {
            case 'saving':
                return 'Saving...';
            case 'saved':
                return 'Saved';
            case 'error':
                return 'Error saving';
            default:
                return '';
        }
    };

    return (
        <div className="flex h-full flex-col overflow-y-auto p-6">
            <div className="mb-6">
                <div className="mb-2 flex items-start justify-between gap-4">
                    <h1 className="text-foreground text-2xl font-bold">{document.title}</h1>
                    <div className="flex items-center gap-3">
                        {saveStatus !== 'idle' && (
                            <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
                                {saveStatus === 'saving' && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                                {saveStatus === 'saved' && <Save className="h-4 w-4" />}
                                <span>{getSaveStatusText()}</span>
                            </div>
                        )}
                        {onTogglePublish && (
                            <div className="flex items-center gap-2">
                                <label
                                    htmlFor="publish-toggle"
                                    className="cursor-pointer text-sm font-medium"
                                >
                                    Published
                                </label>
                                <Switch
                                    id="publish-toggle"
                                    checked={document.status === 'published'}
                                    disabled={isPublishing}
                                    onCheckedChange={() =>
                                        onTogglePublish(
                                            document,
                                            document.status as 'draft' | 'published'
                                        )
                                    }
                                />
                            </div>
                        )}
                        {onDelete && (
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => onDelete(document)}
                                aria-label="Delete document"
                                className="text-muted-foreground hover:text-destructive"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>
                            Updated{' '}
                            {formatDistanceToNow(new Date(document.updated_at), {
                                addSuffix: true,
                            })}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <FolderTree className="h-4 w-4" />
                        <span className="capitalize">{document.category.replace('-', ' ')}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <Tag className="h-4 w-4" />
                        <span className="capitalize">{document.priority}</span>
                    </div>
                </div>

                {document.tags && document.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {document.tags.map((tag, index) => (
                            <Badge key={index} variant="outline">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>

            <Card className="flex-1">
                <CardContent className="pt-6">
                    <InlineEditor
                        content={stripYamlFrontmatter(document.content)}
                        onUpdate={(newContent) => {
                            if (onContentUpdate) {
                                // Preserve frontmatter when saving
                                const frontmatter = extractYamlFrontmatter(document.content);
                                const fullContent = frontmatter
                                    ? addYamlFrontmatter(newContent, frontmatter)
                                    : newContent;
                                onContentUpdate(fullContent);
                            }
                        }}
                        editable={document.status === 'draft'}
                        placeholder="Start writing your knowledge base document..."
                    />
                </CardContent>
            </Card>

            {document.applies_to && document.applies_to.length > 0 && (
                <Card className="mt-4">
                    <CardHeader>
                        <CardTitle className="text-base">Applies To</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {document.applies_to.map((item, index) => (
                                <Badge key={index} variant="secondary">
                                    {item}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {document.context_triggers && document.context_triggers.length > 0 && (
                <Card className="mt-4">
                    <CardHeader>
                        <CardTitle className="text-base">Context Triggers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {document.context_triggers.map((trigger, index) => (
                                <Badge key={index} variant="secondary">
                                    {trigger}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
