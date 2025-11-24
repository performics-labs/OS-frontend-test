import type { ChatPrompt } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LightningBoltIcon, Pencil2Icon, BarChartIcon, StarIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';

const iconMap = {
    lightbulb: LightningBoltIcon,
    pencil: Pencil2Icon,
    barchart: BarChartIcon,
    star: StarIcon,
} as const;

type PromptCardProps = {
    prompt: ChatPrompt;
    onClick?: (prompt: ChatPrompt) => void;
    className?: string;
};

export function PromptCard({ prompt, onClick, className }: PromptCardProps) {
    const Icon =
        prompt.icon && prompt.icon in iconMap ? iconMap[prompt.icon as keyof typeof iconMap] : null;

    const handleClick = () => {
        onClick?.(prompt);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.(prompt);
        }
    };

    return (
        <Card
            className={cn(
                'cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg',
                'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                className
            )}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="button"
            aria-label={`Select prompt: ${prompt.title} ${prompt.description}`}
        >
            <CardHeader className="flex flex-row items-start gap-4 pb-3">
                {Icon && (
                    <div
                        className="flex h-12 w-12 items-center justify-center rounded-lg"
                        aria-hidden="true"
                    >
                        <Icon className="text-primary h-6 w-6" />
                    </div>
                )}
                <div className="flex-1">
                    <CardTitle className="text-lg">{prompt.title}</CardTitle>
                    <CardDescription className="mt-1 text-sm">{prompt.description}</CardDescription>
                </div>
            </CardHeader>
        </Card>
    );
}
