import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ComingSoonPage from '@/pages/ComingSoonPage';

describe('ComingSoonPage', () => {
    it('renders default title and message', () => {
        render(<ComingSoonPage />);

        expect(screen.getByRole('heading', { name: /coming soon/i })).toBeInTheDocument();
        expect(
            screen.getByText(/this feature is currently under development\. check back soon!/i)
        ).toBeInTheDocument();
    });

    it('renders custom title and message', () => {
        render(
            <ComingSoonPage
                title="Under Construction"
                message="We're building something awesome."
            />
        );

        expect(screen.getByRole('heading', { name: /under construction/i })).toBeInTheDocument();
        expect(screen.getByText(/we're building something awesome\./i)).toBeInTheDocument();
    });

    it('renders construction icon', () => {
        render(<ComingSoonPage />);

        const icon = screen.getByRole('main').querySelector('svg');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
});
