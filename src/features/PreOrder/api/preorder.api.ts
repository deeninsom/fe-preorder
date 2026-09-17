import api from "@/lib/axios";

import type {
    PreOrderListResponse,
    PreOrder,
    CreatePreOrderPayload,
    UpdatePreOrderPayload,
    CreatePreOrderItemPayload,
    UpdatePreOrderItemPayload,
    POStatus,
} from "@/features/PreOrder/types/preorder.type";

export const preorderApi = {
    // =========================
    // PRE ORDER
    // =========================

    getPreOrders: async (params?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: POStatus | "ALL";
    }): Promise<PreOrderListResponse> => {
        const response = await api.get<PreOrderListResponse>("/pre-order", {
            params: {
                ...params,
                status: params?.status === "ALL" ? undefined : params?.status,
            },
        });

        return response.data;
    },

    getPreOrder: async (id: string): Promise<PreOrder> => {
        const response = await api.get<PreOrder>(`/pre-order/${id}`);
        return response.data;
    },

    createPreOrder: async (payload: CreatePreOrderPayload): Promise<PreOrder> => {
        const response = await api.post<PreOrder>("/pre-order", payload);
        return response.data;
    },

    updatePreOrder: async (id: string, payload: UpdatePreOrderPayload): Promise<PreOrder> => {
        const response = await api.put<PreOrder>(`/pre-order/${id}`, payload);
        return response.data;
    },

    deletePreOrder: async (id: string): Promise<void> => {
        await api.delete(`/pre-order/${id}`);
    },

    publishPreOrder: async (id: string): Promise<PreOrder> => {
        const response = await api.post<PreOrder>(`/pre-order/${id}/publish`);
        return response.data;
    },

    // pausePreOrder: async (id: string): Promise<PreOrder> => {
    //     const response = await api.post<PreOrder>(`/pre-order/${id}/pause`);
    //     return response.data;
    // },

    // resumePreOrder: async (id: string): Promise<PreOrder> => {
    //     const response = await api.post<PreOrder>(`/pre-order/${id}/resume`);
    //     return response.data;
    // },

    closePreOrder: async (id: string): Promise<PreOrder> => {
        const response = await api.post<PreOrder>(`/pre-order/${id}/close`);
        return response.data;
    },

    // =========================
    // PRE ORDER ITEMS
    // =========================

    createItem: async (preOrderId: string, payload: CreatePreOrderItemPayload): Promise<PreOrder> => {
        const response = await api.post<PreOrder>(`/pre-order/${preOrderId}/items`, payload);
        return response.data;
    },

    updateItem: async (
        preOrderId: string,
        itemId: string,
        payload: UpdatePreOrderItemPayload
    ): Promise<PreOrder> => {
        const response = await api.put<PreOrder>(`/pre-order/${preOrderId}/items/${itemId}`, payload);
        return response.data;
    },

    deleteItem: async (preOrderId: string, itemId: string): Promise<void> => {
        await api.delete(`/pre-order/${preOrderId}/items/${itemId}`);
    },
};
