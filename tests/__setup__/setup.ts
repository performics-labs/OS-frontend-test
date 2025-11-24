import { expect, afterEach, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { server } from '@/mocks/server';

// Polyfill ResizeObserver for tests
global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Start MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

// Reset handlers after each test
afterEach(() => {
    server.resetHandlers();
    cleanup();
    localStorage.clear();
});

// Stop MSW server after all tests
afterAll(() => server.close());
