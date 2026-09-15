import { useMemo, useState } from "react";

import {
    AlertTriangle,
    Eye,
    Package,
    Pencil,
    Plus,
    Trash2,
    X,
} from "lucide-react";

import DataTable, {
    type DataTableBulkAction,
    type DataTableColumn,
    type DataTableFilter,
    type DataTableRowAction,
} from "@/components/ui/DataTable";

import {
    orders as initialOrders,
    type Order,
    type OrderStatus,
} from "@/data/data";

import { useNotification } from "@/contexts/NotificationContext";

/* =========================================================
   CONSTANTS
========================================================= */

const TABS: {
    label: string;
    value: OrderStatus | "ALL";
}[] = [
        { label: "All", value: "ALL" },
        { label: "Processing", value: "PROCESSING" },
        { label: "Packed", value: "PACKED" },
        { label: "Shipped", value: "SHIPPED" },
        { label: "Delivered", value: "DELIVERED" },
        { label: "Hold", value: "HOLD" },
    ];

const statusColor: Record<string, string> = {
    PROCESSING: "var(--c-accent)",
    PACKED: "var(--c-cyan)",
    SHIPPED: "var(--c-green)",
    DELIVERED: "var(--c-green)",
    HOLD: "var(--c-amber)",
};

const priorityColor: Record<string, string> = {
    HIGH: "var(--c-red)",
    STD: "var(--c-muted)",
    LOW: "var(--c-dim)",
};

/* =========================================================
   HELPERS
========================================================= */

function getNextStatus(
    status: OrderStatus,
): OrderStatus {
    switch (status) {
        case "PROCESSING":
            return "PACKED";

        case "PACKED":
            return "SHIPPED";

        case "SHIPPED":
            return "DELIVERED";

        case "DELIVERED":
            return "DELIVERED";

        case "HOLD":
            return "PROCESSING";

        default:
            return "PROCESSING";
    }
}

function Row({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 20,
                padding: "7px 0",
                borderBottom:
                    "1px solid var(--c-border2)",
            }}
        >
            <span
                style={{
                    fontSize: 12,
                    color: "var(--c-dim)",
                }}
            >
                {label}
            </span>

            <span
                style={{
                    fontSize: 12.5,
                    color: "var(--c-text)",
                    fontWeight: 500,
                    textAlign: "right",
                }}
            >
                {value}
            </span>
        </div>
    );
}

/* =========================================================
   COMPONENT
========================================================= */

