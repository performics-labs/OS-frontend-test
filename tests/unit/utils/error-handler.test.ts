import { describe, it, expect } from 'vitest';
import { AxiosError } from 'axios';
import { getErrorMessage } from '@/utils/error-handler';
import { ERROR_MESSAGES } from '@/constants';

describe('getErrorMessage', () => {
    describe('Axios network errors', () => {
        it('should return timeout message for ECONNABORTED', () => {
            const error = new AxiosError('timeout', 'ECONNABORTED');

            expect(getErrorMessage(error)).toBe(ERROR_MESSAGES.NETWORK.TIMEOUT);
        });

        it('should return offline message for ERR_NETWORK', () => {
            const error = new AxiosError('network', 'ERR_NETWORK');

            expect(getErrorMessage(error)).toBe(ERROR_MESSAGES.NETWORK.OFFLINE);
        });

        it('should return default network message for other network errors', () => {
            const error = new AxiosError('network');

            expect(getErrorMessage(error)).toBe(ERROR_MESSAGES.NETWORK.DEFAULT);
        });
    });

    describe('Axios HTTP errors', () => {
        it('should return session expired message for 401 status', () => {
            const error = new AxiosError('unauthorized', 'ERR_BAD_REQUEST', undefined, undefined, {
                status: 401,
                data: {},
                statusText: 'Unauthorized',
                headers: {},
                config: { headers: {} } as never,
            });

            expect(getErrorMessage(error)).toBe(ERROR_MESSAGES.AUTH.SESSION_EXPIRED);
        });

        it('should return unauthorized message for 403 status', () => {
            const error = new AxiosError('forbidden', 'ERR_BAD_REQUEST', undefined, undefined, {
                status: 403,
                data: {},
                statusText: 'Forbidden',
                headers: {},
                config: { headers: {} } as never,
            });

            expect(getErrorMessage(error)).toBe(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
        });

        it('should return server error message for 500 status', () => {
            const error = new AxiosError('server error', 'ERR_BAD_RESPONSE', undefined, undefined, {
                status: 500,
                data: {},
                statusText: 'Internal Server Error',
                headers: {},
                config: { headers: {} } as never,
            });

            expect(getErrorMessage(error)).toBe(ERROR_MESSAGES.SERVER.DEFAULT);
        });

        it('should return server error message for 503 status', () => {
            const error = new AxiosError(
                'service unavailable',
                'ERR_BAD_RESPONSE',
                undefined,
                undefined,
                {
                    status: 503,
                    data: {},
                    statusText: 'Service Unavailable',
                    headers: {},
                    config: { headers: {} } as never,
                }
            );

            expect(getErrorMessage(error)).toBe(ERROR_MESSAGES.SERVER.DEFAULT);
        });

        it('should return error message for 400 status', () => {
            const error = new AxiosError('bad request', 'ERR_BAD_REQUEST', undefined, undefined, {
                status: 400,
                data: {},
                statusText: 'Bad Request',
                headers: {},
                config: { headers: {} } as never,
            });

            expect(getErrorMessage(error)).toBe('bad request');
        });
    });

    describe('Non-Axios errors', () => {
        it('should return error message for Error instances', () => {
            const error = new Error('Custom error message');

            expect(getErrorMessage(error)).toBe('Custom error message');
        });

        it('should return default message for unknown error types', () => {
            const error = { unknown: 'error' };

            expect(getErrorMessage(error)).toBe(ERROR_MESSAGES.DEFAULT);
        });

        it('should return default message for string errors', () => {
            const error = 'string error';

            expect(getErrorMessage(error)).toBe(ERROR_MESSAGES.DEFAULT);
        });

        it('should return default message for null', () => {
            expect(getErrorMessage(null)).toBe(ERROR_MESSAGES.DEFAULT);
        });
    });
});
