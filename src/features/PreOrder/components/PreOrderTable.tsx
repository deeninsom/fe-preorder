import {
    Eye,
    Pencil,
    Trash2,
    Calendar,
} from "lucide-react";
import { format, isBefore, isAfter } from "date-fns";

import DataTable, {
    type DataTableColumn,
} from "@/components/ui/DataTable";

import { SecureImage } from "@/components/ui/SecureImage";
import type {
    PreOrder,
} from "@/features/PreOrder/types/preorder.type";

interface PreOrderTableProps {
    preOrders: PreOrder[];
    loading?: boolean;

    search: string;
    onSearchChange: (value: string) => void;

    page: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;

    onView: (preOrder: PreOrder) => void;
    onEdit: (preOrder: PreOrder) => void;
    onDelete: (preOrder: PreOrder) => void;
}

export default function PreOrderTable({
    preOrders,
    loading = false,
    search,
    onSearchChange,

    page,
    totalItems,
    onPageChange,
    onPageSizeChange,

    onView,
    onEdit,
    onDelete,
}: PreOrderTableProps) {
    const columns: DataTableColumn<PreOrder>[] = [
        {
            id: "name",
            header: "Name",
            accessorKey: "name",
            sortable: true,
            searchable: false,
            width: 260,
            cell: (po) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                        {po.bannerUrl ? (
                            <SecureImage
                                src={po.bannerUrl}
                                alt={po.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <Calendar
                                size={18}
                                className="text-slate-400"
                            />
                        )}
                    </div>

                    <div className="min-w-0">
                        <p className="truncate font-medium" style={{ color: "var(--c-text)" }}>
                            {po.name}
                        </p>
                        <p className="truncate text-xs" style={{ color: "var(--c-dim)" }}>
                            {po.slug}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            id: "duration",
            header: "Duration",
            accessorKey: "startsAt",
            sortable: true,
            width: 180,
            cell: (po) => {
                const start = new Date(po.startsAt);
                const end = new Date(po.endsAt);
                return (
                    <div className="flex flex-col gap-0.5 text-xs">
                        <span style={{ color: "var(--c-text)" }}>
                            {format(start, "dd MMM yyyy, HH:mm")}
                        </span>
                        <span style={{ color: "var(--c-dim)" }}>
                            until {format(end, "dd MMM yyyy, HH:mm")}
                        </span>
                    </div>
                );
            },
        },
        {
            id: "status",
            header: "Status",
            accessorKey: "status",
            sortable: true,
            width: 120,
            cell: (po) => {
                let bg = "var(--c-surface2)";
                let color = "var(--c-dim)";

                switch (po.status) {
                    case "ACTIVE":
                        bg = "var(--c-green-bg)";
                        color = "var(--c-green)";
                        break;
                    case "PAUSED":
                        bg = "var(--c-amber-bg)";
                        color = "var(--c-amber)";
                        break;
                    case "DRAFT":
                        bg = "var(--c-surface2)";
                        color = "var(--c-muted)";
                        break;
                    case "CLOSED":
                        bg = "var(--c-red-bg)";
                        color = "var(--c-red)";
                        break;
                }

                return (
                    <span
                        className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                        style={{ background: bg, color }}
                    >
                        {po.status}
                    </span>
                );
            },
        },
        {
            id: "items",
            header: "Items",
            accessorKey: "items",
            width: 100,
            cell: (po) => (
                <span style={{ color: "var(--c-muted)" }}>
                    {po.items?.length ?? 0}
                </span>
            ),
        },
    ];

    return (
        <DataTable<PreOrder>
            data={preOrders}
            columns={columns}
            loading={loading}
            searchable
            searchValue={search}
            onSearchChange={onSearchChange}
            searchPlaceholder="Search preorders..."
            getRowId={(po) => po.id}
            serverSide
            totalRows={totalItems}
            pagination
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            initialPageSize={20}
            onRowClick={onView}
            rowActions={[
                {
                    id: "view",
                    label: "View Detail",
                    icon: <Eye size={14} />,
                    onClick: onView,
                },
                {
                    id: "edit",
                    label: "Edit PreOrder",
                    icon: <Pencil size={14} />,
                    onClick: onEdit,
                },
                {
                    id: "delete",
                    label: "Delete",
                    icon: <Trash2 size={14} />,
                    variant: "danger",
                    onClick: onDelete,
                },
            ]}
        />
    );
}
