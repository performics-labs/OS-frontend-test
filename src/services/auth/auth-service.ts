import { apiClient } from '@/lib';
import type { User } from '@/types';
import { API_ROUTES } from '@/constants';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
}

export interface AuthResponse {
    user: User;
    message?: string;
}

export async function loginWithEmail(data: LoginRequest) {
    const response = await apiClient.post<AuthResponse>(API_ROUTES.LOGIN, data);
    return response;
}

export async function registerWithEmail(data: RegisterRequest) {
    const response = await apiClient.post<AuthResponse>(API_ROUTES.REGISTER, data);
    return response;
}

export async function getCurrentSession() {
    const response = await apiClient.get<User>(API_ROUTES.SESSION);
    return response;
}

export async function logoutUser() {
    const response = await apiClient.post(API_ROUTES.LOGOUT);
    return response;
}

export async function refreshSession() {
    const response = await apiClient.post<AuthResponse>(API_ROUTES.REFRESH);
    return response;
}
