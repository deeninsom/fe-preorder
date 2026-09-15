import api from "@/lib/axios";

import type {
    ProductListResponse,
    Product,
    CreateProductPayload,
    UpdateProductPayload,
    CreateProductVariantPayload,
    UpdateProductVariantPayload,
    ProductVariant,
} from "@/features/Product/types/product.type";

export const productApi = {
    // =========================
    // PRODUCT
    // =========================

    getProducts: async (params?: {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
    }): Promise<ProductListResponse> => {
        const response =
            await api.get<ProductListResponse>(
                "/products",
                {
                    params,
                }
            );

        return response.data;
    },

    getProduct: async (
        id: string
    ): Promise<Product> => {
        const response =
            await api.get<Product>(
                `/products/${id}`
            );

        return response.data;
    },

    createProduct: async (
        payload: CreateProductPayload
    ): Promise<Product> => {
        const response =
            await api.post<Product>(
                "/products",
                payload
            );

        return response.data;
    },

    updateProduct: async (
        id: string,
        payload: UpdateProductPayload
    ): Promise<Product> => {
        const response =
            await api.patch<Product>(
                `/products/${id}`,
                payload
            );

        return response.data;
    },

    archiveProduct: async (
        id: string
    ): Promise<Product> => {
        const response =
            await api.patch<Product>(
                `/products/${id}/archive`
            );

        return response.data;
    },

    restoreProduct: async (
        id: string
    ): Promise<Product> => {
        const response =
            await api.patch<Product>(
                `/products/${id}/restore`
            );

        return response.data;
    },

    deleteProduct: async (
        id: string
    ): Promise<void> => {
        await api.delete(
            `/products/${id}`
        );
    },

    // =========================
    // PRODUCT VARIANT
    // =========================

    getVariants: async (
        productId: string
    ): Promise<ProductVariant[]> => {
        const response =
            await api.get<ProductVariant[]>(
                `/products/${productId}/variants`
            );

        return response.data;
    },

    getVariant: async (
        productId: string,
        variantId: string
    ): Promise<ProductVariant> => {
        const response =
            await api.get<ProductVariant>(
                `/products/${productId}/variants/${variantId}`
            );

        return response.data;
    },

    createVariant: async (
        productId: string,
        payload: CreateProductVariantPayload
    ): Promise<ProductVariant> => {
        const response =
            await api.post<ProductVariant>(
                `/products/${productId}/variants`,
                payload
            );

        return response.data;
    },

    updateVariant: async (
        productId: string,
        variantId: string,
        payload: UpdateProductVariantPayload
    ): Promise<ProductVariant> => {
        const response =
            await api.patch<ProductVariant>(
                `/products/${productId}/variants/${variantId}`,
                payload
            );

        return response.data;
    },

    deleteVariant: async (
        productId: string,
        variantId: string
    ): Promise<void> => {
        await api.delete(
            `/products/${productId}/variants/${variantId}`
        );
    },
};