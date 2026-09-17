import { Product, ProductVariant } from "@/features/Product/types/product.type";

export type POStatus = "DRAFT" | "UPCOMING" | "ACTIVE" | "PAUSED" | "CLOSED" | "EXPIRED";

export interface PreOrderItem {
    id: string;
    preOrderId: string;
    productId: string;
    variantId?: string | null;
    price: number;
    stockLimit?: number | null;
    displayOrder: number;
    createdAt: string;
    updatedAt: string;

    product?: Product;
    variant?: ProductVariant | null;
}

export interface PreOrder {
    id: string;
    storeId: string;
    name: string;
    slug: string;
    description?: string | null;
    bannerUrl?: string | null;
    startsAt: string;
    endsAt: string;
    orderLimit?: number | null;
    status: POStatus;
    publishedAt?: string | null;
    closedAt?: string | null;
    createdAt: string;
    updatedAt: string;

    items: PreOrderItem[];
}

export interface CreatePreOrderPayload {
    name: string;
    description?: string;
    bannerUrl?: string;
    startsAt: string;
    endsAt: string;
    orderLimit?: number;
    items?: CreatePreOrderItemPayload[];
}

export interface UpdatePreOrderPayload {
    name?: string;
    description?: string;
    bannerUrl?: string;
    startsAt?: string;
    endsAt?: string;
    orderLimit?: number;
}

export interface CreatePreOrderItemPayload {
    productId: string;
    variantId?: string;
}

export interface UpdatePreOrderItemPayload {
    price?: number;
    stockLimit?: number;
    displayOrder?: number;
}

export interface PreOrderListResponse {
    data: PreOrder[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        totalAll?: number;
        totalDraft?: number;
        totalPublished?: number;
        totalActive?: number;
        totalPaused?: number;
        totalClosed?: number;
    };
}
