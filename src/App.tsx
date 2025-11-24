import { RouterProvider } from 'react-router';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';
import { router } from '@/router';

function App() {
    return (
        <ThemeProvider>
            <RouterProvider router={router} />
            <Toaster position="top-center" />
        </ThemeProvider>
    );
}

export default App;
