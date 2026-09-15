import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type CSSProperties,
    type ReactNode,
} from "react";

import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    Check,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Columns3,
    Download,
    Eye,
    Filter,
    Loader2,
    RefreshCw,
    Search,
    SlidersHorizontal,
    X,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

export type DataTableAlign = "left" | "center" | "right";

export type DataTableSortDirection = "asc" | "desc";

export type DataTableDensity = "comfortable" | "compact";

export type DataTableColumn<T> = {
    id: string;
    header: ReactNode;

    /**
     * Key yang digunakan untuk mengambil value.
     * Bisa tidak digunakan jika memakai cell/sortValue.
     */
    accessorKey?: keyof T;

    /**
     * Custom render cell.
     */
    cell?: (row: T, index: number) => ReactNode;

    /**
     * Value khusus untuk sorting.
     */
    sortValue?: (row: T) => string | number | Date | null | undefined;

    /**
     * Value khusus untuk searching.
     */
    searchValue?: (row: T) => string | number | null | undefined;

    /**
     * Apakah kolom bisa di-sort.
     */
    sortable?: boolean;

    /**
     * Apakah kolom ikut global search.
     */
    searchable?: boolean;

    /**
     * Apakah kolom bisa disembunyikan.
     */
    hideable?: boolean;

    /**
     * Kolom awalnya hidden.
     */
    hidden?: boolean;

    /**
     * Lebar kolom.
     */
    width?: number | string;

    /**
     * Alignment.
     */
    align?: DataTableAlign;

    /**
     * Sticky column.
     */
    sticky?: "left" | "right";

    /**
     * Custom className.
     */
    className?: string;
};

export type DataTableFilterOption = {
    label: string;
    value: string;
};

export type DataTableFilter<T> = {
    id: string;
    label: string;
    options: DataTableFilterOption[];

    /**
     * Value row yang akan dibandingkan dengan option.value.
     */
    getValue: (row: T) => string;
};

export type DataTableBulkAction<T> = {
    id: string;
    label: string;
    icon?: ReactNode;
    variant?: "default" | "danger" | "accent";
    onClick: (rows: T[]) => void | Promise<void>;
};

export type DataTableRowAction<T> = {
    id: string;
    label: string;
    icon?: ReactNode;
    onClick: (row: T) => void;
    variant?: "default" | "danger" | "accent";
};

export type DataTableProps<T> = {
    data: T[];

    columns: DataTableColumn<T>[];

    /**
     * Unique row ID.
     */
    getRowId: (row: T, index: number) => string;

    /**
     * Global search.
     */
    searchable?: boolean;
    searchPlaceholder?: string;

    /**
     * External search value.
     * Jika tidak diberikan, table menggunakan internal state.
     */
    searchValue?: string;
    onSearchChange?: (value: string) => void;

    /**
     * Generic filters.
     */
    filters?: DataTableFilter<T>[];
    totalRows?: number;
    /**
     * Initial filter values.
     */
    initialFilters?: Record<string, string>;

    /**
     * Callback ketika selection berubah.
     */
    onSelectionChange?: (rows: T[]) => void;

    /**
     * Row click.
     */
    onRowClick?: (row: T) => void;

    /**
     * Bulk actions.
     */
    bulkActions?: DataTableBulkAction<T>[];

    /**
     * Row actions.
     */
    rowActions?: DataTableRowAction<T>[];

    /**
     * Export.
     */
    enableExport?: boolean;
    exportFileName?: string;

    /**
     * Refresh button.
     */
    enableRefresh?: boolean;
    onRefresh?: () => void | Promise<void>;

    /**
     * Column visibility.
     */
    enableColumnVisibility?: boolean;

    /**
     * Density.
     */
    enableDensity?: boolean;

    /**
     * Loading.
     */
    loading?: boolean;

    /**
     * Empty state.
     */
    emptyMessage?: string;
    emptyDescription?: string;
    emptyIcon?: ReactNode;

    /**
     * Pagination.
     */
    pagination?: boolean;
    pageSizeOptions?: number[];
    initialPageSize?: number;

    /**
     * Sticky header.
     */
    stickyHeader?: boolean;

    /**
     * Minimum table width.
     */
    minWidth?: number | string;

    /**
     * Initial sort.
     */
    initialSort?: {
        columnId: string;
        direction: DataTableSortDirection;
    };

    /**
     * Controlled sort callback.
     */
    onSortChange?: (
        columnId: string | null,
        direction: DataTableSortDirection | null,
    ) => void;

    /**
     * Custom toolbar.
     */
    toolbar?: ReactNode;

    /**
     * Custom footer.
     */
    footer?: ReactNode;

    /**
     * Show result information.
     */
    showResultCount?: boolean;

    /**
     * Show selected count.
     */
    showSelectedCount?: boolean;

    /**
     * Custom no data action.
     */
    emptyAction?: ReactNode;

    serverSide?: boolean;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;

};

/* =========================================================
   HELPERS
========================================================= */

function normalizeValue(value: unknown): string | number {
    if (value === null || value === undefined) return "";

    if (value instanceof Date) {
        return value.getTime();
    }

    if (typeof value === "number") {
        return value;
    }

    return String(value);
}

function compareValues(a: unknown, b: unknown): number {
    const aValue = normalizeValue(a);
    const bValue = normalizeValue(b);

    if (typeof aValue === "number" && typeof bValue === "number") {
        return aValue - bValue;
    }

    return String(aValue).localeCompare(String(bValue), undefined, {
        numeric: true,
        sensitivity: "base",
    });
}

