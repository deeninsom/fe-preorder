import { useEffect, useState } from "react";
import { X, Trash2, Search } from "lucide-react";
import { format } from "date-fns";

import { productApi } from "@/features/Product/api/product.api";
import type { Product, ProductVariant } from "@/features/Product/types/product.type";
import type {
    PreOrder,
    CreatePreOrderPayload,
    UpdatePreOrderPayload,
} from "@/features/PreOrder/types/preorder.type";
import { useNotification } from "@/contexts/NotificationContext";
import { uploadImage } from "@/features/FileStorage/api/file-storage.api";
import { SecureImage } from "@/components/ui/SecureImage";
import FormField from "@/components/ui/FormField";
import CurrencyInput from "@/components/ui/CurrencyInput";

interface PreOrderFormModalProps {
    open: boolean;
    preOrder: PreOrder | null;
    loading?: boolean;

    onClose: () => void;

    onCreate: (payload: CreatePreOrderPayload) => Promise<boolean>;
    onUpdate: (id: string, payload: UpdatePreOrderPayload) => Promise<boolean>;
}

interface FormState {
    name: string;
    description: string;
    startsAt: string;
    endsAt: string;
    orderLimit: string;
    bannerUrl: string;
}

const defaultForm: FormState = {
    name: "",
    description: "",
    startsAt: "",
    endsAt: "",
    orderLimit: "",
    bannerUrl: "",
};

