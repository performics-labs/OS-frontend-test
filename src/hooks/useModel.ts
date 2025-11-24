import { useAuthStore, useModelStore } from '@/stores';
import { useCallback, useEffect } from 'react';
import { fetchModels } from '@/services';
import { getErrorMessage } from '@/utils';
import { ERROR_MESSAGES } from '@/constants';
import type { Model } from '@/types';

function useModel() {
    const models = useModelStore((state) => state.models);
    const isLoading = useModelStore((state) => state.isLoading);
    const currentModel = useModelStore((state) => state.currentModel);
    const setLoading = useModelStore((state) => state.setLoading);
    const setModels = useModelStore((state) => state.setModels);
    const setCurrentModel = useModelStore((state) => state.setCurrentModel);
    const setError = useModelStore((state) => state.setError);
    const syncUserModel = useModelStore((state) => state.syncUserModel);

    const user = useAuthStore((state) => state.user);

    const handleError = useCallback(
        (error: unknown): string => {
            const message = getErrorMessage(error);
            setError(message);
            return message;
        },
        [setError]
    );

    const getModels = useCallback(async () => {
        // Always fetch fresh - no caching in localStorage
        setLoading(true);

        try {
            const { data } = await fetchModels();

            if (!data.models) {
                throw new Error(ERROR_MESSAGES.MODELS.MISSING_MODELS);
            }

            setModels(data.models);

            return {
                success: true,
                error: null,
            };
        } catch (error) {
            const message = handleError(error);

            return {
                success: false,
                error: message,
            };
        } finally {
            setLoading(false);
        }
    }, [setModels, setLoading, handleError]);

    const handleSetCurrentModel = useCallback(
        (model: Model) => {
            if (!user?.user_id) {
                return;
            }
            setCurrentModel(model, user.user_id);
        },
        [setCurrentModel, user?.user_id]
    );

    useEffect(() => {
        if (user?.user_id) {
            syncUserModel(user.user_id);
        }
    }, [user?.user_id, syncUserModel]);

    useEffect(() => {
        // Only fetch if models aren't already loaded
        if (!models) {
            getModels();
        }
    }, [getModels, models]);

    return {
        models,
        isLoading,
        currentModel,
        setLoading,
        setCurrentModel: handleSetCurrentModel,
        getModels,
        setModels,
    };
}

export { useModel };
