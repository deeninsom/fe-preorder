export interface AuthUser {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    role: string;
    tenantId?: string | null;
    isActive: boolean;

    tenant?: {
        id: string;
        name: string;
        slug: string;
        isActive: boolean;
    } | null;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
    phone?: string;
}

export interface AuthResponse {
    data: AuthUser;
    accessToken: string;
    refreshToken: string;
}