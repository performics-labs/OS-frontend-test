export const IS_DEV = import.meta.env.DEV;

export const VITE_PORT = import.meta.env.VITE_PORT;

export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS?.toLowerCase() === 'true';

// In production (Amplify), API requests use relative paths with rewrites
// In development, use full backend URL or empty string for mocks
export const API_BASE_URL = USE_MOCKS
    ? ''
    : import.meta.env.VITE_API_BASE_URL || '';