function downloadCsv<T>(
    rows: T[],
    columns: DataTableColumn<T>[],
    fileName: string,
) {
    const visibleColumns = columns.filter((column) => column.id !== "__actions");

    const escapeCsv = (value: unknown) => {
        const text = value === null || value === undefined ? "" : String(value);

        if (
            text.includes(",") ||
            text.includes('"') ||
            text.includes("\n") ||
            text.includes("\r")
        ) {
            return `"${text.replace(/"/g, '""')}"`;
        }

        return text;
    };

    const headers = visibleColumns.map((column) =>
        typeof column.header === "string" ? column.header : column.id,
    );

    const lines = [
        headers.map(escapeCsv).join(","),
        ...rows.map((row) =>
            visibleColumns
                .map((column) => {
                    const value = column.accessorKey
                        ? row[column.accessorKey]
                        : column.searchValue
                            ? column.searchValue(row)
                            : "";

                    return escapeCsv(value);
                })
                .join(","),
        ),
    ];

    const blob = new Blob(["\ufeff" + lines.join("\n")], {
        type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = fileName.endsWith(".csv")
        ? fileName
        : `${fileName}.csv`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
}

/* =========================================================
   CHECKBOX
========================================================= */

function Checkbox({
    checked,
    indeterminate = false,
    onChange,
    disabled = false,
    ariaLabel,
}: {
    checked: boolean;
    indeterminate?: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    ariaLabel?: string;
}) {
    const ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.indeterminate = indeterminate;
        }
    }, [indeterminate]);

    return (
        <input
            ref={ref}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            aria-label={ariaLabel}
            onChange={(event) => onChange(event.target.checked)}
            className="data-table-checkbox"
            style={{
                width: 15,
                height: 15,
                accentColor: "var(--c-accent)",
                cursor: disabled ? "not-allowed" : "pointer",
                margin: 0,
            }}
        />
    );
}

/* =========================================================
   COMPONENT
========================================================= */

