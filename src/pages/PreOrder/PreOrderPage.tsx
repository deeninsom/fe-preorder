import { useState, useEffect } from "react";
import { Plus, AlertTriangle } from "lucide-react";

import { useNotification } from "@/contexts/NotificationContext";
import { PreOrderProvider, usePreOrder } from "@/features/PreOrder/context/preorderContext";

import type { PreOrder, PreOrderItem, CreatePreOrderPayload, UpdatePreOrderPayload, CreatePreOrderItemPayload, UpdatePreOrderItemPayload, POStatus } from "@/features/PreOrder/types/preorder.type";

import PreOrderTable from "@/features/PreOrder/components/PreOrderTable";
import PreOrderFormModal from "@/features/PreOrder/components/PreOrderFormModal";
import PreOrderDetailDrawer from "@/features/PreOrder/components/PreOrderDetailDrawer";
import PreOrderItemFormModal from "@/features/PreOrder/components/PreOrderItemFormModal";

const TABS: { label: string; value: POStatus | "ALL" }[] = [
    { label: "All", value: "ALL" },
    { label: "Upcoming", value: "UPCOMING" },
    { label: "Active", value: "ACTIVE" },
    { label: "Closed", value: "CLOSED" },
];

function PreOrderPageContent() {
    const {
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
    } = usePreOrder();

    const { success, error: toastError } = useNotification();

    const [tab, setTab] = useState<POStatus | "ALL">("ALL");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    const [showForm, setShowForm] = useState(false);
    const [editingPreOrder, setEditingPreOrder] = useState<PreOrder | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<PreOrder | null>(null);

    const [showItemForm, setShowItemForm] = useState(false);
    const [editingItem, setEditingItem] = useState<PreOrderItem | null>(null);
    const [deleteItemConfirm, setDeleteItemConfirm] = useState<PreOrderItem | null>(null);

    // Reset pagination on search or tab change
    useEffect(() => {
        setPage(1);
    }, [search, tab]);

    // Fetch data
    useEffect(() => {
        const timer = setTimeout(() => {
            getPreOrders({
                page,
                limit: pageSize,
                search: search.trim() || undefined,
                status: tab,
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [search, tab, page, pageSize, getPreOrders]);

    const handleCreate = async (payload: CreatePreOrderPayload) => {
        const result = await createPreOrder(payload);
        if (!result.ok) {
            toastError("Failed to create PreOrder", result.error);
            return false;
        }
        return true;
    };

    const handleUpdate = async (id: string, payload: UpdatePreOrderPayload) => {
        const result = await updatePreOrder(id, payload);
        if (!result.ok) {
            toastError("Failed to update PreOrder", result.error);
            return false;
        }
        return true;
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        const result = await deletePreOrder(deleteConfirm.id);
        if (result.ok) {
            success("PreOrder deleted.");
        } else {
            toastError("Failed to delete PreOrder", result.error);
        }
        setDeleteConfirm(null);
    };

    // Item actions
    const handleCreateItem = async (preOrderId: string, payload: CreatePreOrderItemPayload) => {
        const result = await createItem(preOrderId, payload);
        if (!result.ok) {
            toastError("Failed to add item", result.error);
            return false;
        }
        return true;
    };

    const handleUpdateItem = async (preOrderId: string, itemId: string, payload: UpdatePreOrderItemPayload) => {
        const result = await updateItem(preOrderId, itemId, payload);
        if (!result.ok) {
            toastError("Failed to update item", result.error);
            return false;
        }
        return true;
    };

    const handleDeleteItem = async () => {
        if (!deleteItemConfirm || !preOrder) return;
        const result = await deleteItem(preOrder.id, deleteItemConfirm.id);
        if (result.ok) {
            success("Item removed.");
        } else {
            toastError("Failed to remove item", result.error);
        }
        setDeleteItemConfirm(null);
    };

    const getTabCount = (value: POStatus | "ALL") => {
        if (!meta) return "-";
        switch (value) {
            case "ALL": return meta.totalAll ?? meta.total ?? "-";
            case "UPCOMING": return meta.totalUpcoming ?? "-";
            case "ACTIVE": return meta.totalActive ?? "-";
            case "CLOSED": return meta.totalClosed ?? "-";
            default: return "-";
        }
    };

    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b px-8 py-6" style={{ borderColor: "var(--c-border)", background: "var(--c-surface)" }}>
                <div>
                    <h1 className="text-xl font-bold" style={{ color: "var(--c-text)" }}>
                        PreOrders
                    </h1>
                    <p className="mt-1 font-mono text-xs" style={{ color: "var(--c-muted)" }}>
                        {meta?.total ?? preOrders.length} preorders
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setEditingPreOrder(null);
                        setShowForm(true);
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                    style={{ background: "var(--c-accent)" }}
                >
                    <Plus size={14} /> New PreOrder
                </button>
            </div>

            <div className="flex items-center gap-1 overflow-x-auto border-b" style={{ borderColor: "var(--c-border)", background: "var(--c-surface)" }}>
                {TABS.map((item) => {
                    const active = tab === item.value;
                    return (
                        <button
                            key={item.value}
                            type="button"
                            onClick={() => setTab(item.value)}
                            className="relative flex shrink-0 items-center gap-2 px-4 py-3 text-xs font-medium transition"
                            style={{ color: active ? "var(--c-accent)" : "var(--c-muted)" }}
                        >
                            {item.label}
                            <span className="rounded-md px-1.5 py-0.5 font-mono text-[10px]" style={{ background: active ? "var(--c-accent-bg)" : "var(--c-surface2)", color: active ? "var(--c-accent)" : "var(--c-dim)" }}>
                                {getTabCount(item.value)}
                            </span>
                            {active && <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full" style={{ background: "var(--c-accent)" }} />}
                        </button>
                    );
                })}
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50 p-6" style={{ background: "var(--c-bg)" }}>
                <PreOrderTable
                    preOrders={preOrders}
                    loading={loading}
                    search={search}
                    onSearchChange={setSearch}
                    page={page}
                    totalItems={meta?.total ?? 0}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                    onView={(po) => getPreOrder(po.id)}
                    onEdit={(po) => {
                        setEditingPreOrder(po);
                        setShowForm(true);
                    }}
                    onDelete={(po) => setDeleteConfirm(po)}
                />
            </div>

            {/* Modals & Drawers */}
            <PreOrderDetailDrawer
                preOrder={preOrder}
                onClose={clearPreOrder}
                onEdit={(po) => {
                    clearPreOrder();
                    setEditingPreOrder(po);
                    setShowForm(true);
                }}
                onPublish={async (po) => {
                    const result = await publishPreOrder(po.id);
                    if (result.ok) success("PreOrder published.");
                    else toastError("Publish failed", result.error);
                }}
                // onPause={async (po) => {
                //     const result = await pausePreOrder(po.id);
                //     if (result.ok) success("PreOrder paused.");
                //     else toastError("Pause failed", result.error);
                // }}
                // onResume={async (po) => {
                //     const result = await resumePreOrder(po.id);
                //     if (result.ok) success("PreOrder resumed.");
                //     else toastError("Resume failed", result.error);
                // }}
                onClosePreOrder={async (po) => {
                    const result = await closePreOrder(po.id);
                    if (result.ok) success("PreOrder closed.");
                    else toastError("Close failed", result.error);
                }}
                onAddItem={() => {
                    setEditingItem(null);
                    setShowItemForm(true);
                }}
                onEditItem={(item) => {
                    setEditingItem(item);
                    setShowItemForm(true);
                }}
                onDeleteItem={(item) => setDeleteItemConfirm(item)}
            />

            <PreOrderFormModal
                open={showForm || !!editingPreOrder}
                preOrder={editingPreOrder}
                loading={loading}
                onClose={() => {
                    setShowForm(false);
                    setEditingPreOrder(null);
                }}
                onCreate={handleCreate}
                onUpdate={handleUpdate}
            />

            {preOrder && (
                <PreOrderItemFormModal
                    open={showItemForm || !!editingItem}
                    preOrderId={preOrder.id}
                    item={editingItem}
                    loading={loading}
                    onClose={() => {
                        setShowItemForm(false);
                        setEditingItem(null);
                    }}
                    onCreate={handleCreateItem}
                    onUpdate={handleUpdateItem}
                />
            )}

            {/* DELETE CONFIRM (PreOrder) */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-5" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)" }}>
                    <div className="w-full max-w-[380px] rounded-2xl p-7" style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", boxShadow: "0 24px 70px rgba(0,0,0,0.35)" }}>
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full" style={{ background: "var(--c-red-bg)" }}>
                                <AlertTriangle size={17} color="var(--c-red)" />
                            </div>
                            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--c-text)" }}>Delete PreOrder</h2>
                        </div>
                        <p style={{ fontSize: 13, color: "var(--c-muted)", lineHeight: 1.5, marginBottom: 24 }}>
                            Are you sure you want to delete <b style={{ color: "var(--c-text)" }}>{deleteConfirm.name}</b>?
                            This action cannot be undone.
                        </p>
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={() => setDeleteConfirm(null)} className="flex-1 rounded-xl py-2.5 text-xs font-semibold transition" style={{ color: "var(--c-text)", background: "var(--c-surface2)" }}>
                                Cancel
                            </button>
                            <button type="button" onClick={handleDelete} className="flex-1 rounded-xl py-2.5 text-xs font-semibold text-white transition" style={{ background: "var(--c-red)" }}>
                                Delete PreOrder
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRM (Item) */}
            {deleteItemConfirm && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-5" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)" }}>
                    <div className="w-full max-w-[380px] rounded-2xl p-7" style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", boxShadow: "0 24px 70px rgba(0,0,0,0.35)" }}>
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full" style={{ background: "var(--c-red-bg)" }}>
                                <AlertTriangle size={17} color="var(--c-red)" />
                            </div>
                            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--c-text)" }}>Remove Item</h2>
                        </div>
                        <p style={{ fontSize: 13, color: "var(--c-muted)", lineHeight: 1.5, marginBottom: 24 }}>
                            Are you sure you want to remove <b style={{ color: "var(--c-text)" }}>{deleteItemConfirm.product?.name}</b> from this PreOrder?
                        </p>
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={() => setDeleteItemConfirm(null)} className="flex-1 rounded-xl py-2.5 text-xs font-semibold transition" style={{ color: "var(--c-text)", background: "var(--c-surface2)" }}>
                                Cancel
                            </button>
                            <button type="button" onClick={handleDeleteItem} className="flex-1 rounded-xl py-2.5 text-xs font-semibold text-white transition" style={{ background: "var(--c-red)" }}>
                                Remove Item
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function PreOrderPage() {
    return (
        <PreOrderProvider>
            <PreOrderPageContent />
        </PreOrderProvider>
    );
}