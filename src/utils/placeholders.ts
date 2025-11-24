export const OPTIMIZATION_PLACEHOLDERS = [
    'What are we optimizing today?',
    'What should we optimize today?',
    'What can we improve today?',
    'What are we making faster?',
    'What needs optimizing?',
    'Ready to optimize something?',
    "What's on the optimization list?",
    'What are we speeding up today?',
] as const;

/**
 * Returns a random placeholder from the optimization placeholders array
 */
export function getRandomPlaceholder(): string {
    const randomIndex = Math.floor(Math.random() * OPTIMIZATION_PLACEHOLDERS.length);
    return OPTIMIZATION_PLACEHOLDERS[randomIndex];
}
