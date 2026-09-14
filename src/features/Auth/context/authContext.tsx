import {
    createContext,
    useCallback,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import { authApi } from "@/features/Auth/api/auth.api";
import type {
    AuthUser,
    LoginPayload,
    RegisterPayload,
} from "@/features/Auth/types/auth.type";

interface AuthContextValue {
    user: AuthUser | null;
    loading: boolean;
    isAuthenticated: boolean;

    login: (
        payload: LoginPayload
    ) => Promise<{
        ok: boolean;
        error?: string;
    }>;

    register: (
        payload: RegisterPayload
    ) => Promise<{
        ok: boolean;
        error?: string;
    }>;

    logout: () => Promise<void>;
}

export const AuthContext =
    createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({
    children,
}: AuthProviderProps) {
    const [user, setUser] =
        useState<AuthUser | null>(null);

    const [loading, setLoading] =
        useState(true);

    const isAuthenticated = Boolean(user);

    /**
     * Initialize authentication
     * when application starts.
     */
    const initializeAuth = useCallback(async () => {
        const accessToken =
            localStorage.getItem("access_token");

        if (!accessToken) {
            setLoading(false);
            return;
        }

        try {
            const currentUser =
                await authApi.getMe();

            setUser(currentUser);
        } catch (error) {
            console.error(
                "Failed to initialize authentication:",
                error
            );

            localStorage.removeItem(
                "access_token"
            );

            localStorage.removeItem(
                "refresh_token"
            );

            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    /**
     * Login
     */
    const login = async (
        payload: LoginPayload
    ) => {
        try {
            const response =
                await authApi.login(payload);

            localStorage.setItem(
                "access_token",
                response.accessToken
            );

            localStorage.setItem(
                "refresh_token",
                response.refreshToken
            );

            setUser(response.data);

            return {
                ok: true,
            };
        } catch (error: any) {
            return {
                ok: false,
                error:
                    error?.response?.data?.message ??
                    "Login failed",
            };
        }
    };

    /**
     * Register
     */
    const register = async (
        payload: RegisterPayload
    ) => {
        try {
            const response =
                await authApi.register(payload);

            localStorage.setItem(
                "access_token",
                response.accessToken
            );

            localStorage.setItem(
                "refresh_token",
                response.refreshToken
            );

            setUser(response.data);

            return {
                ok: true,
            };
        } catch (error: any) {
            return {
                ok: false,
                error:
                    error?.response?.data?.message ??
                    "Registration failed",
            };
        }
    };

    /**
     * Logout
     */
    const logout = async () => {
        const refreshToken =
            localStorage.getItem("refresh_token");

        try {
            if (refreshToken) {
                await authApi.logout(refreshToken);
            }
        } catch (error) {
            console.error(
                "Logout error:",
                error
            );
        } finally {
            localStorage.removeItem(
                "access_token"
            );

            localStorage.removeItem(
                "refresh_token"
            );

            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}