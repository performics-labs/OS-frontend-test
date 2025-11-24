import { APP_ROUTES } from '@/constants/routes';

describe('APP_ROUTES Constants', () => {
    it('should define CHAT_NEW route', () => {
        expect(APP_ROUTES.CHAT_NEW).toBe('/chat/new');
    });

    it('should define CHAT route', () => {
        expect(APP_ROUTES.CHAT).toBe('/chat/:id');
    });

    it('should define LOGIN route', () => {
        expect(APP_ROUTES.LOGIN).toBe('/login');
    });

    it('should be frozen and immutable', () => {
        expect(Object.isFrozen(APP_ROUTES)).toBe(true);
    });

    it('should not allow modification of route values', () => {
        expect(() => {
            // @ts-expect-error - Testing runtime immutability
            APP_ROUTES.CHAT_NEW = '/different';
        }).toThrow();
    });

    it('should not allow adding new properties', () => {
        expect(() => {
            // @ts-expect-error - Testing runtime immutability
            APP_ROUTES.NEW_ROUTE = '/new';
        }).toThrow();
    });
});
