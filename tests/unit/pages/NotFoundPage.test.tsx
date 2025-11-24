import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { NotFoundPage } from '@/pages';

describe('NotFoundPage', () => {
    it('should render 404 error message', () => {
        render(
            <BrowserRouter>
                <NotFoundPage />
            </BrowserRouter>
        );
        expect(screen.getByText('404')).toBeInTheDocument();
        expect(screen.getByText('Page not found')).toBeInTheDocument();
    });

    it('should render helpful error description', () => {
        render(
            <BrowserRouter>
                <NotFoundPage />
            </BrowserRouter>
        );
        expect(screen.getByText(/couldn't find the page you're looking for/i)).toBeInTheDocument();
    });

    it('should render link to home page', () => {
        render(
            <BrowserRouter>
                <NotFoundPage />
            </BrowserRouter>
        );
        const homeLink = screen.getByRole('link', { name: /go to home/i });
        expect(homeLink).toBeInTheDocument();
        expect(homeLink).toHaveAttribute('href', '/chat/new');
    });

    it('should render link to login page', () => {
        render(
            <BrowserRouter>
                <NotFoundPage />
            </BrowserRouter>
        );
        const loginLink = screen.getByRole('link', { name: /go to login/i });
        expect(loginLink).toBeInTheDocument();
        expect(loginLink).toHaveAttribute('href', '/login');
    });
});
