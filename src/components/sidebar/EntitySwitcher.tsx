// import { ChevronsUpDown } from 'lucide-react';

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

export function EntitySwitcher() {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                    <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                        <span className="text-lg font-semibold">OS</span>
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate text-xs">OneSuite</span>
                    </div>
                    {/* <ChevronsUpDown className="ml-auto" /> */}
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
