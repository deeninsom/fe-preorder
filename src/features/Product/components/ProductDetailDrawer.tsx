import {
    Package,
    Pencil,
    Trash2,
    X,
} from "lucide-react";

import type { Product } from "@/features/Product/types/product.type";

interface ProductDetailDrawerProps {
    product: Product | null;
    onClose: () => void;
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
}

export default function ProductDetailDrawer({
    product,
    onClose,
    onEdit,
    onDelete,
}: ProductDetailDrawerProps) {
    if (!product) {
        return null;
    }

    const formatPrice = (
        value: string | null | undefined
    ) => {
        if (!value) {
            return "—";
        }

        return `Rp ${Number(value).toLocaleString(
            "id-ID"
        )}`;
    };

    return (
        <>
            <div
                onClick={onClose}
                style={{
                    position: "fixed",
                    inset: 0,
                    background:
                        "rgba(0,0,0,0.25)",
                    zIndex: 90,
                }}
            />

            <div
                style={{
                    position: "fixed",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width:
                        "min(420px, 100vw)",
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
                            {product.sku ??
                                product.id}
                        </div>

                        <h2
                            style={{
                                fontSize: 17,
                                fontWeight: 700,
                                color:
                                    "var(--c-text)",
                                margin:
                                    "4px 0 0",
                            }}
                        >
                            {product.name}
                        </h2>
                    </div>

                    <button
                        onClick={onClose}
                        style={{
                            background:
                                "none",
                            border: "none",
                            cursor:
                                "pointer",
                            color:
                                "var(--c-dim)",
                            display: "flex",
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {product.imageUrl && (
                    <img
                        src={
                            product.imageUrl
                        }
                        alt={product.name}
                        style={{
                            width: "100%",
                            height: 180,
                            objectFit: "cover",
                            borderRadius: 12,
                            marginBottom: 18,
                            border:
                                "1px solid var(--c-border)",
                        }}
                    />
                )}

                <div
                    style={{
                        display: "flex",
                        flexDirection:
                            "column",
                        gap: 8,
                    }}
                >
                    <Row
                        label="Slug"
                        value={`/${product.slug}`}
                    />

                    <Row
                        label="SKU"
                        value={
                            product.sku ??
                            "—"
                        }
                    />

                    <Row
                        label="Price"
                        value={formatPrice(
                            product.price
                        )}
                    />

                    <Row
                        label="Cost"
                        value={formatPrice(
                            product.cost
                        )}
                    />

                    <Row
                        label="Stock"
                        value={String(
                            product.stock
                        )}
                    />

                    <Row
                        label="Weight"
                        value={
                            product.weightGram
                                ? `${product.weightGram} gram`
                                : "—"
                        }
                    />

                    <Row
                        label="Status"
                        value={
                            product.isActive &&
                                !product.archivedAt
                                ? "Active"
                                : "Archived"
                        }
                    />
                </div>

                {product.description && (
                    <div
                        style={{
                            marginTop: 20,
                            padding: 14,
                            borderRadius: 10,
                            background:
                                "var(--c-surface2)",
                        }}
                    >
                        <div
                            style={{
                                fontSize: 10,
                                fontFamily:
                                    "JetBrains Mono, monospace",
                                color:
                                    "var(--c-dim)",
                                textTransform:
                                    "uppercase",
                                marginBottom: 8,
                            }}
                        >
                            Description
                        </div>

                        <p
                            style={{
                                margin: 0,
                                fontSize: 12.5,
                                lineHeight: 1.6,
                                color:
                                    "var(--c-muted)",
                            }}
                        >
                            {
                                product.description
                            }
                        </p>
                    </div>
                )}

                {/* VARIANTS */}

                <div
                    style={{
                        marginTop: 20,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems:
                                "center",
                            gap: 7,
                            marginBottom: 10,
                        }}
                    >
                        <Package
                            size={13}
                            color="var(--c-dim)"
                        />

                        <span
                            style={{
                                fontSize: 10,
                                fontFamily:
                                    "JetBrains Mono, monospace",
                                color:
                                    "var(--c-dim)",
                                textTransform:
                                    "uppercase",
                            }}
                        >
                            Variants
                        </span>
                    </div>

                    {product.variants?.length ? (
                        product.variants.map(
                            (variant) => (
                                <div
                                    key={
                                        variant.id
                                    }
                                    style={{
                                        display:
                                            "flex",
                                        alignItems:
                                            "center",
                                        justifyContent:
                                            "space-between",
                                        gap: 10,
                                        padding:
                                            "9px 0",
                                        borderBottom:
                                            "1px solid var(--c-border2)",
                                    }}
                                >
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 12,
                                                color:
                                                    "var(--c-text)",
                                                fontWeight:
                                                    500,
                                            }}
                                        >
                                            {
                                                variant.name
                                            }
                                        </div>

                                        <div
                                            style={{
                                                fontFamily:
                                                    "JetBrains Mono, monospace",
                                                fontSize: 10,
                                                color:
                                                    "var(--c-dim)",
                                                marginTop:
                                                    2,
                                            }}
                                        >
                                            {
                                                variant.sku ??
                                                "No SKU"
                                            }
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            textAlign:
                                                "right",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: 11,
                                                fontWeight:
                                                    600,
                                                color:
                                                    "var(--c-text)",
                                            }}
                                        >
                                            {variant.price
                                                ? formatPrice(
                                                    variant.price
                                                )
                                                : formatPrice(
                                                    product.price
                                                )}
                                        </div>

                                        <div
                                            style={{
                                                fontSize: 10,
                                                color:
                                                    "var(--c-muted)",
                                            }}
                                        >
                                            Stock{" "}
                                            {
                                                variant.stock
                                            }
                                        </div>
                                    </div>
                                </div>
                            )
                        )
                    ) : (
                        <div
                            style={{
                                padding: 14,
                                borderRadius: 10,
                                background:
                                    "var(--c-surface2)",
                                color:
                                    "var(--c-dim)",
                                fontSize: 11.5,
                            }}
                        >
                            No variants.
                        </div>
                    )}
                </div>

                {/* ACTIONS */}

                <div
                    style={{
                        display: "flex",
                        gap: 8,
                        marginTop: 24,
                    }}
                >
                    <button
                        onClick={() =>
                            onEdit(product)
                        }
                        style={{
                            flex: 1,
                            display: "flex",
                            alignItems:
                                "center",
                            justifyContent:
                                "center",
                            gap: 6,
                            padding: 10,
                            borderRadius: 8,
                            background:
                                "var(--c-accent)",
                            color: "#fff",
                            border: "none",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor:
                                "pointer",
                        }}
                    >
                        <Pencil size={13} />
                        Edit
                    </button>

                    <button
                        onClick={() =>
                            onDelete(product)
                        }
                        style={{
                            flex: 1,
                            display: "flex",
                            alignItems:
                                "center",
                            justifyContent:
                                "center",
                            gap: 6,
                            padding: 10,
                            borderRadius: 8,
                            border:
                                "1px solid var(--c-red)",
                            background:
                                "var(--c-red-bg)",
                            color:
                                "var(--c-red)",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor:
                                "pointer",
                        }}
                    >
                        <Trash2 size={13} />
                        Delete
                    </button>
                </div>
            </div>
        </>
    );
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
                justifyContent:
                    "space-between",
                alignItems: "center",
                gap: 20,
                padding: "8px 0",
                borderBottom:
                    "1px solid var(--c-border2)",
            }}
        >
            <span
                style={{
                    fontSize: 11.5,
                    color:
                        "var(--c-dim)",
                }}
            >
                {label}
            </span>

            <span
                style={{
                    fontSize: 12,
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