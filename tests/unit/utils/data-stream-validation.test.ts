import { describe, it, expect, vi } from 'vitest';
import {
    validateDataStreamEvent,
    isArtifactDataEvent,
    dataStreamSchemas,
} from '@/utils/data-stream-validation';

describe('validateDataStreamEvent', () => {
    it('should validate data-id events', () => {
        const event = {
            type: 'data-id',
            data: 'artifact-123',
        };

        const result = validateDataStreamEvent(event);

        expect(result).not.toBeNull();
        expect(result?.type).toBe('data-id');
        expect(result?.data).toBe('artifact-123');
    });

    it('should validate data-title events', () => {
        const event = {
            type: 'data-title',
            data: 'My Artifact Title',
        };

        const result = validateDataStreamEvent(event);

        expect(result).not.toBeNull();
        expect(result?.type).toBe('data-title');
        expect(result?.data).toBe('My Artifact Title');
    });

    it('should validate data-kind events with valid artifact types', () => {
        const validKinds = ['code', 'text', 'image', 'spreadsheet'];

        validKinds.forEach((kind) => {
            const event = {
                type: 'data-kind',
                data: kind,
            };

            const result = validateDataStreamEvent(event);

            expect(result).not.toBeNull();
            expect(result?.type).toBe('data-kind');
            expect(result?.data).toBe(kind);
        });
    });

    it('should validate data-codeDelta events', () => {
        const event = {
            type: 'data-codeDelta',
            data: 'const x = 1;',
        };

        const result = validateDataStreamEvent(event);

        expect(result).not.toBeNull();
        expect(result?.type).toBe('data-codeDelta');
    });

    it('should validate data-textDelta events', () => {
        const event = {
            type: 'data-textDelta',
            data: 'Some text content',
        };

        const result = validateDataStreamEvent(event);

        expect(result).not.toBeNull();
        expect(result?.type).toBe('data-textDelta');
    });

    it('should validate data-imageDelta events', () => {
        const event = {
            type: 'data-imageDelta',
            data: 'base64imagedata',
        };

        const result = validateDataStreamEvent(event);

        expect(result).not.toBeNull();
        expect(result?.type).toBe('data-imageDelta');
    });

    it('should validate data-spreadsheetDelta events', () => {
        const event = {
            type: 'data-spreadsheetDelta',
            data: 'csv,data,here',
        };

        const result = validateDataStreamEvent(event);

        expect(result).not.toBeNull();
        expect(result?.type).toBe('data-spreadsheetDelta');
    });

    it('should validate data-clear events', () => {
        const event = {
            type: 'data-clear',
            data: null,
        };

        const result = validateDataStreamEvent(event);

        expect(result).not.toBeNull();
        expect(result?.type).toBe('data-clear');
        expect(result?.data).toBeNull();
    });

    it('should validate data-finish events', () => {
        const event = {
            type: 'data-finish',
            data: null,
        };

        const result = validateDataStreamEvent(event);

        expect(result).not.toBeNull();
        expect(result?.type).toBe('data-finish');
        expect(result?.data).toBeNull();
    });

    it('should return null for invalid event types', () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const event = {
            type: 'invalid-type',
            data: 'some data',
        };

        const result = validateDataStreamEvent(event);

        expect(result).toBeNull();
        expect(consoleWarnSpy).toHaveBeenCalled();

        consoleWarnSpy.mockRestore();
    });

    it('should return null for events with wrong data type', () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const event = {
            type: 'data-id',
            data: 123,
        };

        const result = validateDataStreamEvent(event);

        expect(result).toBeNull();
        expect(consoleWarnSpy).toHaveBeenCalled();

        consoleWarnSpy.mockRestore();
    });

    it('should return null for malformed events', () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const result = validateDataStreamEvent({ invalid: 'structure' });

        expect(result).toBeNull();
        expect(consoleWarnSpy).toHaveBeenCalled();

        consoleWarnSpy.mockRestore();
    });

    it('should handle optional id field', () => {
        const event = {
            type: 'data-id',
            id: 'optional-id-123',
            data: 'artifact-456',
        };

        const result = validateDataStreamEvent(event);

        expect(result).not.toBeNull();
        expect(result?.id).toBe('optional-id-123');
    });
});

describe('isArtifactDataEvent', () => {
    it('should return true for valid artifact data events', () => {
        const event = {
            type: 'data-id',
            data: 'artifact-123',
        };

        expect(isArtifactDataEvent(event)).toBe(true);
    });

    it('should return false for invalid events', () => {
        const event = {
            type: 'invalid-type',
            data: 'some data',
        };

        expect(isArtifactDataEvent(event)).toBe(false);
    });

    it('should return false for malformed events', () => {
        expect(isArtifactDataEvent(null)).toBe(false);
        expect(isArtifactDataEvent(undefined)).toBe(false);
        expect(isArtifactDataEvent('string')).toBe(false);
        expect(isArtifactDataEvent(123)).toBe(false);
    });

    it('should type guard correctly', () => {
        const event: unknown = {
            type: 'data-title',
            data: 'Test Title',
        };

        if (isArtifactDataEvent(event)) {
            expect(event.type).toBe('data-title');
            expect(typeof event.data).toBe('string');
        }
    });
});

describe('dataStreamSchemas', () => {
    it('should have schema for data-id', () => {
        expect(dataStreamSchemas['data-id']).toBeDefined();
    });

    it('should have schema for data-title', () => {
        expect(dataStreamSchemas['data-title']).toBeDefined();
    });

    it('should have schema for data-kind', () => {
        expect(dataStreamSchemas['data-kind']).toBeDefined();
    });

    it('should have schema for data-codeDelta', () => {
        expect(dataStreamSchemas['data-codeDelta']).toBeDefined();
    });

    it('should have schema for data-textDelta', () => {
        expect(dataStreamSchemas['data-textDelta']).toBeDefined();
    });

    it('should have schema for data-imageDelta', () => {
        expect(dataStreamSchemas['data-imageDelta']).toBeDefined();
    });

    it('should have schema for data-spreadsheetDelta', () => {
        expect(dataStreamSchemas['data-spreadsheetDelta']).toBeDefined();
    });

    it('should have schema for data-clear', () => {
        expect(dataStreamSchemas['data-clear']).toBeDefined();
    });

    it('should have schema for data-finish', () => {
        expect(dataStreamSchemas['data-finish']).toBeDefined();
    });
});