export default function PreOrderPage() {
    const [ordersData, setOrdersData] =
        useState<Order[]>(initialOrders);

    const [tab, setTab] =
        useState<OrderStatus | "ALL">("ALL");

    const [selected, setSelected] =
        useState<Order | null>(null);

    const [editing, setEditing] =
        useState<Order | null>(null);

    const [deleteConfirm, setDeleteConfirm] =
        useState<Order | null>(null);

    const [showNew, setShowNew] =
        useState(false);

    const [newOrder, setNewOrder] =
        useState<Order>({
            id: "",
            customer: "",
            items: 0,
            value: 0,
            priority: "STD",
            status: "PROCESSING",
            eta: "TBD",
            region: "",
            carrier: "",
            created: "Sep 15",
            sku: [],
        });

    const {
        success,
        warning,
        info,
        error: toastError,
    } = useNotification();

    /* =======================================================
       TAB DATA
    ======================================================= */

    const tabFilteredOrders = useMemo(() => {
        if (tab === "ALL") {
            return ordersData;
        }

        return ordersData.filter(
            (order) => order.status === tab,
        );
    }, [ordersData, tab]);

    /* =======================================================
       TABLE COLUMNS
    ======================================================= */

    const columns = useMemo<
        DataTableColumn<Order>[]
    >(
        () => [
            {
                id: "id",
                header: "Order ID",
                accessorKey: "id",
                sortable: true,
                searchable: true,
                width: 125,

                cell: (order) => (
                    <span
                        style={{
                            fontFamily:
                                "JetBrains Mono, monospace",
                            fontSize: 11.5,
                            color: "var(--c-accent)",
                            fontWeight: 600,
                        }}
                    >
                        {order.id}
                    </span>
                ),
            },

            {
                id: "customer",
                header: "Customer",
                accessorKey: "customer",
                sortable: true,
                searchable: true,
                width: 190,

                cell: (order) => (
                    <div
                        style={{
                            maxWidth: 190,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            color: "var(--c-text)",
                            fontWeight: 500,
                        }}
                    >
                        {order.customer}
                    </div>
                ),
            },

            {
                id: "region",
                header: "Region",
                accessorKey: "region",
                sortable: true,
                searchable: true,

                cell: (order) => (
                    <span
                        style={{
                            color: "var(--c-muted)",
                            fontSize: 11.5,
                        }}
                    >
                        {order.region}
                    </span>
                ),
            },

            {
                id: "items",
                header: "Items",
                accessorKey: "items",
                sortable: true,
                searchable: false,
                align: "right",

                cell: (order) => (
                    <span
                        style={{
                            fontFamily:
                                "JetBrains Mono, monospace",
                            color: "var(--c-muted)",
                        }}
                    >
                        {order.items}
                    </span>
                ),
            },

            {
                id: "value",
                header: "Value",
                accessorKey: "value",
                sortable: true,
                searchable: false,
                align: "right",

                cell: (order) => (
                    <span
                        style={{
                            fontFamily:
                                "JetBrains Mono, monospace",
                            color: "var(--c-text)",
                            fontWeight: 600,
                        }}
                    >
                        $
                        {order.value.toLocaleString()}
                    </span>
                ),
            },

            {
                id: "priority",
                header: "Priority",
                accessorKey: "priority",
                sortable: true,
                searchable: true,

                sortValue: (order) => {
                    const weight: Record<
                        string,
                        number
                    > = {
                        HIGH: 1,
                        STD: 2,
                        LOW: 3,
                    };

                    return weight[order.priority] ?? 99;
                },

                cell: (order) => {
                    const color =
                        priorityColor[
                        order.priority
                        ] ?? "var(--c-muted)";

                    return (
                        <span
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                padding: "3px 7px",
                                borderRadius: 5,
                                border: `1px solid ${color}`,
                                color,
                                fontFamily:
                                    "JetBrains Mono, monospace",
                                fontSize: 9.5,
                                fontWeight: 600,
                            }}
                        >
                            {order.priority}
                        </span>
                    );
                },
            },

            {
                id: "status",
                header: "Status",
                accessorKey: "status",
                sortable: true,
                searchable: true,

                sortValue: (order) => {
                    const weight: Record<
                        string,
                        number
                    > = {
                        HOLD: 1,
                        PROCESSING: 2,
                        PACKED: 3,
                        SHIPPED: 4,
                        DELIVERED: 5,
                    };

                    return weight[order.status] ?? 99;
                },

                cell: (order) => {
                    const color =
                        statusColor[
                        order.status
                        ] ?? "var(--c-muted)";

                    return (
                        <span
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "3px 8px",
                                borderRadius: 5,
                                fontSize: 10,
                                fontFamily:
                                    "JetBrains Mono, monospace",
                                fontWeight: 600,
                                background: `${color}18`,
                                color,
                                whiteSpace: "nowrap",
                            }}
                        >
                            <span
                                style={{
                                    width: 5,
                                    height: 5,
                                    borderRadius: "50%",
                                    background: color,
                                }}
                            />

                            {order.status}
                        </span>
                    );
                },
            },

            {
                id: "carrier",
                header: "Carrier",
                accessorKey: "carrier",
                sortable: true,
                searchable: true,

                cell: (order) => (
                    <span
                        style={{
                            color: "var(--c-muted)",
                            fontSize: 11.5,
                        }}
                    >
                        {order.carrier}
                    </span>
                ),
            },

            {
                id: "eta",
                header: "ETA",
                accessorKey: "eta",
                sortable: true,
                searchable: true,

                cell: (order) => (
                    <span
                        style={{
                            fontFamily:
                                "JetBrains Mono, monospace",
                            fontSize: 11,
                            color: "var(--c-muted)",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {order.eta}
                    </span>
                ),
            },

            {
                id: "created",
                header: "Created",
                accessorKey: "created",
                sortable: true,
                searchable: true,

                cell: (order) => (
                    <span
                        style={{
                            fontFamily:
                                "JetBrains Mono, monospace",
                            fontSize: 11,
                            color: "var(--c-muted)",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {order.created}
                    </span>
                ),
            },
        ],
        [],
    );

    /* =======================================================
       FILTERS
    ======================================================= */

    const filters = useMemo<
        DataTableFilter<Order>[]
    >(
        () => [
            {
                id: "priority",
                label: "Priority",
                getValue: (order) =>
                    order.priority,
                options: [
                    {
                        label: "High",
                        value: "HIGH",
                    },
                    {
                        label: "Standard",
                        value: "STD",
                    },
                    {
                        label: "Low",
                        value: "LOW",
                    },
                ],
            },

            {
                id: "carrier",
                label: "Carrier",
                getValue: (order) =>
                    order.carrier,
                options: Array.from(
                    new Set(
                        ordersData
                            .map(
                                (order) =>
                                    order.carrier,
                            )
                            .filter(Boolean),
                    ),
                ).map((carrier) => ({
                    label: carrier,
                    value: carrier,
                })),
            },
        ],
        [ordersData],
    );

    /* =======================================================
       ROW ACTIONS
    ======================================================= */

    const rowActions = useMemo<
        DataTableRowAction<Order>[]
    >(
        () => [
            {
                id: "view",
                label: "View",
                icon: <Eye size={12} />,
                variant: "default",

                onClick: (order) => {
                    setSelected(order);
                    info(
                        "Order selected",
                        order.id,
                    );
                },
            },

            {
                id: "edit",
                label: "Edit",
                icon: <Pencil size={12} />,
                variant: "accent",

                onClick: (order) => {
                    setEditing(order);
                },
            },

            {
                id: "delete",
                label: "Delete",
                icon: <Trash2 size={12} />,
                variant: "danger",

                onClick: (order) => {
                    setDeleteConfirm(order);
                },
            },
        ],
        [info],
    );

    /* =======================================================
       BULK ACTIONS
    ======================================================= */

    const bulkActions =
        useMemo<DataTableBulkAction<Order>[]>(
            () => [
                {
                    id: "delete",
                    label: "Delete selected",
                    icon: <Trash2 size={12} />,
                    variant: "danger",

                    onClick: (rows) => {
                        if (!rows.length) {
                            return;
                        }

                        const ids = new Set(
                            rows.map(
                                (order) => order.id,
                            ),
                        );

                        setOrdersData((previous) =>
                            previous.filter(
                                (order) =>
                                    !ids.has(order.id),
                            ),
                        );

                        if (
                            selected &&
                            ids.has(selected.id)
                        ) {
                            setSelected(null);
                        }

                        info(
                            "Orders deleted",
                            `${rows.length} order(s) have been removed.`,
                        );
                    },
                },
            ],
            [selected, info],
        );

    /* =======================================================
       CREATE ORDER
    ======================================================= */

    const openNewOrder = () => {
        const nextNumber =
            48292 +
            ordersData.length -
            initialOrders.length +
            1;

        setNewOrder({
            id: `ORD-${nextNumber}`,
            customer: "",
            items: 0,
            value: 0,
            priority: "STD",
            status: "PROCESSING",
            eta: "TBD",
            region: "",
            carrier: "",
            created: "Sep 15",
            sku: [],
        });

        setShowNew(true);
    };

    const handleNewOrder = () => {
        if (!newOrder.customer.trim()) {
            toastError?.(
                "Customer required",
                "Please enter a customer name.",
            );

            return;
        }

        const order: Order = {
            ...newOrder,
            customer:
                newOrder.customer.trim(),
            region:
                newOrder.region.trim() || "—",
            carrier:
                newOrder.carrier.trim() || "—",
            eta:
                newOrder.eta.trim() || "TBD",
            sku: newOrder.sku ?? [],
        };

        setOrdersData((previous) => [
            order,
            ...previous,
        ]);

        setShowNew(false);

        success(
            "Order created",
            `${order.id} has been added to the queue.`,
        );
    };

    /* =======================================================
       DELETE
    ======================================================= */

    const handleDelete = () => {
        if (!deleteConfirm) {
            return;
        }

        const id = deleteConfirm.id;

        setOrdersData((previous) =>
            previous.filter(
                (order) => order.id !== id,
            ),
        );

        if (selected?.id === id) {
            setSelected(null);
        }

        setDeleteConfirm(null);

        info(
            "Order deleted",
            `${id} has been removed.`,
        );
    };

    /* =======================================================
       EDIT
    ======================================================= */

    const handleSaveEdit = () => {
        if (!editing) {
            return;
        }

        setOrdersData((previous) =>
            previous.map((order) =>
                order.id === editing.id
                    ? editing
                    : order,
            ),
        );

        if (
            selected?.id === editing.id
        ) {
            setSelected(editing);
        }

        setEditing(null);

        success(
            "Order updated",
            `${editing.id} has been saved.`,
        );
    };

    /* =======================================================
       ADVANCE STATUS
    ======================================================= */

    const handleAdvanceStatus = (
        order: Order,
    ) => {
        if (order.status === "DELIVERED") {
            info(
                "Order completed",
                `${order.id} is already delivered.`,
            );

            return;
        }

        const updatedOrder: Order = {
            ...order,
            status: getNextStatus(
                order.status,
            ),
        };

        setOrdersData((previous) =>
            previous.map((item) =>
                item.id === order.id
                    ? updatedOrder
                    : item,
            ),
        );

        setSelected(updatedOrder);

        success(
            "Status updated",
            `${order.id} changed to ${updatedOrder.status}.`,
        );
    };

    /* =======================================================
       HOLD
    ======================================================= */

    const handleHold = (
        order: Order,
    ) => {
        const updatedOrder: Order = {
            ...order,
            status: "HOLD",
        };

        setOrdersData((previous) =>
            previous.map((item) =>
                item.id === order.id
                    ? updatedOrder
                    : item,
            ),
        );

        setSelected(updatedOrder);

        warning(
            "Order placed on hold",
            order.id,
        );
    };

    /* =======================================================
       RENDER
    ======================================================= */

    return (
        <div
            className="p-4 md:p-5 flex flex-col gap-4 overflow-x-hidden"
        >
            {/* =====================================================
          PAGE HEADER
      ===================================================== */}

            <div
                className="flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
                <div>
                    <h1
                        style={{
                            fontSize: 20,
                            fontWeight: 700,
                            color: "var(--c-text)",
                            margin: 0,
                            letterSpacing: "-0.5px",
                        }}
                    >
                        Orders
                    </h1>

                    <p
                        style={{
                            fontSize: 11.5,
                            color: "var(--c-muted)",
                            margin: "3px 0 0",
                            fontFamily:
                                "JetBrains Mono, monospace",
                        }}
                    >
                        {tabFilteredOrders.length}{" "}
                        orders · Sep 15, 2026
                    </p>
                </div>

                <div
                    style={{
                        display: "flex",
                        gap: 8,
                    }}
                >
                    <button
                        onClick={openNewOrder}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "8px 14px",
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
                        New Order
                    </button>
                </div>
            </div>

            {/* =====================================================
          STATUS TABS
      ===================================================== */}

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    background:
                        "var(--c-surface)",
                    border:
                        "1px solid var(--c-border)",
                    borderRadius: 12,
                    padding: 8,
                    overflowX: "auto",
                }}
            >
                {TABS.map((item) => {
                    const count =
                        item.value === "ALL"
                            ? ordersData.length
                            : ordersData.filter(
                                (order) =>
                                    order.status ===
                                    item.value,
                            ).length;

                    const active =
                        tab === item.value;

                    return (
                        <button
                            key={item.value}
                            onClick={() =>
                                setTab(item.value)
                            }
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "6px 12px",
                                borderRadius: 7,
                                border: "none",
                                cursor: "pointer",
                                fontSize: 12,
                                fontWeight: active
                                    ? 600
                                    : 500,
                                background: active
                                    ? "var(--c-accent-bg)"
                                    : "transparent",
                                color: active
                                    ? "var(--c-accent)"
                                    : "var(--c-muted)",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {item.label}

                            <span
                                style={{
                                    fontSize: 10,
                                    fontFamily:
                                        "JetBrains Mono, monospace",
                                    opacity: 0.7,
                                }}
                            >
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* =====================================================
          REUSABLE TABLE
      ===================================================== */}

            <DataTable<Order>
                data={tabFilteredOrders}
                columns={columns}
                getRowId={(order) =>
                    order.id
                }
                searchPlaceholder="Search orders, customers, region, carrier..."
                filters={filters}
                initialPageSize={10}
                pageSizeOptions={[
                    10,
                    20,
                    50,
                    100,
                ]}
                initialSort={{
                    columnId: "created",
                    direction: "desc",
                }}
                stickyHeader
                enableExport
                exportFileName="orders"
                enableColumnVisibility
                enableDensity
                pagination
                rowActions={rowActions}
                bulkActions={bulkActions}
                onRowClick={(order) => {
                    setSelected(order);
                    info(
                        "Order selected",
                        order.id,
                    );
                }}
                emptyMessage="No orders found"
                emptyDescription="No orders match the current search or filters."
                emptyIcon={
                    <Package
                        size={30}
                        style={{
                            opacity: 0.35,
                        }}
                    />
                }
            />

            {/* =====================================================
          DETAIL DRAWER
      ===================================================== */}

            {selected && (
                <>
                    {/* OVERLAY */}

                    <div
                        onClick={() =>
                            setSelected(null)
                        }
                        style={{
                            position: "fixed",
                            inset: 0,
                            background:
                                "rgba(0,0,0,0.25)",
                            zIndex: 90,
                        }}
                    />

                    {/* DRAWER */}

                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            right: 0,
                            bottom: 0,
                            width:
                                "min(390px, 100vw)",
                            background:
                                "var(--c-surface)",
                            borderLeft:
                                "1px solid var(--c-border)",
                            boxShadow:
                                "-12px 0 50px rgba(0,0,0,0.2)",
                            zIndex: 100,
                            overflowY: "auto",
                            padding: 24,
                        }}
                        className="fade-in"
                    >
                        {/* DRAWER HEADER */}

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent:
                                    "space-between",
                                marginBottom: 24,
                            }}
                        >
                            <div>
                                <div
                                    style={{
                                        fontFamily:
                                            "JetBrains Mono, monospace",
                                        fontSize: 13,
                                        color:
                                            "var(--c-accent)",
                                        fontWeight: 600,
                                    }}
                                >
                                    {selected.id}
                                </div>

                                <div
                                    style={{
                                        fontSize: 11,
                                        color:
                                            "var(--c-dim)",
                                        marginTop: 2,
                                    }}
                                >
                                    Created{" "}
                                    {selected.created}
                                </div>
                            </div>

                            <button
                                onClick={() =>
                                    setSelected(null)
                                }
                                style={{
                                    background:
                                        "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color:
                                        "var(--c-dim)",
                                    display: "flex",
                                }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* DETAILS */}

                        <div
                            style={{
                                display: "flex",
                                flexDirection:
                                    "column",
                                gap: 18,
                            }}
                        >
                            <Row
                                label="Customer"
                                value={
                                    selected.customer
                                }
                            />

                            <Row
                                label="Region"
                                value={
                                    selected.region
                                }
                            />

                            <Row
                                label="Carrier"
                                value={
                                    selected.carrier
                                }
                            />

                            <Row
                                label="ETA"
                                value={
                                    selected.eta
                                }
                            />

                            <Row
                                label="Items"
                                value={String(
                                    selected.items,
                                )}
                            />

                            <Row
                                label="Order Value"
                                value={`$${selected.value.toLocaleString()}`}
                            />

                            {/* STATUS */}

                            <div
                                style={{
                                    display: "flex",
                                    gap: 8,
                                }}
                            >
                                <span
                                    style={{
                                        padding:
                                            "4px 10px",
                                        borderRadius: 6,
                                        fontSize: 10.5,
                                        fontFamily:
                                            "JetBrains Mono, monospace",
                                        fontWeight: 600,
                                        background: `${statusColor[
                                            selected.status
                                        ]
                                            }18`,
                                        color:
                                            statusColor[
                                            selected.status
                                            ],
                                    }}
                                >
                                    {
                                        selected.status
                                    }
                                </span>

                                <span
                                    style={{
                                        padding:
                                            "4px 10px",
                                        borderRadius: 6,
                                        fontSize: 10.5,
                                        fontFamily:
                                            "JetBrains Mono, monospace",
                                        border: `1px solid ${priorityColor[
                                            selected.priority
                                        ]
                                            }`,
                                        color:
                                            priorityColor[
                                            selected.priority
                                            ],
                                    }}
                                >
                                    {
                                        selected.priority
                                    }
                                </span>
                            </div>

                            {/* SKUS */}

                            <div
                                style={{
                                    background:
                                        "var(--c-surface2)",
                                    borderRadius: 10,
                                    padding: 14,
                                }}
                            >
                                <p
                                    style={{
                                        fontSize: 10,
                                        fontFamily:
                                            "JetBrains Mono, monospace",
                                        color:
                                            "var(--c-dim)",
                                        textTransform:
                                            "uppercase",
                                        letterSpacing:
                                            "0.08em",
                                        margin:
                                            "0 0 10px",
                                    }}
                                >
                                    SKUs on order
                                </p>

                                {selected.sku
                                    .length === 0 ? (
                                    <div
                                        style={{
                                            fontSize: 11.5,
                                            color:
                                                "var(--c-dim)",
                                        }}
                                    >
                                        No SKU data.
                                    </div>
                                ) : (
                                    selected.sku.map(
                                        (sku) => (
                                            <div
                                                key={sku}
                                                style={{
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    gap: 6,
                                                    padding:
                                                        "6px 0",
                                                    borderBottom:
                                                        "1px solid var(--c-border2)",
                                                    fontSize: 12,
                                                    color:
                                                        "var(--c-text)",
                                                }}
                                            >
                                                <Package
                                                    size={11}
                                                    color="var(--c-dim)"
                                                />

                                                <span
                                                    style={{
                                                        fontFamily:
                                                            "JetBrains Mono, monospace",
                                                        color:
                                                            "var(--c-accent)",
                                                    }}
                                                >
                                                    {sku}
                                                </span>
                                            </div>
                                        ),
                                    )
                                )}
                            </div>

                            {/* ACTIONS */}

                            <div
                                style={{
                                    display: "flex",
                                    gap: 8,
                                    marginTop: 8,
                                }}
                            >
                                <button
                                    onClick={() =>
                                        handleAdvanceStatus(
                                            selected,
                                        )
                                    }
                                    disabled={
                                        selected.status ===
                                        "DELIVERED"
                                    }
                                    style={{
                                        flex: 1,
                                        padding: 9,
                                        borderRadius: 8,
                                        background:
                                            selected.status ===
                                                "DELIVERED"
                                                ? "var(--c-surface2)"
                                                : "var(--c-accent)",
                                        color:
                                            selected.status ===
                                                "DELIVERED"
                                                ? "var(--c-dim)"
                                                : "#fff",
                                        fontSize: 12,
                                        fontWeight: 600,
                                        border: "none",
                                        cursor:
                                            selected.status ===
                                                "DELIVERED"
                                                ? "not-allowed"
                                                : "pointer",
                                    }}
                                >
                                    Advance Status
                                </button>

                                <button
                                    onClick={() =>
                                        handleHold(
                                            selected,
                                        )
                                    }
                                    disabled={
                                        selected.status ===
                                        "HOLD"
                                    }
                                    style={{
                                        flex: 1,
                                        padding: 9,
                                        borderRadius: 8,
                                        border:
                                            "1px solid var(--c-border)",
                                        background:
                                            "transparent",
                                        color:
                                            selected.status ===
                                                "HOLD"
                                                ? "var(--c-dim)"
                                                : "var(--c-amber)",
                                        fontSize: 12,
                                        cursor:
                                            selected.status ===
                                                "HOLD"
                                                ? "not-allowed"
                                                : "pointer",
                                    }}
                                >
                                    Hold
                                </button>
                            </div>

                            {/* EDIT */}

                            <button
                                onClick={() => {
                                    setSelected(null);
                                    setEditing(selected);
                                }}
                                style={{
                                    display: "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",
                                    gap: 7,
                                    width: "100%",
                                    padding: 9,
                                    borderRadius: 8,
                                    border:
                                        "1px solid var(--c-border)",
                                    background:
                                        "transparent",
                                    color:
                                        "var(--c-muted)",
                                    fontSize: 12,
                                    cursor: "pointer",
                                }}
                            >
                                <Pencil size={13} />
                                Edit Order
                            </button>

                            {/* DELETE */}

                            <button
                                onClick={() => {
                                    setSelected(null);
                                    setDeleteConfirm(
                                        selected,
                                    );
                                }}
                                style={{
                                    display: "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",
                                    gap: 7,
                                    width: "100%",
                                    padding: 9,
                                    borderRadius: 8,
                                    border:
                                        "1px solid var(--c-red)",
                                    background:
                                        "var(--c-red-bg)",
                                    color:
                                        "var(--c-red)",
                                    fontSize: 12,
                                    cursor: "pointer",
                                }}
                            >
                                <Trash2 size={13} />
                                Delete Order
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* =====================================================
          EDIT MODAL
      ===================================================== */}

            {editing && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background:
                            "rgba(0,0,0,0.45)",
                        zIndex: 200,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 20,
                    }}
                >
                    <div
                        style={{
                            background:
                                "var(--c-surface)",
                            border:
                                "1px solid var(--c-border)",
                            borderRadius: 16,
                            padding: 28,
                            width: 460,
                            maxWidth: "100%",
                            maxHeight:
                                "calc(100vh - 40px)",
                            overflowY: "auto",
                            boxShadow:
                                "0 20px 60px rgba(0,0,0,0.3)",
                        }}
                        className="fade-in"
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent:
                                    "space-between",
                                alignItems: "center",
                                marginBottom: 22,
                            }}
                        >
                            <h2
                                style={{
                                    fontSize: 16,
                                    fontWeight: 700,
                                    color:
                                        "var(--c-text)",
                                    margin: 0,
                                }}
                            >
                                Edit {editing.id}
                            </h2>

                            <button
                                onClick={() =>
                                    setEditing(null)
                                }
                                style={{
                                    background:
                                        "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color:
                                        "var(--c-dim)",
                                }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                flexDirection:
                                    "column",
                                gap: 14,
                            }}
                        >
                            {/* CUSTOMER */}

                            <FormInput
                                label="Customer"
                                value={
                                    editing.customer
                                }
                                onChange={(value) =>
                                    setEditing(
                                        (previous) =>
                                            previous
                                                ? {
                                                    ...previous,
                                                    customer:
                                                        value,
                                                }
                                                : previous,
                                    )
                                }
                            />

                            {/* REGION */}

                            <FormInput
                                label="Region"
                                value={
                                    editing.region
                                }
                                onChange={(value) =>
                                    setEditing(
                                        (previous) =>
                                            previous
                                                ? {
                                                    ...previous,
                                                    region:
                                                        value,
                                                }
                                                : previous,
                                    )
                                }
                            />

                            {/* CARRIER */}

                            <FormInput
                                label="Carrier"
                                value={
                                    editing.carrier
                                }
                                onChange={(value) =>
                                    setEditing(
                                        (previous) =>
                                            previous
                                                ? {
                                                    ...previous,
                                                    carrier:
                                                        value,
                                                }
                                                : previous,
                                    )
                                }
                            />

                            {/* ETA */}

                            <FormInput
                                label="ETA"
                                value={editing.eta}
                                onChange={(value) =>
                                    setEditing(
                                        (previous) =>
                                            previous
                                                ? {
                                                    ...previous,
                                                    eta: value,
                                                }
                                                : previous,
                                    )
                                }
                            />

                            {/* ITEMS / VALUE */}

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "1fr 1fr",
                                    gap: 12,
                                }}
                            >
                                <FormInput
                                    label="Items"
                                    type="number"
                                    value={String(
                                        editing.items,
                                    )}
                                    onChange={(value) =>
                                        setEditing(
                                            (previous) =>
                                                previous
                                                    ? {
                                                        ...previous,
                                                        items:
                                                            Number(
                                                                value,
                                                            ),
                                                    }
                                                    : previous,
                                        )
                                    }
                                />

                                <FormInput
                                    label="Value"
                                    type="number"
                                    value={String(
                                        editing.value,
                                    )}
                                    onChange={(value) =>
                                        setEditing(
                                            (previous) =>
                                                previous
                                                    ? {
                                                        ...previous,
                                                        value:
                                                            Number(
                                                                value,
                                                            ),
                                                    }
                                                    : previous,
                                        )
                                    }
                                />
                            </div>

                            {/* PRIORITY / STATUS */}

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "1fr 1fr",
                                    gap: 12,
                                }}
                            >
                                <FormSelect
                                    label="Priority"
                                    value={
                                        editing.priority
                                    }
                                    options={[
                                        "HIGH",
                                        "STD",
                                        "LOW",
                                    ]}
                                    onChange={(value) =>
                                        setEditing(
                                            (previous) =>
                                                previous
                                                    ? {
                                                        ...previous,
                                                        priority:
                                                            value as Order["priority"],
                                                    }
                                                    : previous,
                                        )
                                    }
                                />

                                <FormSelect
                                    label="Status"
                                    value={
                                        editing.status
                                    }
                                    options={[
                                        "PROCESSING",
                                        "PACKED",
                                        "SHIPPED",
                                        "DELIVERED",
                                        "HOLD",
                                    ]}
                                    onChange={(value) =>
                                        setEditing(
                                            (previous) =>
                                                previous
                                                    ? {
                                                        ...previous,
                                                        status:
                                                            value as OrderStatus,
                                                    }
                                                    : previous,
                                        )
                                    }
                                />
                            </div>

                            {/* BUTTONS */}

                            <div
                                style={{
                                    display: "flex",
                                    gap: 10,
                                    marginTop: 6,
                                }}
                            >
                                <button
                                    onClick={
                                        handleSaveEdit
                                    }
                                    style={{
                                        flex: 1,
                                        padding: 10,
                                        borderRadius: 8,
                                        background:
                                            "var(--c-accent)",
                                        color: "#fff",
                                        fontSize: 13,
                                        fontWeight: 600,
                                        border: "none",
                                        cursor:
                                            "pointer",
                                    }}
                                >
                                    Save changes
                                </button>

                                <button
                                    onClick={() =>
                                        setEditing(null)
                                    }
                                    style={{
                                        flex: 1,
                                        padding: 10,
                                        borderRadius: 8,
                                        border:
                                            "1px solid var(--c-border)",
                                        background:
                                            "transparent",
                                        color:
                                            "var(--c-muted)",
                                        fontSize: 13,
                                        cursor:
                                            "pointer",
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* =====================================================
          DELETE CONFIRM
      ===================================================== */}

            {deleteConfirm && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background:
                            "rgba(0,0,0,0.45)",
                        zIndex: 200,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 20,
                    }}
                >
                    <div
                        style={{
                            background:
                                "var(--c-surface)",
                            border:
                                "1px solid var(--c-border)",
                            borderRadius: 16,
                            padding: 28,
                            width: 380,
                            maxWidth: "100%",
                            boxShadow:
                                "0 20px 60px rgba(0,0,0,0.3)",
                        }}
                        className="fade-in"
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems:
                                    "center",
                                gap: 12,
                                marginBottom: 14,
                            }}
                        >
                            <div
                                style={{
                                    width: 38,
                                    height: 38,
                                    borderRadius:
                                        "50%",
                                    background:
                                        "var(--c-red-bg)",
                                    display: "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",
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
                                        fontSize: 16,
                                        fontWeight: 700,
                                        color:
                                            "var(--c-text)",
                                        margin: 0,
                                    }}
                                >
                                    Delete order?
                                </h2>

                                <div
                                    style={{
                                        fontSize: 11,
                                        color:
                                            "var(--c-dim)",
                                        marginTop: 2,
                                    }}
                                >
                                    This action cannot
                                    be undone.
                                </div>
                            </div>
                        </div>

                        <p
                            style={{
                                fontSize: 13,
                                lineHeight: 1.6,
                                color:
                                    "var(--c-muted)",
                                margin:
                                    "0 0 22px",
                            }}
                        >
                            <strong
                                style={{
                                    color:
                                        "var(--c-text)",
                                }}
                            >
                                {deleteConfirm.id}
                            </strong>{" "}
                            for{" "}
                            <strong
                                style={{
                                    color:
                                        "var(--c-text)",
                                }}
                            >
                                {
                                    deleteConfirm.customer
                                }
                            </strong>{" "}
                            will be permanently
                            deleted.
                        </p>

                        <div
                            style={{
                                display: "flex",
                                gap: 10,
                            }}
                        >
                            <button
                                onClick={
                                    handleDelete
                                }
                                style={{
                                    flex: 1,
                                    padding: 10,
                                    borderRadius: 8,
                                    background:
                                        "var(--c-red)",
                                    color: "#fff",
                                    fontSize: 13,
                                    fontWeight: 600,
                                    border: "none",
                                    cursor: "pointer",
                                }}
                            >
                                Delete
                            </button>

                            <button
                                onClick={() =>
                                    setDeleteConfirm(
                                        null,
                                    )
                                }
                                style={{
                                    flex: 1,
                                    padding: 10,
                                    borderRadius: 8,
                                    border:
                                        "1px solid var(--c-border)",
                                    background:
                                        "transparent",
                                    color:
                                        "var(--c-muted)",
                                    fontSize: 13,
                                    cursor: "pointer",
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* =====================================================
          NEW ORDER MODAL
      ===================================================== */}

            {showNew && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background:
                            "rgba(0,0,0,0.5)",
                        zIndex: 200,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 20,
                    }}
                >
                    <div
                        style={{
                            background:
                                "var(--c-surface)",
                            border:
                                "1px solid var(--c-border)",
                            borderRadius: 16,
                            padding: 28,
                            width: 460,
                            maxWidth: "100%",
                            maxHeight:
                                "calc(100vh - 40px)",
                            overflowY: "auto",
                            boxShadow:
                                "0 20px 60px rgba(0,0,0,0.3)",
                        }}
                        className="fade-in"
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent:
                                    "space-between",
                                alignItems: "center",
                                marginBottom: 22,
                            }}
                        >
                            <div>
                                <h2
                                    style={{
                                        fontSize: 18,
                                        fontWeight: 700,
                                        color:
                                            "var(--c-text)",
                                        margin: 0,
                                    }}
                                >
                                    New Order
                                </h2>

                                <p
                                    style={{
                                        fontSize: 11,
                                        color:
                                            "var(--c-dim)",
                                        margin:
                                            "4px 0 0",
                                        fontFamily:
                                            "JetBrains Mono, monospace",
                                    }}
                                >
                                    {newOrder.id}
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    setShowNew(false)
                                }
                                style={{
                                    background:
                                        "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color:
                                        "var(--c-dim)",
                                }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                flexDirection:
                                    "column",
                                gap: 14,
                            }}
                        >
                            <FormInput
                                label="Customer"
                                value={
                                    newOrder.customer
                                }
                                onChange={(value) =>
                                    setNewOrder(
                                        (previous) => ({
                                            ...previous,
                                            customer:
                                                value,
                                        }),
                                    )
                                }
                                placeholder="Customer name"
                            />

                            <FormInput
                                label="Region"
                                value={
                                    newOrder.region
                                }
                                onChange={(value) =>
                                    setNewOrder(
                                        (previous) => ({
                                            ...previous,
                                            region: value,
                                        }),
                                    )
                                }
                                placeholder="East Java"
                            />

                            <FormInput
                                label="Carrier"
                                value={
                                    newOrder.carrier
                                }
                                onChange={(value) =>
                                    setNewOrder(
                                        (previous) => ({
                                            ...previous,
                                            carrier:
                                                value,
                                        }),
                                    )
                                }
                                placeholder="JNE / J&T / ..."
                            />

                            <FormInput
                                label="ETA"
                                value={newOrder.eta}
                                onChange={(value) =>
                                    setNewOrder(
                                        (previous) => ({
                                            ...previous,
                                            eta: value,
                                        }),
                                    )
                                }
                                placeholder="Sep 20"
                            />

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "1fr 1fr",
                                    gap: 12,
                                }}
                            >
                                <FormInput
                                    label="Items"
                                    type="number"
                                    value={String(
                                        newOrder.items,
                                    )}
                                    onChange={(value) =>
                                        setNewOrder(
                                            (previous) => ({
                                                ...previous,
                                                items:
                                                    Number(
                                                        value,
                                                    ),
                                            }),
                                        )
                                    }
                                />

                                <FormInput
                                    label="Value"
                                    type="number"
                                    value={String(
                                        newOrder.value,
                                    )}
                                    onChange={(value) =>
                                        setNewOrder(
                                            (previous) => ({
                                                ...previous,
                                                value:
                                                    Number(
                                                        value,
                                                    ),
                                            }),
                                        )
                                    }
                                />
                            </div>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "1fr 1fr",
                                    gap: 12,
                                }}
                            >
                                <FormSelect
                                    label="Priority"
                                    value={
                                        newOrder.priority
                                    }
                                    options={[
                                        "HIGH",
                                        "STD",
                                        "LOW",
                                    ]}
                                    onChange={(value) =>
                                        setNewOrder(
                                            (previous) => ({
                                                ...previous,
                                                priority:
                                                    value as Order["priority"],
                                            }),
                                        )
                                    }
                                />

                                <FormSelect
                                    label="Status"
                                    value={
                                        newOrder.status
                                    }
                                    options={[
                                        "PROCESSING",
                                        "PACKED",
                                        "SHIPPED",
                                        "DELIVERED",
                                        "HOLD",
                                    ]}
                                    onChange={(value) =>
                                        setNewOrder(
                                            (previous) => ({
                                                ...previous,
                                                status:
                                                    value as OrderStatus,
                                            }),
                                        )
                                    }
                                />
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    gap: 10,
                                    marginTop: 8,
                                }}
                            >
                                <button
                                    onClick={
                                        handleNewOrder
                                    }
                                    style={{
                                        flex: 1,
                                        padding: 10,
                                        borderRadius: 8,
                                        background:
                                            "var(--c-accent)",
                                        color: "#fff",
                                        fontSize: 13,
                                        fontWeight: 600,
                                        border: "none",
                                        cursor:
                                            "pointer",
                                    }}
                                >
                                    Create Order
                                </button>

                                <button
                                    onClick={() =>
                                        setShowNew(false)
                                    }
                                    style={{
                                        flex: 1,
                                        padding: 10,
                                        borderRadius: 8,
                                        border:
                                            "1px solid var(--c-border)",
                                        background:
                                            "transparent",
                                        color:
                                            "var(--c-muted)",
                                        fontSize: 13,
                                        cursor:
                                            "pointer",
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* =========================================================
   FORM INPUT
========================================================= */

function FormInput({
    label,
    value,
    onChange,
    type = "text",
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    placeholder?: string;
}) {
    return (
        <div>
            <label
                style={{
                    fontSize: 11.5,
                    color: "var(--c-muted)",
                    display: "block",
                    marginBottom: 5,
                }}
            >
                {label}
            </label>

            <input
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "9px 12px",
                    borderRadius: 8,
                    border:
                        "1px solid var(--c-border)",
                    background:
                        "var(--c-surface2)",
                    color: "var(--c-text)",
                    fontSize: 13,
                    outline: "none",
                }}
            />
        </div>
    );
}

/* =========================================================
   FORM SELECT
========================================================= */

function FormSelect({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
}) {
    return (
        <div>
            <label
                style={{
                    fontSize: 11.5,
                    color: "var(--c-muted)",
                    display: "block",
                    marginBottom: 5,
                }}
            >
                {label}
            </label>

            <select
                value={value}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 8,
                    border:
                        "1px solid var(--c-border)",
                    background:
                        "var(--c-surface2)",
                    color: "var(--c-text)",
                    fontSize: 13,
                    outline: "none",
                }}
            >
                {options.map((option) => (
                    <option
                        key={option}
                        value={option}
                    >
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
}