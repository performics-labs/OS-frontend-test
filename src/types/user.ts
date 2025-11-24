export type UserRole = 'user' | 'super_user' | 'admin';

export type UserConsent = {
    telemetry: boolean;
    model_training: boolean;
    marketing: boolean;
};

export interface Session {
    sid: string;
    expires_at: string;
}

export interface User {
    user_id: string;
    email: string;
    display_name: string;
    roles: UserRole[];
    consent: UserConsent;
    session: Session;
}

export type AuthError = {
    error: string;
    message?: string;
};
