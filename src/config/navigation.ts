import { Plus, Grid2x2Plus, Layers, History, Palette, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { APP_ROUTES } from '@/constants';

export type NavItem = {
    title: string;
    url: string;
    icon: LucideIcon;
};

export const navMain: NavItem[] = [
    {
        title: 'New Chat',
        url: APP_ROUTES.CHAT_NEW,
        icon: Plus,
    },
    {
        title: 'Projects',
        url: APP_ROUTES.PROJECTS,
        icon: Grid2x2Plus,
    },
    {
        title: 'Knowledge Base',
        url: APP_ROUTES.KNOWLEDGE_BASE,
        icon: Layers,
    },
];

export const navSecondary: NavItem[] = [
    {
        title: 'History',
        url: '#',
        icon: History,
    },
    {
        title: 'Design System',
        url: APP_ROUTES.DESIGN_SYSTEM,
        icon: Palette,
    },
    {
        title: 'Tools Showcase',
        url: APP_ROUTES.TOOLS_SHOWCASE,
        icon: Wrench,
    },
];
