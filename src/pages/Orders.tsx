import { useState } from "react";
import { Search, Plus, Download, X, ChevronRight, Package, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { orders as initialOrders, type Order, type OrderStatus } from "@/data/data";
import { useNotification } from "@/contexts/NotificationContext";

const TABS: { label: string; value: OrderStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Packed", value: "PACKED" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Hold", value: "HOLD" },
];

const statusColor: Record<string, string> = {
  PROCESSING: "var(--c-accent)", PACKED: "var(--c-cyan)", SHIPPED: "var(--c-green)",
  DELIVERED: "var(--c-green)", HOLD: "var(--c-amber)",
};
const priorityColor: Record<string, string> = {
  HIGH: "var(--c-red)", STD: "var(--c-muted)", LOW: "var(--c-dim)",
};

export default function Orders() {
  const [ordersData, setOrdersData] = useState<Order[]>(initialOrders);
  const [tab, setTab] = useState<OrderStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [editing, setEditing] = useState<Order | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Order | null>(null);
  const [showNew, setShowNew] = useState(false);
  const { success, warning, info, error: toastError } = useNotification();

  const filtered = ordersData.filter((o) => {
    if (tab !== "ALL" && o.status !== tab) return false;
    if (search && !o.id.toLowerCase().includes(search.toLowerCase()) && !o.customer.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleExport = () => warning("Exporting orders", "CSV will download in a moment.");
  const handleNewOrder = () => {
    const newOrder: Order = {
      id: `ORD-${48292 + ordersData.length - initialOrders.length}`,
      customer: "New Customer",
      items: 0, value: 0, priority: "STD", status: "PROCESSING",
      eta: "TBD", region: "—", carrier: "—", created: "Sep 10", sku: [],
    };
    setOrdersData((prev) => [newOrder, ...prev]);
    setShowNew(false);
    success("Order created", `${newOrder.id} has been added to the queue.`);
  };
  const handleDelete = () => {
    if (!deleteConfirm) return;
    setOrdersData((prev) => prev.filter((o) => o.id !== deleteConfirm.id));
    setSelected(null);
    setDeleteConfirm(null);
    info("Order deleted", `${deleteConfirm.id} has been removed.`);
  };
  const handleSaveEdit = () => {
    if (!editing) return;
    setOrdersData((prev) => prev.map((o) => (o.id === editing.id ? editing : o)));
    if (selected?.id === editing.id) setSelected(editing);
    setEditing(null);
    success("Order updated", `${editing.id} has been saved.`);
  };

  return (
    <div className="p-4 md:p-5 flex flex-col gap-4 overflow-x-hidden">
      {/* header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--c-text)", margin: 0, letterSpacing: "-0.5px" }}>Orders</h1>
          <p style={{ fontSize: 11.5, color: "var(--c-muted)", margin: "3px 0 0", fontFamily: "JetBrains Mono, monospace" }}>
            {filtered.length} orders · Sep 10, 2026
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleExport} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", fontSize: 12.5, cursor: "pointer", color: "var(--c-muted)" }}>
            <Download size={13} /> Export
          </button>
          <button onClick={() => setShowNew(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "var(--c-accent)", color: "#fff", fontSize: 12.5, fontWeight: 600, border: "none", cursor: "pointer" }}>
            <Plus size={13} /> New Order
          </button>
        </div>
      </div>

      {/* tabs + search */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: "10px 14px", gap: 16 }}>
        <div style={{ display: "flex", gap: 4 }}>
          {TABS.map((t) => {
            const count = t.value === "ALL" ? ordersData.length : ordersData.filter((o) => o.status === t.value).length;
            return (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                style={{ padding: "5px 12px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, background: tab === t.value ? "var(--c-accent-bg)" : "transparent", color: tab === t.value ? "var(--c-accent)" : "var(--c-muted)" }}
              >
                {t.label} <span style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", opacity: 0.7 }}>{count}</span>
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface2)", minWidth: 220 }}>
          <Search size={13} color="var(--c-dim)" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders or customers…"
            style={{ background: "none", border: "none", outline: "none", fontSize: 12.5, color: "var(--c-text)", flex: 1 }}
          />
          {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-dim)", display: "flex" }}><X size={12} /></button>}
        </div>
      </div>

      {/* table */}
      <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, overflow: "hidden", overflowX: "auto" }}>
        <div className="overflow-x-auto">
<table style={{ width: "100%", fontSize: 12.5, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--c-border2)" }}>
              {["Order ID", "Customer", "Region", "Items", "Value", "Priority", "Status", "Carrier", "ETA", "Actions"].map((h) => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontFamily: "JetBrains Mono, monospace", fontSize: 9.5, color: "var(--c-dim)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={10} style={{ padding: 32, textAlign: "center", color: "var(--c-dim)", fontSize: 13 }}>No orders match your filters.</td></tr>
            )}
            {filtered.map((o) => (
              <tr
                key={o.id}
                onClick={() => { setSelected(o); info("Order selected", o.id); }}
                style={{ borderBottom: "1px solid var(--c-border2)", cursor: "pointer", background: selected?.id === o.id ? "var(--c-accent-bg)" : "transparent" }}
              >
                <td style={{ padding: "10px 14px", fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "var(--c-accent)" }}>{o.id}</td>
                <td style={{ padding: "10px 14px", color: "var(--c-text)", maxWidth: 180, overflow: "hidden", overflowX: "auto", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.customer}</td>
                <td style={{ padding: "10px 14px", color: "var(--c-muted)", fontSize: 11.5 }}>{o.region}</td>
                <td style={{ padding: "10px 14px", fontFamily: "JetBrains Mono, monospace", color: "var(--c-muted)" }}>{o.items}</td>
                <td style={{ padding: "10px 14px", fontFamily: "JetBrains Mono, monospace", color: "var(--c-text)", fontWeight: 600 }}>${o.value.toLocaleString()}</td>
                <td style={{ padding: "10px 14px" }}>
                  <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9.5, padding: "2px 6px", borderRadius: 4, border: `1px solid ${priorityColor[o.priority]}`, color: priorityColor[o.priority] }}>{o.priority}</span>
                </td>
                <td style={{ padding: "10px 14px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 5, fontSize: 10.5, fontFamily: "JetBrains Mono, monospace", fontWeight: 500, background: `${statusColor[o.status]}18`, color: statusColor[o.status] }}>
                    {o.status}
                  </span>
                </td>
                <td style={{ padding: "10px 14px", color: "var(--c-muted)", fontSize: 11.5 }}>{o.carrier}</td>
                <td style={{ padding: "10px 14px", fontFamily: "JetBrains Mono, monospace", fontSize: 11.5, color: "var(--c-muted)" }}>{o.eta}</td>
                <td style={{ padding: "10px 14px" }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={(e) => { e.stopPropagation(); setEditing(o); }} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid var(--c-border)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-muted)" }}><Pencil size={11} /></button>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(o); }} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid var(--c-border)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-red)" }}><Trash2 size={11} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
</div>
      </div>

      {/* detail drawer */}
      {selected && (
        <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 380, background: "var(--c-surface)", borderLeft: "1px solid var(--c-border)", boxShadow: "-8px 0 40px rgba(0,0,0,0.15)", zIndex: 100, overflowY: "auto", padding: 24 }} className="fade-in">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: "var(--c-accent)", fontWeight: 600 }}>{selected.id}</div>
              <div style={{ fontSize: 11, color: "var(--c-dim)", marginTop: 2 }}>Created {selected.created}</div>
            </div>
            <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-dim)", display: "flex" }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <Row label="Customer" value={selected.customer} />
            <Row label="Region" value={selected.region} />
            <Row label="Carrier" value={selected.carrier} />
            <Row label="ETA" value={selected.eta} />
            <Row label="Items" value={String(selected.items)} />
            <Row label="Order Value" value={`$${selected.value.toLocaleString()}`} />

            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontFamily: "JetBrains Mono, monospace", fontWeight: 600, background: `${statusColor[selected.status]}18`, color: statusColor[selected.status] }}>{selected.status}</span>
              <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontFamily: "JetBrains Mono, monospace", border: `1px solid ${priorityColor[selected.priority]}`, color: priorityColor[selected.priority] }}>{selected.priority}</span>
            </div>

            <div style={{ background: "var(--c-surface2)", borderRadius: 10, padding: 14 }}>
              <p style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "var(--c-dim)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>SKUs on order</p>
              {selected.sku.map((s) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 0", borderBottom: "1px solid var(--c-border2)", fontSize: 12, color: "var(--c-text)" }}>
                  <Package size={11} color="var(--c-dim)" /> <span style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--c-accent)" }}>{s}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={() => { setSelected(null); success("Order updated", `${selected.id} status changed to PACKED.`); }} style={{ flex: 1, padding: "9px", borderRadius: 8, background: "var(--c-accent)", color: "#fff", fontSize: 12.5, fontWeight: 600, border: "none", cursor: "pointer" }}>Advance Status</button>
              <button onClick={() => { setSelected(null); warning("Order placed on hold", selected.id); }} style={{ flex: 1, padding: "9px", borderRadius: 8, border: "1px solid var(--c-border)", background: "transparent", color: "var(--c-amber)", fontSize: 12.5, cursor: "pointer" }}>Hold</button>
            </div>
          </div>
        </div>
      )}

      {/* edit modal */}
      {editing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 16, padding: 28, width: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }} className="fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--c-text)", margin: 0 }}>Edit {editing.id}</h2>
              <button onClick={() => setEditing(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-dim)" }}><X size={16} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[["Customer", "customer"], ["Carrier", "carrier"], ["ETA", "eta"], ["Region", "region"]].map(([lbl, key]) => (
                <div key={key}>
                  <label style={{ fontSize: 12, color: "var(--c-muted)", display: "block", marginBottom: 5 }}>{lbl}</label>
                  <input value={(editing as any)[key]} onChange={(e) => setEditing((p) => p ? { ...p, [key]: e.target.value } : p)} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface2)", color: "var(--c-text)", fontSize: 13, outline: "none", boxSizing: "border-box" as const }} />
                </div>
              ))}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--c-muted)", display: "block", marginBottom: 5 }}>Priority</label>
                  <select value={editing.priority} onChange={(e) => setEditing((p) => p ? { ...p, priority: e.target.value as Order["priority"] } : p)} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface2)", color: "var(--c-text)", fontSize: 13, outline: "none" }}>
                    {["HIGH","STD","LOW"].map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--c-muted)", display: "block", marginBottom: 5 }}>Status</label>
                  <select value={editing.status} onChange={(e) => setEditing((p) => p ? { ...p, status: e.target.value as OrderStatus } : p)} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface2)", color: "var(--c-text)", fontSize: 13, outline: "none" }}>
                    {["PROCESSING","PACKED","SHIPPED","DELIVERED","HOLD"].map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button onClick={handleSaveEdit} style={{ flex: 1, padding: 10, borderRadius: 8, background: "var(--c-accent)", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>Save changes</button>
                <button onClick={() => setEditing(null)} style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid var(--c-border)", background: "transparent", color: "var(--c-muted)", fontSize: 13, cursor: "pointer" }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* delete confirm */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 16, padding: 28, width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }} className="fade-in">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--c-red-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AlertTriangle size={16} color="var(--c-red)" />
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--c-text)", margin: 0 }}>Delete order?</h2>
            </div>
            <p style={{ fontSize: 13, color: "var(--c-muted)", margin: "0 0 22px" }}>
              <strong>{deleteConfirm.id}</strong> for {deleteConfirm.customer} will be permanently deleted. This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleDelete} style={{ flex: 1, padding: 10, borderRadius: 8, background: "var(--c-red)", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>Delete</button>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid var(--c-border)", background: "transparent", color: "var(--c-muted)", fontSize: 13, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* new order modal */}
      {showNew && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 16, padding: 32, width: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }} className="fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--c-text)", margin: 0 }}>New Order</h2>
              <button onClick={() => setShowNew(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-dim)" }}><X size={16} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[["Customer name", "text"], ["Email / Contact", "email"], ["Shipping address", "text"], ["Notes", "text"]].map(([label, type]) => (
                <div key={label}>
                  <label style={{ fontSize: 12, color: "var(--c-muted)", display: "block", marginBottom: 5 }}>{label}</label>
                  <input type={type} style={{ width: "100%", padding: "9px 13px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface2)", color: "var(--c-text)", fontSize: 13, outline: "none" }} />
                </div>
              ))}
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button onClick={handleNewOrder} style={{ flex: 1, padding: 10, borderRadius: 8, background: "var(--c-accent)", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>Create Order</button>
                <button onClick={() => setShowNew(false)} style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid var(--c-border)", background: "transparent", color: "var(--c-muted)", fontSize: 13, cursor: "pointer" }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid var(--c-border2)" }}>
      <span style={{ fontSize: 12, color: "var(--c-dim)" }}>{label}</span>
      <span style={{ fontSize: 12.5, color: "var(--c-text)", fontWeight: 500 }}>{value}</span>
    </div>
  );
}
