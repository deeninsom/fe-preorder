import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Download,
  X,
  ChevronRight,
  Package,
  Pencil,
  Trash2,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  MoreHorizontal,
  Truck,
  CalendarDays,
  MapPin,
  User,
  DollarSign,
  Box,
  CheckCircle2,
  Clock3,
  PauseCircle,
} from "lucide-react";

import {
  orders as initialOrders,
  type Order,
  type OrderStatus,
} from "@/data/data";

import { useNotification } from "@/contexts/NotificationContext";

/* =========================================================
   TYPES
========================================================= */

type SortKey =
  | "id"
  | "customer"
  | "region"
  | "items"
  | "value"
  | "priority"
  | "status"
  | "carrier"
  | "eta"
  | "created";

type SortDirection = "asc" | "desc";

type OrderForm = {
  customer: string;
  email: string;
  address: string;
  notes: string;
  region: string;
  carrier: string;
  eta: string;
  items: number;
  value: number;
  priority: Order["priority"];
  status: OrderStatus;
};

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

const priorityWeight: Record<string, number> = {
  HIGH: 3,
  STD: 2,
  LOW: 1,
};

const statusWeight: Record<string, number> = {
  PROCESSING: 1,
  PACKED: 2,
  SHIPPED: 3,
  DELIVERED: 4,
  HOLD: 5,
};

const PAGE_SIZE = 10;

/* =========================================================
   HELPERS
========================================================= */

