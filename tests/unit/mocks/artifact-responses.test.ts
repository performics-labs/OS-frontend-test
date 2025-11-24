import { describe, it, expect } from 'vitest';
import { getArtifactByTrigger, MOCK_ARTIFACT_RESPONSES } from '@/mocks/data/artifact-responses';

describe('Artifact Responses', () => {
    describe('getArtifactByTrigger', () => {
        it('returns button component for button prompts', () => {
            const result = getArtifactByTrigger('create a button component');
            expect(result).toBe(MOCK_ARTIFACT_RESPONSES['button-component']);
        });

        it('returns button component for button variations', () => {
            expect(getArtifactByTrigger('create button')).toBe(
                MOCK_ARTIFACT_RESPONSES['button-component']
            );
            expect(getArtifactByTrigger('button component please')).toBe(
                MOCK_ARTIFACT_RESPONSES['button-component']
            );
        });

        it('returns table component for table prompts', () => {
            const result = getArtifactByTrigger('build a data table');
            expect(result).toBe(MOCK_ARTIFACT_RESPONSES['data-table']);
        });

        it('returns table component for table variations', () => {
            expect(getArtifactByTrigger('create table component')).toBe(
                MOCK_ARTIFACT_RESPONSES['data-table']
            );
            expect(getArtifactByTrigger('build a data table')).toBe(
                MOCK_ARTIFACT_RESPONSES['data-table']
            );
            expect(getArtifactByTrigger('make a grid component')).toBe(
                MOCK_ARTIFACT_RESPONSES['data-table']
            );
        });

        it('returns markdown documentation for documentation prompts', () => {
            const result = getArtifactByTrigger('generate component documentation');
            expect(result).toBe(MOCK_ARTIFACT_RESPONSES['markdown-doc']);
        });

        it('returns markdown documentation for documentation variations', () => {
            expect(getArtifactByTrigger('write documentation')).toBe(
                MOCK_ARTIFACT_RESPONSES['markdown-doc']
            );
            expect(getArtifactByTrigger('create guide')).toBe(
                MOCK_ARTIFACT_RESPONSES['markdown-doc']
            );
            expect(getArtifactByTrigger('generate react docs')).toBe(
                MOCK_ARTIFACT_RESPONSES['markdown-doc']
            );
        });

        it('returns api hook for hook prompts', () => {
            const result = getArtifactByTrigger('create a custom API hook');
            expect(result).toBe(MOCK_ARTIFACT_RESPONSES['api-hook']);
        });

        it('returns api hook for hook variations', () => {
            expect(getArtifactByTrigger('custom hook')).toBe(MOCK_ARTIFACT_RESPONSES['api-hook']);
            expect(getArtifactByTrigger('api hook')).toBe(MOCK_ARTIFACT_RESPONSES['api-hook']);
            expect(getArtifactByTrigger('useAPI hook')).toBe(MOCK_ARTIFACT_RESPONSES['api-hook']);
        });

        it('returns python analysis for python prompts', () => {
            const result = getArtifactByTrigger('create a python script');
            expect(result).toBe(MOCK_ARTIFACT_RESPONSES['python-analysis']);
        });

        it('returns python analysis for python variations', () => {
            expect(getArtifactByTrigger('write python code')).toBe(
                MOCK_ARTIFACT_RESPONSES['python-analysis']
            );
            expect(getArtifactByTrigger('create data analysis script')).toBe(
                MOCK_ARTIFACT_RESPONSES['python-analysis']
            );
            expect(getArtifactByTrigger('generate visualization')).toBe(
                MOCK_ARTIFACT_RESPONSES['python-analysis']
            );
        });

        it('returns null for non-artifact prompts', () => {
            expect(getArtifactByTrigger('hello world')).toBeNull();
            expect(getArtifactByTrigger('how are you')).toBeNull();
            expect(getArtifactByTrigger('search for documents')).toBeNull();
        });

        it('is case insensitive', () => {
            expect(getArtifactByTrigger('CREATE A BUTTON COMPONENT')).toBe(
                MOCK_ARTIFACT_RESPONSES['button-component']
            );
            expect(getArtifactByTrigger('Build A Data Table')).toBe(
                MOCK_ARTIFACT_RESPONSES['data-table']
            );
        });
    });

    describe('MOCK_ARTIFACT_RESPONSES', () => {
        it('all artifacts have required properties', () => {
            Object.values(MOCK_ARTIFACT_RESPONSES).forEach((artifact) => {
                expect(artifact).toHaveProperty('kind');
                expect(artifact).toHaveProperty('title');
                expect(artifact).toHaveProperty('content');
                expect(artifact.content.length).toBeGreaterThan(0);
            });
        });

        it('code artifacts have language specified', () => {
            const codeArtifacts = Object.values(MOCK_ARTIFACT_RESPONSES).filter(
                (artifact) => artifact.kind === 'code'
            );

            codeArtifacts.forEach((artifact) => {
                expect(artifact.language).toBeDefined();
                expect(artifact.language).toBeTruthy();
            });
        });

        it('all artifacts have descriptions', () => {
            Object.values(MOCK_ARTIFACT_RESPONSES).forEach((artifact) => {
                expect(artifact.description).toBeDefined();
                expect(artifact.description).toBeTruthy();
            });
        });

        it('contains expected artifact types', () => {
            expect(MOCK_ARTIFACT_RESPONSES['button-component']).toBeDefined();
            expect(MOCK_ARTIFACT_RESPONSES['data-table']).toBeDefined();
            expect(MOCK_ARTIFACT_RESPONSES['markdown-doc']).toBeDefined();
            expect(MOCK_ARTIFACT_RESPONSES['api-hook']).toBeDefined();
            expect(MOCK_ARTIFACT_RESPONSES['python-analysis']).toBeDefined();
        });
    });
});
