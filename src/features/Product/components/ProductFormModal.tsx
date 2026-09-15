import {
    useEffect,
    useState,
} from "react";

import {
    X,
    Loader2,
    Upload,
    Image as ImageIcon,
    Trash2,
} from "lucide-react";

import type {
    Product,
    CreateProductPayload,
    UpdateProductPayload,
} from "@/features/Product/types/product.type";

import { useNotification } from "@/contexts/NotificationContext";
import CurrencyInput from "@/components/ui/CurrencyInput";
import { uploadImage } from "@/features/FileStorage/api/file-storage.api";

interface ProductFormModalProps {
    open: boolean;
    product: Product | null;
    loading?: boolean;

    onClose: () => void;

    onCreate: (
        payload: CreateProductPayload,
    ) => Promise<boolean>;

    onUpdate: (
        id: string,
        payload: UpdateProductPayload,
    ) => Promise<boolean>;
}

interface FormState {
    name: string;
    description: string;
    price: string;
    cost: string;
    stock: string;
    weightGram: string;
    imageUrl: string;
    isActive: boolean;
}

const defaultForm: FormState = {
    name: "",
    description: "",
    price: "",
    cost: "",
    stock: "0",
    weightGram: "",
    imageUrl: "",
    isActive: true,
};

export default function ProductFormModal({
    open,
    product,
    loading = false,
    onClose,
    onCreate,
    onUpdate,
}: ProductFormModalProps) {
    const [form, setForm] =
        useState<FormState>(
            defaultForm,
        );

    const {
        success,
        error: toastError,
    } = useNotification();

    const [imageFile, setImageFile] =
        useState<File | null>(null);

    const [imagePreview, setImagePreview] =
        useState<string>("");

    const [uploadingImage, setUploadingImage] =
        useState(false);

    const isEdit = Boolean(product);

    useEffect(() => {
        if (!open) {
            return;
        }

        if (product) {
            setForm({
                name:
                    product.name ?? "",

                description:
                    product.description ?? "",

                price:
                    product.price !== null &&
                        product.price !== undefined
                        ? String(product.price)
                        : "",

                cost:
                    product.cost !== null &&
                        product.cost !== undefined
                        ? String(product.cost)
                        : "",

                stock:
                    String(
                        product.stock ?? 0,
                    ),

                weightGram:
                    product.weightGram !== null &&
                        product.weightGram !== undefined
                        ? String(
                            product.weightGram,
                        )
                        : "",

                imageUrl:
                    product.imageUrl ?? "",

                isActive:
                    product.isActive ?? true,
            });

            setImageFile(null);

            setImagePreview(
                product.imageUrl ?? "",
            );
        } else {
            setForm({
                ...defaultForm,
            });

            setImageFile(null);
            setImagePreview("");
        }
    }, [
        open,
        product,
    ]);

    if (!open) {
        return null;
    }

    const updateField = <
        K extends keyof FormState,
    >(
        field: K,
        value: FormState[K],
    ) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleImageChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        if (
            !file.type.startsWith(
                "image/",
            )
        ) {
            toastError(
                "File harus berupa gambar.",
            );

            event.target.value = "";
            return;
        }

        const maxSize =
            5 * 1024 * 1024;

        if (file.size > maxSize) {
            toastError(
                "Ukuran gambar maksimal 5MB.",
            );

            event.target.value = "";
            return;
        }

        setImageFile(file);

        const preview =
            URL.createObjectURL(
                file,
            );

        setImagePreview(
            preview,
        );

        // Reset supaya file yang sama
        // bisa dipilih lagi setelah remove.
        event.target.value = "";
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview("");

        updateField(
            "imageUrl",
            "",
        );
    };

    // const uploadImage = async (
    //     file: File,
    // ): Promise<string | null> => {
    //     const formData =
    //         new FormData();

    //     formData.append(
    //         "file",
    //         file,
    //     );

    //     formData.append(
    //         "folder",
    //         "products",
    //     );

    //     const response =
    //         await fetch(
    //             "/api/fileStorage/image",
    //             {
    //                 method: "POST",
    //                 body: formData,
    //             },
    //         );

    //     const result =
    //         await response
    //             .json()
    //             .catch(() => null);

    //     if (!response.ok) {
    //         throw new Error(
    //             result?.message ??
    //             "Gagal upload gambar.",
    //         );
    //     }

    //     return result?.url ?? null;
    // };

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        // -----------------------------------------
        // VALIDATION
        // -----------------------------------------

        if (!form.name.trim()) {
            toastError(
                "Nama product wajib diisi.",
            );

            return;
        }

        const price =
            Number(form.price);

        if (
            !form.price ||
            !Number.isFinite(price) ||
            price < 0
        ) {
            toastError(
                "Harga jual harus diisi dengan benar.",
            );

            return;
        }

        const cost =
            form.cost
                ? Number(form.cost)
                : undefined;

        if (
            cost !== undefined &&
            (!Number.isFinite(cost) ||
                cost < 0)
        ) {
            toastError(
                "Cost harus berupa angka yang valid.",
            );

            return;
        }

        const stock =
            Number(
                form.stock || 0,
            );

        if (
            !Number.isFinite(stock) ||
            stock < 0
        ) {
            toastError(
                "Stock harus berupa angka yang valid.",
            );

            return;
        }

        const weightGram =
            form.weightGram
                ? Number(
                    form.weightGram,
                )
                : undefined;

        if (
            weightGram !== undefined &&
            (!Number.isFinite(
                weightGram,
            ) ||
                weightGram < 0)
        ) {
            toastError(
                "Weight harus berupa angka yang valid.",
            );

            return;
        }

        try {
            let imageUrl =
                form.imageUrl ||
                undefined;

            // -----------------------------------------
            // UPLOAD IMAGE
            // -----------------------------------------

            if (imageFile) {
                setUploadingImage(true);

                const uploadedUrl =
                    await uploadImage(
                        imageFile,
                    );

                if (!uploadedUrl) {
                    throw new Error(
                        "URL gambar tidak ditemukan setelah upload.",
                    );
                }

                imageUrl =
                    uploadedUrl;
            }

            // -----------------------------------------
            // PAYLOAD
            // Slug & SKU tidak dikirim.
            // Backend yang generate.
            // -----------------------------------------

            const basePayload = {
                name:
                    form.name.trim(),

                description:
                    form.description.trim() ||
                    undefined,

                price,

                cost,

                stock,

                weightGram,

                imageUrl,

                isActive:
                    form.isActive,
            };

            // -----------------------------------------
            // UPDATE
            // -----------------------------------------

            if (product) {
                const result =
                    await onUpdate(
                        product.id,
                        basePayload,
                    );

                if (result) {
                    success(
                        "Product berhasil diperbarui.",
                    );

                    onClose();
                }

                return;
            }

            // -----------------------------------------
            // CREATE
            // -----------------------------------------

            const result =
                await onCreate(
                    basePayload,
                );

            if (result) {
                success(
                    "Product berhasil dibuat.",
                );

                onClose();
            }
        } catch (error) {
            console.error(
                "Product submit error:",
                error,
            );

            toastError(
                error instanceof Error
                    ? error.message
                    : "Gagal menyimpan product.",
            );
        } finally {
            setUploadingImage(false);
        }
    };

    const inputClass =
        "w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60";

    const inputStyle: React.CSSProperties = {
        borderColor:
            "var(--c-border)",

        background:
            "var(--c-surface2)",

        color:
            "var(--c-text)",
    };

    const isSubmitting =
        loading ||
        uploadingImage;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            style={{
                background:
                    "rgba(0,0,0,0.55)",
            }}
        >
            <div
                className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl"
                style={{
                    background:
                        "var(--c-surface)",

                    border:
                        "1px solid var(--c-border)",

                    boxShadow:
                        "0 24px 80px rgba(0,0,0,0.35)",
                }}
            >
                {/* HEADER */}

                <div
                    className="flex items-center justify-between px-6 py-4"
                    style={{
                        borderBottom:
                            "1px solid var(--c-border)",
                    }}
                >
                    <div>
                        <h2
                            style={{
                                margin: 0,
                                fontSize: 17,
                                fontWeight: 700,
                                color:
                                    "var(--c-text)",
                            }}
                        >
                            {isEdit
                                ? "Edit Product"
                                : "Create Product"}
                        </h2>

                        <p
                            style={{
                                margin:
                                    "4px 0 0",
                                fontSize: 11.5,
                                color:
                                    "var(--c-muted)",
                            }}
                        >
                            {isEdit
                                ? "Update product information."
                                : "Add a new product to your store."}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={
                            isSubmitting
                        }
                        className="flex rounded-lg p-2 transition"
                        style={{
                            background:
                                "transparent",

                            border:
                                "none",

                            color:
                                "var(--c-dim)",

                            cursor:
                                isSubmitting
                                    ? "not-allowed"
                                    : "pointer",
                        }}
                    >
                        <X size={17} />
                    </button>
                </div>

                {/* FORM */}

                <form
                    onSubmit={
                        handleSubmit
                    }
                    className="overflow-y-auto"
                >
                    <div className="grid gap-5 px-6 py-6 sm:grid-cols-2">

                        {/* NAME */}

                        <div className="sm:col-span-2">
                            <FormField
                                label="Product Name"
                                required
                            >
                                <input
                                    type="text"
                                    value={
                                        form.name
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        updateField(
                                            "name",
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    placeholder="Example: Premium Coffee"
                                    required
                                    disabled={
                                        isSubmitting
                                    }
                                    className={
                                        inputClass
                                    }
                                    style={
                                        inputStyle
                                    }
                                />
                            </FormField>
                        </div>

                        {/* PRICE */}

                        <FormField
                            label="Selling Price"
                            required
                        >
                            <CurrencyInput
                                value={form.price}
                                onChange={(value) =>
                                    updateField(
                                        "price",
                                        value,
                                    )
                                }
                                placeholder="30.000"
                                disabled={
                                    isSubmitting
                                }
                                style={inputStyle}
                            />
                        </FormField>

                        {/* COST */}

                        <FormField label="Cost">
                            <CurrencyInput
                                value={form.cost}
                                onChange={(value) =>
                                    updateField(
                                        "cost",
                                        value,
                                    )
                                }
                                placeholder="30.000"
                                disabled={
                                    isSubmitting
                                }
                                style={inputStyle}
                            />
                        </FormField>

                        {/* STOCK */}

                        <FormField label="Stock">
                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={
                                    form.stock
                                }
                                onChange={(
                                    event,
                                ) =>
                                    updateField(
                                        "stock",
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                placeholder="0"
                                disabled={
                                    isSubmitting
                                }
                                className={
                                    inputClass
                                }
                                style={
                                    inputStyle
                                }
                            />
                        </FormField>

                        {/* WEIGHT */}

                        <FormField label="Weight (gram)">
                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={
                                    form.weightGram
                                }
                                onChange={(
                                    event,
                                ) =>
                                    updateField(
                                        "weightGram",
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                placeholder="Optional"
                                disabled={
                                    isSubmitting
                                }
                                className={
                                    inputClass
                                }
                                style={
                                    inputStyle
                                }
                            />

                            <p
                                className="mt-1.5 text-[10.5px]"
                                style={{
                                    color:
                                        "var(--c-muted)",
                                }}
                            >
                                Optional. Leave empty if the product does not require shipping weight.
                            </p>
                        </FormField>

                        {/* IMAGE */}

                        <div className="sm:col-span-2">
                            <FormField label="Product Image">
                                <div
                                    className="rounded-xl p-4"
                                    style={{
                                        border:
                                            "1px solid var(--c-border)",

                                        background:
                                            "var(--c-surface2)",
                                    }}
                                >
                                    {imagePreview ? (
                                        <div className="flex items-start gap-4">
                                            <img
                                                src={
                                                    imagePreview
                                                }
                                                alt={
                                                    form.name ||
                                                    "Product"
                                                }
                                                className="h-28 w-28 rounded-xl object-cover"
                                            />

                                            <div className="flex flex-col gap-2">
                                                <span
                                                    className="text-xs"
                                                    style={{
                                                        color:
                                                            "var(--c-muted)",
                                                    }}
                                                >
                                                    {imageFile
                                                        ? imageFile.name
                                                        : "Current product image"}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={
                                                        handleRemoveImage
                                                    }
                                                    disabled={
                                                        isSubmitting
                                                    }
                                                    className="inline-flex w-fit items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium"
                                                    style={{
                                                        background:
                                                            "rgba(239,68,68,0.1)",

                                                        color:
                                                            "var(--c-red)",

                                                        border:
                                                            "1px solid rgba(239,68,68,0.2)",
                                                    }}
                                                >
                                                    <Trash2
                                                        size={
                                                            13
                                                        }
                                                    />

                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label
                                            className="flex cursor-pointer flex-col items-center justify-center rounded-xl px-6 py-8 text-center"
                                            style={{
                                                border:
                                                    "1px dashed var(--c-border)",
                                            }}
                                        >
                                            <div
                                                className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg"
                                                style={{
                                                    background:
                                                        "var(--c-surface)",

                                                    color:
                                                        "var(--c-muted)",
                                                }}
                                            >
                                                <Upload
                                                    size={
                                                        18
                                                    }
                                                />
                                            </div>

                                            <p
                                                className="text-sm font-medium"
                                                style={{
                                                    color:
                                                        "var(--c-text)",
                                                }}
                                            >
                                                Upload product image
                                            </p>

                                            <p
                                                className="mt-1 text-xs"
                                                style={{
                                                    color:
                                                        "var(--c-muted)",
                                                }}
                                            >
                                                JPG, PNG, WEBP up to 5MB
                                            </p>

                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp,image/gif"
                                                onChange={
                                                    handleImageChange
                                                }
                                                disabled={
                                                    isSubmitting
                                                }
                                                className="hidden"
                                            />
                                        </label>
                                    )}

                                    {imagePreview && (
                                        <label
                                            className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium"
                                            style={{
                                                border:
                                                    "1px solid var(--c-border)",

                                                color:
                                                    "var(--c-muted)",

                                                background:
                                                    "var(--c-surface)",
                                            }}
                                        >
                                            <ImageIcon
                                                size={
                                                    13
                                                }
                                            />

                                            Change image

                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp,image/gif"
                                                onChange={
                                                    handleImageChange
                                                }
                                                disabled={
                                                    isSubmitting
                                                }
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                            </FormField>
                        </div>

                        {/* DESCRIPTION */}

                        <div className="sm:col-span-2">
                            <FormField label="Description">
                                <textarea
                                    value={
                                        form.description
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        updateField(
                                            "description",
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    placeholder="Describe your product..."
                                    rows={4}
                                    disabled={
                                        isSubmitting
                                    }
                                    className={`${inputClass} resize-none`}
                                    style={{
                                        ...inputStyle,
                                        minHeight: 110,
                                    }}
                                />
                            </FormField>
                        </div>

                        {/* ACTIVE */}

                        <div className="sm:col-span-2">
                            <label
                                className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition"
                                style={{
                                    background:
                                        "var(--c-surface2)",

                                    border:
                                        "1px solid var(--c-border)",
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={
                                        form.isActive
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        updateField(
                                            "isActive",
                                            event
                                                .target
                                                .checked,
                                        )
                                    }
                                    disabled={
                                        isSubmitting
                                    }
                                    className="h-4 w-4"
                                />

                                <div>
                                    <p
                                        style={{
                                            margin: 0,
                                            fontSize: 12.5,
                                            fontWeight: 600,
                                            color:
                                                "var(--c-text)",
                                        }}
                                    >
                                        Active product
                                    </p>

                                    <p
                                        style={{
                                            margin:
                                                "3px 0 0",
                                            fontSize: 10.5,
                                            color:
                                                "var(--c-muted)",
                                        }}
                                    >
                                        Product can be displayed and used when active.
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* FOOTER */}

                    <div
                        className="flex items-center justify-end gap-3 px-6 py-4"
                        style={{
                            borderTop:
                                "1px solid var(--c-border)",

                            background:
                                "var(--c-surface2)",
                        }}
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={
                                isSubmitting
                            }
                            className="rounded-lg px-4 py-2.5 text-sm font-medium transition"
                            style={{
                                border:
                                    "1px solid var(--c-border)",

                                background:
                                    "var(--c-surface)",

                                color:
                                    "var(--c-muted)",

                                cursor:
                                    isSubmitting
                                        ? "not-allowed"
                                        : "pointer",

                                opacity:
                                    isSubmitting
                                        ? 0.6
                                        : 1,
                            }}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={
                                isSubmitting
                            }
                            className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition"
                            style={{
                                background:
                                    "var(--c-accent)",

                                color: "#fff",

                                border:
                                    "none",

                                cursor:
                                    isSubmitting
                                        ? "not-allowed"
                                        : "pointer",

                                opacity:
                                    isSubmitting
                                        ? 0.65
                                        : 1,
                            }}
                        >
                            {isSubmitting && (
                                <Loader2
                                    size={15}
                                    className="animate-spin"
                                />
                            )}

                            {uploadingImage
                                ? "Uploading..."
                                : isEdit
                                    ? "Save Changes"
                                    : "Create Product"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function FormField({
    label,
    required = false,
    children,
}: {
    label: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label
                className="mb-1.5 block"
                style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    color:
                        "var(--c-muted)",
                }}
            >
                {label}

                {required && (
                    <span
                        style={{
                            marginLeft: 4,
                            color:
                                "var(--c-red)",
                        }}
                    >
                        *
                    </span>
                )}
            </label>

            {children}
        </div>
    );
}