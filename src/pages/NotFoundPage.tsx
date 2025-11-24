import { Link } from 'react-router';
import { APP_ROUTES } from '@/constants/routes';

export function NotFoundPage() {
    return (
        <main className="bg-background flex min-h-screen items-center justify-center">
            <div className="text-center">
                <h1 className="text-foreground text-9xl font-bold">404</h1>
                <p className="text-foreground mt-4 text-2xl font-semibold">Page not found</p>
                <p className="text-muted-foreground mt-2">
                    Sorry, we couldn't find the page you're looking for.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                    <Link
                        to={APP_ROUTES.CHAT_NEW}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary rounded-md px-4 py-2 focus:ring-2 focus:ring-offset-2 focus:outline-none"
                    >
                        Go to Home
                    </Link>
                    <Link
                        to={APP_ROUTES.LOGIN}
                        className="border-input bg-background hover:bg-accent hover:text-accent-foreground focus:ring-primary rounded-md border px-4 py-2 focus:ring-2 focus:ring-offset-2 focus:outline-none"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        </main>
    );
}
