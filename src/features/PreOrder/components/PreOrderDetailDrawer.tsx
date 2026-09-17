import {
    Pencil,
    Trash2,
    X,
    Plus,
    Calendar,
    Play,
    Pause,
    CheckSquare,
    Globe,
    Copy,
    ExternalLink,
    Link2,
    Share2,
    Info,
    Check,
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

import type { PreOrder, PreOrderItem } from "@/features/PreOrder/types/preorder.type";
import { SecureImage } from "@/components/ui/SecureImage";
import { useAuth } from "@/features/Auth/hooks/useAuth";

interface PreOrderDetailDrawerProps {
    preOrder: PreOrder | null;
    onClose: () => void;
    onEdit: (preOrder: PreOrder) => void;

    // Status actions
    onPublish?: (preOrder: PreOrder) => void;
    onClosePreOrder?: (preOrder: PreOrder) => void;

    // Item actions
    onAddItem?: (preOrderId: string) => void;
    onEditItem?: (item: PreOrderItem) => void;
    onDeleteItem?: (item: PreOrderItem) => void;
}

export default function PreOrderDetailDrawer({
    preOrder,
    onClose,
    onEdit,
    onPublish,
    onClosePreOrder,
    onAddItem,
    onEditItem,
    onDeleteItem,
}: PreOrderDetailDrawerProps) {
    const { user } = useAuth();
    const [copied, setCopied] = useState(false);

    if (!preOrder) return null;

    const publicLink = user?.store?.slug
        ? `${window.location.origin}/p/${user.store.slug}/${preOrder.slug}`
        : null;

    const handleCopyLink = () => {
        if (!publicLink) return;
        navigator.clipboard.writeText(publicLink);
        setCopied(true);
        toast.success("Link berhasil disalin!");
        setTimeout(() => setCopied(false), 2000);
    };

    const formatPrice = (value: number | string | null | undefined) => {
        if (value === null || value === undefined) return "—";
        return `Rp ${Number(value).toLocaleString("id-ID")}`;
    };

    return (
        <>
            <div
                onClick={onClose}
                className="fixed inset-0 z-[90]"
                style={{ background: "rgba(0,0,0,0.25)" }}
            />

            <div
                className="fixed bottom-0 right-0 top-0 z-[100] flex w-full max-w-[460px] flex-col overflow-y-auto"
                style={{
                    background: "var(--c-surface)",
                    borderLeft: "1px solid var(--c-border)",
                    boxShadow: "-12px 0 50px rgba(0,0,0,0.2)",
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b p-6" style={{ borderColor: "var(--c-border)" }}>
                    <div>
                        <div className="mb-1 font-mono text-xs font-semibold" style={{ color: "var(--c-accent)" }}>
                            PREORDER
                        </div>
                        <h2 className="text-xl font-bold" style={{ color: "var(--c-text)" }}>
                            {preOrder.name}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 transition hover:bg-slate-100"
                        style={{ color: "var(--c-dim)" }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Banner & Actions */}
                <div className="p-6">
                    <div className="mb-6 flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-slate-100" style={{ border: "1px solid var(--c-border)" }}>
                        {preOrder.bannerUrl ? (
                            <SecureImage src={preOrder.bannerUrl} alt={preOrder.name} className="h-full w-full object-cover" />
                        ) : (
                            <Calendar size={32} className="text-slate-300" />
                        )}
                    </div>

                    <div className="mb-6 grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => onEdit(preOrder)}
                            className="flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-medium transition"
                            style={{ background: "var(--c-surface2)", color: "var(--c-text)", border: "1px solid var(--c-border)" }}
                        >
                            <Pencil size={14} /> Edit PreOrder
                        </button>

                        {preOrder.status === "DRAFT" && onPublish && (
                            <button
                                type="button"
                                onClick={() => onPublish(preOrder)}
                                className="flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-medium text-white transition"
                                style={{ background: "var(--c-accent)" }}
                            >
                                <Globe size={14} /> Publish
                            </button>
                        )}

                        {(preOrder.status === "ACTIVE") && user?.store?.slug && (
                            <button
                                type="button"
                                onClick={() => {
                                    const link = `${window.location.origin}/p/${user.store?.slug}/${preOrder.slug}`;
                                    navigator.clipboard.writeText(link);
                                    toast.success("Link berhasil disalin!");
                                }}
                                className="flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-medium text-white transition"
                                style={{ background: "var(--c-accent)" }}
                            >
                                <Copy size={14} /> Copy Link
                            </button>
                        )}

                        {["ACTIVE"].includes(preOrder.status) && (
                            <button
                                type="button"
                                onClick={() => onClosePreOrder?.(preOrder)}
                                className="col-span-2 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-medium transition"
                                style={{ background: "var(--c-red-bg)", color: "var(--c-red)", border: "1px solid rgba(239, 68, 68, 0.2)" }}
                            >
                                <CheckSquare size={14} /> Close PreOrder
                            </button>
                        )}
                    </div>

                    {/* Info Grid */}
                    <div className="mb-8 grid grid-cols-2 gap-y-5">
                        <InfoItem label="Status" value={preOrder.status} />
                        <InfoItem label="Total Items" value={preOrder.items.length.toString()} />
                        <InfoItem label="Starts At" value={format(new Date(preOrder.startsAt), "dd MMM yyyy HH:mm")} />
                        <InfoItem label="Ends At" value={format(new Date(preOrder.endsAt), "dd MMM yyyy HH:mm")} />
                        <InfoItem label="Order Limit" value={preOrder.orderLimit ? String(preOrder.orderLimit) : "No Limit"} />
                    </div>

                    {/* Seller Info Card */}
                    {publicLink && preOrder.status === "ACTIVE" && (
                        <div
                            className="mb-8 rounded-xl p-4"
                            style={{
                                background: "linear-gradient(135deg, var(--c-accent-bg), var(--c-surface2))",
                                border: "1px solid var(--c-border)",
                            }}
                        >
                            <div className="mb-3 flex items-center gap-2">
                                <div
                                    className="flex h-7 w-7 items-center justify-center rounded-lg"
                                    style={{ background: "var(--c-accent)", color: "#fff" }}
                                >
                                    <Share2 size={13} />
                                </div>
                                <h4 className="text-xs font-bold" style={{ color: "var(--c-text)" }}>
                                    Bagikan ke Pelanggan
                                </h4>
                            </div>

                            {/* Link display */}
                            <div
                                className="mb-3 flex items-center gap-2 rounded-lg p-2.5"
                                style={{
                                    background: "var(--c-surface)",
                                    border: "1px solid var(--c-border)",
                                }}
                            >
                                <Link2 size={13} style={{ color: "var(--c-accent)", flexShrink: 0 }} />
                                <span
                                    className="flex-1 truncate font-mono text-[11px]"
                                    style={{ color: "var(--c-text)" }}
                                    title={publicLink}
                                >
                                    {publicLink}
                                </span>
                            </div>

                            {/* Action buttons */}
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={handleCopyLink}
                                    className="flex items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-semibold transition"
                                    style={{
                                        background: copied ? "var(--c-green)" : "var(--c-accent)",
                                        color: "#fff",
                                    }}
                                >
                                    {copied ? <Check size={12} /> : <Copy size={12} />}
                                    {copied ? "Tersalin!" : "Salin Link"}
                                </button>
                                <a
                                    href={publicLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-semibold transition no-underline"
                                    style={{
                                        background: "var(--c-surface)",
                                        color: "var(--c-text)",
                                        border: "1px solid var(--c-border)",
                                    }}
                                >
                                    <ExternalLink size={12} />
                                    Buka Preview
                                </a>
                            </div>

                            {/* Helpful tip */}
                            <div className="mt-3 flex gap-2 rounded-lg p-2.5" style={{ background: "rgba(89,96,232,0.06)" }}>
                                <Info size={13} style={{ color: "var(--c-accent)", flexShrink: 0, marginTop: 1 }} />
                                <p className="text-[10.5px] leading-relaxed" style={{ color: "var(--c-muted)" }}>
                                    Bagikan link ini ke pelanggan Anda. Pelanggan bisa langsung memilih produk dan melakukan pemesanan (checkout) langsung di website ini.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Seller Info - Draft/Upcoming */}
                    {(!publicLink || preOrder.status !== "ACTIVE") && (
                        <div
                            className="mb-8 flex items-start gap-2.5 rounded-xl p-3.5"
                            style={{
                                background: "var(--c-amber-bg)",
                                border: "1px solid rgba(222,149,96,0.15)",
                            }}
                        >
                            <Info size={14} style={{ color: "var(--c-amber)", flexShrink: 0, marginTop: 1 }} />
                            <p className="text-[11px] leading-relaxed" style={{ color: "var(--c-amber)" }}>
                                {preOrder.status === "DRAFT"
                                    ? "Publish PreOrder ini terlebih dahulu untuk mendapatkan link yang bisa dibagikan ke pelanggan."
                                    : preOrder.status === "CLOSED" || preOrder.status === "EXPIRED"
                                        ? "PreOrder ini sudah ditutup. Link tidak bisa diakses pelanggan."
                                        : "PreOrder belum aktif. Tunggu sampai waktu mulai untuk mendapatkan link aktif."}
                            </p>
                        </div>
                    )}

                    {/* PreOrder Items */}
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-bold" style={{ color: "var(--c-text)" }}>
                                Included Products
                            </h3>
                            <button
                                type="button"
                                onClick={() => onAddItem?.(preOrder.id)}
                                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition hover:bg-slate-100"
                                style={{ color: "var(--c-accent)" }}
                            >
                                <Plus size={13} /> Add Product
                            </button>
                        </div>

                        {preOrder.items.length === 0 ? (
                            <div className="rounded-xl border border-dashed py-8 text-center" style={{ borderColor: "var(--c-border)" }}>
                                <p className="text-sm font-medium" style={{ color: "var(--c-muted)" }}>
                                    No products added yet.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {preOrder.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="group relative flex items-center gap-3 rounded-xl border p-3 transition hover:shadow-sm"
                                        style={{ borderColor: "var(--c-border)", background: "var(--c-surface)" }}
                                    >
                                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                                            {item.product?.imageUrl && (
                                                <SecureImage src={item.product.imageUrl} alt={item.product.name} className="h-full w-full object-cover" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="truncate text-sm font-medium" style={{ color: "var(--c-text)" }}>
                                                {item.product?.name}
                                            </p>
                                            <div className="mt-1 flex items-center gap-2 text-xs" style={{ color: "var(--c-dim)" }}>
                                                {item.variant && <span className="font-medium">{item.variant.name} • </span>}
                                                <span className="font-medium" style={{ color: "var(--c-green)" }}>{formatPrice(item.price)}</span>
                                                {item.stockLimit && <span>• Limit: {item.stockLimit}</span>}
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 opacity-0 transition group-hover:opacity-100">
                                            <button
                                                type="button"
                                                onClick={() => onEditItem?.(item)}
                                                className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onDeleteItem?.(item)}
                                                className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function InfoItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className="mb-1 text-[10.5px] font-medium uppercase tracking-wider" style={{ color: "var(--c-muted)" }}>
                {label}
            </div>
            <div className="text-sm font-medium" style={{ color: "var(--c-text)" }}>
                {value}
            </div>
        </div>
    );
}
