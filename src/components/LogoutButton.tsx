import { useAuth } from '@/hooks';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function LogoutButton() {
    const { logout, isAuthenticated, isLoading } = useAuth();
    const handleLogout = async () => {
        const { success, error } = await logout();

        if (!success && error) {
            toast.error(error);
        }

        window.location.href = '/login';
    };

    if (!isAuthenticated) return null;

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2"
            aria-label="Logout"
            disabled={isLoading}
        >
            <span>➜]</span>
            <span>Logout</span>
        </Button>
    );
}
