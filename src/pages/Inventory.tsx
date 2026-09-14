import { useState } from "react";
import { Search, AlertTriangle, RefreshCcw, Plus, X, Pencil, Trash2 } from "lucide-react";
import { inventory as initialInventory, type SkuItem } from "@/data/data";
import { useNotification } from "@/contexts/NotificationContext";

const CATS = ["All", "Electronics", "Industrial", "Apparel", "FMCG", "Hardware", "Chemicals"];

function StockBar({ item }: { item: SkuItem }) {
  const pct = Math.min((item.stock / item.cap) * 100, 100);
  const reorderPct = (item.reorder / item.cap) * 100;
  const critical = item.stock < item.reorder;
  const color = critical ? "var(--c-red)" : pct < 40 ? "var(--c-amber)" : "var(--c-green)";
  return (
    <div style={{ position: "relative", height: 6, borderRadius: 3, background: "var(--c-surface3)" }}>
      <div style={{ height: 6, borderRadius: 3, width: `${pct}%`, background: color }} />
      <div style={{ position: "absolute", top: -1, bottom: -1, left: `${reorderPct}%`, width: 1.5, background: "var(--c-amber)", borderRadius: 1 }} title="Reorder point" />
    </div>
  );
}

export default function Inventory() {
  const [inventoryData, setInventoryData] = useState<SkuItem[]>(initialInventory);
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"stock" | "sku" | "value">("stock");
  const [selected, setSelected] = useState<SkuItem | null>(null);
  const [editing, setEditing] = useState<SkuItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<SkuItem | null>(null);
  const { success, info, warning } = useNotification();

  const handleSaveEdit = () => {
    if (!editing) return;
    setInventoryData((prev) => prev.map((i) => (i.sku === editing.sku ? editing : i)));
    if (selected?.sku === editing.sku) setSelected(editing);
    setEditing(null);
    success("SKU updated", `${editing.sku} has been saved.`);
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    setInventoryData((prev) => prev.filter((i) => i.sku !== deleteConfirm.sku));
    setSelected(null);
    setDeleteConfirm(null);
    info("SKU removed", `${deleteConfirm.sku} deleted from inventory.`);
  };

  const filtered = inventoryData
    .filter((i) => {
      if (cat !== "All" && i.category !== cat) return false;
      if (search && !i.sku.toLowerCase().includes(search.toLowerCase()) && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "stock") return (a.stock / a.reorder) - (b.stock / b.reorder);
      if (sort === "value") return (b.stock * b.value) - (a.stock * a.value);
      return a.sku.localeCompare(b.sku);
    });

  const lowStock = inventoryData.filter((i) => i.stock < i.reorder);

  return (
    <div className="p-4 md:p-5 flex flex-col gap-4 overflow-x-hidden">
      {/* header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--c-text)", margin: 0, letterSpacing: "-0.5px" }}>Inventory</h1>
          <p style={{ fontSize: 11.5, color: "var(--c-muted)", margin: "3px 0 0", fontFamily: "JetBrains Mono, monospace" }}>
            {inventoryData.length} SKUs · {lowStock.length} below reorder point
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => success("Reorder sent", `${lowStock.length} SKUs queued for reorder.`)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "1px solid var(--c-amber)", color: "var(--c-amber)", background: "var(--c-amber-bg)", fontSize: 12.5, cursor: "pointer" }}>
            <RefreshCcw size={13} /> Reorder All Low
          </button>
          <button onClick={() => info("Feature coming soon", "SKU import via CSV.")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "var(--c-accent)", color: "#fff", fontSize: 12.5, fontWeight: 600, border: "none", cursor: "pointer" }}>
            <Plus size={13} /> Add SKU
          </button>
        </div>
      </div>

      {/* alert banner */}
      {lowStock.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, background: "var(--c-amber-bg)", border: "1px solid var(--c-amber)" }}>
          <AlertTriangle size={15} color="var(--c-amber)" />
          <span style={{ fontSize: 13, color: "var(--c-amber)" }}><strong>{lowStock.length} SKUs</strong> are below their reorder point — {lowStock.map((i) => i.sku).join(", ")}</span>
        </div>
      )}

      {/* filters */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: "10px 14px", gap: 16 }}>
        <div style={{ display: "flex", gap: 4 }}>
          {CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)} style={{ padding: "5px 12px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, background: cat === c ? "var(--c-accent-bg)" : "transparent", color: cat === c ? "var(--c-accent)" : "var(--c-muted)" }}>
              {c}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface2)" }}>
            <Search size={13} color="var(--c-dim)" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search SKU or name…" style={{ background: "none", border: "none", outline: "none", fontSize: 12.5, color: "var(--c-text)", width: 180 }} />
            {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-dim)", display: "flex" }}><X size={11} /></button>}
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} style={{ padding: "7px 11px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface2)", color: "var(--c-text)", fontSize: 12, outline: "none", fontFamily: "JetBrains Mono, monospace" }}>
            <option value="stock">Sort: Urgency</option>
            <option value="sku">Sort: SKU</option>
            <option value="value">Sort: Value</option>
          </select>
        </div>
      </div>

      {/* grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
        {filtered.map((item) => {
          const critical = item.stock < item.reorder;
          return (
            <div
              key={item.sku}
              onClick={() => setSelected(item)}
              style={{ background: "var(--c-surface)", border: `1px solid ${critical ? "var(--c-amber)" : "var(--c-border)"}`, borderRadius: 12, padding: 16, cursor: "pointer", transition: "border-color 0.15s" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "var(--c-accent)", marginBottom: 4 }}>{item.sku}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-text)", lineHeight: 1.3 }}>{item.name}</div>
                </div>
                {critical && <AlertTriangle size={15} color="var(--c-amber)" />}
              </div>
              <div style={{ marginBottom: 10 }}>
                <StockBar item={item} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, fontSize: 10.5, fontFamily: "JetBrains Mono, monospace" }}>
                  <span style={{ color: critical ? "var(--c-amber)" : "var(--c-muted)" }}>
                    {item.stock.toLocaleString()} {item.unit}
                  </span>
                  <span style={{ color: "var(--c-dim)" }}>cap {item.cap.toLocaleString()}</span>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "var(--c-dim)" }}>
                <span>{item.category}</span>
                <div style={{ display: "flex", gap: 4 }} onClick={(e) => e.stopPropagation()}>
                  <button onClick={(e) => { e.stopPropagation(); setEditing(item); }} style={{ width: 24, height: 24, borderRadius: 5, border: "1px solid var(--c-border)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-muted)" }}><Pencil size={10} /></button>
                  <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(item); }} style={{ width: 24, height: 24, borderRadius: 5, border: "1px solid var(--c-border)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-red)" }}><Trash2 size={10} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* edit modal */}
      {editing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 16, padding: 28, width: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }} className="fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 22 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--c-text)", margin: 0 }}>Edit {editing.sku}</h2>
              <button onClick={() => setEditing(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-dim)" }}><X size={16} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {([["Name", "name"], ["Category", "category"], ["Unit", "unit"], ["Location", "location"], ["Supplier", "supplier"]] as [string,string][]).map(([lbl, key]) => (
                <div key={key} style={{ gridColumn: key === "name" ? "1/-1" : undefined }}>
                  <label style={{ fontSize: 12, color: "var(--c-muted)", display: "block", marginBottom: 5 }}>{lbl}</label>
                  <input value={(editing as any)[key]} onChange={(e) => setEditing((p) => p ? { ...p, [key]: e.target.value } : p)} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface2)", color: "var(--c-text)", fontSize: 13, outline: "none", boxSizing: "border-box" as const }} />
                </div>
              ))}
              {([["Stock", "stock"], ["Reorder at", "reorder"], ["Capacity", "cap"], ["Unit value ($)", "value"]] as [string,string][]).map(([lbl, key]) => (
                <div key={key}>
                  <label style={{ fontSize: 12, color: "var(--c-muted)", display: "block", marginBottom: 5 }}>{lbl}</label>
                  <input type="number" value={(editing as any)[key]} onChange={(e) => setEditing((p) => p ? { ...p, [key]: Number(e.target.value) } : p)} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface2)", color: "var(--c-text)", fontSize: 13, outline: "none", boxSizing: "border-box" as const }} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={handleSaveEdit} style={{ flex: 1, padding: 10, borderRadius: 8, background: "var(--c-accent)", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>Save changes</button>
              <button onClick={() => setEditing(null)} style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid var(--c-border)", background: "transparent", color: "var(--c-muted)", fontSize: 13, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* delete confirm */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 16, padding: 28, width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }} className="fade-in">
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--c-text)", margin: "0 0 10px" }}>Delete SKU?</h2>
            <p style={{ fontSize: 13, color: "var(--c-muted)", margin: "0 0 22px" }}>
              <strong>{deleteConfirm.sku}</strong> — {deleteConfirm.name} will be permanently removed.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleDelete} style={{ flex: 1, padding: 10, borderRadius: 8, background: "var(--c-red)", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>Delete</button>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid var(--c-border)", background: "transparent", color: "var(--c-muted)", fontSize: 13, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* SKU detail drawer */}
      {selected && (
        <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 380, background: "var(--c-surface)", borderLeft: "1px solid var(--c-border)", boxShadow: "-8px 0 40px rgba(0,0,0,0.15)", zIndex: 100, overflowY: "auto", padding: 24 }} className="fade-in">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: "var(--c-accent)", fontWeight: 600 }}>{selected.sku}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--c-text)", marginTop: 4 }}>{selected.name}</div>
            </div>
            <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-dim)", display: "flex" }}><X size={18} /></button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              ["Category", selected.category],
              ["Unit", selected.unit],
              ["Unit value", `$${selected.value}`],
              ["Total value", `$${(selected.stock * selected.value).toLocaleString()}`],
              ["Location", selected.location],
              ["Supplier", selected.supplier],
              ["Stock", `${selected.stock.toLocaleString()} / ${selected.cap.toLocaleString()}`],
              ["Reorder at", selected.reorder.toLocaleString()],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--c-border2)" }}>
                <span style={{ fontSize: 12, color: "var(--c-dim)" }}>{k}</span>
                <span style={{ fontSize: 12.5, color: "var(--c-text)", fontWeight: 500 }}>{v}</span>
              </div>
            ))}
            <div style={{ margin: "8px 0" }}>
              <StockBar item={selected} />
            </div>
            <button onClick={() => { setSelected(null); success("Reorder placed", `${selected.sku} — ${selected.supplier} notified.`); }} style={{ padding: "10px", borderRadius: 8, background: "var(--c-accent)", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", width: "100%" }}>
              Place Reorder
            </button>
            <button onClick={() => { setEditing(selected); setSelected(null); }} style={{ padding: "10px", borderRadius: 8, border: "1px solid var(--c-border)", background: "transparent", color: "var(--c-muted)", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Pencil size={13} /> Edit SKU
            </button>
            <button onClick={() => { setDeleteConfirm(selected); setSelected(null); }} style={{ padding: "10px", borderRadius: 8, border: "1px solid var(--c-red)", background: "transparent", color: "var(--c-red)", fontSize: 13, cursor: "pointer" }}>
              Delete SKU
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
