import { Link } from 'react-router';
import type { LucideIcon } from 'lucide-react';

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

type NavSecondaryProps = {
    items: {
        title: string;
        url: string;
        icon: LucideIcon;
        onClick?: (e: React.MouseEvent) => void;
        isActive?: boolean;
    }[];
};

export function NavSecondary({ items }: NavSecondaryProps) {
    return (
        <SidebarGroup>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                tooltip={item.title}
                                isActive={item.isActive}
                            >
                                <Link to={item.url} onClick={item.onClick}>
                                    <item.icon />
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
