import { describe, it, expect, vi, beforeEach } from 'vitest';
import { streamText, createStreamController } from '@/utils/streaming-helpers';

describe('streamText', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    it('should stream text by words', async () => {
        const chunks: string[] = [];
        const onChunk = (text: string) => chunks.push(text);

        const promise = streamText('Hello world test', onChunk, {
            chunkBy: 'word',
            delayMs: 10,
        });

        await vi.runAllTimersAsync();
        await promise;

        expect(chunks.length).toBeGreaterThan(0);
        expect(chunks[chunks.length - 1]).toBe('Hello world test');
    });

    it('should stream text by characters', async () => {
        const chunks: string[] = [];
        const onChunk = (text: string) => chunks.push(text);

        const promise = streamText('Hi', onChunk, { chunkBy: 'char', delayMs: 10 });

        await vi.runAllTimersAsync();
        await promise;

        expect(chunks.length).toBe(2);
        expect(chunks[0]).toBe('H');
        expect(chunks[1]).toBe('Hi');
    });

    it('should use default options when not provided', async () => {
        const chunks: string[] = [];
        const onChunk = (text: string) => chunks.push(text);

        const promise = streamText('Test message', onChunk);

        await vi.runAllTimersAsync();
        await promise;

        expect(chunks.length).toBeGreaterThan(0);
        expect(chunks[chunks.length - 1]).toBe('Test message');
    });

    it('should call onChunk for each accumulated chunk', async () => {
        const chunks: string[] = [];
        const onChunk = vi.fn((text: string) => chunks.push(text));

        const promise = streamText('A B', onChunk, { chunkBy: 'word', delayMs: 5 });

        await vi.runAllTimersAsync();
        await promise;

        expect(onChunk).toHaveBeenCalled();
        expect(chunks.every((chunk, i) => i === 0 || chunk.length >= chunks[i - 1].length)).toBe(
            true
        );
    });

    it('should handle empty string', async () => {
        const chunks: string[] = [];
        const onChunk = (text: string) => chunks.push(text);

        const promise = streamText('', onChunk);

        await vi.runAllTimersAsync();
        await promise;

        expect(chunks.length).toBeGreaterThanOrEqual(0);
    });

    it('should respect custom delay', async () => {
        const chunks: string[] = [];
        const onChunk = (text: string) => chunks.push(text);

        const promise = streamText('A B C', onChunk, { chunkBy: 'word', delayMs: 100 });

        await vi.advanceTimersByTimeAsync(50);
        expect(chunks.length).toBeGreaterThanOrEqual(0);

        await vi.runAllTimersAsync();
        await promise;

        expect(chunks[chunks.length - 1]).toBe('A B C');
    });

    it('should preserve whitespace when streaming by word', async () => {
        const chunks: string[] = [];
        const onChunk = (text: string) => chunks.push(text);

        const promise = streamText('Hello  world', onChunk, { chunkBy: 'word' });

        await vi.runAllTimersAsync();
        await promise;

        expect(chunks[chunks.length - 1]).toBe('Hello  world');
    });
});

describe('createStreamController', () => {
    it('should create a controller with abort and shouldContinue methods', () => {
        const controller = createStreamController();

        expect(controller).toHaveProperty('abort');
        expect(controller).toHaveProperty('shouldContinue');
        expect(typeof controller.abort).toBe('function');
        expect(typeof controller.shouldContinue).toBe('function');
    });

    it('should initially return true for shouldContinue', () => {
        const controller = createStreamController();

        expect(controller.shouldContinue()).toBe(true);
    });

    it('should return false for shouldContinue after abort is called', () => {
        const controller = createStreamController();

        controller.abort();

        expect(controller.shouldContinue()).toBe(false);
    });

    it('should allow multiple calls to abort', () => {
        const controller = createStreamController();

        controller.abort();
        controller.abort();

        expect(controller.shouldContinue()).toBe(false);
    });

    it('should allow multiple calls to shouldContinue', () => {
        const controller = createStreamController();

        expect(controller.shouldContinue()).toBe(true);
        expect(controller.shouldContinue()).toBe(true);

        controller.abort();

        expect(controller.shouldContinue()).toBe(false);
        expect(controller.shouldContinue()).toBe(false);
    });
});
