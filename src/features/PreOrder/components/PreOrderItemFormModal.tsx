import { useEffect, useState } from "react";
import { X, Search } from "lucide-react";

import type {
    PreOrderItem,
    CreatePreOrderItemPayload,
    UpdatePreOrderItemPayload,
} from "@/features/PreOrder/types/preorder.type";
import { productApi } from "@/features/Product/api/product.api";
import type { Product, ProductVariant } from "@/features/Product/types/product.type";
import { useNotification } from "@/contexts/NotificationContext";
import FormField from "@/components/ui/FormField";
import CurrencyInput from "@/components/ui/CurrencyInput";
import { SecureImage } from "@/components/ui/SecureImage";

interface PreOrderItemFormModalProps {
    open: boolean;
    preOrderId: string;
    item: PreOrderItem | null;
    loading?: boolean;

    onClose: () => void;
    onCreate: (preOrderId: string, payload: CreatePreOrderItemPayload) => Promise<boolean>;
    onUpdate: (preOrderId: string, itemId: string, payload: UpdatePreOrderItemPayload) => Promise<boolean>;
}

export default function PreOrderItemFormModal({
    open,
    preOrderId,
    item,
    loading = false,
    onClose,
    onCreate,
    onUpdate,
}: PreOrderItemFormModalProps) {
    const { success, error: toastError } = useNotification();

    const [products, setProducts] = useState<Product[]>([]);
    const [fetchingProducts, setFetchingProducts] = useState(false);
    const [search, setSearch] = useState("");

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

    const [price, setPrice] = useState("");
    const [stockLimit, setStockLimit] = useState("");
    const [displayOrder, setDisplayOrder] = useState("");

    const isEdit = Boolean(item);

    // Fetch products
    useEffect(() => {
        if (!open) return;
        let isMounted = true;

        const fetchProducts = async () => {
            setFetchingProducts(true);
            try {
                const response = await productApi.getProducts({ limit: 50, search, isActive: true });
                if (isMounted) setProducts(response.data);
            } catch (err) {
                if (isMounted) toastError("Failed to fetch products.");
            } finally {
                if (isMounted) setFetchingProducts(false);
            }
        };

        const timer = setTimeout(fetchProducts, 300);
        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [open, search, toastError]);

    // Initialize state
    useEffect(() => {
        if (!open) return;

        if (item) {
            setSelectedProduct(item.product ?? null);
            setSelectedVariant(item.variant ?? null);
            setPrice(String(item.price));
            setStockLimit(item.stockLimit !== null && item.stockLimit !== undefined ? String(item.stockLimit) : "");
            setDisplayOrder(String(item.displayOrder));
        } else {
            setSelectedProduct(null);
            setSelectedVariant(null);
            setPrice("");
            setStockLimit("");
            setDisplayOrder("0");
            setSearch("");
        }
    }, [open, item]);

    if (!open) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            stockLimit: stockLimit ? Number(stockLimit) : undefined,
            displayOrder: displayOrder ? Number(displayOrder) : 0,
        };

        try {
            if (isEdit) {
                const result = await onUpdate(preOrderId, item!.id, payload);
                if (result) {
                    success("Item updated successfully.");
                    onClose();
                }
            } else {
                if (!selectedProduct) return;
                const createPayload: CreatePreOrderItemPayload = {
                    ...payload,
                    productId: selectedProduct.id,
                    variantId: selectedVariant?.id,
                };
                const result = await onCreate(preOrderId, createPayload);
                if (result) {
                    success("Item added successfully.");
                    onClose();
                }
            }
        } catch (error) {
            toastError("Failed to save item.");
        }
    };

    const inputClass = "w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60";
    const inputStyle: React.CSSProperties = {
        borderColor: "var(--c-border)",
        background: "var(--c-surface2)",
        color: "var(--c-text)",
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.55)" }}>
            <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl" style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", boxShadow: "0 24px 80px rgba(0,0,0,0.35)" }}>
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--c-border)" }}>
                    <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--c-text)" }}>
                        {isEdit ? "Edit PreOrder Item" : "Add Product to PreOrder"}
                    </h2>
                    <button type="button" onClick={onClose} disabled={loading} className="flex rounded-lg p-2 transition hover:bg-slate-100" style={{ color: "var(--c-dim)" }}>
                        <X size={17} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="grid gap-5 px-6 py-6">
                        {!isEdit && (
                            <FormField label="Search Product" required>
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--c-muted)" }} />
                                    <input
                                        type="text"
                                        placeholder="Type to search..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className={inputClass}
                                        style={{ ...inputStyle, paddingLeft: 36 }}
                                    />
                                </div>

                                <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border" style={{ borderColor: "var(--c-border)" }}>
                                    {fetchingProducts ? (
                                        <div className="p-3 text-center text-xs text-slate-500">Loading...</div>
                                    ) : products.length === 0 ? (
                                        <div className="p-3 text-center text-xs text-slate-500">No products found</div>
                                    ) : (
                                        products.map((p) => {
                                            const hasVariants = p.variants && p.variants.length > 0;
                                            return (
                                                <div key={p.id} className="border-b last:border-b-0" style={{ borderColor: "var(--c-border)" }}>
                                                    <div
                                                        className="flex cursor-pointer items-center gap-3 p-2 hover:bg-slate-50"
                                                        onClick={() => {
                                                            setSelectedProduct(p);
                                                            setSelectedVariant(null);
                                                            if (!hasVariants) setPrice(String(p.price));
                                                        }}
                                                    >
                                                        {p.imageUrl ? (
                                                            <SecureImage src={p.imageUrl} className="h-8 w-8 rounded object-cover" />
                                                        ) : (
                                                            <div className="h-8 w-8 rounded bg-slate-100" />
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="truncate text-sm font-medium" style={{ color: selectedProduct?.id === p.id && !selectedVariant && !hasVariants ? "var(--c-accent)" : "var(--c-text)" }}>
                                                                {p.name}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Render variants if exist */}
                                                    {hasVariants && (
                                                        <div className="bg-slate-50 pl-11 pr-2 py-1">
                                                            {p.variants.map((v) => (
                                                                <div
                                                                    key={v.id}
                                                                    className="cursor-pointer py-1 text-xs"
                                                                    style={{ color: selectedVariant?.id === v.id ? "var(--c-accent)" : "var(--c-text)", fontWeight: selectedVariant?.id === v.id ? 600 : 400 }}
                                                                    onClick={() => {
                                                                        setSelectedProduct(p);
                                                                        setSelectedVariant(v);
                                                                        setPrice(String(v.price ?? p.price));
                                                                    }}
                                                                >
                                                                    • {v.name}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </FormField>
                        )}

                        {isEdit && item!.product && (
                            <div className="flex items-center gap-3 rounded-lg border p-3" style={{ borderColor: "var(--c-border)", background: "var(--c-surface2)" }}>
                                {item!.product.imageUrl && <SecureImage src={item!.product.imageUrl} className="h-10 w-10 rounded object-cover" />}
                                <div>
                                    <p className="font-medium text-sm" style={{ color: "var(--c-text)" }}>{item!.product.name}</p>
                                    {item!.variant && <p className="text-xs" style={{ color: "var(--c-dim)" }}>Variant: {item!.variant.name}</p>}
                                </div>
                            </div>
                        )}

                        <FormField label="PreOrder Price" required>
                            <CurrencyInput
                                value={price}
                                onChange={setPrice}
                                placeholder="0"
                                disabled={loading}
                                style={inputStyle}
                            />
                        </FormField>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField label="Item Stock Limit">
                                <input
                                    type="number"
                                    min="0"
                                    value={stockLimit}
                                    onChange={(e) => setStockLimit(e.target.value)}
                                    placeholder="Optional"
                                    disabled={loading}
                                    className={inputClass}
                                    style={inputStyle}
                                />
                            </FormField>

                            <FormField label="Display Order">
                                <input
                                    type="number"
                                    min="0"
                                    value={displayOrder}
                                    onChange={(e) => setDisplayOrder(e.target.value)}
                                    disabled={loading}
                                    className={inputClass}
                                    style={inputStyle}
                                />
                            </FormField>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: "var(--c-border)", background: "var(--c-surface)" }}>
                        <button type="button" onClick={onClose} disabled={loading} className="rounded-lg px-4 py-2 text-xs font-medium transition" style={{ color: "var(--c-text)", background: "var(--c-surface2)", border: "1px solid var(--c-border)" }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="rounded-lg px-5 py-2 text-xs font-medium text-white transition disabled:opacity-70" style={{ background: "var(--c-accent)" }}>
                            {loading ? "Saving..." : "Save Item"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
