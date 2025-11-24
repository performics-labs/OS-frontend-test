import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';

interface AutoResizeParams {
    ref: RefObject<HTMLElement | null>;
    value: string;
    minRows: number;
    maxRows: number;
}

export function useAutoResize({ ref, value, minRows, maxRows }: AutoResizeParams) {
    const [rows, setRows] = useState<number>(minRows);

    const countRef = useRef<number>(rows);
    const animation = useRef<number | null>(null);

    // Keep a live reference of the count of how many rows are for future calculations.
    useEffect(() => {
        countRef.current = rows;
    }, [rows]);

    // Cleanup on unmount.
    useEffect(() => {
        return () => {
            if (animation.current !== null) {
                cancelAnimationFrame(animation.current);
                animation.current = null;
            }
        };
    }, []);

    useLayoutEffect(() => {
        const element = ref.current;

        if (!element) return;

        // Cancel any ongoing animation.
        if (animation.current !== null) {
            cancelAnimationFrame(animation.current);
            animation.current = null;
        }

        const { lineHeight, paddingTop, paddingBottom } = getComputedStyle(element);

        const leading = Math.max(1, Math.round(parseFloat(lineHeight) || 24));
        const padding = parseFloat(paddingTop) + parseFloat(paddingBottom);

        element.style.height = '0px'; // Set height to '0px' to reset scroll values.

        // Calculate the height of the ref content.
        const height = Math.max(0, element.scrollHeight - padding);

        // Count how many rows fit inside the given content height.
        const count = Math.max(1, Math.ceil(height / leading));

        // Determine how many rows should go inside the element.
        const clamped = Math.min(Math.max(count, minRows), maxRows);

        const prev = countRef.current;

        // Helper to set exact px height for a given rows count.
        const setHeightForRows = (row: number) => {
            const px = row * leading + padding;
            element.style.height = `${px}px`;
            element.style.overflowY = row >= maxRows ? 'auto' : 'hidden';
        };

        // If previous equals target, ensure styles are correct and return.
        if (prev === clamped) {
            setHeightForRows(clamped);
            setRows((prev) => (prev === clamped ? prev : clamped));
            return;
        }

        // If we're growing, update immediately.
        if (prev < clamped) {
            setHeightForRows(clamped);
            setRows(clamped);
            return;
        }

        // If we're shrinking, step down one row at a time
        // This ensures rows state transitions in a sequence.
        let current = prev;
        const step = () => {
            current = Math.max(clamped, current - 1);

            setHeightForRows(current);
            setRows(current);

            if (current > clamped) {
                animation.current = requestAnimationFrame(step);
            } else {
                animation.current = null;
            }
        };

        animation.current = requestAnimationFrame(step);

        // Cleanup if effect re-runs before finishing animation
        return () => {
            if (animation.current !== null) {
                cancelAnimationFrame(animation.current);
                animation.current = null;
            }
        };
    }, [ref, value, minRows, maxRows]);

    return { rows };
}
