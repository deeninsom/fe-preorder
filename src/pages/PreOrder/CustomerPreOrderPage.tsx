import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Clock, MapPin, Package, ShoppingBag, ArrowLeft, CheckCircle2, ChevronRight, User, Phone, MapPin as MapPinIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

import { preorderApi } from "@/features/PreOrder/api/preorder.api";
import { SecureImage } from "@/components/ui/SecureImage";

interface PublicProduct {
    id: string;
    name: string;
    slug: string;
    description?: string;
    price: string;
    stock: number;
    imageUrl?: string;
    variants: {
        id: string;
        name: string;
        price?: string;
        stock: number;
    }[];
}

interface PublicStore {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
}

interface PublicPreOrder {
    id: string;
    name: string;
    slug: string;
    description?: string;
    bannerUrl?: string;
    startsAt: string;
    endsAt: string;
    orderLimit?: number;
    status: string;
}

function formatPrice(value: string | number): string {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
}

type CheckoutStep = "CART" | "CHECKOUT" | "SUCCESS";

export default function CustomerPreOrderPage() {
    const { storeSlug, poSlug } = useParams<{ storeSlug: string; poSlug: string }>();
    const [store, setStore] = useState<PublicStore | null>(null);
    const [preOrder, setPreOrder] = useState<PublicPreOrder | null>(null);
    const [products, setProducts] = useState<PublicProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProducts, setSelectedProducts] = useState<Map<string, { qty: number; variantId?: string }>>(new Map());

    // Checkout Flow State
    const [step, setStep] = useState<CheckoutStep>("CART");
    const [customerForm, setCustomerForm] = useState({ name: "", phone: "", address: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);

    useEffect(() => {
        if (!storeSlug || !poSlug) return;
        let cancelled = false;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await preorderApi.getPublicPreOrder(storeSlug, poSlug);
                if (cancelled) return;
                setStore(data.store);
                setPreOrder(data.preOrder);
                setProducts(data.products);
            } catch (err: any) {
                if (cancelled) return;
                setError(err?.response?.data?.message ?? "PreOrder tidak ditemukan.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchData();
        return () => { cancelled = true; };
    }, [storeSlug, poSlug]);

    const toggleProduct = (productId: string, variantId?: string) => {
        setSelectedProducts((prev) => {
            const next = new Map(prev);
            const key = variantId ? `${productId}__${variantId}` : productId;
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.set(key, { qty: 1, variantId });
            }
            return next;
        });
    };

    const updateQty = (productId: string, qty: number, variantId?: string) => {
        if (qty < 1) return;
        setSelectedProducts((prev) => {
            const next = new Map(prev);
            const key = variantId ? `${productId}__${variantId}` : productId;
            next.set(key, { qty, variantId });
            return next;
        });
    };

    const totalAmount = (): number => {
        let total = 0;
        selectedProducts.forEach(({ qty, variantId }, key) => {
            const productId = key.split("__")[0];
            const product = products.find((p) => p.id === productId);
            if (!product) return;
            let price = parseFloat(product.price);
            if (variantId) {
                const variant = product.variants.find((v) => v.id === variantId);
                if (variant?.price) price = parseFloat(variant.price);
            }
            total += price * qty;
        });
        return total;
    };

    const handleCheckoutSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!storeSlug || !poSlug) return;

        setIsSubmitting(true);
        try {
            // Build order payload
            const orderItems = Array.from(selectedProducts.entries()).map(([key, { qty, variantId }]) => {
                const productId = key.split("__")[0];
                return { productId, variantId, quantity: qty };
            });

            const payload = {
                customer: customerForm,
                items: orderItems,
                total: totalAmount(),
            };

            const response: any = await preorderApi.submitPublicOrder(storeSlug, poSlug, payload);
            setOrderId(response.orderId || "ORD-SUCCESS");
            setStep("SUCCESS");
        } catch (err: any) {
            alert(err?.message || "Terjadi kesalahan saat membuat pesanan.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[var(--c-accent)]" />
                    <span className="text-sm font-medium text-gray-500">Memuat katalog...</span>
                </div>
            </div>
        );
    }

    if (error || !preOrder || !store) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-5 bg-gray-50 p-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-xl shadow-gray-200/50">
                    <Package size={32} className="text-red-500" />
                </div>
                <div className="text-center">
                    <h1 className="text-xl font-bold text-gray-900">PreOrder Tidak Ditemukan</h1>
                    <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
                        {error ?? "Link ini mungkin sudah kadaluarsa atau PreOrder telah ditutup."}
                    </p>
                </div>
            </div>
        );
    }

    const isUpcoming = preOrder.status === "UPCOMING";
    const now = new Date();
    const startsAt = new Date(preOrder.startsAt);
    const endsAt = new Date(preOrder.endsAt);
    const isExpired = now > endsAt;

    // --- SUCCESS VIEW ---
    if (step === "SUCCESS") {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
                <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl shadow-[var(--c-accent)]/10 ring-1 ring-gray-100">
                    <div className="flex flex-col items-center p-10 text-center">
                        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--c-green-bg)]">
                            <CheckCircle2 size={48} style={{ color: "var(--c-green)" }} />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Pesanan Berhasil!</h1>
                        <p className="mt-3 text-sm leading-relaxed text-gray-500">
                            Terima kasih <strong>{customerForm.name}</strong>, pesanan Anda telah kami terima dan sedang diproses oleh {store.name}.
                        </p>
                        
                        <div className="mt-8 w-full rounded-2xl bg-gray-50 p-5 text-left border border-gray-100">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Order ID</p>
                            <p className="mt-1 font-mono text-lg font-bold text-[var(--c-accent)]">{orderId}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- CHECKOUT VIEW ---
    if (step === "CHECKOUT") {
        return (
            <div className="min-h-screen bg-gray-50 pb-32">
                <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-xl">
                    <div className="mx-auto flex max-w-2xl items-center gap-4">
                        <button onClick={() => setStep("CART")} className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200">
                            <ArrowLeft size={18} />
                        </button>
                        <h1 className="text-lg font-bold text-gray-900">Checkout Pesanan</h1>
                    </div>
                </header>

                <main className="mx-auto mt-6 max-w-2xl px-6">
                    <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200">
                        {/* Order Summary */}
                        <div className="border-b border-gray-100 bg-gray-50/50 p-6">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Ringkasan Pesanan</h3>
                            <div className="mt-4 divide-y divide-gray-100">
                                {Array.from(selectedProducts.entries()).map(([key, { qty, variantId }]) => {
                                    const productId = key.split("__")[0];
                                    const product = products.find((p) => p.id === productId);
                                    if (!product) return null;
                                    let price = parseFloat(product.price);
                                    let label = product.name;
                                    if (variantId) {
                                        const variant = product.variants.find((v) => v.id === variantId);
                                        if (variant) {
                                            label += ` (${variant.name})`;
                                            if (variant.price) price = parseFloat(variant.price);
                                        }
                                    }
                                    return (
                                        <div key={key} className="flex items-center justify-between py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-600">
                                                    {qty}x
                                                </div>
                                                <p className="text-sm font-medium text-gray-900">{label}</p>
                                            </div>
                                            <p className="text-sm font-bold text-gray-900">{formatPrice(price * qty)}</p>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                                <p className="font-medium text-gray-600">Total Harga</p>
                                <p className="text-lg font-bold text-[var(--c-accent)]">{formatPrice(totalAmount())}</p>
                            </div>
                        </div>

                        {/* Customer Form */}
                        <form onSubmit={handleCheckoutSubmit} className="p-6">
                            <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-gray-500">Informasi Penerima</h3>
                            <div className="grid gap-5">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Nama Lengkap</label>
                                    <div className="relative">
                                        <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            required
                                            type="text"
                                            value={customerForm.name}
                                            onChange={(e) => setCustomerForm(prev => ({...prev, name: e.target.value}))}
                                            className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm font-medium text-gray-900 outline-none transition focus:border-[var(--c-accent)] focus:ring-1 focus:ring-[var(--c-accent)]"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Nomor WhatsApp</label>
                                    <div className="relative">
                                        <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            required
                                            type="tel"
                                            value={customerForm.phone}
                                            onChange={(e) => setCustomerForm(prev => ({...prev, phone: e.target.value}))}
                                            className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm font-medium text-gray-900 outline-none transition focus:border-[var(--c-accent)] focus:ring-1 focus:ring-[var(--c-accent)]"
                                            placeholder="081234567890"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Alamat Pengiriman</label>
                                    <div className="relative">
                                        <MapPinIcon size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                                        <textarea
                                            required
                                            rows={3}
                                            value={customerForm.address}
                                            onChange={(e) => setCustomerForm(prev => ({...prev, address: e.target.value}))}
                                            className="w-full resize-none rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm font-medium text-gray-900 outline-none transition focus:border-[var(--c-accent)] focus:ring-1 focus:ring-[var(--c-accent)]"
                                            placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                                style={{ background: "var(--c-accent)" }}
                            >
                                {isSubmitting ? (
                                    <><Loader2 size={18} className="animate-spin" /> Memproses...</>
                                ) : (
                                    <>Kirim Pesanan Sekarang</>
                                )}
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        );
    }

    // --- CART / MAIN VIEW ---
    return (
        <div className="min-h-screen bg-gray-50 pb-32 selection:bg-[var(--c-accent)] selection:text-white">
            {/* Header */}
            <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-xl transition-all">
                <div className="mx-auto flex max-w-5xl items-center gap-4">
                    {store.logoUrl ? (
                        <SecureImage src={store.logoUrl} alt={store.name} className="h-10 w-10 rounded-xl object-cover shadow-sm ring-1 ring-gray-100" />
                    ) : (
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm"
                            style={{ background: "linear-gradient(135deg, var(--c-accent), #8a81eb)" }}
                        >
                            {store.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <h1 className="truncate text-base font-bold text-gray-900">{store.name}</h1>
                        <p className="text-xs text-gray-500">Official Store</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span
                            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide"
                            style={{
                                background: isUpcoming ? "var(--c-amber-bg)" : isExpired ? "var(--c-red-bg)" : "var(--c-green-bg)",
                                color: isUpcoming ? "var(--c-amber)" : isExpired ? "var(--c-red)" : "var(--c-green)",
                            }}
                        >
                            <span className="relative flex h-2 w-2">
                                {!isExpired && !isUpcoming && (
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: "var(--c-green)" }}></span>
                                )}
                                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "currentColor" }}></span>
                            </span>
                            {isUpcoming ? "Segera Hadir" : isExpired ? "Berakhir" : "Aktif"}
                        </span>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-6 pt-8">
                {/* Banner & Info */}
                <div className="mb-10 overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-gray-200">
                    {preOrder.bannerUrl && (
                        <SecureImage
                            src={preOrder.bannerUrl}
                            alt={preOrder.name}
                            className="h-56 w-full object-cover sm:h-72"
                        />
                    )}
                    <div className="p-8 sm:p-10">
                        <h2 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
                            {preOrder.name}
                        </h2>
                        {preOrder.description && (
                            <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
                                {preOrder.description}
                            </p>
                        )}
                        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-6">
                            <div className="flex items-center gap-2 rounded-2xl bg-gray-50 px-4 py-2.5 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                                <Clock size={15} className="text-[var(--c-accent)]" />
                                {format(startsAt, "dd MMM", { locale: localeId })} — {format(endsAt, "dd MMM yyyy", { locale: localeId })}
                            </div>
                            {preOrder.orderLimit && (
                                <div className="flex items-center gap-2 rounded-2xl bg-gray-50 px-4 py-2.5 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                                    <ShoppingBag size={15} className="text-[var(--c-accent)]" />
                                    Maks. {preOrder.orderLimit} order
                                </div>
                            )}
                            <div className="flex items-center gap-2 rounded-2xl bg-gray-50 px-4 py-2.5 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                                <Package size={15} className="text-[var(--c-accent)]" />
                                {products.length} produk
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="mb-6 flex items-end justify-between">
                    <div>
                        <h3 className="text-lg font-black tracking-tight text-gray-900">Katalog Produk</h3>
                        <p className="text-sm text-gray-500">Pilih produk yang ingin Anda pesan</p>
                    </div>
                </div>

                {products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-4 rounded-[2rem] bg-white py-20 ring-1 ring-gray-200">
                        <Package size={48} className="text-gray-300" />
                        <p className="text-sm font-medium text-gray-500">Belum ada produk tersedia.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {products.map((product) => {
                            const hasVariants = product.variants.length > 0;

                            return (
                                <div
                                    key={product.id}
                                    className="group flex flex-col overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-xl hover:shadow-[var(--c-accent)]/10 hover:ring-[var(--c-accent)]/30"
                                >
                                    <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
                                        {product.imageUrl ? (
                                            <SecureImage
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <Package size={48} className="text-gray-300" />
                                            </div>
                                        )}
                                        {product.stock <= 0 && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                                                <span className="rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white shadow-lg">Habis Terjual</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-1 flex-col p-6">
                                        <h4 className="text-lg font-bold text-gray-900">{product.name}</h4>
                                        {product.description && (
                                            <p className="mt-2 text-sm leading-relaxed text-gray-500 line-clamp-2">
                                                {product.description}
                                            </p>
                                        )}

                                        <div className="mt-4 flex items-center gap-3">
                                            <span className="text-xl font-black text-[var(--c-accent)]">
                                                {formatPrice(product.price)}
                                            </span>
                                        </div>

                                        {/* Variants */}
                                        {hasVariants && (
                                            <div className="mt-6 grid gap-2">
                                                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Pilih Varian</p>
                                                {product.variants.map((v) => {
                                                    const key = `${product.id}__${v.id}`;
                                                    const isSelected = selectedProducts.has(key);
                                                    return (
                                                        <div key={v.id} className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleProduct(product.id, v.id)}
                                                                className="flex flex-1 items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-all"
                                                                style={{
                                                                    background: isSelected ? "var(--c-accent-bg)" : "#f9fafb",
                                                                    border: `1px solid ${isSelected ? "var(--c-accent)" : "#f3f4f6"}`,
                                                                    color: isSelected ? "var(--c-accent)" : "#374151",
                                                                    fontWeight: isSelected ? 700 : 500,
                                                                }}
                                                            >
                                                                <span className="flex-1 text-left">{v.name}</span>
                                                                {v.price && <span className="opacity-80">{formatPrice(v.price)}</span>}
                                                            </button>
                                                            {isSelected && (
                                                                <div className="flex items-center gap-2 rounded-2xl bg-gray-50 p-1 ring-1 ring-gray-200">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => updateQty(product.id, (selectedProducts.get(key)?.qty ?? 1) - 1, v.id)}
                                                                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-gray-600 shadow-sm transition hover:bg-gray-100"
                                                                    >
                                                                        −
                                                                    </button>
                                                                    <span className="w-6 text-center text-sm font-bold text-gray-900">
                                                                        {selectedProducts.get(key)?.qty ?? 1}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => updateQty(product.id, (selectedProducts.get(key)?.qty ?? 1) + 1, v.id)}
                                                                        className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm transition hover:opacity-90"
                                                                        style={{ background: "var(--c-accent)" }}
                                                                    >
                                                                        +
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* For products without variants */}
                                        {!hasVariants && product.stock > 0 && (
                                            <div className="mt-6 flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleProduct(product.id)}
                                                    className="flex-1 rounded-2xl py-3.5 text-sm font-bold transition-all"
                                                    style={{
                                                        background: selectedProducts.has(product.id) ? "var(--c-accent)" : "#f9fafb",
                                                        color: selectedProducts.has(product.id) ? "#fff" : "#374151",
                                                        border: `1px solid ${selectedProducts.has(product.id) ? "var(--c-accent)" : "#e5e7eb"}`,
                                                    }}
                                                >
                                                    {selectedProducts.has(product.id) ? "✓ Dipilih" : "Tambah ke Keranjang"}
                                                </button>
                                                {selectedProducts.has(product.id) && (
                                                    <div className="flex items-center gap-2 rounded-2xl bg-gray-50 p-1 ring-1 ring-gray-200">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQty(product.id, (selectedProducts.get(product.id)?.qty ?? 1) - 1)}
                                                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-600 shadow-sm transition hover:bg-gray-100"
                                                        >
                                                            −
                                                        </button>
                                                        <span className="w-6 text-center text-sm font-bold text-gray-900">
                                                            {selectedProducts.get(product.id)?.qty ?? 1}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQty(product.id, (selectedProducts.get(product.id)?.qty ?? 1) + 1)}
                                                            className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm transition hover:opacity-90"
                                                            style={{ background: "var(--c-accent)" }}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Sticky Bottom Checkout Bar */}
            {selectedProducts.size > 0 && (
                <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/90 px-6 py-5 backdrop-blur-xl transition-all">
                    <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                {selectedProducts.size} item dipilih
                            </p>
                            <p className="text-xl font-black text-gray-900">
                                {formatPrice(totalAmount())}
                            </p>
                        </div>
                        <button
                            onClick={() => setStep("CHECKOUT")}
                            className="flex items-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-[var(--c-accent)]/20 transition hover:opacity-90"
                            style={{ background: "var(--c-accent)" }}
                        >
                            Lanjut Checkout
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

