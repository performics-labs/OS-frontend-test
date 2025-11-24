import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';
import { DataStreamProvider } from '@/contexts/DataStreamProvider';
import { DataStreamHandler } from '@/components/DataStreamHandler';

import { USE_MOCKS } from '@/constants';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

document.documentElement.classList.add('dark');

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
        },
    },
});

async function enableMocking() {
    if (USE_MOCKS) {
        console.info('Mocks enabled');
        const { worker } = await import('./mocks/browser');
        return worker.start({ onUnhandledRequest: 'bypass' });
    }
}

enableMocking().then(() => {
    createRoot(document.getElementById('root')!).render(
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <DataStreamProvider>
                    <DataStreamHandler />
                    <App />
                </DataStreamProvider>
            </QueryClientProvider>
        </StrictMode>
    );
});
