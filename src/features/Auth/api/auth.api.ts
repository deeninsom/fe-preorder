import api from "@/lib/axios";
import type {
    AuthResponse,
    AuthUser,
    LoginPayload,
    RegisterPayload,
} from "@/features/Auth/types/auth.type";

export const authApi = {
    login: async (payload: LoginPayload): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>(
            "/auth/login",
            payload
        );

        return response.data;
    },

    register: async (
        payload: RegisterPayload
    ): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>(
            "/auth/register",
            payload
        );

        return response.data;
    },

    logout: async (refreshToken: string): Promise<void> => {
        await api.post("/auth/logout", {
            refreshToken,
        });
    },

    getMe: async (): Promise<AuthUser> => {
        const response = await api.get<AuthUser>("/users/me");

        return response.data;
    },
};