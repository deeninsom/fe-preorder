import {
    createContext,
    useCallback,
    useState,
    type ReactNode,
} from "react";

import { productApi } from "@/features/Product/api/product.api";

import type {
    Product,
    CreateProductPayload,
    UpdateProductPayload,
    CreateProductVariantPayload,
    UpdateProductVariantPayload,
} from "@/features/Product/types/product.type";

interface ProductQuery {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
}

interface ProductMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    totalAll?: number;
    totalActive?: number;
    totalArchived?: number;
}

interface ActionResult {
    ok: boolean;
    error?: string;
}

interface ProductContextValue {
    products: Product[];
    product: Product | null;
    meta: ProductMeta | null;

    loading: boolean;

    getProducts: (
        params?: ProductQuery
    ) => Promise<ActionResult>;

    getProduct: (
        id: string
    ) => Promise<ActionResult>;

    createProduct: (
        payload: CreateProductPayload
    ) => Promise<ActionResult>;

    updateProduct: (
        id: string,
        payload: UpdateProductPayload
    ) => Promise<ActionResult>;

    deleteProduct: (
        id: string
    ) => Promise<ActionResult>;

    createVariant: (
        productId: string,
        payload: CreateProductVariantPayload
    ) => Promise<ActionResult>;

    updateVariant: (
        productId: string,
        variantId: string,
        payload: UpdateProductVariantPayload
    ) => Promise<ActionResult>;

    deleteVariant: (
        productId: string,
        variantId: string
    ) => Promise<ActionResult>;

    selectProduct: (product: Product) => void;
    clearProduct: () => void;
}

export const ProductContext =
    createContext<ProductContextValue | null>(null);

interface ProductProviderProps {
    children: ReactNode;
}

export function ProductProvider({
    children,
}: ProductProviderProps) {
    const [products, setProducts] =
        useState<Product[]>([]);

    const [product, setProduct] =
        useState<Product | null>(null);

    const [meta, setMeta] =
        useState<ProductMeta | null>(null);

    const [loading, setLoading] =
        useState(false);

    /**
     * Get all products
     */
    const getProducts = useCallback(
        async (
            params?: ProductQuery
        ): Promise<ActionResult> => {
            setLoading(true);

            try {
                const response =
                    await productApi.getProducts(params);

                setProducts(response.data);
                setMeta(response.meta);

                return {
                    ok: true,
                };
            } catch (error: any) {
                return {
                    ok: false,
                    error:
                        error?.response?.data?.message ??
                        "Failed to get products",
                };
            } finally {
                setLoading(false);
            }
        },
        []
    );

    /**
     * Get product detail
     */
    const getProduct = useCallback(
        async (
            id: string
        ): Promise<ActionResult> => {
            setLoading(true);

            try {
                const response =
                    await productApi.getProduct(id);

                setProduct(response);

                return {
                    ok: true,
                };
            } catch (error: any) {
                setProduct(null);

                return {
                    ok: false,
                    error:
                        error?.response?.data?.message ??
                        "Failed to get product",
                };
            } finally {
                setLoading(false);
            }
        },
        []
    );

    /**
     * Create product
     */
    const createProduct = useCallback(
        async (
            payload: CreateProductPayload
        ): Promise<ActionResult> => {
            setLoading(true);

            try {
                const response =
                    await productApi.createProduct(
                        payload
                    );

                setProducts((prev) => [
                    response,
                    ...prev,
                ]);

                return {
                    ok: true,
                };
            } catch (error: any) {
                return {
                    ok: false,
                    error:
                        error?.response?.data?.message ??
                        "Failed to create product",
                };
            } finally {
                setLoading(false);
            }
        },
        []
    );

    /**
     * Update product
     */
    const updateProduct = useCallback(
        async (
            id: string,
            payload: UpdateProductPayload
        ): Promise<ActionResult> => {
            setLoading(true);

            try {
                const response =
                    await productApi.updateProduct(
                        id,
                        payload
                    );

                setProducts((prev) =>
                    prev.map((item) =>
                        item.id === id
                            ? response
                            : item
                    )
                );

                setProduct((prev) =>
                    prev?.id === id
                        ? response
                        : prev
                );

                return {
                    ok: true,
                };
            } catch (error: any) {
                return {
                    ok: false,
                    error:
                        error?.response?.data?.message ??
                        "Failed to update product",
                };
            } finally {
                setLoading(false);
            }
        },
        []
    );

    /**
     * Permanently delete product
     */
    const deleteProduct = useCallback(
        async (
            id: string
        ): Promise<ActionResult> => {
            setLoading(true);

            try {
                await productApi.deleteProduct(id);

                setProducts((prev) =>
                    prev.filter(
                        (item) =>
                            item.id !== id
                    )
                );

                setProduct((prev) =>
                    prev?.id === id
                        ? null
                        : prev
                );

                return {
                    ok: true,
                };
            } catch (error: any) {
                return {
                    ok: false,
                    error:
                        error?.response?.data?.message ??
                        "Failed to delete product",
                };
            } finally {
                setLoading(false);
            }
        },
        []
    );

    /**
     * Create variant
     */
    const createVariant = useCallback(
        async (
            productId: string,
            payload: CreateProductVariantPayload
        ): Promise<ActionResult> => {
            setLoading(true);

            try {
                await productApi.createVariant(productId, payload);
                await getProduct(productId); // Refresh product detail

                return { ok: true };
            } catch (error: any) {
                return {
                    ok: false,
                    error:
                        error?.response?.data?.message ??
                        "Failed to create variant",
                };
            } finally {
                setLoading(false);
            }
        },
        [getProduct]
    );

    /**
     * Update variant
     */
    const updateVariant = useCallback(
        async (
            productId: string,
            variantId: string,
            payload: UpdateProductVariantPayload
        ): Promise<ActionResult> => {
            setLoading(true);

            try {
                await productApi.updateVariant(productId, variantId, payload);
                await getProduct(productId); // Refresh product detail

                return { ok: true };
            } catch (error: any) {
                return {
                    ok: false,
                    error:
                        error?.response?.data?.message ??
                        "Failed to update variant",
                };
            } finally {
                setLoading(false);
            }
        },
        [getProduct]
    );

    /**
     * Delete variant
     */
    const deleteVariant = useCallback(
        async (
            productId: string,
            variantId: string
        ): Promise<ActionResult> => {
            setLoading(true);

            try {
                await productApi.deleteVariant(productId, variantId);
                await getProduct(productId); // Refresh product detail

                return { ok: true };
            } catch (error: any) {
                return {
                    ok: false,
                    error:
                        error?.response?.data?.message ??
                        "Failed to delete variant",
                };
            } finally {
                setLoading(false);
            }
        },
        [getProduct]
    );

    /**
     * Clear selected product
     */
    const clearProduct = useCallback(() => {
        setProduct(null);
    }, []);

    /**
     * Select product (instant view)
     */
    const selectProduct = useCallback((p: Product) => {
        setProduct(p);
    }, []);

    return (
        <ProductContext.Provider
            value={{
                products,
                product,
                meta,
                loading,
                getProducts,
                getProduct,
                createProduct,
                updateProduct,
                deleteProduct,
                createVariant,
                updateVariant,
                deleteVariant,
                selectProduct,
                clearProduct,
            }}
        >
            {children}
        </ProductContext.Provider>
    );
}