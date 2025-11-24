import { z } from 'zod';
import { VALID_ARTIFACT_TYPES } from '@/constants/artifacts';

/**
 * Zod schemas for AI SDK data stream events
 * Validates artifact-related streaming data at runtime
 */

const artifactTypeSchema = z.enum([
    VALID_ARTIFACT_TYPES[0],
    VALID_ARTIFACT_TYPES[1],
    VALID_ARTIFACT_TYPES[2],
    VALID_ARTIFACT_TYPES[3],
]);

/**
 * Base schema for all data events
 */
const baseDataEventSchema = z.object({
    type: z.string(),
    id: z.string().optional(),
    data: z.unknown(),
});

/**
 * Individual event schemas
 */
export const dataStreamSchemas = {
    'data-id': baseDataEventSchema.extend({
        type: z.literal('data-id'),
        data: z.string(),
    }),
    'data-title': baseDataEventSchema.extend({
        type: z.literal('data-title'),
        data: z.string(),
    }),
    'data-kind': baseDataEventSchema.extend({
        type: z.literal('data-kind'),
        data: artifactTypeSchema,
    }),
    'data-codeDelta': baseDataEventSchema.extend({
        type: z.literal('data-codeDelta'),
        data: z.string(),
    }),
    'data-textDelta': baseDataEventSchema.extend({
        type: z.literal('data-textDelta'),
        data: z.string(),
    }),
    'data-imageDelta': baseDataEventSchema.extend({
        type: z.literal('data-imageDelta'),
        data: z.string(),
    }),
    'data-spreadsheetDelta': baseDataEventSchema.extend({
        type: z.literal('data-spreadsheetDelta'),
        data: z.string(),
    }),
    'data-clear': baseDataEventSchema.extend({
        type: z.literal('data-clear'),
        data: z.null(),
    }),
    'data-finish': baseDataEventSchema.extend({
        type: z.literal('data-finish'),
        data: z.null(),
    }),
};

/**
 * Union schema for all artifact data events
 */
export const artifactDataEventSchema = z.discriminatedUnion('type', [
    dataStreamSchemas['data-id'],
    dataStreamSchemas['data-title'],
    dataStreamSchemas['data-kind'],
    dataStreamSchemas['data-codeDelta'],
    dataStreamSchemas['data-textDelta'],
    dataStreamSchemas['data-imageDelta'],
    dataStreamSchemas['data-spreadsheetDelta'],
    dataStreamSchemas['data-clear'],
    dataStreamSchemas['data-finish'],
]);

/**
 * Type inference from schema
 */
export type ValidatedArtifactDataEvent = z.infer<typeof artifactDataEventSchema>;

/**
 * Validates a data stream event
 * @param dataPart - Raw data part from AI SDK
 * @returns Validated data event or null if validation fails
 */
export function validateDataStreamEvent(dataPart: unknown): ValidatedArtifactDataEvent | null {
    const result = artifactDataEventSchema.safeParse(dataPart);

    if (!result.success) {
        console.warn('[DataStream] Invalid data event received:', {
            data: dataPart,
            issues: result.error.issues,
        });
        return null;
    }

    return result.data;
}

/**
 * Type guard for artifact data events
 */
export function isArtifactDataEvent(dataPart: unknown): dataPart is ValidatedArtifactDataEvent {
    return artifactDataEventSchema.safeParse(dataPart).success;
}
