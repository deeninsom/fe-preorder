import {
    createContext,
    useContext,
    useCallback,
    useState,
    type ReactNode,
} from "react";

import { preorderApi } from "@/features/PreOrder/api/preorder.api";

import type {
    PreOrder,
    CreatePreOrderPayload,
    UpdatePreOrderPayload,
    CreatePreOrderItemPayload,
    UpdatePreOrderItemPayload,
    POStatus,
} from "@/features/PreOrder/types/preorder.type";

interface PreOrderQuery {
    page?: number;
    limit?: number;
    search?: string;
    status?: POStatus | "ALL";
}

interface PreOrderMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    totalAll?: number;
    totalUpcoming?: number;
    totalActive?: number;
    totalClosed?: number;
}

interface ActionResult {
    ok: boolean;
    error?: string;
}

interface PreOrderContextValue {
    preOrders: PreOrder[];
    preOrder: PreOrder | null;
    meta: PreOrderMeta | null;

    loading: boolean;

    getPreOrders: (
        params?: PreOrderQuery
    ) => Promise<ActionResult>;

    getPreOrder: (
        id: string
    ) => Promise<ActionResult>;

    createPreOrder: (
        payload: CreatePreOrderPayload
    ) => Promise<ActionResult>;

    updatePreOrder: (
        id: string,
        payload: UpdatePreOrderPayload
    ) => Promise<ActionResult>;

    deletePreOrder: (
        id: string
    ) => Promise<ActionResult>;

    publishPreOrder: (id: string) => Promise<ActionResult>;
    // pausePreOrder: (id: string) => Promise<ActionResult>;
    // resumePreOrder: (id: string) => Promise<ActionResult>;
    closePreOrder: (id: string) => Promise<ActionResult>;

    createItem: (
        preOrderId: string,
        payload: CreatePreOrderItemPayload
    ) => Promise<ActionResult>;

    updateItem: (
        preOrderId: string,
        itemId: string,
        payload: UpdatePreOrderItemPayload
    ) => Promise<ActionResult>;

    deleteItem: (
        preOrderId: string,
        itemId: string
    ) => Promise<ActionResult>;

    selectPreOrder: (preOrder: PreOrder) => void;
    clearPreOrder: () => void;
}

export const PreOrderContext =
    createContext<PreOrderContextValue | null>(null);

interface PreOrderProviderProps {
    children: ReactNode;
}

