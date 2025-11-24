import { useModel } from '@/hooks';
import { Select, SelectContent, SelectTrigger } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { ModelOption } from '@/components/ModelOption';

interface ModelSelectorProps {
    disabled?: boolean;
}

export function ModelSelector({ disabled }: ModelSelectorProps) {
    const { models, isLoading, currentModel, setCurrentModel } = useModel();

    const handleValueChange = (value: string) => {
        const selectedModel = models?.find((model) => model.id === value);
        if (selectedModel) {
            setCurrentModel(selectedModel);
        }
    };

    return (
        <Select value={currentModel?.id} onValueChange={handleValueChange} disabled={disabled}>
            <SelectTrigger className="h-8 w-fit border-0 px-2 text-right shadow-none hover:bg-black/5 dark:hover:bg-white/10">
                <span className="text-muted-foreground block truncate px-1 text-xs">
                    {currentModel.name}
                </span>
            </SelectTrigger>
            <SelectContent className="relative min-w-[150px] p-1">
                {models && !isLoading ? (
                    models?.map((model) => (
                        <ModelOption
                            key={model.id}
                            model={model}
                            isSelected={model.id === currentModel?.id}
                        />
                    ))
                ) : (
                    <Spinner
                        data-testid="model-spinner"
                        className="absolute top-[50%] left-[50%] translate-[-50%]"
                    />
                )}
            </SelectContent>
        </Select>
    );
}
