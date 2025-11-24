import { describe, it, expect } from 'vitest';
import { artifactResultSchema, artifactInputSchema } from '@/types/artifact-tool';

describe('artifact-tool schemas', () => {
    describe('artifactInputSchema', () => {
        it('should validate valid code input', () => {
            const validInput = {
                title: 'Button Component',
                kind: 'code',
            };

            const result = artifactInputSchema.safeParse(validInput);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(validInput);
            }
        });

        it('should validate valid text input', () => {
            const validInput = {
                title: 'Documentation',
                kind: 'text',
            };

            const result = artifactInputSchema.safeParse(validInput);
            expect(result.success).toBe(true);
        });

        it('should validate valid image input', () => {
            const validInput = {
                title: 'Chart',
                kind: 'image',
            };

            const result = artifactInputSchema.safeParse(validInput);
            expect(result.success).toBe(true);
        });

        it('should validate valid spreadsheet input', () => {
            const validInput = {
                title: 'Data Table',
                kind: 'spreadsheet',
            };

            const result = artifactInputSchema.safeParse(validInput);
            expect(result.success).toBe(true);
        });

        it('should reject input with missing title', () => {
            const invalidInput = {
                kind: 'code',
            };

            const result = artifactInputSchema.safeParse(invalidInput);
            expect(result.success).toBe(false);
        });

        it('should reject input with missing kind', () => {
            const invalidInput = {
                title: 'Test',
            };

            const result = artifactInputSchema.safeParse(invalidInput);
            expect(result.success).toBe(false);
        });

        it('should reject input with invalid kind', () => {
            const invalidInput = {
                title: 'Test',
                kind: 'invalid-kind',
            };

            const result = artifactInputSchema.safeParse(invalidInput);
            expect(result.success).toBe(false);
        });

        it('should reject input with non-string title', () => {
            const invalidInput = {
                title: 123,
                kind: 'code',
            };

            const result = artifactInputSchema.safeParse(invalidInput);
            expect(result.success).toBe(false);
        });

        it('should reject null input', () => {
            const result = artifactInputSchema.safeParse(null);
            expect(result.success).toBe(false);
        });

        it('should reject undefined input', () => {
            const result = artifactInputSchema.safeParse(undefined);
            expect(result.success).toBe(false);
        });
    });

    describe('artifactResultSchema', () => {
        it('should validate valid code result with all fields', () => {
            const validResult = {
                id: 'artifact-123',
                title: 'Button Component',
                kind: 'code',
                content: 'export function Button() {}',
                language: 'tsx',
            };

            const result = artifactResultSchema.safeParse(validResult);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(validResult);
            }
        });

        it('should validate result without optional content', () => {
            const validResult = {
                id: 'artifact-456',
                title: 'Test',
                kind: 'text',
            };

            const result = artifactResultSchema.safeParse(validResult);
            expect(result.success).toBe(true);
        });

        it('should validate result without optional language', () => {
            const validResult = {
                id: 'artifact-789',
                title: 'Plain Text',
                kind: 'text',
                content: 'Some content',
            };

            const result = artifactResultSchema.safeParse(validResult);
            expect(result.success).toBe(true);
        });

        it('should reject result with missing id', () => {
            const invalidResult = {
                title: 'Test',
                kind: 'code',
                content: 'test',
            };

            const result = artifactResultSchema.safeParse(invalidResult);
            expect(result.success).toBe(false);
        });

        it('should reject result with missing title', () => {
            const invalidResult = {
                id: 'artifact-123',
                kind: 'code',
                content: 'test',
            };

            const result = artifactResultSchema.safeParse(invalidResult);
            expect(result.success).toBe(false);
        });

        it('should reject result with missing kind', () => {
            const invalidResult = {
                id: 'artifact-123',
                title: 'Test',
                content: 'test',
            };

            const result = artifactResultSchema.safeParse(invalidResult);
            expect(result.success).toBe(false);
        });

        it('should reject result with invalid kind', () => {
            const invalidResult = {
                id: 'artifact-123',
                title: 'Test',
                kind: 'invalid-type',
                content: 'test',
            };

            const result = artifactResultSchema.safeParse(invalidResult);
            expect(result.success).toBe(false);
        });

        it('should reject result with non-string id', () => {
            const invalidResult = {
                id: 123,
                title: 'Test',
                kind: 'code',
            };

            const result = artifactResultSchema.safeParse(invalidResult);
            expect(result.success).toBe(false);
        });

        it('should reject result with non-string content', () => {
            const invalidResult = {
                id: 'artifact-123',
                title: 'Test',
                kind: 'code',
                content: 123,
            };

            const result = artifactResultSchema.safeParse(invalidResult);
            expect(result.success).toBe(false);
        });

        it('should reject result with non-string language', () => {
            const invalidResult = {
                id: 'artifact-123',
                title: 'Test',
                kind: 'code',
                language: 123,
            };

            const result = artifactResultSchema.safeParse(invalidResult);
            expect(result.success).toBe(false);
        });

        it('should validate all artifact kinds', () => {
            const kinds = ['text', 'code', 'image', 'spreadsheet'] as const;

            kinds.forEach((kind) => {
                const validResult = {
                    id: `artifact-${kind}`,
                    title: `${kind} artifact`,
                    kind,
                };

                const result = artifactResultSchema.safeParse(validResult);
                expect(result.success).toBe(true);
            });
        });

        it('should reject empty object', () => {
            const result = artifactResultSchema.safeParse({});
            expect(result.success).toBe(false);
        });

        it('should reject null', () => {
            const result = artifactResultSchema.safeParse(null);
            expect(result.success).toBe(false);
        });

        it('should reject undefined', () => {
            const result = artifactResultSchema.safeParse(undefined);
            expect(result.success).toBe(false);
        });

        it('should reject primitive values', () => {
            expect(artifactResultSchema.safeParse('string').success).toBe(false);
            expect(artifactResultSchema.safeParse(123).success).toBe(false);
            expect(artifactResultSchema.safeParse(true).success).toBe(false);
        });
    });
});
