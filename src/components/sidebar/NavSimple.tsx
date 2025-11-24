import { Link, useLocation } from 'react-router';

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/config/navigation';

type NavSimpleProps = {
    items: NavItem[];
};

export function NavSimple({ items }: NavSimpleProps) {
    const { pathname } = useLocation();

    return (
        <SidebarGroup>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => {
                        const basePath = item.url.startsWith('/')
                            ? '/' + (item.url.split('/')[1] || '')
                            : item.url;
                        const isActive = item.url !== '#' && pathname.startsWith(basePath);

                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton tooltip={item.title} isActive={isActive} asChild>
                                    <Link to={item.url}>
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
