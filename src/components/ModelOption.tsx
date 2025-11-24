import type { Model } from '@/types';
import { SelectItem } from '@/components/ui/select';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib';
import { memo } from 'react';
import { Info } from 'lucide-react';

interface ModelOptionProps {
    model: Model;
    isSelected: boolean;
}

export const ModelOption = memo(function ({ model, isSelected }: ModelOptionProps) {
    return (
        <SelectItem
            value={model.id}
            className={cn(
                'mb-1 flex w-full cursor-pointer items-start gap-2 rounded-md p-1.5 transition-colors outline-none [&>*]:flex-1 [&>span.absolute]:hidden',
                isSelected && 'bg-muted'
            )}
        >
            <div className="flex w-full items-center justify-between gap-2">
                <p className="text-xs leading-none font-bold">{model.name}</p>
                <HoverCard openDelay={200}>
                    <HoverCardTrigger asChild>
                        <Info className="text-muted-foreground h-3 w-3" />
                    </HoverCardTrigger>
                    <HoverCardContent side="right" align="start" className="z-[100] w-80 p-0">
                        <div className="flex flex-col p-4">
                            <CardTitle className="mb-3 text-sm font-semibold">
                                {model.name}
                            </CardTitle>
                            <CardDescription className="mb-3 text-xs">
                                {model.description}
                            </CardDescription>
                            {model.capabilities && model.capabilities.length > 0 && (
                                <CardContent className="mb-3 p-0">
                                    <div className="space-y-2">
                                        <p className="text-muted-foreground text-xs font-medium">
                                            Main Capabilities
                                        </p>
                                        <ul className="space-y-1">
                                            {model.capabilities.map((capability, index) => (
                                                <li
                                                    key={index}
                                                    className="flex items-start gap-1.5 text-xs"
                                                >
                                                    <span className="text-muted-foreground mt-0.5">
                                                        •
                                                    </span>
                                                    <span>{capability}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                            )}
                            {model.platforms && model.platforms.length > 0 && (
                                <CardFooter className="border-t p-0 pt-3">
                                    <div className="w-full space-y-2">
                                        <p className="text-muted-foreground text-xs font-medium">
                                            Available Platforms
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {model.platforms.map((platform, index) => (
                                                <span
                                                    key={index}
                                                    className="bg-muted inline-flex items-center rounded-md px-2 py-1 text-xs"
                                                >
                                                    {platform}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </CardFooter>
                            )}
                        </div>
                    </HoverCardContent>
                </HoverCard>
            </div>
        </SelectItem>
    );
});
