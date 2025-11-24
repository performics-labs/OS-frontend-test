export function generateHash(str: string) {
    let hash = 0;
    for (const char of str) {
        hash = (hash << 5) - hash + char.charCodeAt(0);
        hash |= 0;
    }
    return hash * -1;
}

export function generateMockUser(email: string, name?: string) {
    // Use provided name or generate from email
    const displayName = name || email.split('@')[0].replace(/[._-]/g, ' ');

    // Simple role assignment: admin or regular user only
    const roles = email.toLowerCase().includes('admin') ? ['admin'] : [];

    // Capitalize display name if generated from email
    const formattedName = name || displayName
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

    // Generate deterministic UUID from email hash for consistency across sessions
    const emailHash = generateHash(email).toString();
    const paddedHash = emailHash.padStart(32, '0').slice(0, 32);
    const userId = `${paddedHash.slice(0, 8)}-${paddedHash.slice(8, 12)}-${paddedHash.slice(12, 16)}-${paddedHash.slice(16, 20)}-${paddedHash.slice(20, 32)}`;

    // Use a fixed UUID for tenant_id in development (all users same tenant)
    const tenantId = '550e8400-e29b-41d4-a716-446655440000';

    return {
        user_id: userId,
        email,
        display_name: formattedName,
        tenant_id: tenantId,
        roles,
        consent: {
            telemetry: true,
            model_training: false,
            marketing: false,
        },
        session: {
            sid: crypto.randomUUID(),
            expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        },
    };
}
