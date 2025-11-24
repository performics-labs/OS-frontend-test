import { Component, type ReactNode } from 'react';
import { Outlet } from 'react-router';

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    state: State = {
        hasError: false,
        error: undefined,
    };

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 p-4 text-center text-sm">
                    <div>Something went wrong</div>
                    <button
                        type="button"
                        onClick={() => this.setState({ hasError: false, error: undefined })}
                        className="text-primary hover:underline"
                    >
                        Try again
                    </button>
                </div>
            );
        }

        return this.props.children || <Outlet />;
    }
}
