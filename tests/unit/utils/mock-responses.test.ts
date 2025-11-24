import { describe, it, expect } from 'vitest';
import { getMockResponse } from '@/utils/mock-responses';

describe('getMockResponse', () => {
    it('should return a string response', () => {
        const response = getMockResponse('test message');
        expect(typeof response).toBe('string');
    });

    it('should include the user message in the response', () => {
        const userMessage = 'Hello, world!';
        const response = getMockResponse(userMessage);
        expect(response).toContain(userMessage);
    });

    it('should return markdown-formatted content', () => {
        const response = getMockResponse('test');
        expect(response.includes('**') || response.includes('`') || response.includes('#')).toBe(
            true
        );
    });

    it('should return different responses on multiple calls', () => {
        const responses = new Set();
        for (let i = 0; i < 20; i++) {
            responses.add(getMockResponse('test'));
        }
        expect(responses.size).toBeGreaterThan(1);
    });

    it('should handle empty string input', () => {
        const response = getMockResponse('');
        expect(typeof response).toBe('string');
        expect(response.length).toBeGreaterThan(0);
    });

    it('should handle special characters in input', () => {
        const userMessage = '<script>alert("test")</script>';
        const response = getMockResponse(userMessage);
        expect(response).toContain(userMessage);
    });
});