export default function DataTable<T>({
    data,
    columns,
    getRowId,

    searchable = true,
    searchPlaceholder = "Search...",

    searchValue,
    onSearchChange,

    filters = [],
    initialFilters = {},

    onSelectionChange,
    onRowClick,

    bulkActions = [],
    rowActions = [],

    enableExport = true,
    exportFileName = "export",

    enableRefresh = false,
    onRefresh,

    enableColumnVisibility = true,
    enableDensity = true,

    loading = false,

    emptyMessage = "No data found.",
    emptyDescription = "There are no records to display.",
    emptyIcon,

    pagination = true,
    pageSizeOptions = [10, 20, 50, 100],
    initialPageSize = 10,

    stickyHeader = true,
    minWidth = 900,

    initialSort,
    onSortChange,

    toolbar,
    footer,

    showResultCount = true,
    showSelectedCount = true,

    emptyAction,
}: DataTableProps<T>) {
    /* =======================================================
       STATE
    ======================================================= */

    const [internalSearch, setInternalSearch] = useState("");

    const search = searchValue ?? internalSearch;

    const updateSearch = (value: string) => {
        if (onSearchChange) {
            onSearchChange(value);
        } else {
            setInternalSearch(value);
        }
    };

    const [sortColumn, setSortColumn] = useState<string | null>(
        initialSort?.columnId ?? null,
    );

    const [sortDirection, setSortDirection] =
        useState<DataTableSortDirection>(
            initialSort?.direction ?? "asc",
        );

    const [page, setPage] = useState(1);

    const [pageSize, setPageSize] = useState(initialPageSize);

    const [selectedIds, setSelectedIds] = useState<Set<string>>(
        new Set(),
    );

    const [columnVisibility, setColumnVisibility] = useState<
        Record<string, boolean>
    >(() => {
        const initial: Record<string, boolean> = {};

        columns.forEach((column) => {
            initial[column.id] = !column.hidden;
        });

        return initial;
    });

    const [filterValues, setFilterValues] =
        useState<Record<string, string>>(initialFilters);

    const [showFilters, setShowFilters] = useState(false);

    const [showColumns, setShowColumns] = useState(false);

    const [density, setDensity] =
        useState<DataTableDensity>("comfortable");

    const [refreshing, setRefreshing] = useState(false);

    /* =======================================================
       VISIBLE COLUMNS
    ======================================================= */

    const visibleColumns = useMemo(() => {
        return columns.filter(
            (column) => columnVisibility[column.id] !== false,
        );
    }, [columns, columnVisibility]);

    /* =======================================================
       FILTER
    ======================================================= */

    const filteredData = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return data.filter((row) => {
            /* -----------------------------
               GLOBAL SEARCH
            ----------------------------- */

            if (keyword) {
                const searchableColumns = columns.filter(
                    (column) => column.searchable !== false,
                );

                const matched = searchableColumns.some((column) => {
                    let value: unknown = "";

                    if (column.searchValue) {
                        value = column.searchValue(row);
                    } else if (column.accessorKey) {
                        value = row[column.accessorKey];
                    }

                    return String(value ?? "")
                        .toLowerCase()
                        .includes(keyword);
                });

                if (!matched) {
                    return false;
                }
            }

            /* -----------------------------
               FILTERS
            ----------------------------- */

            for (const filter of filters) {
                const selectedValue = filterValues[filter.id];

                if (
                    !selectedValue ||
                    selectedValue === "ALL"
                ) {
                    continue;
                }

                const rowValue = filter.getValue(row);

                if (rowValue !== selectedValue) {
                    return false;
                }
            }

            return true;
        });
    }, [
        data,
        columns,
        search,
        filters,
        filterValues,
    ]);

    /* =======================================================
       SORT
    ======================================================= */

    const sortedData = useMemo(() => {
        if (!sortColumn) {
            return [...filteredData];
        }

        const column = columns.find(
            (item) => item.id === sortColumn,
        );

        if (!column || column.sortable === false) {
            return [...filteredData];
        }

        return [...filteredData].sort((a, b) => {
            let aValue: unknown = "";
            let bValue: unknown = "";

            if (column.sortValue) {
                aValue = column.sortValue(a);
                bValue = column.sortValue(b);
            } else if (column.accessorKey) {
                aValue = a[column.accessorKey];
                bValue = b[column.accessorKey];
            }

            const result = compareValues(aValue, bValue);

            return sortDirection === "asc"
                ? result
                : result * -1;
        });
    }, [
        filteredData,
        columns,
        sortColumn,
        sortDirection,
    ]);

    /* =======================================================
       PAGINATION
    ======================================================= */

    const totalRows = sortedData.length;

    const totalPages = pagination
        ? Math.max(1, Math.ceil(totalRows / pageSize))
        : 1;

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    useEffect(() => {
        setPage(1);
    }, [search, filterValues, pageSize]);

    const paginatedData = useMemo(() => {
        if (!pagination) {
            return sortedData;
        }

        const start = (page - 1) * pageSize;

        return sortedData.slice(
            start,
            start + pageSize,
        );
    }, [
        sortedData,
        pagination,
        page,
        pageSize,
    ]);

    /* =======================================================
       SELECTION
    ======================================================= */

    const selectedRows = useMemo(() => {
        const map = new Map(
            data.map((row, index) => [
                getRowId(row, index),
                row,
            ]),
        );

        return Array.from(selectedIds)
            .map((id) => map.get(id))
            .filter(Boolean) as T[];
    }, [data, selectedIds, getRowId]);

    useEffect(() => {
        onSelectionChange?.(selectedRows);
    }, [selectedRows, onSelectionChange]);

    const visibleIds = paginatedData.map((row, index) => {
        const absoluteIndex = pagination
            ? (page - 1) * pageSize + index
            : index;

        return getRowId(row, absoluteIndex);
    });

    const selectedVisibleCount = visibleIds.filter((id) =>
        selectedIds.has(id),
    ).length;

    const allVisibleSelected =
        visibleIds.length > 0 &&
        selectedVisibleCount === visibleIds.length;

    const someVisibleSelected =
        selectedVisibleCount > 0 &&
        selectedVisibleCount < visibleIds.length;

    const toggleRow = (
        row: T,
        absoluteIndex: number,
        checked: boolean,
    ) => {
        const id = getRowId(row, absoluteIndex);

        setSelectedIds((previous) => {
            const next = new Set(previous);

            if (checked) {
                next.add(id);
            } else {
                next.delete(id);
            }

            return next;
        });
    };

    const toggleAllVisible = (checked: boolean) => {
        setSelectedIds((previous) => {
            const next = new Set(previous);

            visibleIds.forEach((id) => {
                if (checked) {
                    next.add(id);
                } else {
                    next.delete(id);
                }
            });

            return next;
        });
    };

    const clearSelection = () => {
        setSelectedIds(new Set());
    };

    /* =======================================================
       SORT HANDLER
    ======================================================= */

    const handleSort = (column: DataTableColumn<T>) => {
        if (column.sortable === false) {
            return;
        }

        if (sortColumn !== column.id) {
            setSortColumn(column.id);
            setSortDirection("asc");

            onSortChange?.(column.id, "asc");

            return;
        }

        if (sortDirection === "asc") {
            setSortDirection("desc");

            onSortChange?.(column.id, "desc");
        } else {
            setSortColumn(null);

            onSortChange?.(null, null);
        }
    };

    /* =======================================================
       REFRESH
    ======================================================= */

    const handleRefresh = async () => {
        if (!onRefresh || refreshing) {
            return;
        }

        try {
            setRefreshing(true);
            await onRefresh();
        } finally {
            setRefreshing(false);
        }
    };

    /* =======================================================
       RESET
    ======================================================= */

    const hasActiveFilters =
        search.trim() !== "" ||
        Object.values(filterValues).some(
            (value) => value && value !== "ALL",
        );

    const resetFilters = () => {
        updateSearch("");

        const reset: Record<string, string> = {};

        filters.forEach((filter) => {
            reset[filter.id] = "ALL";
        });

        setFilterValues(reset);
        setPage(1);
    };

    /* =======================================================
       STYLE
    ======================================================= */

    const cellPadding =
        density === "compact"
            ? "7px 12px"
            : "11px 14px";

    const headerPadding =
        density === "compact"
            ? "8px 12px"
            : "10px 14px";

    /* =======================================================
       RENDER
    ======================================================= */

    return (
        <div
            style={{
                background: "var(--c-surface)",
                border: "1px solid var(--c-border)",
                borderRadius: 12,
                overflow: "hidden",
                width: "100%",
            }}
        >
            {/* =====================================================
          TOOLBAR
      ===================================================== */}

            <div
                style={{
                    padding: 12,
                    borderBottom: "1px solid var(--c-border)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                }}
            >
                {/* TOP TOOLBAR */}

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                        flexWrap: "wrap",
                    }}
                >
                    {/* SEARCH */}

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            height: 34,
                            padding: "0 10px",
                            borderRadius: 8,
                            border: "1px solid var(--c-border)",
                            background: "var(--c-surface2)",
                            width: "min(340px, 100%)",
                        }}
                    >
                        <Search
                            size={14}
                            color="var(--c-dim)"
                        />

                        <input
                            value={search}
                            onChange={(event) =>
                                updateSearch(event.target.value)
                            }
                            placeholder={searchPlaceholder}
                            style={{
                                border: "none",
                                outline: "none",
                                background: "transparent",
                                color: "var(--c-text)",
                                fontSize: 12,
                                flex: 1,
                                minWidth: 0,
                            }}
                        />

                        {search && (
                            <button
                                onClick={() => updateSearch("")}
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    color: "var(--c-dim)",
                                    cursor: "pointer",
                                    display: "flex",
                                    padding: 2,
                                }}
                            >
                                <X size={13} />
                            </button>
                        )}
                    </div>

                    {/* ACTIONS */}

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            flexWrap: "wrap",
                        }}
                    >
                        {toolbar}

                        {filters.length > 0 && (
                            <button
                                onClick={() =>
                                    setShowFilters((value) => !value)
                                }
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    height: 34,
                                    padding: "0 10px",
                                    borderRadius: 8,
                                    border: "1px solid var(--c-border)",
                                    background: showFilters
                                        ? "var(--c-accent-bg)"
                                        : "var(--c-surface)",
                                    color: showFilters
                                        ? "var(--c-accent)"
                                        : "var(--c-muted)",
                                    cursor: "pointer",
                                    fontSize: 11.5,
                                }}
                            >
                                <Filter size={13} />
                                Filters
                            </button>
                        )}

                        {enableColumnVisibility && (
                            <div
                                style={{
                                    position: "relative",
                                }}
                            >
                                <button
                                    onClick={() =>
                                        setShowColumns(
                                            (value) => !value,
                                        )
                                    }
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                        height: 34,
                                        padding: "0 10px",
                                        borderRadius: 8,
                                        border:
                                            "1px solid var(--c-border)",
                                        background: showColumns
                                            ? "var(--c-accent-bg)"
                                            : "var(--c-surface)",
                                        color: showColumns
                                            ? "var(--c-accent)"
                                            : "var(--c-muted)",
                                        cursor: "pointer",
                                        fontSize: 11.5,
                                    }}
                                >
                                    <Columns3 size={13} />
                                    Columns
                                </button>

                                {showColumns && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            right: 0,
                                            top: 40,
                                            width: 220,
                                            background:
                                                "var(--c-surface)",
                                            border:
                                                "1px solid var(--c-border)",
                                            borderRadius: 10,
                                            padding: 8,
                                            zIndex: 80,
                                            boxShadow:
                                                "0 12px 40px rgba(0,0,0,0.18)",
                                        }}
                                    >
                                        <div
                                            style={{
                                                padding:
                                                    "6px 8px 8px",
                                                fontSize: 10,
                                                color: "var(--c-dim)",
                                                fontFamily:
                                                    "JetBrains Mono, monospace",
                                                textTransform:
                                                    "uppercase",
                                                letterSpacing:
                                                    "0.06em",
                                            }}
                                        >
                                            Visible columns
                                        </div>

                                        {columns
                                            .filter(
                                                (column) =>
                                                    column.hideable !== false,
                                            )
                                            .map((column) => (
                                                <label
                                                    key={column.id}
                                                    style={{
                                                        display: "flex",
                                                        alignItems:
                                                            "center",
                                                        gap: 8,
                                                        padding:
                                                            "7px 8px",
                                                        borderRadius: 7,
                                                        cursor:
                                                            "pointer",
                                                        color:
                                                            "var(--c-text)",
                                                        fontSize: 12,
                                                    }}
                                                >
                                                    <Checkbox
                                                        checked={
                                                            columnVisibility[
                                                            column.id
                                                            ] !== false
                                                        }
                                                        onChange={(
                                                            checked,
                                                        ) =>
                                                            setColumnVisibility(
                                                                (previous) => ({
                                                                    ...previous,
                                                                    [column.id]:
                                                                        checked,
                                                                }),
                                                            )
                                                        }
                                                    />

                                                    <span>
                                                        {column.header}
                                                    </span>
                                                </label>
                                            ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {enableDensity && (
                            <button
                                onClick={() =>
                                    setDensity((value) =>
                                        value === "comfortable"
                                            ? "compact"
                                            : "comfortable",
                                    )
                                }
                                title="Toggle density"
                                style={{
                                    width: 34,
                                    height: 34,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: 8,
                                    border:
                                        "1px solid var(--c-border)",
                                    background:
                                        "var(--c-surface)",
                                    color: "var(--c-muted)",
                                    cursor: "pointer",
                                }}
                            >
                                <SlidersHorizontal
                                    size={14}
                                />
                            </button>
                        )}

                        {enableRefresh && (
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                title="Refresh"
                                style={{
                                    width: 34,
                                    height: 34,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: 8,
                                    border:
                                        "1px solid var(--c-border)",
                                    background:
                                        "var(--c-surface)",
                                    color: "var(--c-muted)",
                                    cursor: refreshing
                                        ? "not-allowed"
                                        : "pointer",
                                }}
                            >
                                <RefreshCw
                                    size={14}
                                    style={{
                                        animation: refreshing
                                            ? "spin 0.8s linear infinite"
                                            : undefined,
                                    }}
                                />
                            </button>
                        )}

                        {enableExport && (
                            <button
                                onClick={() =>
                                    downloadCsv(
                                        sortedData,
                                        columns,
                                        exportFileName,
                                    )
                                }
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    height: 34,
                                    padding: "0 10px",
                                    borderRadius: 8,
                                    border:
                                        "1px solid var(--c-border)",
                                    background:
                                        "var(--c-surface)",
                                    color: "var(--c-muted)",
                                    cursor: "pointer",
                                    fontSize: 11.5,
                                }}
                            >
                                <Download size={13} />
                                Export
                            </button>
                        )}
                    </div>
                </div>

                {/* FILTERS */}

                {showFilters && filters.length > 0 && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "flex-end",
                            gap: 10,
                            flexWrap: "wrap",
                            paddingTop: 2,
                        }}
                    >
                        {filters.map((filter) => (
                            <div
                                key={filter.id}
                                style={{
                                    minWidth: 150,
                                }}
                            >
                                <label
                                    style={{
                                        display: "block",
                                        marginBottom: 5,
                                        fontSize: 10,
                                        color: "var(--c-dim)",
                                        fontFamily:
                                            "JetBrains Mono, monospace",
                                        textTransform: "uppercase",
                                    }}
                                >
                                    {filter.label}
                                </label>

                                <select
                                    value={
                                        filterValues[filter.id] ??
                                        "ALL"
                                    }
                                    onChange={(event) => {
                                        setFilterValues(
                                            (previous) => ({
                                                ...previous,
                                                [filter.id]:
                                                    event.target.value,
                                            }),
                                        );
                                    }}
                                    style={{
                                        height: 34,
                                        width: "100%",
                                        padding: "0 10px",
                                        borderRadius: 8,
                                        border:
                                            "1px solid var(--c-border)",
                                        background:
                                            "var(--c-surface2)",
                                        color: "var(--c-text)",
                                        fontSize: 11.5,
                                        outline: "none",
                                    }}
                                >
                                    <option value="ALL">
                                        All
                                    </option>

                                    {filter.options.map(
                                        (option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>
                        ))}

                        {hasActiveFilters && (
                            <button
                                onClick={resetFilters}
                                style={{
                                    height: 34,
                                    padding: "0 10px",
                                    borderRadius: 8,
                                    border:
                                        "1px solid var(--c-border)",
                                    background:
                                        "var(--c-surface)",
                                    color: "var(--c-accent)",
                                    cursor: "pointer",
                                    fontSize: 11.5,
                                }}
                            >
                                Reset
                            </button>
                        )}
                    </div>
                )}

                {/* SELECTION BAR */}

                {selectedIds.size > 0 && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 10,
                            padding: "8px 10px",
                            borderRadius: 8,
                            background:
                                "var(--c-accent-bg)",
                            border:
                                "1px solid var(--c-border)",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                color: "var(--c-accent)",
                                fontSize: 11.5,
                                fontWeight: 600,
                            }}
                        >
                            <Check size={14} />

                            {selectedIds.size} selected
                        </div>

                        <div
                            style={{
                                display: "flex",
                                gap: 6,
                                alignItems: "center",
                                flexWrap: "wrap",
                            }}
                        >
                            {bulkActions.map((action) => {
                                const isDanger =
                                    action.variant === "danger";

                                return (
                                    <button
                                        key={action.id}
                                        onClick={async () => {
                                            await action.onClick(
                                                selectedRows,
                                            );
                                        }}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 5,
                                            height: 28,
                                            padding: "0 9px",
                                            borderRadius: 6,
                                            border: isDanger
                                                ? "1px solid var(--c-red)"
                                                : "1px solid var(--c-border)",
                                            background:
                                                isDanger
                                                    ? "var(--c-red-bg)"
                                                    : "var(--c-surface)",
                                            color: isDanger
                                                ? "var(--c-red)"
                                                : "var(--c-muted)",
                                            cursor: "pointer",
                                            fontSize: 11,
                                        }}
                                    >
                                        {action.icon}
                                        {action.label}
                                    </button>
                                );
                            })}

                            <button
                                onClick={clearSelection}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 5,
                                    height: 28,
                                    padding: "0 9px",
                                    borderRadius: 6,
                                    border:
                                        "1px solid var(--c-border)",
                                    background:
                                        "var(--c-surface)",
                                    color: "var(--c-muted)",
                                    cursor: "pointer",
                                    fontSize: 11,
                                }}
                            >
                                <X size={12} />
                                Clear
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* =====================================================
          TABLE
      ===================================================== */}

            <div
                style={{
                    width: "100%",
                    overflowX: "auto",
                }}
            >
                <table
                    style={{
                        width: "100%",
                        minWidth,
                        borderCollapse: "collapse",
                        tableLayout: "auto",
                    }}
                >
                    <thead>
                        <tr
                            style={{
                                borderBottom:
                                    "1px solid var(--c-border2)",
                            }}
                        >
                            {/* SELECT ALL */}

                            <th
                                style={{
                                    width: 42,
                                    padding: headerPadding,
                                    textAlign: "center",
                                    background:
                                        "var(--c-surface)",
                                    position:
                                        stickyHeader
                                            ? "sticky"
                                            : undefined,
                                    top: 0,
                                    zIndex: 10,
                                }}
                            >
                                <Checkbox
                                    checked={allVisibleSelected}
                                    indeterminate={
                                        someVisibleSelected
                                    }
                                    onChange={
                                        toggleAllVisible
                                    }
                                    ariaLabel="Select all rows"
                                />
                            </th>

                            {visibleColumns.map(
                                (column) => {
                                    const isSorted =
                                        sortColumn === column.id;

                                    const headerStyle: CSSProperties =
                                    {
                                        padding: headerPadding,
                                        textAlign:
                                            column.align ??
                                            "left",
                                        fontFamily:
                                            "JetBrains Mono, monospace",
                                        fontSize: 9.5,
                                        color: isSorted
                                            ? "var(--c-accent)"
                                            : "var(--c-dim)",
                                        textTransform:
                                            "uppercase",
                                        letterSpacing:
                                            "0.08em",
                                        fontWeight: 500,
                                        whiteSpace:
                                            "nowrap",
                                        borderBottom:
                                            "1px solid var(--c-border2)",
                                        background:
                                            "var(--c-surface)",
                                        position:
                                            stickyHeader
                                                ? "sticky"
                                                : undefined,
                                        top: 0,
                                        zIndex: 10,
                                    };

                                    if (column.width) {
                                        headerStyle.width =
                                            column.width;
                                    }

                                    if (
                                        column.sticky === "right"
                                    ) {
                                        headerStyle.position =
                                            "sticky";
                                        headerStyle.right = 0;
                                        headerStyle.zIndex = 11;
                                        headerStyle.boxShadow =
                                            "-5px 0 8px rgba(0,0,0,0.04)";
                                    }

                                    return (
                                        <th
                                            key={column.id}
                                            style={headerStyle}
                                        >
                                            {column.sortable !==
                                                false ? (
                                                <button
                                                    onClick={() =>
                                                        handleSort(
                                                            column,
                                                        )
                                                    }
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems:
                                                            "center",
                                                        justifyContent:
                                                            column.align ===
                                                                "right"
                                                                ? "flex-end"
                                                                : column.align ===
                                                                    "center"
                                                                    ? "center"
                                                                    : "flex-start",
                                                        gap: 5,
                                                        border: "none",
                                                        background:
                                                            "transparent",
                                                        color:
                                                            "inherit",
                                                        font:
                                                            "inherit",
                                                        textTransform:
                                                            "inherit",
                                                        letterSpacing:
                                                            "inherit",
                                                        cursor:
                                                            "pointer",
                                                        padding: 0,
                                                    }}
                                                >
                                                    {column.header}

                                                    {!isSorted && (
                                                        <ArrowUpDown
                                                            size={11}
                                                            style={{
                                                                opacity: 0.5,
                                                            }}
                                                        />
                                                    )}

                                                    {isSorted &&
                                                        sortDirection ===
                                                        "asc" && (
                                                            <ArrowUp
                                                                size={11}
                                                            />
                                                        )}

                                                    {isSorted &&
                                                        sortDirection ===
                                                        "desc" && (
                                                            <ArrowDown
                                                                size={11}
                                                            />
                                                        )}
                                                </button>
                                            ) : (
                                                column.header
                                            )}
                                        </th>
                                    );
                                },
                            )}

                            {rowActions.length > 0 && (
                                <th
                                    style={{
                                        padding: headerPadding,
                                        width: 80,
                                        textAlign: "right",
                                        fontFamily:
                                            "JetBrains Mono, monospace",
                                        fontSize: 9.5,
                                        color: "var(--c-dim)",
                                        textTransform:
                                            "uppercase",
                                        letterSpacing:
                                            "0.08em",
                                        fontWeight: 500,
                                        background:
                                            "var(--c-surface)",
                                        position: "sticky",
                                        right: 0,
                                        top: 0,
                                        zIndex: 12,
                                        borderBottom:
                                            "1px solid var(--c-border2)",
                                        boxShadow:
                                            "-5px 0 8px rgba(0,0,0,0.04)",
                                    }}
                                >
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {/* LOADING */}

                        {loading && (
                            <tr>
                                <td
                                    colSpan={
                                        visibleColumns.length +
                                        1 +
                                        (rowActions.length > 0
                                            ? 1
                                            : 0)
                                    }
                                    style={{
                                        padding: 60,
                                        textAlign: "center",
                                        color: "var(--c-muted)",
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
                                        <Loader2
                                            size={22}
                                            style={{
                                                animation:
                                                    "spin 0.8s linear infinite",
                                            }}
                                        />

                                        <span
                                            style={{
                                                fontSize: 12,
                                            }}
                                        >
                                            Loading data...
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {/* EMPTY */}

                        {!loading &&
                            paginatedData.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={
                                            visibleColumns.length +
                                            1 +
                                            (rowActions.length > 0
                                                ? 1
                                                : 0)
                                        }
                                        style={{
                                            padding: 60,
                                            textAlign: "center",
                                            color: "var(--c-dim)",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection:
                                                    "column",
                                                alignItems:
                                                    "center",
                                                gap: 9,
                                            }}
                                        >
                                            {emptyIcon ?? (
                                                <Eye
                                                    size={28}
                                                    style={{
                                                        opacity: 0.35,
                                                    }}
                                                />
                                            )}

                                            <div
                                                style={{
                                                    color:
                                                        "var(--c-text)",
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {emptyMessage}
                                            </div>

                                            <div
                                                style={{
                                                    color:
                                                        "var(--c-dim)",
                                                    fontSize: 11.5,
                                                }}
                                            >
                                                {emptyDescription}
                                            </div>

                                            {emptyAction}
                                        </div>
                                    </td>
                                </tr>
                            )}

                        {/* ROWS */}

                        {!loading &&
                            paginatedData.map(
                                (row, index) => {
                                    const absoluteIndex =
                                        pagination
                                            ? (page - 1) *
                                            pageSize +
                                            index
                                            : index;

                                    const rowId = getRowId(
                                        row,
                                        absoluteIndex,
                                    );

                                    const selected =
                                        selectedIds.has(rowId);

                                    return (
                                        <tr
                                            key={rowId}
                                            onClick={() =>
                                                onRowClick?.(row)
                                            }
                                            style={{
                                                borderBottom:
                                                    "1px solid var(--c-border2)",
                                                background: selected
                                                    ? "var(--c-accent-bg)"
                                                    : "transparent",
                                                cursor: onRowClick
                                                    ? "pointer"
                                                    : "default",
                                                transition:
                                                    "background 120ms ease",
                                            }}
                                            onMouseEnter={(
                                                event,
                                            ) => {
                                                if (!selected) {
                                                    event.currentTarget.style.background =
                                                        "var(--c-surface2)";
                                                }
                                            }}
                                            onMouseLeave={(
                                                event,
                                            ) => {
                                                if (!selected) {
                                                    event.currentTarget.style.background =
                                                        "transparent";
                                                }
                                            }}
                                        >
                                            {/* CHECKBOX */}

                                            <td
                                                style={{
                                                    padding: cellPadding,
                                                    textAlign:
                                                        "center",
                                                }}
                                                onClick={(event) =>
                                                    event.stopPropagation()
                                                }
                                            >
                                                <Checkbox
                                                    checked={selected}
                                                    onChange={(
                                                        checked,
                                                    ) =>
                                                        toggleRow(
                                                            row,
                                                            absoluteIndex,
                                                            checked,
                                                        )
                                                    }
                                                    ariaLabel={`Select row ${rowId}`}
                                                />
                                            </td>

                                            {/* CELLS */}

                                            {visibleColumns.map(
                                                (column) => {
                                                    const cellStyle: CSSProperties =
                                                    {
                                                        padding:
                                                            cellPadding,
                                                        textAlign:
                                                            column.align ??
                                                            "left",
                                                        color:
                                                            "var(--c-text)",
                                                        fontSize: 12,
                                                        verticalAlign:
                                                            "middle",
                                                    };

                                                    if (
                                                        column.sticky ===
                                                        "right"
                                                    ) {
                                                        cellStyle.position =
                                                            "sticky";
                                                        cellStyle.right =
                                                            0;
                                                        cellStyle.background =
                                                            selected
                                                                ? "var(--c-accent-bg)"
                                                                : "var(--c-surface)";
                                                        cellStyle.boxShadow =
                                                            "-5px 0 8px rgba(0,0,0,0.04)";
                                                    }

                                                    return (
                                                        <td
                                                            key={column.id}
                                                            className={
                                                                column.className
                                                            }
                                                            style={
                                                                cellStyle
                                                            }
                                                            onClick={(
                                                                event,
                                                            ) => {
                                                                if (
                                                                    column.sticky
                                                                ) {
                                                                    event.stopPropagation();
                                                                }
                                                            }}
                                                        >
                                                            {column.cell
                                                                ? column.cell(
                                                                    row,
                                                                    absoluteIndex,
                                                                )
                                                                : column.accessorKey
                                                                    ? String(
                                                                        row[
                                                                        column
                                                                            .accessorKey
                                                                        ] ?? "",
                                                                    )
                                                                    : null}
                                                        </td>
                                                    );
                                                },
                                            )}

                                            {/* ACTIONS */}

                                            {rowActions.length >
                                                0 && (
                                                    <td
                                                        style={{
                                                            padding:
                                                                cellPadding,
                                                            textAlign:
                                                                "right",
                                                            position:
                                                                "sticky",
                                                            right: 0,
                                                            background:
                                                                selected
                                                                    ? "var(--c-accent-bg)"
                                                                    : "var(--c-surface)",
                                                            boxShadow:
                                                                "-5px 0 8px rgba(0,0,0,0.04)",
                                                        }}
                                                        onClick={(event) =>
                                                            event.stopPropagation()
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
                                                            {rowActions.map(
                                                                (
                                                                    action,
                                                                ) => (
                                                                    <button
                                                                        key={
                                                                            action.id
                                                                        }
                                                                        title={
                                                                            action.label
                                                                        }
                                                                        onClick={() =>
                                                                            action.onClick(
                                                                                row,
                                                                            )
                                                                        }
                                                                        style={{
                                                                            width: 28,
                                                                            height: 28,
                                                                            display:
                                                                                "flex",
                                                                            alignItems:
                                                                                "center",
                                                                            justifyContent:
                                                                                "center",
                                                                            borderRadius:
                                                                                6,
                                                                            border:
                                                                                "1px solid var(--c-border)",
                                                                            background:
                                                                                "transparent",
                                                                            color:
                                                                                action.variant ===
                                                                                    "danger"
                                                                                    ? "var(--c-red)"
                                                                                    : action.variant ===
                                                                                        "accent"
                                                                                        ? "var(--c-accent)"
                                                                                        : "var(--c-muted)",
                                                                            cursor:
                                                                                "pointer",
                                                                        }}
                                                                    >
                                                                        {action.icon ??
                                                                            action.label}
                                                                    </button>
                                                                ),
                                                            )}
                                                        </div>
                                                    </td>
                                                )}
                                        </tr>
                                    );
                                },
                            )}
                    </tbody>
                </table>
            </div>

            {/* =====================================================
          FOOTER
      ===================================================== */}

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "10px 12px",
                    borderTop:
                        "1px solid var(--c-border)",
                    flexWrap: "wrap",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        fontSize: 11,
                        color: "var(--c-muted)",
                    }}
                >
                    {showResultCount && (
                        <span>
                            {totalRows === 0
                                ? "0 results"
                                : `${Math.min(
                                    (page - 1) *
                                    pageSize +
                                    1,
                                    totalRows,
                                )}-${Math.min(
                                    page * pageSize,
                                    totalRows,
                                )} of ${totalRows}`}
                        </span>
                    )}

                    {showSelectedCount &&
                        selectedIds.size > 0 && (
                            <span
                                style={{
                                    color:
                                        "var(--c-accent)",
                                    fontWeight: 600,
                                }}
                            >
                                {selectedIds.size} selected
                            </span>
                        )}
                </div>

                {pagination && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        {/* PAGE SIZE */}

                        <select
                            value={pageSize}
                            onChange={(event) => {
                                setPageSize(
                                    Number(
                                        event.target.value,
                                    ),
                                );
                                setPage(1);
                            }}
                            style={{
                                height: 30,
                                padding: "0 8px",
                                borderRadius: 7,
                                border:
                                    "1px solid var(--c-border)",
                                background:
                                    "var(--c-surface)",
                                color: "var(--c-muted)",
                                fontSize: 11,
                                outline: "none",
                            }}
                        >
                            {pageSizeOptions.map(
                                (size) => (
                                    <option
                                        key={size}
                                        value={size}
                                    >
                                        {size} / page
                                    </option>
                                ),
                            )}
                        </select>

                        {/* FIRST */}

                        <button
                            disabled={page <= 1}
                            onClick={() => setPage(1)}
                            style={{
                                width: 30,
                                height: 30,
                                display: "flex",
                                alignItems: "center",
                                justifyContent:
                                    "center",
                                borderRadius: 7,
                                border:
                                    "1px solid var(--c-border)",
                                background:
                                    "var(--c-surface)",
                                color:
                                    page <= 1
                                        ? "var(--c-dim)"
                                        : "var(--c-muted)",
                                cursor:
                                    page <= 1
                                        ? "not-allowed"
                                        : "pointer",
                            }}
                        >
                            <ChevronsLeft size={13} />
                        </button>

                        {/* PREVIOUS */}

                        <button
                            disabled={page <= 1}
                            onClick={() =>
                                setPage((value) =>
                                    Math.max(1, value - 1),
                                )
                            }
                            style={{
                                width: 30,
                                height: 30,
                                display: "flex",
                                alignItems: "center",
                                justifyContent:
                                    "center",
                                borderRadius: 7,
                                border:
                                    "1px solid var(--c-border)",
                                background:
                                    "var(--c-surface)",
                                color:
                                    page <= 1
                                        ? "var(--c-dim)"
                                        : "var(--c-muted)",
                                cursor:
                                    page <= 1
                                        ? "not-allowed"
                                        : "pointer",
                            }}
                        >
                            <ChevronLeft size={13} />
                        </button>

                        <span
                            style={{
                                minWidth: 70,
                                textAlign: "center",
                                fontSize: 11,
                                color: "var(--c-muted)",
                                fontFamily:
                                    "JetBrains Mono, monospace",
                            }}
                        >
                            {page} / {totalPages}
                        </span>

                        {/* NEXT */}

                        <button
                            disabled={
                                page >= totalPages
                            }
                            onClick={() =>
                                setPage((value) =>
                                    Math.min(
                                        totalPages,
                                        value + 1,
                                    ),
                                )
                            }
                            style={{
                                width: 30,
                                height: 30,
                                display: "flex",
                                alignItems: "center",
                                justifyContent:
                                    "center",
                                borderRadius: 7,
                                border:
                                    "1px solid var(--c-border)",
                                background:
                                    "var(--c-surface)",
                                color:
                                    page >= totalPages
                                        ? "var(--c-dim)"
                                        : "var(--c-muted)",
                                cursor:
                                    page >= totalPages
                                        ? "not-allowed"
                                        : "pointer",
                            }}
                        >
                            <ChevronRight size={13} />
                        </button>

                        {/* LAST */}

                        <button
                            disabled={
                                page >= totalPages
                            }
                            onClick={() =>
                                setPage(totalPages)
                            }
                            style={{
                                width: 30,
                                height: 30,
                                display: "flex",
                                alignItems: "center",
                                justifyContent:
                                    "center",
                                borderRadius: 7,
                                border:
                                    "1px solid var(--c-border)",
                                background:
                                    "var(--c-surface)",
                                color:
                                    page >= totalPages
                                        ? "var(--c-dim)"
                                        : "var(--c-muted)",
                                cursor:
                                    page >= totalPages
                                        ? "not-allowed"
                                        : "pointer",
                            }}
                        >
                            <ChevronsRight size={13} />
                        </button>
                    </div>
                )}

                {footer}
            </div>

            <style>
                {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
            </style>
        </div>
    );
}