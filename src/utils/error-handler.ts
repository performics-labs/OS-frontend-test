import { isAxiosError } from 'axios';
import { ERROR_MESSAGES } from '@/constants';

export function getErrorMessage(error: unknown): string {
    if (isAxiosError(error)) {
        // Network Errors.
        if (!error.response) {
            if (error.code === 'ECONNABORTED') {
                return ERROR_MESSAGES.NETWORK.TIMEOUT;
            }

            if (error.code === 'ERR_NETWORK') {
                return ERROR_MESSAGES.NETWORK.OFFLINE;
            }

            return ERROR_MESSAGES.NETWORK.DEFAULT;
        }

        // API and HTTP Errors.
        const status = error.response?.status;

        if (status === 401) {
            return ERROR_MESSAGES.AUTH.SESSION_EXPIRED;
        }

        if (status === 403) {
            return ERROR_MESSAGES.AUTH.UNAUTHORIZED;
        }

        if (status >= 500) {
            return ERROR_MESSAGES.SERVER.DEFAULT;
        }
    }

    // Fallback for unknown errors.
    if (error instanceof Error) {
        return error.message;
    }

    return ERROR_MESSAGES.DEFAULT;
}
