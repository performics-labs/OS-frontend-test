import { createBrowserRouter } from 'react-router';
import { routes } from './routes';

export const router = createBrowserRouter(routes);

// Re-export routes for testing purposes
export { routes } from './routes';
