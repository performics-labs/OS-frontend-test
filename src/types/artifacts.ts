import { ARTIFACT_TYPES, VALID_ARTIFACT_TYPES } from '@/constants/artifacts';

/**
 * Artifact type union derived from constants
 */
export type ArtifactType = (typeof ARTIFACT_TYPES)[keyof typeof ARTIFACT_TYPES];

/**
 * Base artifact interface
 */
export interface Artifact {
    id: string;
    type: ArtifactType;
    title: string;
    content: string;
    language?: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Runtime type guard to validate artifact type from untrusted sources
 */
export function isValidArtifactType(value: unknown): value is ArtifactType {
    return typeof value === 'string' && VALID_ARTIFACT_TYPES.includes(value as ArtifactType);
}

/**
 * Type guards for artifact types
 */
export function isTextArtifact(artifact: Artifact): boolean {
    return artifact.type === 'text';
}

export function isCodeArtifact(artifact: Artifact): boolean {
    return artifact.type === 'code';
}

export function isImageArtifact(artifact: Artifact): boolean {
    return artifact.type === 'image';
}

export function isSpreadsheetArtifact(artifact: Artifact): boolean {
    return artifact.type === 'spreadsheet';
}
