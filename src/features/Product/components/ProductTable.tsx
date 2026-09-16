import {
    Eye,
    Pencil,
    Trash2,
    Package,
    Search,
} from "lucide-react";

import DataTable, {
    type DataTableColumn,
} from "@/components/ui/DataTable";

import { SecureImage } from "@/components/ui/SecureImage";
import type {
    Product,
} from "@/features/Product/types/product.type";

interface ProductTableProps {
    products: Product[];
    loading?: boolean;

    search: string;
    onSearchChange: (value: string) => void;

    totalProducts: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;

    onView: (product: Product) => void;
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
}

export default function ProductTable({
    products,
    loading = false,
    search,
    onSearchChange,

    totalProducts,
    onPageChange,
    onPageSizeChange,

    onView,
    onEdit,
    onDelete,
}: ProductTableProps) {
    const formatPrice = (
        value: number
    ) => {
        return new Intl.NumberFormat(
            "id-ID",
            {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
            }
        ).format(value);
    };

    const columns: DataTableColumn<Product>[] = [
        {
            id: "name",
            header: "Product",
            accessorKey: "name",

            sortable: true,

            searchable: false,

            width: 240,

            cell: (product) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                        {product.imageUrl ? (
                            <SecureImage
                                src={product.imageUrl}
                                alt={product.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <Package
                                size={18}
                                className="text-slate-400"
                            />
                        )}
                    </div>

                    <div className="min-w-0">
                        <p className="truncate font-medium" style={{ color: "var(--c-text)" }}>
                            {product.name}
                        </p>

                        <p className="truncate text-xs" style={{ color: "var(--c-dim)" }}>
                            {product.slug}
                        </p>
                    </div>
                </div>
            ),
        },

        {
            id: "sku",
            header: "SKU",
            accessorKey: "sku",

            sortable: true,

            searchable: false,

            width: 150,

            cell: (product) => (
                <span className="font-mono text-sm" style={{ color: "var(--c-muted)" }}>
                    {product.sku || "-"}
                </span>
            ),
        },

        {
            id: "price",
            header: "Price",

            sortable: true,

            align: "right",

            width: 150,

            cell: (product) => (
                <span className="font-medium" style={{ color: "var(--c-text)" }}>
                    {formatPrice(
                        product.price
                    )}
                </span>
            ),
        },

        {
            id: "stock",
            header: "Stock",

            sortable: true,

            align: "right",

            width: 100,

            cell: (product) => {
                const isLowStock =
                    product.stock <= 5;

                return (
                    <span
                        className={
                            isLowStock
                                ? "font-semibold"
                                : ""
                        }
                        style={{
                            color: isLowStock ? "var(--c-red)" : "var(--c-muted)",
                        }}
                    >
                        {product.stock}
                    </span>
                );
            },
        },

        {
            id: "variants",
            header: "Variants",

            sortable: false,

            width: 100,

            cell: (product) => (
                <span style={{ color: "var(--c-muted)" }}>
                    {product.variants
                        ?.length ?? 0}
                </span>
            ),
        },

        {
            id: "status",
            header: "Status",
            accessorKey: "isActive",

            sortable: true,

            width: 120,

            cell: (product) => (
                <span
                    className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{
                        background: product.isActive ? "var(--c-green-bg)" : "var(--c-surface2)",
                        color: product.isActive ? "var(--c-green)" : "var(--c-dim)",
                    }}
                >
                    {product.isActive
                        ? "Active"
                        : "Archived"}
                </span>
            ),
        },
    ];

    return (
        <div className="flex flex-col gap-3">

            {/* TABLE */}

            <DataTable<Product>
                data={products}
                columns={columns}
                getRowId={(product) => product.id}
                loading={loading}

                /*
                 * SERVER SIDE
                 */
                serverSide

                /*
                 * SEARCH
                 */
                searchable
                searchValue={search}
                onSearchChange={onSearchChange}

                /*
                 * TOTAL DATA DARI API
                 */
                totalRows={totalProducts}

                /*
                 * PAGINATION
                 */
                pagination
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}

                initialPageSize={10}
                pageSizeOptions={[
                    10,
                    20,
                    50,
                    100,
                ]}

                /*
                 * SORTING
                 */
                initialSort={{
                    columnId: "name",
                    direction: "asc",
                }}

                stickyHeader

                enableExport
                exportFileName="products"

                enableColumnVisibility
                enableDensity

                rowActions={[
                    {
                        id: "view",
                        label: "View",
                        icon: <Eye size={12} />,
                        variant: "default",
                        onClick: onView,
                    },

                    {
                        id: "edit",
                        label: "Edit",
                        icon: <Pencil size={12} />,
                        variant: "accent",
                        onClick: onEdit,
                    },

                    {
                        id: "delete",
                        label: "Delete",
                        icon: <Trash2 size={12} />,
                        variant: "danger",
                        onClick: onDelete,
                    },
                ]}

                onRowClick={onView}

                emptyMessage="No products found"

                emptyDescription={
                    search
                        ? `No products match "${search}".`
                        : "No products found."
                }

                emptyIcon={
                    <Package
                        size={30}
                        style={{
                            opacity: 0.35,
                        }}
                    />
                }
            />
        </div>
    );
}
