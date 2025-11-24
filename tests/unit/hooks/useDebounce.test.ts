import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';

describe('useDebounce', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    it('should return initial value immediately', () => {
        const { result } = renderHook(() => useDebounce('initial', 500));

        expect(result.current).toBe('initial');
    });

    it('should debounce value changes', () => {
        const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
            initialProps: { value: 'initial', delay: 500 },
        });

        expect(result.current).toBe('initial');

        rerender({ value: 'updated', delay: 500 });

        expect(result.current).toBe('initial');

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(result.current).toBe('updated');
    });

    it('should cancel previous timeout on rapid changes', () => {
        const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
            initialProps: { value: 'initial', delay: 500 },
        });

        rerender({ value: 'first', delay: 500 });

        act(() => {
            vi.advanceTimersByTime(300);
        });

        rerender({ value: 'second', delay: 500 });

        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(result.current).toBe('initial');

        act(() => {
            vi.advanceTimersByTime(200);
        });

        expect(result.current).toBe('second');
    });

    it('should handle different delay values', () => {
        const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
            initialProps: { value: 'initial', delay: 1000 },
        });

        rerender({ value: 'updated', delay: 1000 });

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(result.current).toBe('initial');

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(result.current).toBe('updated');
    });

    it('should cleanup timeout on unmount', () => {
        const { unmount, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
            initialProps: { value: 'initial', delay: 500 },
        });

        rerender({ value: 'updated', delay: 500 });

        unmount();

        act(() => {
            vi.advanceTimersByTime(500);
        });
    });

    it('should handle empty string values', () => {
        const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
            initialProps: { value: '', delay: 500 },
        });

        expect(result.current).toBe('');

        rerender({ value: 'text', delay: 500 });

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(result.current).toBe('text');
    });
});
