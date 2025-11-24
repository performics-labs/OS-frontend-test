import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import type { Model } from '@/types';
import { DEFAULT_MODEL_OPTION } from '@/constants';

export interface ModelState {
    currentModel: Model;
    models: Model[] | null;
    isLoading: boolean;
    error: string | null;
    currentUserId: string | null;
}

export interface ModelActions {
    setCurrentModel: (model: Model, userId: string) => void;
    setModels: (models: Model[]) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    syncUserModel: (userId: string) => void;
}

export type ModelStore = ModelState & ModelActions;

const initialState: ModelState = {
    currentModel: DEFAULT_MODEL_OPTION,
    models: null,
    isLoading: false,
    error: null,
    currentUserId: null,
};

const storageKey = (userId: string) => `user-${userId}-selected-model`;

const getUserModel = (userId: string): Model | null => {
    try {
        const key = storageKey(userId);
        const model = localStorage.getItem(key);
        return model ? JSON.parse(model) : null;
    } catch {
        return null;
    }
};

const saveUserModel = (userId: string, model: Model): void => {
    try {
        const key = storageKey(userId);
        localStorage.setItem(key, JSON.stringify(model));
    } catch (error) {
        console.log('Failed to save user:', error);
    }
};

const useModelStore = create<ModelStore>()(
    devtools(
        persist(
            (set, get) => ({
                ...initialState,
                setCurrentModel: (model: Model, userId: string) => {
                    if (get().currentUserId !== userId) {
                        return;
                    }
                    set({ currentModel: model });
                    saveUserModel(userId, model);
                },
                setModels: (models: Model[]) => set({ models }),
                setLoading: (isLoading: boolean) => set({ isLoading }),
                setError: (error: string | null) => set({ error }),
                syncUserModel: (userId: string) => {
                    const model = getUserModel(userId);
                    const exists = model && get().models?.some((m) => m.id === model.id);
                    const selectedModel = exists ? model : DEFAULT_MODEL_OPTION;
                    set({
                        currentModel: selectedModel,
                        currentUserId: userId,
                    });
                },
            }),
            {
                name: ``,
                storage: createJSONStorage(() => localStorage),
                partialize: (state) => ({
                    // Only persist models list (fetched from API)
                    // User preferences (currentModel) cached separately via saveUserModel()
                    models: state.models,
                }),
                version: 9,
            }
        ),
        {
            name: 'model-store',
        }
    )
);

// Custom hooks for selecting specific state (best practice)
export const useCurrentModel = () => useModelStore((state) => state.currentModel);
export const useModels = () => useModelStore((state) => state.models);
export const useModelLoading = () => useModelStore((state) => state.isLoading);
export const useModelError = () => useModelStore((state) => state.error);

export { useModelStore };
