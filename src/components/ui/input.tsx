import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const inputVariants = cva(
    'file:text-foreground placeholder:text-muted-foreground flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
    {
        variants: {
            state: {
                default: 'border-input focus-visible:ring-ring',
                error: 'border-destructive focus-visible:ring-destructive',
                success: 'border-disrupt-500 focus-visible:ring-disrupt-500',
            },
        },
        defaultVariants: {
            state: 'default',
        },
    }
);

export interface InputProps
    extends React.ComponentProps<'input'>,
        VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, state, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(inputVariants({ state, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Input.displayName = 'Input';

export { Input };
