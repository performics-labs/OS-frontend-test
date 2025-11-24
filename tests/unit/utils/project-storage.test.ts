import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getUserProjects, saveUserProjects, initializeUserProjects } from '@/utils';
import type { Project } from '@/types';

describe('project-storage', () => {
    const mockUserId = 'test-user-123';
    const mockProjects: Project[] = [
        {
            id: '1',
            user_id: mockUserId,
            owner_user_id: mockUserId,
            name: 'Test Project',
            description: 'Test Description',
            custom_instructions: null,
            metadata: null,
            last_activity_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
    ];

    beforeEach(() => {
        localStorage.clear();
    });

    describe('getUserProjects', () => {
        it('should return empty array when no projects exist', () => {
            const projects = getUserProjects(mockUserId);
            expect(projects).toEqual([]);
        });

        it('should return stored projects for user', () => {
            localStorage.setItem(`user-${mockUserId}-projects`, JSON.stringify(mockProjects));
            const projects = getUserProjects(mockUserId);
            expect(projects).toEqual(mockProjects);
        });

        it('should return empty array on JSON parse error', () => {
            localStorage.setItem(`user-${mockUserId}-projects`, 'invalid-json');
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            const projects = getUserProjects(mockUserId);

            expect(projects).toEqual([]);
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });

        it('should isolate projects by userId', () => {
            const user1Projects = [{ ...mockProjects[0], id: 'user1-project' }];
            const user2Projects = [{ ...mockProjects[0], id: 'user2-project' }];

            localStorage.setItem('user-user1-projects', JSON.stringify(user1Projects));
            localStorage.setItem('user-user2-projects', JSON.stringify(user2Projects));

            expect(getUserProjects('user1')).toEqual(user1Projects);
            expect(getUserProjects('user2')).toEqual(user2Projects);
        });
    });

    describe('saveUserProjects', () => {
        it('should save projects to localStorage', () => {
            saveUserProjects(mockUserId, mockProjects);
            const stored = localStorage.getItem(`user-${mockUserId}-projects`);
            expect(JSON.parse(stored!)).toEqual(mockProjects);
        });

        it('should overwrite existing projects', () => {
            const initialProjects = [mockProjects[0]];
            const updatedProjects = [
                ...mockProjects,
                { ...mockProjects[0], id: '2', name: 'New Project' },
            ];

            saveUserProjects(mockUserId, initialProjects);
            saveUserProjects(mockUserId, updatedProjects);

            const stored = getUserProjects(mockUserId);
            expect(stored).toEqual(updatedProjects);
            expect(stored).toHaveLength(2);
        });

        it('should handle save errors gracefully', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
                throw new Error('Storage quota exceeded');
            });

            expect(() => saveUserProjects(mockUserId, mockProjects)).not.toThrow();
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });

    describe('initializeUserProjects', () => {
        it('should create default projects for new user', () => {
            initializeUserProjects(mockUserId);
            const projects = getUserProjects(mockUserId);

            expect(projects).toHaveLength(3);
            expect(projects[0]).toMatchObject({
                name: 'Marketing Campaign Q1',
                owner_user_id: mockUserId,
            });
        });

        it('should not overwrite existing projects', () => {
            saveUserProjects(mockUserId, mockProjects);
            initializeUserProjects(mockUserId);

            const projects = getUserProjects(mockUserId);
            expect(projects).toEqual(mockProjects);
            expect(projects).toHaveLength(1);
        });

        it('should create unique IDs for each default project', () => {
            initializeUserProjects(mockUserId);
            const projects = getUserProjects(mockUserId);

            const ids = projects.map((p) => p.id);
            const uniqueIds = new Set(ids);

            expect(uniqueIds.size).toBe(ids.length);
        });
    });
});
