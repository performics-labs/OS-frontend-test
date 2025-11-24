import { http, HttpResponse, delay } from 'msw';
import { generateMockUser } from '@/mocks/utils/user-generator';

export const authHandlers = [
    // POST /api/v1/auth/login - Email/password login
    http.post('/api/v1/auth/login', async ({ request }) => {
        await delay(300);

        const body = (await request.json()) as { email: string; password: string };
        const { email } = body;

        // Generate user on-the-fly
        const userData = generateMockUser(email);

        // Set mock cookies
        return HttpResponse.json(
            { user: userData },
            {
                headers: {
                    'Set-Cookie': `os_session=mock-session-${Date.now()}; Path=/; HttpOnly; SameSite=Lax; Max-Age=900`,
                },
            }
        );
    }),

    // POST /api/v1/auth/register - Email/password registration
    http.post('/api/v1/auth/register', async ({ request }) => {
        await delay(400);

        const body = (await request.json()) as { email: string; password: string; name: string };
        const { email, name } = body;

        // Generate user with provided name
        const userData = generateMockUser(email, name);

        // Set mock cookies
        return HttpResponse.json(
            {
                user: userData,
                message: 'Registration successful',
            },
            {
                headers: {
                    'Set-Cookie': `os_session=mock-session-${Date.now()}; Path=/; HttpOnly; SameSite=Lax; Max-Age=900`,
                },
            }
        );
    }),

    // GET /api/v1/auth/session - Check current session
    http.get('/api/v1/auth/session', async ({ cookies }) => {
        await delay(100);

        const sessionCookie = cookies.os_session;

        if (!sessionCookie) {
            return new HttpResponse(null, { status: 401 });
        }

        // Return a default user for session checks
        const defaultUser = generateMockUser('user@publicisgroupe.com');
        return HttpResponse.json(defaultUser);
    }),

    // POST /api/v1/auth/logout - Clear session
    http.post('/api/v1/auth/logout', async () => {
        await delay(100);

        return new HttpResponse(null, {
            status: 204,
            headers: {
                'Set-Cookie': 'os_session=; Path=/; Max-Age=0',
            },
        });
    }),

    // POST /api/v1/auth/refresh - Refresh session
    http.post('/api/v1/auth/refresh', async ({ cookies }) => {
        await delay(100);

        const sessionCookie = cookies.os_session;

        if (!sessionCookie) {
            return new HttpResponse(null, { status: 401 });
        }

        // Return refreshed user data
        const defaultUser = generateMockUser('user@example.com');

        return HttpResponse.json(
            { user: defaultUser },
            {
                headers: {
                    'Set-Cookie': `os_session=mock-session-${Date.now()}; Path=/; HttpOnly; SameSite=Lax; Max-Age=900`,
                },
            }
        );
    }),
];
