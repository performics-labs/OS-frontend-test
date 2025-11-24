import type { Project } from '@/types';

const getStorageKey = (userId: string) => `user-${userId}-projects`;

export function getUserProjects(userId: string): Project[] {
    try {
        const key = getStorageKey(userId);
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Failed to load projects:', error);
        return [];
    }
}

export function saveUserProjects(userId: string, projects: Project[]): void {
    try {
        const key = getStorageKey(userId);
        localStorage.setItem(key, JSON.stringify(projects));
    } catch (error) {
        console.error('Failed to save projects:', error);
    }
}

export function initializeUserProjects(userId: string): void {
    const existing = getUserProjects(userId);
    if (existing.length === 0) {
        const defaultProjects: Project[] = [
            {
                id: crypto.randomUUID(),
                user_id: userId,
                owner_user_id: userId,
                name: 'Marketing Campaign Q1',
                description: 'Social media strategy and content calendar for Q1 2025',
                custom_instructions: null,
                metadata: null,
                last_activity_at: new Date('2024-12-15').toISOString(),
                created_at: new Date('2024-12-15').toISOString(),
                updated_at: new Date('2024-12-15').toISOString(),
            },
            {
                id: crypto.randomUUID(),
                user_id: userId,
                owner_user_id: userId,
                name: 'Website Redesign',
                description: 'Complete overhaul of company website with new branding',
                custom_instructions: null,
                metadata: null,
                last_activity_at: new Date('2024-12-10').toISOString(),
                created_at: new Date('2024-12-10').toISOString(),
                updated_at: new Date('2024-12-10').toISOString(),
            },
            {
                id: crypto.randomUUID(),
                user_id: userId,
                owner_user_id: userId,
                name: 'Product Launch',
                description: 'New product line launch campaign and materials',
                custom_instructions: null,
                metadata: null,
                last_activity_at: new Date('2024-12-05').toISOString(),
                created_at: new Date('2024-12-05').toISOString(),
                updated_at: new Date('2024-12-05').toISOString(),
            },
        ];
        saveUserProjects(userId, defaultProjects);
    }
}
