import { generateMockUser } from '@/mocks/utils/user-generator';

describe('generateMockUser', () => {
    it('generates user with formatted display name', () => {
        const user = generateMockUser('john.doe@publicisgroupe.com');

        expect(user.display_name).toBe('John Doe');
        expect(user.email).toBe('john.doe@publicisgroupe.com');
    });

    it('handles underscores in email', () => {
        const user = generateMockUser('jane_smith@publicisgroupe.com');

        expect(user.display_name).toBe('Jane Smith');
    });

    it('handles hyphens in email', () => {
        const user = generateMockUser('bob-jones@publicisgroupe.com');

        expect(user.display_name).toBe('Bob Jones');
    });

    it('assigns admin role when email contains "admin"', () => {
        const user = generateMockUser('admin@publicisgroupe.com');

        expect(user.roles).toEqual(['admin']);
    });

    it('assigns admin role case-insensitively', () => {
        const user = generateMockUser('Admin.User@publicisgroupe.com');

        expect(user.roles).toEqual(['admin']);
    });

    it('assigns empty roles for regular users', () => {
        const user = generateMockUser('user@publicisgroupe.com');

        expect(user.roles).toEqual([]);
    });

    it('generates unique user IDs', () => {
        const user1 = generateMockUser('user1@publicisgroupe.com');
        const user2 = generateMockUser('user2@publicisgroupe.com');

        expect(user1.user_id).not.toBe(user2.user_id);
    });

    it('generates unique session IDs', () => {
        const user1 = generateMockUser('user1@publicisgroupe.com');
        const user2 = generateMockUser('user2@publicisgroupe.com');

        expect(user1.session.sid).not.toBe(user2.session.sid);
    });

    it('includes default tenant ID', () => {
        const user = generateMockUser('user@publicisgroupe.com');

        expect(user.tenant_id).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('includes default consent settings', () => {
        const user = generateMockUser('user@publicisgroupe.com');

        expect(user.consent).toEqual({
            telemetry: true,
            model_training: false,
            marketing: false,
        });
    });

    it('sets session expiration to 15 minutes', () => {
        const beforeTime = Date.now() + 14.5 * 60 * 1000;
        const user = generateMockUser('user@publicisgroupe.com');
        const afterTime = Date.now() + 15.5 * 60 * 1000;

        const expiresAt = new Date(user.session.expires_at).getTime();

        expect(expiresAt).toBeGreaterThan(beforeTime);
        expect(expiresAt).toBeLessThan(afterTime);
    });
});
