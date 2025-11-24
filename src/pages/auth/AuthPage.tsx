import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks';
import { loginWithEmail, registerWithEmail } from '@/services';
import { toast } from 'sonner';

type AuthMode = 'login' | 'signup';

export function AuthPage() {
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [imageError, setImageError] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { isAuthenticated, checkSessionExpiry, setAuth } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = mode === 'login'
                ? await loginWithEmail({ email, password })
                : await registerWithEmail({ email, password, name });

            toast.success(
                mode === 'login' ? 'Successfully logged in!' : 'Account created successfully!'
            );

            // Update auth store with user data
            setAuth(response.data.user);

            // Redirect to return URL or home
            const returnUrl = sessionStorage.getItem('auth_return_url') || '/';
            sessionStorage.removeItem('auth_return_url');
            navigate(returnUrl);

        } catch (error: any) {
            const errorMessage = error?.response?.data?.detail || 'Authentication failed';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleMode = () => {
        setMode(mode === 'login' ? 'signup' : 'login');
        setEmail('');
        setPassword('');
        setName('');
    };

    const isSessionExpired = checkSessionExpiry();

    if (isAuthenticated && !isSessionExpired) {
        return <Navigate to="/" replace />;
    }

    return (
        <main className="bg-background flex min-h-screen items-center justify-center p-4">
            <a
                href="#main-content"
                className="focus:bg-disrupt-500 focus:text-warm-black-500 sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:px-4 focus:py-2"
            >
                Skip to main content
            </a>
            <div id="main-content" className="flex w-full max-w-md flex-col items-center gap-8">
                <div className="flex items-center justify-center" aria-label="OneSuite branding">
                    {!imageError ? (
                        <img
                            src="/assets/logo.svg"
                            alt="OneSuite Logo"
                            className="h-32 w-auto invert dark:invert-0"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="text-warm-black-500 flex items-center justify-center">
                            <span className="text-3xl font-bold">OneSuite</span>
                        </div>
                    )}
                </div>

                <Card className="w-full">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl">
                            {mode === 'login' ? 'Welcome back' : 'Create an account'}
                        </CardTitle>
                        <CardDescription>
                            {mode === 'login'
                                ? 'Enter your credentials to access your account'
                                : 'Enter your details to create a new account'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {mode === 'signup' && (
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        autoComplete="name"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete={
                                        mode === 'login' ? 'current-password' : 'new-password'
                                    }
                                    minLength={8}
                                />
                                {mode === 'signup' && (
                                    <p className="text-muted-foreground text-sm">
                                        Must be at least 8 characters with uppercase, lowercase, and
                                        a number
                                    </p>
                                )}
                            </div>

                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting
                                    ? mode === 'login'
                                        ? 'Signing in...'
                                        : 'Creating account...'
                                    : mode === 'login'
                                      ? 'Sign in'
                                      : 'Create account'}
                            </Button>
                        </form>

                        <div className="mt-4 text-center text-sm">
                            <button
                                type="button"
                                onClick={toggleMode}
                                className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                            >
                                {mode === 'login'
                                    ? "Don't have an account? Sign up"
                                    : 'Already have an account? Sign in'}
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
