export interface AuthUser {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    role: string;
    storeId?: string | null;
    isActive: boolean;

    store?: {
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
    store_name: string;
}

export interface AuthResponse {
    data: AuthUser;
    accessToken: string;
    refreshToken: string;
}