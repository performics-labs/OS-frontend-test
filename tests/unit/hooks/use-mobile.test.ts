import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '@/hooks/use-mobile';

describe('useIsMobile', () => {
    let originalInnerWidth: number;
    let matchMediaMock: ReturnType<typeof vi.fn>;
    let listeners: Array<() => void> = [];

    beforeEach(() => {
        originalInnerWidth = window.innerWidth;
        listeners = [];

        // Mock matchMedia
        matchMediaMock = vi.fn((query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn((event: string, listener: () => void) => {
                if (event === 'change') {
                    listeners.push(listener);
                }
            }),
            removeEventListener: vi.fn((event: string, listener: () => void) => {
                if (event === 'change') {
                    listeners = listeners.filter((l) => l !== listener);
                }
            }),
            dispatchEvent: vi.fn(),
        }));

        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            configurable: true,
            value: matchMediaMock,
        });
    });

    afterEach(() => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: originalInnerWidth,
        });
    });

    it('should return true for mobile widths', () => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 375,
        });

        const { result } = renderHook(() => useIsMobile());

        expect(result.current).toBe(true);
    });

    it('should return false for desktop widths', () => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1024,
        });

        const { result } = renderHook(() => useIsMobile());

        expect(result.current).toBe(false);
    });

    it('should return true for width exactly at breakpoint - 1 (767px)', () => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 767,
        });

        const { result } = renderHook(() => useIsMobile());

        expect(result.current).toBe(true);
    });

    it('should return false for width at breakpoint (768px)', () => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 768,
        });

        const { result } = renderHook(() => useIsMobile());

        expect(result.current).toBe(false);
    });

    it('should update when window is resized', () => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1024,
        });

        const { result } = renderHook(() => useIsMobile());

        expect(result.current).toBe(false);

        act(() => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 375,
            });
            // Trigger the change event listener
            listeners.forEach((listener) => listener());
        });

        expect(result.current).toBe(true);
    });
});
