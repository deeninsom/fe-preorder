export interface ProductVariant {
    id: string;
    productId: string;
    name: string;
    sku?: number | null;
    price?: number | null;
    stock: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Product {
    id: string;
    storeId: string;
    name: string;
    slug: string;
    description?: string | null;
    price: number;
    cost?: number | null;
    sku?: string | null;
    stock: number;
    weightGram?: number | null;
    imageUrl?: string | null;
    isActive: boolean;
    archivedAt?: string | null;
    createdAt: string;
    updatedAt: string;

    variants: ProductVariant[];
}

export interface CreateProductPayload {
    name: string;
    slug?: string;
    description?: string;
    price: number;
    cost?: number;
    sku?: string;
    stock?: number;
    weightGram?: number;
    imageUrl?: string;
    isActive?: boolean;

    variants?: CreateProductVariantPayload[];
}

export interface UpdateProductPayload {
    name?: string;
    slug?: string;
    description?: string;
    price?: number;
    cost?: number;
    sku?: string;
    stock?: number;
    weightGram?: number;
    imageUrl?: string;
    isActive?: boolean;
}

export interface CreateProductVariantPayload {
    name: string;
    sku?: number;
    price?: number;
    stock?: number;
    isActive?: boolean;
}

export interface UpdateProductVariantPayload {
    name?: string;
    sku?: number;
    price?: number;
    stock?: number;
    isActive?: boolean;
}

export type ProductTab = "ALL" | "ACTIVE" | "ARCHIVED";

export interface ProductResponse {
    data: Product;
}

export interface ProductListResponse {
    data: Product[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}