export default function PreOrderFormModal({
    open,
    preOrder,
    loading = false,
    onClose,
    onCreate,
    onUpdate,
}: PreOrderFormModalProps) {
    const [form, setForm] = useState<FormState>(defaultForm);
    const { success, error: toastError } = useNotification();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [uploadingImage, setUploadingImage] = useState(false);

    // Initial Product Selection State
    const [products, setProducts] = useState<Product[]>([]);
    const [fetchingProducts, setFetchingProducts] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

    const isEdit = Boolean(preOrder);

    useEffect(() => {
        if (!open || isEdit) return;
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
    }, [open, isEdit, search, toastError]);

    useEffect(() => {
        if (!open) return;

        if (preOrder) {
            setForm({
                name: preOrder.name ?? "",
                description: preOrder.description ?? "",
                startsAt: preOrder.startsAt ? format(new Date(preOrder.startsAt), "yyyy-MM-dd'T'HH:mm") : "",
                endsAt: preOrder.endsAt ? format(new Date(preOrder.endsAt), "yyyy-MM-dd'T'HH:mm") : "",
                orderLimit: preOrder.orderLimit !== null && preOrder.orderLimit !== undefined ? String(preOrder.orderLimit) : "",
                bannerUrl: preOrder.bannerUrl ?? "",
            });
            setImageFile(null);
            setImagePreview(preOrder.bannerUrl ?? "");
        } else {
            setForm({ ...defaultForm });
            setImageFile(null);
            setImagePreview("");
            setSelectedProduct(null);
            setSelectedVariant(null);
            setSearch("");
        }
    }, [open, preOrder]);

    if (!open) return null;

    const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toastError("File must be an image.");
            event.target.value = "";
            return;
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            toastError("Max image size is 5MB.");
            event.target.value = "";
            return;
        }

        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        event.target.value = "";
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview("");
        updateField("bannerUrl", "");
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!form.name.trim()) {
            toastError("Name is required.");
            return;
        }

        if (!form.startsAt || !form.endsAt) {
            toastError("Start and end dates are required.");
            return;
        }



        const startsAt = new Date(form.startsAt).toISOString();
        const endsAt = new Date(form.endsAt).toISOString();

        const orderLimit = form.orderLimit ? Number(form.orderLimit) : undefined;

        try {
            let bannerUrl = form.bannerUrl || undefined;

            if (imageFile) {
                setUploadingImage(true);
                const uploadedUrl = await uploadImage(imageFile);
                if (!uploadedUrl) throw new Error("Failed to upload image.");
                bannerUrl = uploadedUrl;
            }

            const basePayload = {
                name: form.name.trim(),
                description: form.description.trim() || undefined,
                bannerUrl,
                startsAt,
                endsAt,
                orderLimit,
            };

            if (preOrder) {
                const result = await onUpdate(preOrder.id, basePayload);
                if (result) {
                    success("PreOrder updated successfully.");
                    onClose();
                }
                return;
            }

            const createPayload = {
                ...basePayload,
                items: [{
                    productId: selectedProduct!.id,
                    variantId: selectedVariant?.id,
                }],
            };

            const result = await onCreate(createPayload);
            if (result) {
                success("PreOrder created successfully.");
                onClose();
            }
        } catch (error) {
            toastError(error instanceof Error ? error.message : "Failed to save preorder.");
        } finally {
            setUploadingImage(false);
        }
    };

    const inputClass = "w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60";
    const inputStyle: React.CSSProperties = {
        borderColor: "var(--c-border)",
        background: "var(--c-surface2)",
        color: "var(--c-text)",
    };

    const isSubmitting = loading || uploadingImage;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            style={{ background: "rgba(0,0,0,0.55)" }}
        >
            <div
                className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl"
                style={{
                    background: "var(--c-surface)",
                    border: "1px solid var(--c-border)",
                    boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
                }}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--c-border)" }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--c-text)" }}>
                            {isEdit ? "Edit PreOrder" : "Create PreOrder"}
                        </h2>
                        <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "var(--c-muted)" }}>
                            {isEdit ? "Update preorder configuration." : "Setup a new preorder event."}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex rounded-lg p-2 transition hover:bg-slate-100"
                        style={{ color: "var(--c-dim)", cursor: isSubmitting ? "not-allowed" : "pointer" }}
                    >
                        <X size={17} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto">
                    <div className="grid gap-5 px-6 py-6 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <FormField label="PreOrder Name" required>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => updateField("name", e.target.value)}
                                    placeholder="Example: Launch Product 2026"
                                    required
                                    disabled={isSubmitting}
                                    className={inputClass}
                                    style={inputStyle}
                                />
                            </FormField>
                        </div>

                        <div className="sm:col-span-2">
                            <FormField label="Description">
                                <textarea
                                    value={form.description}
                                    onChange={(e) => updateField("description", e.target.value)}
                                    placeholder="PreOrder description..."
                                    rows={3}
                                    disabled={isSubmitting}
                                    className={inputClass}
                                    style={{ ...inputStyle, resize: "vertical" }}
                                />
                            </FormField>
                        </div>

                        <FormField label="Start Time" required>
                            <input
                                type="date"
                                value={form.startsAt}
                                onChange={(e) => updateField("startsAt", e.target.value)}
                                required
                                disabled={isSubmitting}
                                className={inputClass}
                                style={inputStyle}
                            />
                        </FormField>

                        <FormField label="End Time" required>
                            <input
                                type="date"
                                value={form.endsAt}
                                onChange={(e) => updateField("endsAt", e.target.value)}
                                required
                                disabled={isSubmitting}
                                className={inputClass}
                                style={inputStyle}
                            />
                        </FormField>

                        <FormField label="Order Limit (Total Sales Limit)">
                            <input
                                type="number"
                                min="0"
                                value={form.orderLimit}
                                onChange={(e) => updateField("orderLimit", e.target.value)}
                                placeholder="Optional"
                                disabled={isSubmitting}
                                className={inputClass}
                                style={inputStyle}
                            />
                        </FormField>

                        {!isEdit && (
                            <div className="sm:col-span-2 rounded-xl border p-5" style={{ borderColor: "var(--c-border)", background: "var(--c-surface2)" }}>
                                <h3 className="mb-4 text-sm font-semibold flex items-center gap-2" style={{ color: "var(--c-text)" }}>Product in PreOrder <span style={{ color: "var(--c-muted)" }} className="text-[9px] text-muted">( Select the products or variants available in this pre-order batch. )</span></h3>
                                <div className="grid gap-5">
                                    <FormField label="Search Product" >
                                        <div className="relative">
                                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--c-muted)" }} />
                                            <input
                                                type="text"
                                                placeholder="Type to search..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                className={inputClass}
                                                style={{ ...inputStyle, paddingLeft: 36, background: "var(--c-surface)" }}
                                            />
                                        </div>

                                        <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border" style={{ borderColor: "var(--c-border)", background: "var(--c-surface)" }}>
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

                                                            {hasVariants && (
                                                                <div className="pl-11 pr-2 py-1">
                                                                    {p.variants.map((v) => (
                                                                        <div
                                                                            key={v.id}
                                                                            className="cursor-pointer py-1 text-xs"
                                                                            style={{ color: selectedVariant?.id === v.id ? "var(--c-accent)" : "var(--c-text)", fontWeight: selectedVariant?.id === v.id ? 600 : 400 }}
                                                                            onClick={() => {
                                                                                setSelectedProduct(p);
                                                                                setSelectedVariant(v);
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

                                    {selectedProduct && (
                                        <div className="flex items-center gap-3 rounded-lg border p-3" style={{ borderColor: "var(--c-border)", background: "var(--c-surface)" }}>
                                            {selectedProduct.imageUrl && <SecureImage src={selectedProduct.imageUrl} className="h-10 w-10 rounded object-cover" />}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate" style={{ color: "var(--c-text)" }}>{selectedProduct.name}</p>
                                                {selectedVariant && <p className="text-xs truncate" style={{ color: "var(--c-dim)" }}>Variant: {selectedVariant.name}</p>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="sm:col-span-2">
                            <FormField label="Banner Image">
                                <div className="rounded-xl p-4" style={{ border: "1px solid var(--c-border)", background: "var(--c-surface2)" }}>
                                    {imagePreview ? (
                                        <div className="flex items-start gap-4">
                                            {imagePreview.startsWith("blob:") ? (
                                                <img src={imagePreview} alt="Banner" className="h-28 w-28 rounded-xl object-cover" />
                                            ) : (
                                                <SecureImage src={imagePreview} alt="Banner" className="h-28 w-28 rounded-xl object-cover" />
                                            )}
                                            <div className="flex flex-col gap-2">
                                                <span className="text-xs" style={{ color: "var(--c-muted)" }}>
                                                    {imageFile ? imageFile.name : "Current banner image"}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                    disabled={isSubmitting}
                                                    className="inline-flex w-fit items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium"
                                                    style={{ background: "rgba(239,68,68,0.1)", color: "var(--c-red)", border: "1px solid rgba(239,68,68,0.2)" }}
                                                >
                                                    <Trash2 size={13} /> Remove
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-4">
                                            <label
                                                className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition hover:border-blue-500 hover:bg-blue-50"
                                                style={{ borderColor: "var(--c-border)" }}
                                            >
                                                <input type="file" accept="image/png, image/jpeg, image/jpg, image/webp" className="hidden" onChange={handleImageChange} disabled={isSubmitting} />
                                                <span className="text-xs font-medium" style={{ color: "var(--c-muted)" }}>Upload</span>
                                            </label>
                                            <div className="text-xs leading-relaxed" style={{ color: "var(--c-dim)" }}>
                                                <p>Upload a banner for the preorder.</p>
                                                <p>PNG, JPG up to 5MB.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </FormField>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: "var(--c-border)", background: "var(--c-surface)" }}>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="rounded-lg px-4 py-2.5 text-xs font-medium transition"
                            style={{ color: "var(--c-text)", background: "var(--c-surface2)", border: "1px solid var(--c-border)" }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-lg px-5 py-2.5 text-xs font-medium text-white transition disabled:opacity-70"
                            style={{ background: "var(--c-accent)" }}
                        >
                            {isSubmitting ? "Saving..." : "Save PreOrder"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
