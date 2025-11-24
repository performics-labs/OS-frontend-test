import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useModelStore } from '@/stores/model-store';
import { DEFAULT_MODEL_OPTION } from '@/constants';
import type { Model } from '@/types';

const mockModel: Model = {
    id: 'test-model',
    name: 'Test Model',
    description: 'Test Description',
    provider: 'test',
    badge: 'new',
};

const TEST_USER_ID = 'test-user-123';
const USER_MODEL_KEY = `user-${TEST_USER_ID}-selected-model`;

describe('Model Store', () => {
    beforeEach(() => {
        localStorage.clear();
        useModelStore.setState({
            currentModel: DEFAULT_MODEL_OPTION,
            models: null,
            isLoading: false,
            error: null,
            currentUserId: null,
        });
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('should initialize with default state', () => {
        const state = useModelStore.getState();

        expect(state.currentModel).toEqual(DEFAULT_MODEL_OPTION);
        expect(state.models).toBeNull();
        expect(state.isLoading).toBe(false);
        expect(state.error).toBeNull();
        expect(state.currentUserId).toBeNull();
    });

    it('should set current model for synced user', () => {
        useModelStore.getState().syncUserModel(TEST_USER_ID);
        useModelStore.getState().setCurrentModel(mockModel, TEST_USER_ID);

        const state = useModelStore.getState();
        expect(state.currentModel).toEqual(mockModel);

        // Check localStorage
        const stored = localStorage.getItem(USER_MODEL_KEY);
        expect(stored).toBeTruthy();
        expect(JSON.parse(stored!)).toEqual(mockModel);
    });

    it('should not set model if user is not synced', () => {
        useModelStore.getState().setCurrentModel(mockModel, TEST_USER_ID);

        const state = useModelStore.getState();
        expect(state.currentModel).toEqual(DEFAULT_MODEL_OPTION);
        expect(localStorage.getItem(USER_MODEL_KEY)).toBeNull();
    });

    it('should sync user model from localStorage', () => {
        const mockModels = [mockModel, DEFAULT_MODEL_OPTION];
        useModelStore.getState().setModels(mockModels);

        // Save model to localStorage
        localStorage.setItem(USER_MODEL_KEY, JSON.stringify(mockModel));

        // Sync user
        useModelStore.getState().syncUserModel(TEST_USER_ID);

        const state = useModelStore.getState();
        expect(state.currentModel).toEqual(mockModel);
        expect(state.currentUserId).toBe(TEST_USER_ID);
    });

    it('should use default model if synced model not in models list', () => {
        const mockModels = [DEFAULT_MODEL_OPTION];
        useModelStore.getState().setModels(mockModels);

        // Save different model to localStorage
        localStorage.setItem(USER_MODEL_KEY, JSON.stringify(mockModel));

        useModelStore.getState().syncUserModel(TEST_USER_ID);

        const state = useModelStore.getState();
        expect(state.currentModel).toEqual(DEFAULT_MODEL_OPTION);
    });

    it('should set models list', () => {
        const mockModels = [mockModel, DEFAULT_MODEL_OPTION];
        useModelStore.getState().setModels(mockModels);

        const state = useModelStore.getState();
        expect(state.models).toEqual(mockModels);
    });

    it('should set loading state', () => {
        useModelStore.getState().setLoading(true);

        const state = useModelStore.getState();
        expect(state.isLoading).toBe(true);
    });

    it('should set error state', () => {
        const errorMessage = 'Test error';
        useModelStore.getState().setError(errorMessage);

        const state = useModelStore.getState();
        expect(state.error).toBe(errorMessage);
    });

    it('should persist only models in zustand storage', () => {
        const mockModels = [mockModel];

        useModelStore.getState().setModels(mockModels);
        useModelStore.getState().setLoading(true);
        useModelStore.getState().setError('Test error');

        // Get data from zustand persist storage (empty name = '')
        const stored = JSON.parse(localStorage.getItem('') || '{}');

        expect(stored.state.models).toEqual(mockModels);
        expect(stored.state.currentModel).toBeUndefined();
        expect(stored.state.isLoading).toBeUndefined();
        expect(stored.state.error).toBeUndefined();
    });
});
