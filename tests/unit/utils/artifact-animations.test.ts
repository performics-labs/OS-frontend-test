import { describe, it, expect, vi } from 'vitest';
import { prefersReducedMotion } from '@/utils';

describe('artifact-animations utils', () => {
    describe('prefersReducedMotion', () => {
        it('detects reduced motion preference', () => {
            // Mock matchMedia
            window.matchMedia = vi.fn(
                (query): MediaQueryList =>
                    ({
                        matches: query === '(prefers-reduced-motion: reduce)',
                        media: query,
                        onchange: null,
                        addListener: vi.fn(),
                        removeListener: vi.fn(),
                        addEventListener: vi.fn(),
                        removeEventListener: vi.fn(),
                        dispatchEvent: vi.fn(),
                    }) as MediaQueryList
            );

            expect(prefersReducedMotion()).toBe(true);
        });

        it('returns false when motion is allowed', () => {
            // Mock matchMedia
            window.matchMedia = vi.fn(
                (query): MediaQueryList =>
                    ({
                        matches: false,
                        media: query,
                        onchange: null,
                        addListener: vi.fn(),
                        removeListener: vi.fn(),
                        addEventListener: vi.fn(),
                        removeEventListener: vi.fn(),
                        dispatchEvent: vi.fn(),
                    }) as MediaQueryList
            );

            expect(prefersReducedMotion()).toBe(false);
        });
    });
});