function getStatusIcon(status: OrderStatus) {
  switch (status) {
    case "PROCESSING":
      return <Clock3 size={11} />;
    case "PACKED":
      return <Package size={11} />;
    case "SHIPPED":
      return <Truck size={11} />;
    case "DELIVERED":
      return <CheckCircle2 size={11} />;
    case "HOLD":
      return <PauseCircle size={11} />;
    default:
      return null;
  }
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString()}`;
}

function getNextStatus(status: OrderStatus): OrderStatus {
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

/* =========================================================
   COMPONENT
========================================================= */

export default function Orders() {
  const [ordersData, setOrdersData] =
    useState<Order[]>(initialOrders);

  const [tab, setTab] =
    useState<OrderStatus | "ALL">("ALL");

  const [search, setSearch] = useState("");

  const [selected, setSelected] =
    useState<Order | null>(null);

  const [editing, setEditing] =
    useState<Order | null>(null);

  const [deleteConfirm, setDeleteConfirm] =
    useState<Order | null>(null);

  const [showNew, setShowNew] =
    useState(false);

  const [sortKey, setSortKey] =
    useState<SortKey>("created");

  const [sortDirection, setSortDirection] =
    useState<SortDirection>("desc");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [newOrder, setNewOrder] =
    useState<OrderForm>({
      customer: "",
      email: "",
      address: "",
      notes: "",
      region: "",
      carrier: "",
      eta: "TBD",
      items: 0,
      value: 0,
      priority: "STD",
      status: "PROCESSING",
    });

  const {
    success,
    warning,
    info,
  } = useNotification();

  /* =======================================================
     FILTER + SORT
  ======================================================= */

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    const result = ordersData.filter((order) => {
      if (
        tab !== "ALL" &&
        order.status !== tab
      ) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      return [
        order.id,
        order.customer,
        order.region,
        order.carrier,
        order.status,
        order.priority,
        order.eta,
        order.created,
        ...order.sku,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });

    result.sort((a, b) => {
      let comparison = 0;

      switch (sortKey) {
        case "items":
        case "value":
          comparison =
            Number(a[sortKey]) -
            Number(b[sortKey]);
          break;

        case "priority":
          comparison =
            priorityWeight[a.priority] -
            priorityWeight[b.priority];
          break;

        case "status":
          comparison =
            statusWeight[a.status] -
            statusWeight[b.status];
          break;

        default:
          comparison = String(
            a[sortKey]
          ).localeCompare(
            String(b[sortKey]),
            undefined,
            {
              numeric: true,
              sensitivity: "base",
            }
          );
      }

      return sortDirection === "asc"
        ? comparison
        : -comparison;
    });

    return result;
  }, [
    ordersData,
    tab,
    search,
    sortKey,
    sortDirection,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / PAGE_SIZE)
  );

  const paginatedOrders = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  /* =======================================================
     SORT
  ======================================================= */

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) =>
        prev === "asc" ? "desc" : "asc"
      );
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }

    setCurrentPage(1);
  };

  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) {
      return (
        <ArrowUpDown
          size={11}
          style={{ opacity: 0.45 }}
        />
      );
    }

    return sortDirection === "asc" ? (
      <ArrowUp size={11} />
    ) : (
      <ArrowDown size={11} />
    );
  };

  /* =======================================================
     EXPORT
  ======================================================= */

  const handleExport = () => {
    const headers = [
      "Order ID",
      "Customer",
      "Region",
      "Items",
      "Value",
      "Priority",
      "Status",
      "Carrier",
      "ETA",
      "Created",
    ];

    const rows = filtered.map((order) => [
      order.id,
      order.customer,
      order.region,
      order.items,
      order.value,
      order.priority,
      order.status,
      order.carrier,
      order.eta,
      order.created,
    ]);

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(
              /"/g,
              '""'
            )}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download = `orders-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    success(
      "Export completed",
      `${filtered.length} orders exported successfully.`
    );
  };

  /* =======================================================
     CREATE ORDER
  ======================================================= */

  const handleCreateOrder = () => {
    if (!newOrder.customer.trim()) {
      warning(
        "Customer required",
        "Please enter a customer name."
      );
      return;
    }

    const newId = `ORD-${48292 +
      ordersData.length -
      initialOrders.length
      }`;

    const order: Order = {
      id: newId,
      customer: newOrder.customer,
      items: Number(newOrder.items) || 0,
      value: Number(newOrder.value) || 0,
      priority: newOrder.priority,
      status: newOrder.status,
      eta: newOrder.eta || "TBD",
      region: newOrder.region || "—",
      carrier: newOrder.carrier || "—",
      created: "Sep 15",
      sku: [],
    };

    setOrdersData((prev) => [
      order,
      ...prev,
    ]);

    setShowNew(false);

    setNewOrder({
      customer: "",
      email: "",
      address: "",
      notes: "",
      region: "",
      carrier: "",
      eta: "TBD",
      items: 0,
      value: 0,
      priority: "STD",
      status: "PROCESSING",
    });

    setCurrentPage(1);

    success(
      "Order created",
      `${newId} has been added to the queue.`
    );
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete = () => {
    if (!deleteConfirm) return;

    const id = deleteConfirm.id;

    setOrdersData((prev) =>
      prev.filter(
        (order) => order.id !== id
      )
    );

    if (selected?.id === id) {
      setSelected(null);
    }

    setDeleteConfirm(null);

    info(
      "Order deleted",
      `${id} has been removed.`
    );
  };

  /* =======================================================
     EDIT
  ======================================================= */

  const handleSaveEdit = () => {
    if (!editing) return;

    setOrdersData((prev) =>
      prev.map((order) =>
        order.id === editing.id
          ? editing
          : order
      )
    );

    if (
      selected?.id === editing.id
    ) {
      setSelected(editing);
    }

    setEditing(null);

    success(
      "Order updated",
      `${editing.id} has been saved.`
    );
  };

  /* =======================================================
     ADVANCE STATUS
  ======================================================= */

  const handleAdvanceStatus = (
    order: Order
  ) => {
    const nextStatus =
      getNextStatus(order.status);

    if (
      order.status === "DELIVERED"
    ) {
      info(
        "Order completed",
        `${order.id} is already delivered.`
      );
      return;
    }

    const updatedOrder: Order = {
      ...order,
      status: nextStatus,
    };

    setOrdersData((prev) =>
      prev.map((item) =>
        item.id === order.id
          ? updatedOrder
          : item
      )
    );

    setSelected(updatedOrder);

    success(
      "Status updated",
      `${order.id} changed to ${nextStatus}.`
    );
  };

  /* =======================================================
     HOLD
  ======================================================= */

  const handleHold = (
    order: Order
  ) => {
    const updatedOrder: Order = {
      ...order,
      status: "HOLD",
    };

    setOrdersData((prev) =>
      prev.map((item) =>
        item.id === order.id
          ? updatedOrder
          : item
      )
    );

    setSelected(updatedOrder);

    warning(
      "Order placed on hold",
      order.id
    );
  };

  /* =======================================================
     TAB
  ======================================================= */

  const handleTabChange = (
    value: OrderStatus | "ALL"
  ) => {
    setTab(value);
    setCurrentPage(1);
  };

  /* =======================================================
     TABLE HEADER
  ======================================================= */

  const TableHeader = ({
    label,
    sort,
    align = "left",
  }: {
    label: string;
    sort?: SortKey;
    align?: "left" | "right" | "center";
  }) => {
    return (
      <th
        style={{
          padding: "12px 14px",
          textAlign: align,
          fontFamily:
            "JetBrains Mono, monospace",
          fontSize: 9.5,
          color: "var(--c-dim)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 500,
          whiteSpace: "nowrap",
          borderBottom:
            "1px solid var(--c-border2)",
        }}
      >
        {sort ? (
          <button
            onClick={() =>
              handleSort(sort)
            }
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent:
                align === "right"
                  ? "flex-end"
                  : align === "center"
                    ? "center"
                    : "flex-start",
              gap: 5,
              width: "100%",
              background: "transparent",
              border: "none",
              padding: 0,
              color:
                sortKey === sort
                  ? "var(--c-accent)"
                  : "var(--c-dim)",
              cursor: "pointer",
              fontFamily:
                "JetBrains Mono, monospace",
              fontSize: 9.5,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {label}
            {renderSortIcon(sort)}
          </button>
        ) : (
          label
        )}
      </th>
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="p-4 md:p-5 flex flex-col gap-4 overflow-x-hidden"
      style={{
        minHeight: "100%",
      }}
    >
      {/* ===================================================
          HEADER
      =================================================== */}

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
            {filtered.length} orders · Sep 15, 2026
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
          }}
        >
          <button
            onClick={handleExport}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 8,
              border:
                "1px solid var(--c-border)",
              background:
                "var(--c-surface)",
              fontSize: 12.5,
              cursor: "pointer",
              color: "var(--c-muted)",
            }}
          >
            <Download size={13} />
            Export
          </button>

          <button
            onClick={() =>
              setShowNew(true)
            }
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

      {/* ===================================================
          FILTER BAR
      =================================================== */}

      <div
        className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3"
        style={{
          background:
            "var(--c-surface)",
          border:
            "1px solid var(--c-border)",
          borderRadius: 12,
          padding: 10,
        }}
      >
        {/* TABS */}

        <div
          style={{
            display: "flex",
            gap: 4,
            overflowX: "auto",
            paddingBottom: 1,
          }}
        >
          {TABS.map((t) => {
            const count =
              t.value === "ALL"
                ? ordersData.length
                : ordersData.filter(
                  (order) =>
                    order.status ===
                    t.value
                ).length;

            const active =
              tab === t.value;

            return (
              <button
                key={t.value}
                onClick={() =>
                  handleTabChange(
                    t.value
                  )
                }
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding:
                    "6px 12px",
                  borderRadius: 7,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: active
                    ? 600
                    : 500,
                  whiteSpace:
                    "nowrap",
                  background: active
                    ? "var(--c-accent-bg)"
                    : "transparent",
                  color: active
                    ? "var(--c-accent)"
                    : "var(--c-muted)",
                }}
              >
                {t.label}

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

        {/* SEARCH */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding:
              "7px 12px",
            borderRadius: 8,
            border:
              "1px solid var(--c-border)",
            background:
              "var(--c-surface2)",
            minWidth: 260,
          }}
        >
          <Search
            size={13}
            color="var(--c-dim)"
          />

          <input
            value={search}
            onChange={(e) => {
              setSearch(
                e.target.value
              );
              setCurrentPage(1);
            }}
            placeholder="Search orders, customers, SKU..."
            style={{
              background: "none",
              border: "none",
              outline: "none",
              fontSize: 12.5,
              color: "var(--c-text)",
              flex: 1,
              minWidth: 0,
            }}
          />

          {search && (
            <button
              onClick={() => {
                setSearch("");
                setCurrentPage(1);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--c-dim)",
                display: "flex",
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ===================================================
          COMPLETE TABLE
      =================================================== */}

      <div
        style={{
          background:
            "var(--c-surface)",
          border:
            "1px solid var(--c-border)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "100%",
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              minWidth: 1250,
              fontSize: 12.5,
              borderCollapse:
                "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  background:
                    "var(--c-surface2)",
                }}
              >
                <TableHeader
                  label="Order ID"
                  sort="id"
                />

                <TableHeader
                  label="Customer"
                  sort="customer"
                />

                <TableHeader
                  label="Region"
                  sort="region"
                />

                <TableHeader
                  label="Items"
                  sort="items"
                  align="center"
                />

                <TableHeader
                  label="Value"
                  sort="value"
                  align="right"
                />

                <TableHeader
                  label="Priority"
                  sort="priority"
                  align="center"
                />

                <TableHeader
                  label="Status"
                  sort="status"
                  align="center"
                />

                <TableHeader
                  label="Carrier"
                  sort="carrier"
                />

                <TableHeader
                  label="ETA"
                  sort="eta"
                />

                <TableHeader
                  label="Created"
                  sort="created"
                />

                <TableHeader
                  label="Actions"
                  align="right"
                />
              </tr>
            </thead>

            <tbody>
              {paginatedOrders.length ===
                0 && (
                  <tr>
                    <td
                      colSpan={11}
                      style={{
                        padding: 48,
                        textAlign: "center",
                        color:
                          "var(--c-dim)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection:
                            "column",
                          alignItems:
                            "center",
                          gap: 10,
                        }}
                      >
                        <Package
                          size={28}
                          style={{
                            opacity: 0.35,
                          }}
                        />

                        <span
                          style={{
                            fontSize: 13,
                          }}
                        >
                          No orders match
                          your filters.
                        </span>

                        {(search ||
                          tab !==
                          "ALL") && (
                            <button
                              onClick={() => {
                                setSearch(
                                  ""
                                );
                                setTab(
                                  "ALL"
                                );
                                setCurrentPage(
                                  1
                                );
                              }}
                              style={{
                                marginTop: 4,
                                padding:
                                  "6px 10px",
                                borderRadius:
                                  7,
                                border:
                                  "1px solid var(--c-border)",
                                background:
                                  "transparent",
                                color:
                                  "var(--c-accent)",
                                cursor:
                                  "pointer",
                                fontSize: 11.5,
                              }}
                            >
                              Clear filters
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                )}

              {paginatedOrders.map(
                (order) => {
                  const isSelected =
                    selected?.id ===
                    order.id;

                  return (
                    <tr
                      key={order.id}
                      onClick={() => {
                        setSelected(
                          order
                        );
                        info(
                          "Order selected",
                          order.id
                        );
                      }}
                      style={{
                        borderBottom:
                          "1px solid var(--c-border2)",
                        cursor:
                          "pointer",
                        background:
                          isSelected
                            ? "var(--c-accent-bg)"
                            : "transparent",
                        transition:
                          "background 120ms ease",
                      }}
                    >
                      {/* ORDER ID */}

                      <td
                        style={{
                          padding:
                            "12px 14px",
                        }}
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: 6,
                          }}
                        >
                          <span
                            style={{
                              fontFamily:
                                "JetBrains Mono, monospace",
                              fontSize: 12,
                              color:
                                "var(--c-accent)",
                              fontWeight:
                                600,
                            }}
                          >
                            {order.id}
                          </span>

                          {isSelected && (
                            <ChevronRight
                              size={12}
                              color="var(--c-accent)"
                            />
                          )}
                        </div>
                      </td>

                      {/* CUSTOMER */}

                      <td
                        style={{
                          padding:
                            "12px 14px",
                          minWidth: 190,
                        }}
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: 9,
                          }}
                        >
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius:
                                7,
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              background:
                                "var(--c-surface2)",
                              border:
                                "1px solid var(--c-border)",
                              flexShrink: 0,
                            }}
                          >
                            <User
                              size={12}
                              color="var(--c-dim)"
                            />
                          </div>

                          <div
                            style={{
                              minWidth: 0,
                            }}
                          >
                            <div
                              style={{
                                color:
                                  "var(--c-text)",
                                fontWeight:
                                  500,
                                overflow:
                                  "hidden",
                                textOverflow:
                                  "ellipsis",
                                whiteSpace:
                                  "nowrap",
                                maxWidth: 170,
                              }}
                            >
                              {
                                order.customer
                              }
                            </div>

                            <div
                              style={{
                                fontSize:
                                  10,
                                color:
                                  "var(--c-dim)",
                                marginTop: 2,
                              }}
                            >
                              Customer
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* REGION */}

                      <td
                        style={{
                          padding:
                            "12px 14px",
                          color:
                            "var(--c-muted)",
                          fontSize: 11.5,
                        }}
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: 5,
                          }}
                        >
                          <MapPin
                            size={11}
                            color="var(--c-dim)"
                          />
                          {order.region}
                        </div>
                      </td>

                      {/* ITEMS */}

                      <td
                        style={{
                          padding:
                            "12px 14px",
                          textAlign:
                            "center",
                          fontFamily:
                            "JetBrains Mono, monospace",
                          color:
                            "var(--c-muted)",
                        }}
                      >
                        <span
                          style={{
                            display:
                              "inline-flex",
                            alignItems:
                              "center",
                            gap: 5,
                          }}
                        >
                          <Box
                            size={11}
                            color="var(--c-dim)"
                          />

                          {order.items}
                        </span>
                      </td>

                      {/* VALUE */}

                      <td
                        style={{
                          padding:
                            "12px 14px",
                          textAlign:
                            "right",
                          fontFamily:
                            "JetBrains Mono, monospace",
                          color:
                            "var(--c-text)",
                          fontWeight: 600,
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {formatCurrency(
                          order.value
                        )}
                      </td>

                      {/* PRIORITY */}

                      <td
                        style={{
                          padding:
                            "12px 14px",
                          textAlign:
                            "center",
                        }}
                      >
                        <span
                          style={{
                            display:
                              "inline-flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            minWidth: 38,
                            fontFamily:
                              "JetBrains Mono, monospace",
                            fontSize: 9.5,
                            padding:
                              "3px 7px",
                            borderRadius: 5,
                            border: `1px solid ${priorityColor[order.priority]}`,
                            color:
                              priorityColor[
                              order.priority
                              ],
                            fontWeight: 600,
                          }}
                        >
                          {order.priority}
                        </span>
                      </td>

                      {/* STATUS */}

                      <td
                        style={{
                          padding:
                            "12px 14px",
                          textAlign:
                            "center",
                        }}
                      >
                        <span
                          style={{
                            display:
                              "inline-flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            gap: 5,
                            padding:
                              "4px 8px",
                            borderRadius: 5,
                            fontSize:
                              10,
                            fontFamily:
                              "JetBrains Mono, monospace",
                            fontWeight: 500,
                            background: `${statusColor[order.status]}18`,
                            color:
                              statusColor[
                              order.status
                              ],
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {getStatusIcon(
                            order.status
                          )}

                          {order.status}
                        </span>
                      </td>

                      {/* CARRIER */}

                      <td
                        style={{
                          padding:
                            "12px 14px",
                          color:
                            "var(--c-muted)",
                          fontSize: 11.5,
                          minWidth: 120,
                        }}
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: 6,
                          }}
                        >
                          <Truck
                            size={11}
                            color="var(--c-dim)"
                          />

                          {order.carrier}
                        </div>
                      </td>

                      {/* ETA */}

                      <td
                        style={{
                          padding:
                            "12px 14px",
                          fontFamily:
                            "JetBrains Mono, monospace",
                          fontSize: 11.5,
                          color:
                            "var(--c-muted)",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: 6,
                          }}
                        >
                          <CalendarDays
                            size={11}
                            color="var(--c-dim)"
                          />

                          {order.eta}
                        </div>
                      </td>

                      {/* CREATED */}

                      <td
                        style={{
                          padding:
                            "12px 14px",
                          fontFamily:
                            "JetBrains Mono, monospace",
                          fontSize: 11,
                          color:
                            "var(--c-dim)",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {order.created}
                      </td>

                      {/* ACTIONS */}

                      <td
                        style={{
                          padding:
                            "12px 14px",
                          textAlign:
                            "right",
                        }}
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            justifyContent:
                              "flex-end",
                            gap: 5,
                          }}
                        >
                          {/* VIEW */}

                          <button
                            title="View order"
                            onClick={() =>
                              setSelected(
                                order
                              )
                            }
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius:
                                6,
                              border:
                                "1px solid var(--c-border)",
                              background:
                                "transparent",
                              cursor:
                                "pointer",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              color:
                                "var(--c-muted)",
                            }}
                          >
                            <Eye
                              size={11}
                            />
                          </button>

                          {/* EDIT */}

                          <button
                            title="Edit order"
                            onClick={() =>
                              setEditing(
                                order
                              )
                            }
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius:
                                6,
                              border:
                                "1px solid var(--c-border)",
                              background:
                                "transparent",
                              cursor:
                                "pointer",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              color:
                                "var(--c-muted)",
                            }}
                          >
                            <Pencil
                              size={11}
                            />
                          </button>

                          {/* DELETE */}

                          <button
                            title="Delete order"
                            onClick={() =>
                              setDeleteConfirm(
                                order
                              )
                            }
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius:
                                6,
                              border:
                                "1px solid var(--c-border)",
                              background:
                                "transparent",
                              cursor:
                                "pointer",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              color:
                                "var(--c-red)",
                            }}
                          >
                            <Trash2
                              size={11}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>

        {/* =================================================
            TABLE FOOTER / PAGINATION
        ================================================= */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            gap: 12,
            padding:
              "11px 14px",
            borderTop:
              "1px solid var(--c-border2)",
            background:
              "var(--c-surface2)",
          }}
        >
          <div
            style={{
              fontSize: 10.5,
              color:
                "var(--c-dim)",
              fontFamily:
                "JetBrains Mono, monospace",
            }}
          >
            {filtered.length ===
              0
              ? "0 results"
              : `${(currentPage - 1) *
              PAGE_SIZE +
              1}–${Math.min(
                currentPage *
                PAGE_SIZE,
                filtered.length
              )} of ${filtered.length
              } orders`}
          </div>

          <div
            style={{
              display: "flex",
              alignItems:
                "center",
              gap: 4,
            }}
          >
            <button
              disabled={
                currentPage === 1
              }
              onClick={() =>
                setCurrentPage(
                  (page) =>
                    Math.max(
                      1,
                      page - 1
                    )
                )
              }
              style={{
                padding:
                  "5px 9px",
                borderRadius: 6,
                border:
                  "1px solid var(--c-border)",
                background:
                  "var(--c-surface)",
                color:
                  currentPage === 1
                    ? "var(--c-dim)"
                    : "var(--c-muted)",
                cursor:
                  currentPage === 1
                    ? "not-allowed"
                    : "pointer",
                fontSize: 11,
              }}
            >
              Previous
            </button>

            <span
              style={{
                padding:
                  "5px 9px",
                fontSize: 10.5,
                color:
                  "var(--c-muted)",
                fontFamily:
                  "JetBrains Mono, monospace",
              }}
            >
              {currentPage} /{" "}
              {totalPages}
            </span>

            <button
              disabled={
                currentPage >=
                totalPages
              }
              onClick={() =>
                setCurrentPage(
                  (page) =>
                    Math.min(
                      totalPages,
                      page + 1
                    )
                )
              }
              style={{
                padding:
                  "5px 9px",
                borderRadius: 6,
                border:
                  "1px solid var(--c-border)",
                background:
                  "var(--c-surface)",
                color:
                  currentPage >=
                    totalPages
                    ? "var(--c-dim)"
                    : "var(--c-muted)",
                cursor:
                  currentPage >=
                    totalPages
                    ? "not-allowed"
                    : "pointer",
                fontSize: 11,
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================
          DETAIL DRAWER
      =================================================== */}

      {selected && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            width: 400,
            maxWidth: "100vw",
            background:
              "var(--c-surface)",
            borderLeft:
              "1px solid var(--c-border)",
            boxShadow:
              "-8px 0 40px rgba(0,0,0,0.15)",
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
              alignItems:
                "center",
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
                cursor:
                  "pointer",
                color:
                  "var(--c-dim)",
                display:
                  "flex",
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* STATUS */}

          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 22,
            }}
          >
            <span
              style={{
                display:
                  "inline-flex",
                alignItems:
                  "center",
                gap: 5,
                padding:
                  "4px 10px",
                borderRadius: 6,
                fontSize: 11,
                fontFamily:
                  "JetBrains Mono, monospace",
                fontWeight: 600,
                background: `${statusColor[selected.status]}18`,
                color:
                  statusColor[
                  selected.status
                  ],
              }}
            >
              {getStatusIcon(
                selected.status
              )}
              {selected.status}
            </span>

            <span
              style={{
                padding:
                  "4px 10px",
                borderRadius: 6,
                fontSize: 11,
                fontFamily:
                  "JetBrains Mono, monospace",
                border: `1px solid ${priorityColor[selected.priority]}`,
                color:
                  priorityColor[
                  selected.priority
                  ],
              }}
            >
              {selected.priority}
            </span>
          </div>

          {/* ORDER INFO */}

          <div
            style={{
              display: "flex",
              flexDirection:
                "column",
              gap: 4,
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
                selected.items
              )}
            />

            <Row
              label="Order Value"
              value={formatCurrency(
                selected.value
              )}
            />
          </div>

          {/* SKU */}

          <div
            style={{
              background:
                "var(--c-surface2)",
              borderRadius: 10,
              padding: 14,
              marginTop: 20,
            }}
          >
            <p
              style={{
                fontSize: 11,
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

            {selected.sku.length ===
              0 ? (
              <div
                style={{
                  fontSize: 12,
                  color:
                    "var(--c-dim)",
                  padding:
                    "8px 0",
                }}
              >
                No SKU assigned.
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
                        "7px 0",
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
                )
              )
            )}
          </div>

          {/* ACTIONS */}

          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 20,
            }}
          >
            <button
              onClick={() =>
                handleAdvanceStatus(
                  selected
                )
              }
              disabled={
                selected.status ===
                "DELIVERED"
              }
              style={{
                flex: 1,
                padding: "9px",
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
                fontSize: 12.5,
                fontWeight: 600,
                border: "none",
                cursor:
                  selected.status ===
                    "DELIVERED"
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {selected.status ===
                "DELIVERED"
                ? "Delivered"
                : "Advance Status"}
            </button>

            <button
              onClick={() =>
                handleHold(
                  selected
                )
              }
              disabled={
                selected.status ===
                "HOLD"
              }
              style={{
                flex: 1,
                padding: "9px",
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
                fontSize: 12.5,
                cursor:
                  selected.status ===
                    "HOLD"
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {selected.status ===
                "HOLD"
                ? "On Hold"
                : "Hold"}
            </button>
          </div>

          {/* EDIT */}

          <button
            onClick={() => {
              setEditing(
                selected
              );
              setSelected(null);
            }}
            style={{
              width: "100%",
              marginTop: 8,
              padding: 9,
              borderRadius: 8,
              border:
                "1px solid var(--c-border)",
              background:
                "transparent",
              color:
                "var(--c-muted)",
              fontSize: 12.5,
              cursor: "pointer",
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              gap: 6,
            }}
          >
            <Pencil size={12} />
            Edit Order
          </button>
        </div>
      )}

      {/* ===================================================
          EDIT MODAL
      =================================================== */}

      {editing && (
        <ModalOverlay>
          <div
            style={{
              background:
                "var(--c-surface)",
              border:
                "1px solid var(--c-border)",
              borderRadius: 16,
              padding: 28,
              width: 500,
              maxWidth:
                "calc(100vw - 32px)",
              maxHeight:
                "calc(100vh - 32px)",
              overflowY:
                "auto",
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
                alignItems:
                  "center",
                marginBottom: 22,
              }}
            >
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
                  Edit {editing.id}
                </h2>

                <p
                  style={{
                    margin:
                      "4px 0 0",
                    fontSize: 11,
                    color:
                      "var(--c-dim)",
                  }}
                >
                  Update order
                  information
                </p>
              </div>

              <button
                onClick={() =>
                  setEditing(null)
                }
                style={{
                  background:
                    "none",
                  border: "none",
                  cursor:
                    "pointer",
                  color:
                    "var(--c-dim)",
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div
              style={{
                display:
                  "flex",
                flexDirection:
                  "column",
                gap: 14,
              }}
            >
              <FormInput
                label="Customer"
                value={
                  editing.customer
                }
                onChange={(value) =>
                  setEditing(
                    (prev) =>
                      prev
                        ? {
                          ...prev,
                          customer:
                            value,
                        }
                        : prev
                  )
                }
              />

              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: 12,
                }}
              >
                <FormInput
                  label="Region"
                  value={
                    editing.region
                  }
                  onChange={(value) =>
                    setEditing(
                      (prev) =>
                        prev
                          ? {
                            ...prev,
                            region:
                              value,
                          }
                          : prev
                    )
                  }
                />

                <FormInput
                  label="Carrier"
                  value={
                    editing.carrier
                  }
                  onChange={(value) =>
                    setEditing(
                      (prev) =>
                        prev
                          ? {
                            ...prev,
                            carrier:
                              value,
                          }
                          : prev
                    )
                  }
                />
              </div>

              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: 12,
                }}
              >
                <FormInput
                  label="Items"
                  type="number"
                  value={String(
                    editing.items
                  )}
                  onChange={(value) =>
                    setEditing(
                      (prev) =>
                        prev
                          ? {
                            ...prev,
                            items:
                              Number(
                                value
                              ),
                          }
                          : prev
                    )
                  }
                />

                <FormInput
                  label="Value"
                  type="number"
                  value={String(
                    editing.value
                  )}
                  onChange={(value) =>
                    setEditing(
                      (prev) =>
                        prev
                          ? {
                            ...prev,
                            value:
                              Number(
                                value
                              ),
                          }
                          : prev
                    )
                  }
                />
              </div>

              <FormInput
                label="ETA"
                value={
                  editing.eta
                }
                onChange={(value) =>
                  setEditing(
                    (prev) =>
                      prev
                        ? {
                          ...prev,
                          eta: value,
                        }
                        : prev
                  )
                }
              />

              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: 12,
                }}
              >
                <SelectInput
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
                      (prev) =>
                        prev
                          ? {
                            ...prev,
                            priority:
                              value as Order["priority"],
                          }
                          : prev
                    )
                  }
                />

                <SelectInput
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
                      (prev) =>
                        prev
                          ? {
                            ...prev,
                            status:
                              value as OrderStatus,
                          }
                          : prev
                    )
                  }
                />
              </div>

              <div
                style={{
                  display:
                    "flex",
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
        </ModalOverlay>
      )}

      {/* ===================================================
          DELETE CONFIRM
      =================================================== */}

      {deleteConfirm && (
        <ModalOverlay>
          <div
            style={{
              background:
                "var(--c-surface)",
              border:
                "1px solid var(--c-border)",
              borderRadius: 16,
              padding: 28,
              width: 380,
              maxWidth:
                "calc(100vw - 32px)",
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
                  width: 36,
                  height: 36,
                  borderRadius:
                    "50%",
                  background:
                    "var(--c-red-bg)",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                }}
              >
                <AlertTriangle
                  size={16}
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
                    fontSize: 10.5,
                    color:
                      "var(--c-dim)",
                    marginTop: 2,
                  }}
                >
                  This action
                  cannot be
                  undone.
                </div>
              </div>
            </div>

            <p
              style={{
                fontSize: 13,
                color:
                  "var(--c-muted)",
                margin:
                  "0 0 22px",
                lineHeight: 1.6,
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
                display:
                  "flex",
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
                  cursor:
                    "pointer",
                }}
              >
                Delete
              </button>

              <button
                onClick={() =>
                  setDeleteConfirm(
                    null
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
                  cursor:
                    "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* ===================================================
          NEW ORDER MODAL
      =================================================== */}

      {showNew && (
        <ModalOverlay>
          <div
            style={{
              background:
                "var(--c-surface)",
              border:
                "1px solid var(--c-border)",
              borderRadius: 16,
              padding: 28,
              width: 500,
              maxWidth:
                "calc(100vw - 32px)",
              maxHeight:
                "calc(100vh - 32px)",
              overflowY:
                "auto",
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
                alignItems:
                  "center",
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
                    margin:
                      "4px 0 0",
                    fontSize: 11,
                    color:
                      "var(--c-dim)",
                  }}
                >
                  Create a new
                  order
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
                  cursor:
                    "pointer",
                  color:
                    "var(--c-dim)",
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div
              style={{
                display:
                  "flex",
                flexDirection:
                  "column",
                gap: 14,
              }}
            >
              <FormInput
                label="Customer name"
                value={
                  newOrder.customer
                }
                onChange={(value) =>
                  setNewOrder(
                    (prev) => ({
                      ...prev,
                      customer:
                        value,
                    })
                  )
                }
              />

              <FormInput
                label="Email / Contact"
                type="email"
                value={
                  newOrder.email
                }
                onChange={(value) =>
                  setNewOrder(
                    (prev) => ({
                      ...prev,
                      email: value,
                    })
                  )
                }
              />

              <FormInput
                label="Shipping address"
                value={
                  newOrder.address
                }
                onChange={(value) =>
                  setNewOrder(
                    (prev) => ({
                      ...prev,
                      address:
                        value,
                    })
                  )
                }
              />

              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: 12,
                }}
              >
                <FormInput
                  label="Region"
                  value={
                    newOrder.region
                  }
                  onChange={(value) =>
                    setNewOrder(
                      (prev) => ({
                        ...prev,
                        region:
                          value,
                      })
                    )
                  }
                />

                <FormInput
                  label="Carrier"
                  value={
                    newOrder.carrier
                  }
                  onChange={(value) =>
                    setNewOrder(
                      (prev) => ({
                        ...prev,
                        carrier:
                          value,
                      })
                    )
                  }
                />
              </div>

              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: 12,
                }}
              >
                <FormInput
                  label="Items"
                  type="number"
                  value={String(
                    newOrder.items
                  )}
                  onChange={(value) =>
                    setNewOrder(
                      (prev) => ({
                        ...prev,
                        items:
                          Number(
                            value
                          ) || 0,
                      })
                    )
                  }
                />

                <FormInput
                  label="Order value"
                  type="number"
                  value={String(
                    newOrder.value
                  )}
                  onChange={(value) =>
                    setNewOrder(
                      (prev) => ({
                        ...prev,
                        value:
                          Number(
                            value
                          ) || 0,
                      })
                    )
                  }
                />
              </div>

              <FormInput
                label="ETA"
                value={
                  newOrder.eta
                }
                onChange={(value) =>
                  setNewOrder(
                    (prev) => ({
                      ...prev,
                      eta: value,
                    })
                  )
                }
              />

              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: 12,
                }}
              >
                <SelectInput
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
                      (prev) => ({
                        ...prev,
                        priority:
                          value as Order["priority"],
                      })
                    )
                  }
                />

                <SelectInput
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
                      (prev) => ({
                        ...prev,
                        status:
                          value as OrderStatus,
                      })
                    )
                  }
                />
              </div>

              <FormInput
                label="Notes"
                value={
                  newOrder.notes
                }
                onChange={(value) =>
                  setNewOrder(
                    (prev) => ({
                      ...prev,
                      notes: value,
                    })
                  )
                }
              />

              <div
                style={{
                  display:
                    "flex",
                  gap: 10,
                  marginTop: 6,
                }}
              >
                <button
                  onClick={
                    handleCreateOrder
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
        </ModalOverlay>
      )}
    </div>
  );
}