export function PreOrderProvider({ children }: PreOrderProviderProps) {
    const [preOrders, setPreOrders] = useState<PreOrder[]>([]);
    const [preOrder, setPreOrder] = useState<PreOrder | null>(null);
    const [meta, setMeta] = useState<PreOrderMeta | null>(null);
    const [loading, setLoading] = useState(false);

    const getPreOrders = useCallback(
        async (params?: PreOrderQuery): Promise<ActionResult> => {
            setLoading(true);
            try {
                const response = await preorderApi.getPreOrders(params);
                setPreOrders(response.data);
                setMeta(response.meta);
                return { ok: true };
            } catch (error: any) {
                return {
                    ok: false,
                    error: error?.response?.data?.message ?? "Failed to get preorders",
                };
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const getPreOrder = useCallback(
        async (id: string): Promise<ActionResult> => {
            setLoading(true);
            try {
                const response = await preorderApi.getPreOrder(id);
                setPreOrder(response);
                return { ok: true };
            } catch (error: any) {
                setPreOrder(null);
                return {
                    ok: false,
                    error: error?.response?.data?.message ?? "Failed to get preorder detail",
                };
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const createPreOrder = useCallback(
        async (payload: CreatePreOrderPayload): Promise<ActionResult> => {
            setLoading(true);
            try {
                const response = await preorderApi.createPreOrder(payload);
                setPreOrders((prev) => [response, ...prev]);
                return { ok: true };
            } catch (error: any) {
                return {
                    ok: false,
                    error: error?.response?.data?.message ?? "Failed to create preorder",
                };
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const updatePreOrder = useCallback(
        async (id: string, payload: UpdatePreOrderPayload): Promise<ActionResult> => {
            setLoading(true);
            try {
                const response = await preorderApi.updatePreOrder(id, payload);
                setPreOrders((prev) => prev.map((item) => (item.id === id ? response : item)));
                setPreOrder((prev) => (prev?.id === id ? response : prev));
                return { ok: true };
            } catch (error: any) {
                return {
                    ok: false,
                    error: error?.response?.data?.message ?? "Failed to update preorder",
                };
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const deletePreOrder = useCallback(
        async (id: string): Promise<ActionResult> => {
            setLoading(true);
            try {
                await preorderApi.deletePreOrder(id);
                setPreOrders((prev) => prev.filter((item) => item.id !== id));
                if (preOrder?.id === id) setPreOrder(null);
                return { ok: true };
            } catch (error: any) {
                return {
                    ok: false,
                    error: error?.response?.data?.message ?? "Failed to delete preorder",
                };
            } finally {
                setLoading(false);
            }
        },
        [preOrder]
    );

    const _handleStatusUpdate = useCallback(
        async (id: string, action: (id: string) => Promise<PreOrder>): Promise<ActionResult> => {
            setLoading(true);
            try {
                const response = await action(id);
                setPreOrders((prev) => prev.map((item) => (item.id === id ? response : item)));
                setPreOrder((prev) => (prev?.id === id ? response : prev));
                return { ok: true };
            } catch (error: any) {
                return {
                    ok: false,
                    error: error?.response?.data?.message ?? "Failed to update preorder status",
                };
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const publishPreOrder = useCallback((id: string) => _handleStatusUpdate(id, preorderApi.publishPreOrder), [_handleStatusUpdate]);
    // const pausePreOrder = useCallback((id: string) => _handleStatusUpdate(id, preorderApi.pausePreOrder), [_handleStatusUpdate]);
    // const resumePreOrder = useCallback((id: string) => _handleStatusUpdate(id, preorderApi.resumePreOrder), [_handleStatusUpdate]);
    const closePreOrder = useCallback((id: string) => _handleStatusUpdate(id, preorderApi.closePreOrder), [_handleStatusUpdate]);

    const createItem = useCallback(
        async (preOrderId: string, payload: CreatePreOrderItemPayload): Promise<ActionResult> => {
            setLoading(true);
            try {
                const response = await preorderApi.createItem(preOrderId, payload);
                setPreOrders((prev) => prev.map((item) => (item.id === preOrderId ? response : item)));
                setPreOrder((prev) => (prev?.id === preOrderId ? response : prev));
                return { ok: true };
            } catch (error: any) {
                return {
                    ok: false,
                    error: error?.response?.data?.message ?? "Failed to add item",
                };
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const updateItem = useCallback(
        async (preOrderId: string, itemId: string, payload: UpdatePreOrderItemPayload): Promise<ActionResult> => {
            setLoading(true);
            try {
                const response = await preorderApi.updateItem(preOrderId, itemId, payload);
                setPreOrders((prev) => prev.map((item) => (item.id === preOrderId ? response : item)));
                setPreOrder((prev) => (prev?.id === preOrderId ? response : prev));
                return { ok: true };
            } catch (error: any) {
                return {
                    ok: false,
                    error: error?.response?.data?.message ?? "Failed to update item",
                };
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const deleteItem = useCallback(
        async (preOrderId: string, itemId: string): Promise<ActionResult> => {
            setLoading(true);
            try {
                await preorderApi.deleteItem(preOrderId, itemId);
                const fetchResponse = await preorderApi.getPreOrder(preOrderId);
                setPreOrders((prev) => prev.map((item) => (item.id === preOrderId ? fetchResponse : item)));
                setPreOrder((prev) => (prev?.id === preOrderId ? fetchResponse : prev));
                return { ok: true };
            } catch (error: any) {
                return {
                    ok: false,
                    error: error?.response?.data?.message ?? "Failed to delete item",
                };
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const selectPreOrder = useCallback((p: PreOrder) => setPreOrder(p), []);
    const clearPreOrder = useCallback(() => setPreOrder(null), []);

    return (
        <PreOrderContext.Provider
            value={{
                preOrders,
                preOrder,
                meta,
                loading,
                getPreOrders,
                getPreOrder,
                createPreOrder,
                updatePreOrder,
                deletePreOrder,
                publishPreOrder,
                // pausePreOrder,
                // resumePreOrder,
                closePreOrder,
                createItem,
                updateItem,
                deleteItem,
                selectPreOrder,
                clearPreOrder,
            }}
        >
            {children}
        </PreOrderContext.Provider>
    );
}

export function usePreOrder() {
    const context = useContext(PreOrderContext);
    if (!context) {
        throw new Error("usePreOrder must be used within a PreOrderProvider");
    }
    return context;
}
