import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import type { KBDocument, KBCategory, KBPriority } from '@/types/knowledgeBase';

type KBDocumentFormProps = {
    document?: KBDocument | null;
    parentId?: string | null;
    isFolder?: boolean;
    onSubmit: (data: FormData) => void | Promise<void>;
    onCancel: () => void;
    isSubmitting?: boolean;
};

export type FormData = {
    title: string;
    content: string;
    category: KBCategory;
    priority: KBPriority;
    tags: string[];
    applies_to: string[];
    context_triggers: string[];
    parent_id?: string | null;
    is_folder: boolean;
};

const CATEGORIES: { value: KBCategory; label: string }[] = [
    { value: 'brand', label: 'Brand' },
    { value: 'channels', label: 'Channels' },
    { value: 'performance', label: 'Performance' },
    { value: 'client-management', label: 'Client Management' },
];

const PRIORITIES: { value: KBPriority; label: string }[] = [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
];

export function KBDocumentForm({
    document,
    parentId,
    isFolder = false,
    onSubmit,
    onCancel,
    isSubmitting = false,
}: KBDocumentFormProps) {
    const [title, setTitle] = useState(document?.title || '');
    const [content, setContent] = useState(document?.content || '');
    const [category, setCategory] = useState<KBCategory>(document?.category || 'brand');
    const [priority, setPriority] = useState<KBPriority>(document?.priority || 'medium');
    const [tags, setTags] = useState<string[]>(document?.tags || []);
    const [tagInput, setTagInput] = useState('');
    const [appliesTo, setAppliesTo] = useState<string[]>(document?.applies_to || []);
    const [appliesToInput, setAppliesToInput] = useState('');
    const [contextTriggers, setContextTriggers] = useState<string[]>(
        document?.context_triggers || []
    );
    const [contextTriggerInput, setContextTriggerInput] = useState('');

    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter((t) => t !== tag));
    };

    const handleAddAppliesTo = () => {
        if (appliesToInput.trim() && !appliesTo.includes(appliesToInput.trim())) {
            setAppliesTo([...appliesTo, appliesToInput.trim()]);
            setAppliesToInput('');
        }
    };

    const handleRemoveAppliesTo = (item: string) => {
        setAppliesTo(appliesTo.filter((a) => a !== item));
    };

    const handleAddContextTrigger = () => {
        if (contextTriggerInput.trim() && !contextTriggers.includes(contextTriggerInput.trim())) {
            setContextTriggers([...contextTriggers, contextTriggerInput.trim()]);
            setContextTriggerInput('');
        }
    };

    const handleRemoveContextTrigger = (trigger: string) => {
        setContextTriggers(contextTriggers.filter((t) => t !== trigger));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData: FormData = {
            title: title.trim(),
            content: content.trim(),
            category,
            priority,
            tags: tags.length > 0 ? tags : [],
            applies_to: appliesTo.length > 0 ? appliesTo : [],
            context_triggers: contextTriggers.length > 0 ? contextTriggers : [],
            parent_id: parentId || document?.parent_id || null,
            is_folder: isFolder,
        };

        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="title">
                    {isFolder ? 'Folder Name' : 'Document Title'}{' '}
                    <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={isFolder ? 'Enter folder name' : 'Enter document title'}
                    required
                    autoFocus
                />
            </div>

            {!isFolder && (
                <>
                    <div className="space-y-2">
                        <Label htmlFor="content">
                            Content <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Enter document content (supports Markdown)"
                            className="min-h-[200px] resize-y"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">
                                Category <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={category}
                                onValueChange={(value) => setCategory(value as KBCategory)}
                            >
                                <SelectTrigger id="category">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select
                                value={priority}
                                onValueChange={(value) => setPriority(value as KBPriority)}
                            >
                                <SelectTrigger id="priority">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PRIORITIES.map((pri) => (
                                        <SelectItem key={pri.value} value={pri.value}>
                                            {pri.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags</Label>
                        <div className="flex gap-2">
                            <Input
                                id="tags"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddTag();
                                    }
                                }}
                                placeholder="Add a tag and press Enter"
                            />
                            <Button type="button" onClick={handleAddTag} variant="secondary">
                                Add
                            </Button>
                        </div>
                        {tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                    <Badge
                                        key={tag}
                                        variant="secondary"
                                        className="flex items-center gap-1"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="hover:bg-accent-foreground/10 rounded-sm"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="applies-to">Applies To</Label>
                        <div className="flex gap-2">
                            <Input
                                id="applies-to"
                                value={appliesToInput}
                                onChange={(e) => setAppliesToInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddAppliesTo();
                                    }
                                }}
                                placeholder="Add item and press Enter"
                            />
                            <Button type="button" onClick={handleAddAppliesTo} variant="secondary">
                                Add
                            </Button>
                        </div>
                        {appliesTo.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {appliesTo.map((item) => (
                                    <Badge
                                        key={item}
                                        variant="outline"
                                        className="flex items-center gap-1"
                                    >
                                        {item}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveAppliesTo(item)}
                                            className="hover:bg-accent-foreground/10 rounded-sm"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="context-triggers">Context Triggers</Label>
                        <div className="flex gap-2">
                            <Input
                                id="context-triggers"
                                value={contextTriggerInput}
                                onChange={(e) => setContextTriggerInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddContextTrigger();
                                    }
                                }}
                                placeholder="Add trigger and press Enter"
                            />
                            <Button
                                type="button"
                                onClick={handleAddContextTrigger}
                                variant="secondary"
                            >
                                Add
                            </Button>
                        </div>
                        {contextTriggers.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {contextTriggers.map((trigger) => (
                                    <Badge
                                        key={trigger}
                                        variant="outline"
                                        className="flex items-center gap-1"
                                    >
                                        {trigger}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveContextTrigger(trigger)}
                                            className="hover:bg-accent-foreground/10 rounded-sm"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting || !title.trim() || (!isFolder && !content.trim())}
                >
                    {isSubmitting ? 'Saving...' : document ? 'Update' : 'Create'}
                </Button>
            </div>
        </form>
    );
}
