import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useNotification } from "@/contexts/NotificationContext";
import CurrencyInput from "@/components/ui/CurrencyInput";

import type {
    ProductVariant,
    CreateProductVariantPayload,
    UpdateProductVariantPayload,
} from "@/features/Product/types/product.type";

interface VariantFormModalProps {
    open: boolean;
    productId: string;
    variant: ProductVariant | null;
    loading?: boolean;
    onClose: () => void;
    onCreate: (productId: string, payload: CreateProductVariantPayload) => Promise<boolean>;
    onUpdate: (productId: string, variantId: string, payload: UpdateProductVariantPayload) => Promise<boolean>;
}

interface FormState {
    name: string;
    sku: string;
    price: string;
    stock: string;
    isActive: boolean;
}

const defaultForm: FormState = {
    name: "",
    sku: "",
    price: "",
    stock: "0",
    isActive: true,
};

export default function VariantFormModal({
    open,
    productId,
    variant,
    loading = false,
    onClose,
    onCreate,
    onUpdate,
}: VariantFormModalProps) {
    const [form, setForm] = useState<FormState>(defaultForm);
    const { success, error: toastError } = useNotification();
    const isEdit = Boolean(variant);

    useEffect(() => {
        if (!open) return;

        if (variant) {
            setForm({
                name: variant.name ?? "",
                sku: variant.sku ?? "",
                price: variant.price !== null && variant.price !== undefined ? String(variant.price) : "",
                stock: String(variant.stock ?? 0),
                isActive: variant.isActive ?? true,
            });
        } else {
            setForm({ ...defaultForm });
        }
    }, [open, variant]);

    if (!open) return null;

    const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!form.name.trim()) {
            toastError("Nama variant wajib diisi.");
            return;
        }

        const stock = Number(form.stock || 0);
        if (!Number.isFinite(stock) || stock < 0) {
            toastError("Stock harus berupa angka yang valid.");
            return;
        }

        const price = form.price ? Number(form.price) : undefined;
        if (price !== undefined && (!Number.isFinite(price) || price < 0)) {
            toastError("Harga harus berupa angka yang valid.");
            return;
        }

        try {
            const basePayload = {
                name: form.name.trim(),
                sku: form.sku.trim() || undefined,
                price,
                stock,
                isActive: form.isActive,
            };

            if (variant) {
                const result = await onUpdate(productId, variant.id, basePayload);
                if (result) {
                    success("Variant berhasil diperbarui.");
                    onClose();
                }
                return;
            }

            const result = await onCreate(productId, basePayload);
            if (result) {
                success("Variant berhasil dibuat.");
                onClose();
            }
        } catch (error) {
            console.error("Variant submit error:", error);
            toastError(error instanceof Error ? error.message : "Gagal menyimpan variant.");
        }
    };

    const inputClass = "w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60";
    const inputStyle: React.CSSProperties = {
        borderColor: "var(--c-border)",
        background: "var(--c-surface2)",
        color: "var(--c-text)",
    };

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-sm"
            style={{ background: "rgba(0,0,0,0.55)" }}
        >
            <div
                className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl"
                style={{
                    background: "var(--c-surface)",
                    border: "1px solid var(--c-border)",
                    boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
                }}
            >
                <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--c-border)" }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--c-text)" }}>
                            {isEdit ? "Edit Variant" : "Add Variant"}
                        </h2>
                        <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "var(--c-muted)" }}>
                            {isEdit ? "Update variant information." : "Add a new variant to this product."}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="flex rounded-lg p-2 transition"
                        style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--c-dim)",
                            cursor: loading ? "not-allowed" : "pointer",
                        }}
                    >
                        <X size={17} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto">
                    <div className="grid gap-5 px-6 py-6 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-muted)" }}>
                                Variant Name *
                            </label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => updateField("name", e.target.value)}
                                placeholder="Example: Large / Red"
                                required
                                disabled={loading}
                                className={inputClass}
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-muted)" }}>
                                SKU
                            </label>
                            <input
                                type="text"
                                value={form.sku}
                                onChange={(e) => updateField("sku", e.target.value)}
                                placeholder="Optional"
                                disabled={loading}
                                className={inputClass}
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-muted)" }}>
                                Stock
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={form.stock}
                                onChange={(e) => updateField("stock", e.target.value)}
                                placeholder="0"
                                disabled={loading}
                                className={inputClass}
                                style={inputStyle}
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-muted)" }}>
                                Variant Price
                            </label>
                            <CurrencyInput
                                value={form.price}
                                onChange={(value) => updateField("price", value)}
                                placeholder="Optional. Leave empty to use product price."
                                disabled={loading}
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 px-6 py-4" style={{ borderTop: "1px solid var(--c-border)", background: "var(--c-surface2)" }}>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-lg px-4 py-2 text-sm font-medium transition"
                            style={{
                                background: "transparent",
                                border: "1px solid var(--c-border)",
                                color: "var(--c-text)",
                                cursor: loading ? "not-allowed" : "pointer",
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg px-4 py-2 text-sm font-semibold transition"
                            style={{
                                background: "var(--c-accent)",
                                color: "#fff",
                                border: "none",
                                cursor: loading ? "not-allowed" : "pointer",
                                opacity: loading ? 0.7 : 1,
                            }}
                        >
                            {loading ? "Saving..." : "Save Variant"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