/* =========================================================
   MODAL OVERLAY
========================================================= */

function ModalOverlay({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background:
          "rgba(0,0,0,0.5)",
        zIndex: 200,
        display: "flex",
        alignItems:
          "center",
        justifyContent:
          "center",
        padding: 16,
      }}
    >
      {children}
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
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  type?: string;
}) {
  return (
    <div>
      <label
        style={{
          fontSize: 12,
          color:
            "var(--c-muted)",
          display: "block",
          marginBottom: 5,
        }}
      >
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        style={{
          width: "100%",
          padding:
            "9px 12px",
          borderRadius: 8,
          border:
            "1px solid var(--c-border)",
          background:
            "var(--c-surface2)",
          color:
            "var(--c-text)",
          fontSize: 13,
          outline: "none",
          boxSizing:
            "border-box",
        }}
      />
    </div>
  );
}

/* =========================================================
   SELECT INPUT
========================================================= */

function SelectInput({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <div>
      <label
        style={{
          fontSize: 12,
          color:
            "var(--c-muted)",
          display: "block",
          marginBottom: 5,
        }}
      >
        {label}
      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        style={{
          width: "100%",
          padding:
            "9px 12px",
          borderRadius: 8,
          border:
            "1px solid var(--c-border)",
          background:
            "var(--c-surface2)",
          color:
            "var(--c-text)",
          fontSize: 13,
          outline: "none",
        }}
      >
        {options.map(
          (option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          )
        )}
      </select>
    </div>
  );
}

/* =========================================================
   ROW
========================================================= */

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
        justifyContent:
          "space-between",
        alignItems:
          "center",
        gap: 16,
        padding:
          "8px 0",
        borderBottom:
          "1px solid var(--c-border2)",
      }}
    >
      <span
        style={{
          fontSize: 12,
          color:
            "var(--c-dim)",
        }}
      >
        {label}
      </span>

      <span
        style={{
          fontSize: 12.5,
          color:
            "var(--c-text)",
          fontWeight: 500,
          textAlign:
            "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}