export const ERROR_MESSAGES = Object.freeze({
    AUTH: {
        SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
        UNAUTHORIZED: 'Access denied. You do not have permission to access this route.',
        REDIRECT_URL: 'Missing redirect URL from authentication response.',
        USER_DATA: 'Failed to retrieve user data after authentication.',
        MISSING_CODE: 'Authentication code is missing from the callback URL.',
        DEFAULT: 'Authentication failed. Please try again later.',
    },
    MODELS: {
        MISSING_MODELS: '',
    },
    NETWORK: {
        OFFLINE: 'Unable to connect. Please check your internet connection.',
        TIMEOUT: 'Request timed out. Please try again later.',
        DEFAULT: 'Network error occurred. Pleasy try again later.',
    },
    SERVER: {
        DEFAULT: 'Something went wrong on our end. Please try again later.',
    },
    DEFAULT: 'An unexpected error occurred. Please try again later.',
} as const);
