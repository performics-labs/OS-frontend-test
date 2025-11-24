import type { ChatPrompt } from '@/types/chat';

export const STARTER_PROMPTS: ChatPrompt[] = [
    {
        id: '1',
        title: 'Brainstorm content ideas',
        description: 'for my new podcast on urban design',
        prompt: 'Brainstorm content ideas for my new podcast on urban design',
        icon: 'lightbulb',
    },
    {
        id: '2',
        title: 'Generate a Python script',
        description: 'for data analysis and visualization',
        prompt: 'Generate a Python script for data analysis',
        icon: 'barchart',
    },
    {
        id: '3',
        title: 'Create a button component',
        description: 'with variant support and styling',
        prompt: 'Create a button component',
        icon: 'star',
    },
    {
        id: '4',
        title: 'Build a data table',
        description: 'with sorting and filtering',
        prompt: 'Build a data table component',
        icon: 'pencil',
    },
];
