import { useEffect, useState } from "react";

import {
    AlertTriangle,
    Plus,
    X,
} from "lucide-react";

import { useNotification } from "@/contexts/NotificationContext";

import type {
    Product,
    CreateProductPayload,
    UpdateProductPayload,
    ProductTab,
} from "@/features/Product/types/product.type";

import { useProduct } from "@/features/Product/hooks/useProduct";
import ProductTable from "@/features/Product/components/ProductTable";
import ProductDetailDrawer from "@/features/Product/components/ProductDetailDrawer";
import ProductFormModal from "@/features/Product/components/ProductFormModal";

const TABS: {
    label: string;
    value: ProductTab;
}[] = [
        { label: "All", value: "ALL" },
        { label: "Active", value: "ACTIVE" },
        { label: "Archived", value: "ARCHIVED" },
    ];

export default function ProductPage() {
    const {
        products,
        product,
        loading,
        meta,
        getProducts,
        getProduct,
        createProduct,
        updateProduct,
        deleteProduct,
        clearProduct,
    } = useProduct();

    const {
        success,
        error: toastError,
    } = useNotification();

    const [showForm, setShowForm] =
        useState(false);

    const [editingProduct, setEditingProduct] =
        useState<Product | null>(null);

    const [deleteConfirm, setDeleteConfirm] =
        useState<Product | null>(null);

    const [tab, setTab] =
        useState<ProductTab>("ALL");

    const [search, setSearch] =
        useState("");

    const [page, setPage] =
        useState(1);

    const [pageSize, setPageSize] =
        useState(20);

    /**
     * RESET PAGE
     *
     * Ketika search atau tab berubah,
     * kembali ke halaman pertama.
     */
    useEffect(() => {
        setPage(1);
    }, [search, tab]);

    /**
     * LOAD PRODUCTS
     *
     * Search + tab + pagination
     * dikirim langsung ke API.
     */
    useEffect(() => {
        const timer = setTimeout(() => {
            getProducts({
                page,
                limit: pageSize,
                search:
                    search.trim() ||
                    undefined,
                isActive:
                    tab === "ALL"
                        ? undefined
                        : tab === "ACTIVE"
                            ? true
                            : false,
            });
        }, 300);

        return () => {
            clearTimeout(timer);
        };
    }, [
        search,
        tab,
        page,
        pageSize,
        getProducts,
    ]);

    const handleCreate = async (
        payload: CreateProductPayload,
    ) => {
        const result =
            await createProduct(
                payload,
            );

        if (!result.ok) {
            toastError?.(
                "Failed to create product",
                result.error ??
                "Something went wrong.",
            );

            return false;
        }

        success(
            "Product created",
            `${payload.name} has been created successfully.`,
        );

        setShowForm(false);

        /**
         * Reload halaman saat ini
         */
        await getProducts({
            page,
            limit: pageSize,
            search:
                search.trim() ||
                undefined,
            isActive:
                tab === "ALL"
                    ? undefined
                    : tab === "ACTIVE"
                        ? true
                        : false,
        });

        return true;
    };

    const handleUpdate = async (
        id: string,
        payload: UpdateProductPayload,
    ) => {
        const result =
            await updateProduct(
                id,
                payload,
            );

        if (!result.ok) {
            toastError?.(
                "Failed to update product",
                result.error ??
                "Something went wrong.",
            );

            return false;
        }

        success(
            "Product updated",
            "Product has been updated successfully.",
        );

        setEditingProduct(null);

        /**
         * Reload halaman saat ini
         */
        await getProducts({
            page,
            limit: pageSize,
            search:
                search.trim() ||
                undefined,
            isActive:
                tab === "ALL"
                    ? undefined
                    : tab === "ACTIVE"
                        ? true
                        : false,
        });

        return true;
    };

    const handleDelete = async () => {
        if (!deleteConfirm) {
            return;
        }

        const id =
            deleteConfirm.id;

        const name =
            deleteConfirm.name;

        const result =
            await deleteProduct(id);

        if (!result.ok) {
            toastError?.(
                "Failed to delete product",
                result.error ??
                "Something went wrong.",
            );

            return;
        }

        setDeleteConfirm(null);

        if (product?.id === id) {
            clearProduct();
        }

        success(
            "Product deleted",
            `${name} has been permanently deleted.`,
        );

        /**
         * Reload halaman saat ini
         */
        await getProducts({
            page,
            limit: pageSize,
            search:
                search.trim() ||
                undefined,
            isActive:
                tab === "ALL"
                    ? undefined
                    : tab === "ACTIVE"
                        ? true
                        : false,
        });
    };

    const handleView = async (
        selectedProduct: Product,
    ) => {
        const result =
            await getProduct(
                selectedProduct.id,
            );

        if (!result.ok) {
            toastError?.(
                "Failed to load product",
                result.error ??
                "Something went wrong.",
            );
        }
    };

    const handleEdit = (
        selectedProduct: Product,
    ) => {
        setEditingProduct(
            selectedProduct,
        );
    };

    return (
        <div className="flex flex-col gap-4 overflow-x-hidden p-4 md:p-5">

            {/* PAGE HEADER */}

            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                    <h1
                        style={{
                            fontSize: 20,
                            fontWeight: 700,
                            color: "var(--c-text)",
                            margin: 0,
                            letterSpacing:
                                "-0.5px",
                        }}
                    >
                        Products
                    </h1>

                    <p
                        style={{
                            fontSize: 11.5,
                            color: "var(--c-muted)",
                            margin:
                                "3px 0 0",
                            fontFamily:
                                "JetBrains Mono, monospace",
                        }}
                    >
                        {meta?.total ??
                            products.length}{" "}
                        products
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setEditingProduct(
                            null,
                        );

                        setShowForm(true);
                    }}
                    style={{
                        display: "flex",
                        alignItems:
                            "center",
                        justifyContent:
                            "center",
                        gap: 6,
                        padding:
                            "8px 14px",
                        borderRadius: 8,
                        background:
                            "var(--c-accent)",
                        color: "#fff",
                        fontSize: 12.5,
                        fontWeight: 600,
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    <Plus size={13} />

                    New Product
                </button>
            </div>

            {/* STATUS TABS */}

            <div
                className="flex items-center gap-1 overflow-x-auto border-b"
                style={{
                    borderColor:
                        "var(--c-border)",
                }}
            >
                {TABS.map((item) => {
                    const active =
                        tab ===
                        item.value;

                    return (
                        <button
                            key={
                                item.value
                            }
                            type="button"
                            onClick={() => {
                                setTab(
                                    item.value,
                                );
                            }}
                            className="relative flex shrink-0 items-center gap-2 px-3 py-2.5 text-xs font-medium transition"
                            style={{
                                color: active
                                    ? "var(--c-accent)"
                                    : "var(--c-muted)",
                            }}
                        >
                            {item.label}

                            <span
                                className="rounded-md px-1.5 py-0.5 font-mono text-[10px]"
                                style={{
                                    background:
                                        active
                                            ? "var(--c-accent-bg)"
                                            : "var(--c-surface2)",
                                    color:
                                        active
                                            ? "var(--c-accent)"
                                            : "var(--c-dim)",
                                }}
                            >
                                {active
                                    ? meta?.total ??
                                    products.length
                                    : "-"}
                            </span>

                            {active && (
                                <span
                                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                                    style={{
                                        background:
                                            "var(--c-accent)",
                                    }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* TABLE */}

            <ProductTable
                products={
                    products
                }
                loading={loading}
                search={search}
                onSearchChange={
                    setSearch
                }
                onView={
                    handleView
                }
                onEdit={
                    handleEdit
                }
                onDelete={(item) =>
                    setDeleteConfirm(
                        item,
                    )
                }
                totalProducts={
                    meta?.total ??
                    products.length
                }
                onPageChange={
                    setPage
                }
                onPageSizeChange={(
                    size,
                ) => {
                    setPageSize(
                        size,
                    );

                    setPage(1);
                }}
            />

            {/* DETAIL DRAWER */}

            <ProductDetailDrawer
                product={product}
                onClose={
                    clearProduct
                }
                onEdit={(item) => {
                    clearProduct();

                    setEditingProduct(
                        item,
                    );
                }}
                onDelete={(item) => {
                    clearProduct();

                    setDeleteConfirm(
                        item,
                    );
                }}
            />

            {/* CREATE / EDIT */}

            <ProductFormModal
                open={
                    showForm ||
                    !!editingProduct
                }
                product={
                    editingProduct
                }
                loading={loading}
                onClose={() => {
                    setShowForm(false);

                    setEditingProduct(
                        null,
                    );
                }}
                onCreate={
                    handleCreate
                }
                onUpdate={
                    handleUpdate
                }
            />

            {/* DELETE CONFIRM */}

            {deleteConfirm && (
                <div
                    className="fixed inset-0 z-[300] flex items-center justify-center p-5"
                    style={{
                        background:
                            "rgba(0,0,0,0.55)",
                        backdropFilter:
                            "blur(3px)",
                    }}
                >
                    <div
                        className="w-full max-w-[380px] rounded-2xl p-7"
                        style={{
                            background:
                                "var(--c-surface)",
                            border:
                                "1px solid var(--c-border)",
                            boxShadow:
                                "0 24px 70px rgba(0,0,0,0.35)",
                        }}
                    >
                        <div className="mb-4 flex items-center gap-3">
                            <div
                                className="flex h-[38px] w-[38px] items-center justify-center rounded-full"
                                style={{
                                    background:
                                        "var(--c-red-bg)",
                                }}
                            >
                                <AlertTriangle
                                    size={17}
                                    color="var(--c-red)"
                                />
                            </div>

                            <div>
                                <h2
                                    style={{
                                        margin: 0,
                                        fontSize: 16,
                                        fontWeight: 700,
                                        color: "var(--c-text)",
                                    }}
                                >
                                    Delete product?
                                </h2>

                                <div
                                    style={{
                                        marginTop: 2,
                                        fontSize: 10.5,
                                        color: "var(--c-dim)",
                                    }}
                                >
                                    This action cannot be undone.
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setDeleteConfirm(
                                        null,
                                    )
                                }
                                style={{
                                    marginLeft:
                                        "auto",
                                    display:
                                        "flex",
                                    background:
                                        "transparent",
                                    border:
                                        "none",
                                    color:
                                        "var(--c-dim)",
                                    cursor:
                                        "pointer",
                                }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <p
                            style={{
                                margin:
                                    "0 0 22px",
                                fontSize: 12.5,
                                lineHeight:
                                    1.6,
                                color:
                                    "var(--c-muted)",
                            }}
                        >
                            <strong
                                style={{
                                    color:
                                        "var(--c-text)",
                                }}
                            >
                                {
                                    deleteConfirm.name
                                }
                            </strong>{" "}
                            will be permanently deleted.
                        </p>

                        <div className="flex gap-2.5">
                            <button
                                type="button"
                                onClick={
                                    handleDelete
                                }
                                disabled={
                                    loading
                                }
                                className="flex-1 rounded-lg py-2.5 text-sm font-semibold"
                                style={{
                                    background:
                                        "var(--c-red)",
                                    color:
                                        "#fff",
                                    border:
                                        "none",
                                    cursor:
                                        loading
                                            ? "not-allowed"
                                            : "pointer",
                                    opacity:
                                        loading
                                            ? 0.6
                                            : 1,
                                }}
                            >
                                {loading
                                    ? "Deleting..."
                                    : "Delete"}
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setDeleteConfirm(
                                        null,
                                    )
                                }
                                disabled={
                                    loading
                                }
                                className="flex-1 rounded-lg py-2.5 text-sm"
                                style={{
                                    border:
                                        "1px solid var(--c-border)",
                                    background:
                                        "var(--c-surface2)",
                                    color:
                                        "var(--c-muted)",
                                    cursor:
                                        loading
                                            ? "not-allowed"
                                            : "pointer",
                                    opacity:
                                        loading
                                            ? 0.6
                                            : 1,
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}