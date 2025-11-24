import { ChevronUp, Moon, Sun, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router';

import { useAuth } from '@/hooks/useAuth';
import { useThemeContext } from '@/hooks/useThemeContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';

export function SidebarUserNav() {
    const navigate = useNavigate();
    const { user, isLoading, logout } = useAuth();
    const { theme, toggleTheme } = useThemeContext();
    const { state } = useSidebar();

    const handleLogout = async () => {
        const result = await logout();
        if (result.success) {
            navigate('/login');
        }
    };

    const displayUser = user || { email: 'Guest User' };
    const avatarUrl = `https://avatar.vercel.sh/${displayUser.email}`;

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        {isLoading ? (
                            <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent bg-background data-[state=open]:text-sidebar-accent-foreground h-10 justify-between">
                                <div className="flex flex-row gap-2">
                                    <div className="bg-muted size-6 animate-pulse rounded-full" />
                                    <span className="bg-muted animate-pulse rounded-md text-transparent">
                                        Loading user...
                                    </span>
                                </div>
                            </SidebarMenuButton>
                        ) : (
                            <SidebarMenuButton
                                size="lg"
                                className="data-[state=open]:bg-sidebar-accent bg-background data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:!p-1"
                            >
                                <img
                                    src={avatarUrl}
                                    alt={`Profile picture for ${displayUser.email}`}
                                    className="size-6 shrink-0 rounded-full"
                                />
                                <span className="truncate">{displayUser.email}</span>
                                <ChevronUp className="ml-auto" />
                            </SidebarMenuButton>
                        )}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        side={state === 'collapsed' ? 'right' : 'top'}
                        align={state === 'collapsed' ? 'end' : 'center'}
                        sideOffset={state === 'collapsed' ? 8 : 4}
                        className={
                            state === 'collapsed'
                                ? 'min-w-[200px]'
                                : 'w-[--radix-popper-anchor-width]'
                        }
                    >
                        <DropdownMenuItem className="cursor-pointer" onSelect={toggleTheme}>
                            {theme === 'dark' ? (
                                <Sun className="mr-2 size-4" />
                            ) : (
                                <Moon className="mr-2 size-4" />
                            )}
                            {`Toggle ${theme === 'light' ? 'dark' : 'light'} mode`}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <button
                                type="button"
                                className="w-full cursor-pointer"
                                onClick={handleLogout}
                                disabled={isLoading}
                            >
                                <LogOut className="mr-2 size-4" />
                                Sign out
                            </button>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
