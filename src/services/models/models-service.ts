import { apiClient } from '@/lib';
import type { ModelResponse } from '@/types';
import { API_ROUTES } from '@/constants';

export async function fetchModels() {
    const response = await apiClient.get<ModelResponse>(API_ROUTES.MODELS);
    return response;
}
