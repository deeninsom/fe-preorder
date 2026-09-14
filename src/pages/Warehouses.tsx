import { useState } from "react";
import { MapPin, Users, Layers, Truck, AlertTriangle, ChevronDown, ChevronUp, Plus, X, Pencil, Trash2 } from "lucide-react";
import { warehouses as initialWarehouses, type Warehouse } from "@/data/data";
import { useNotification } from "@/contexts/NotificationContext";

function CapBar({ v }: { v: number }) {
  const c = v > 85 ? "var(--c-red)" : v > 65 ? "var(--c-amber)" : "var(--c-green)";
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: "var(--c-muted)" }}>Capacity utilization</span>
        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: c, fontWeight: 600 }}>{v}%</span>
      </div>
      <div style={{ height: 7, borderRadius: 4, background: "var(--c-surface3)" }}>
        <div style={{ height: 7, borderRadius: 4, background: c, width: `${v}%` }} />
      </div>
    </div>
  );
}

const zoneData = [
  { zone: "Zone A", fill: 92, items: 3240, type: "Pick" },
  { zone: "Zone B", fill: 67, items: 1840, type: "Bulk" },
  { zone: "Zone C", fill: 45, items: 920,  type: "Staging" },
  { zone: "Zone D", fill: 78, items: 2110, type: "Returns" },
];

export default function Warehouses() {
  const [warehouseData, setWarehouseData] = useState<Warehouse[]>(initialWarehouses);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Warehouse | null>(null);
  const { success, warning, info } = useNotification();

  const toggle = (id: string) => setExpanded((prev) => (prev === id ? null : id));
  const handleSaveEdit = () => {
    if (!editing) return;
    setWarehouseData((prev) => prev.map((w) => (w.id === editing.id ? editing : w)));
    setEditing(null);
    success("Warehouse updated", `${editing.name} has been saved.`);
  };
  const handleDelete = () => {
    if (!deleteConfirm) return;
    setWarehouseData((prev) => prev.filter((w) => w.id !== deleteConfirm.id));
    setDeleteConfirm(null);
    info("Warehouse removed", `${deleteConfirm.name} has been deleted.`);
  };

  return (
    <div className="p-4 md:p-5 flex flex-col gap-4 overflow-x-hidden">
      {/* header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--c-text)", margin: 0, letterSpacing: "-0.5px" }}>Warehouses</h1>
          <p style={{ fontSize: 11.5, color: "var(--c-muted)", margin: "3px 0 0", fontFamily: "JetBrains Mono, monospace" }}>
            {warehouseData.filter((w) => w.active).length} active · {warehouseData.filter((w) => !w.active).length} offline
          </p>
        </div>
        <button onClick={() => info("Feature coming soon", "Add warehouse via the admin portal.")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "var(--c-accent)", color: "#fff", fontSize: 12.5, fontWeight: 600, border: "none", cursor: "pointer" }}>
          <Plus size={13} /> Add Warehouse
        </button>
      </div>

      {/* summary row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "Total Sq. Ft.", value: warehouseData.reduce((s, w) => s + w.sqft, 0).toLocaleString(), sub: "across all sites" },
          { label: "Total Staff", value: warehouseData.filter(w => w.active).reduce((s, w) => s + w.staff, 0).toString(), sub: "active warehouses" },
          { label: "Open Alerts", value: warehouseData.reduce((s, w) => s + w.alerts, 0).toString(), sub: "requires action", color: "var(--c-amber)" },
          { label: "Avg. Capacity", value: warehouseData.filter(w=>w.active).length > 0 ? `${Math.round(warehouseData.filter(w=>w.active).reduce((s,w)=>s+w.capacity,0)/warehouseData.filter(w=>w.active).length)}%` : "—", sub: "active sites", color: "var(--c-green)" },
        ].map((s) => (
          <div key={s.label} style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 16 }}>
            <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 24, fontWeight: 700, color: s.color ?? "var(--c-text)", marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "var(--c-muted)" }}>{s.label}</div>
            <div style={{ fontSize: 10.5, color: "var(--c-dim)", marginTop: 2, fontFamily: "JetBrains Mono, monospace" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* warehouse cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {warehouseData.map((wh) => (
          <div key={wh.id} style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 14, overflow: "hidden" }}>
            {/* card header */}
            <div
              onClick={() => toggle(wh.id)}
              style={{ display: "flex", alignItems: "center", gap: 16, padding: 18, cursor: "pointer" }}
            >
              {/* status dot */}
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: wh.active ? "var(--c-green)" : "var(--c-dim)", flexShrink: 0 }} className={wh.active ? "pulse-dot" : ""} />

              {/* id */}
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, fontWeight: 700, color: "var(--c-accent)", width: 50, flexShrink: 0 }}>{wh.id}</div>

              {/* name + meta */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--c-text)" }}>{wh.name}</span>
                  {!wh.active && <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9.5, padding: "2px 6px", borderRadius: 4, background: "var(--c-surface3)", color: "var(--c-dim)", letterSpacing: "0.08em" }}>OFFLINE</span>}
                  {wh.alerts > 0 && <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9.5, padding: "2px 6px", borderRadius: 4, background: "var(--c-amber-bg)", color: "var(--c-amber)" }}>{wh.alerts} alert{wh.alerts > 1 ? "s" : ""}</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 4, fontSize: 11, color: "var(--c-dim)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={10} /> {wh.location}</span>
                  <span>{wh.temp}</span>
                  <span>{wh.sqft.toLocaleString()} sq ft</span>
                </div>
              </div>

              {/* stats */}
              <div style={{ display: "flex", gap: 24, flexShrink: 0 }}>
                <StatPill icon={<Users size={11} />} value={wh.staff} label="Staff" />
                <StatPill icon={<Layers size={11} />} value={wh.zones} label="Zones" />
                <StatPill icon={<Truck size={11} />} value={wh.docks} label="Docks" />
              </div>

              {/* capacity bar */}
              <div style={{ width: 160 }}>
                <div style={{ fontSize: 10, color: "var(--c-dim)", marginBottom: 3, fontFamily: "JetBrains Mono, monospace" }}>Capacity</div>
                <CapBar v={wh.capacity} />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <button onClick={(e) => { e.stopPropagation(); setEditing(wh); }} style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid var(--c-border)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-muted)" }}><Pencil size={12} /></button>
                <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(wh); }} style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid var(--c-border)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-red)" }}><Trash2 size={12} /></button>
                <div style={{ color: "var(--c-dim)" }}>
                  {expanded === wh.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </div>
              </div>
            </div>

            {/* expanded detail */}
            {expanded === wh.id && (
              <div style={{ borderTop: "1px solid var(--c-border2)", padding: 20, background: "var(--c-surface2)" }} className="fade-in">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  {/* zone breakdown */}
                  <div>
                    <p style={{ fontSize: 10.5, fontFamily: "JetBrains Mono, monospace", color: "var(--c-dim)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 12px" }}>Zone Breakdown</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {zoneData.map((z) => (
                        <div key={z.zone}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 12, color: "var(--c-text)" }}>{z.zone} <span style={{ color: "var(--c-dim)", fontSize: 10 }}>· {z.type}</span></span>
                            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "var(--c-muted)" }}>{z.items.toLocaleString()} items</span>
                          </div>
                          <div style={{ height: 5, borderRadius: 2, background: "var(--c-surface3)" }}>
                            <div style={{ height: 5, borderRadius: 2, background: z.fill > 85 ? "var(--c-red)" : "var(--c-accent)", width: `${z.fill}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* actions */}
                  <div>
                    <p style={{ fontSize: 10.5, fontFamily: "JetBrains Mono, monospace", color: "var(--c-dim)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 12px" }}>Actions</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <button onClick={() => success("Floor plan opened", `${wh.name} floor plan loading…`)} style={{ padding: "9px 14px", borderRadius: 8, background: "var(--c-accent-bg)", color: "var(--c-accent)", fontSize: 12.5, fontWeight: 500, border: "1px solid var(--c-accent)", cursor: "pointer", textAlign: "left" }}>View floor plan</button>
                      <button onClick={() => info("Report generated", `${wh.name} capacity report sent to email.`)} style={{ padding: "9px 14px", borderRadius: 8, background: "transparent", color: "var(--c-muted)", fontSize: 12.5, border: "1px solid var(--c-border)", cursor: "pointer", textAlign: "left" }}>Generate capacity report</button>
                      <button
                        onClick={() => wh.active ? warning("Maintenance scheduled", `${wh.name} will go offline at 20:00 UTC.`) : success("Warehouse back online", `${wh.name} is now active.`)}
                        style={{ padding: "9px 14px", borderRadius: 8, background: "transparent", color: wh.active ? "var(--c-amber)" : "var(--c-green)", fontSize: 12.5, border: `1px solid ${wh.active ? "var(--c-amber)" : "var(--c-green)"}`, cursor: "pointer", textAlign: "left" }}
                      >
                        {wh.active ? "Schedule maintenance" : "Bring back online"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* edit modal */}
      {editing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 16, padding: 28, width: 500, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }} className="fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 22 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--c-text)", margin: 0 }}>Edit {editing.id}</h2>
              <button onClick={() => setEditing(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-dim)" }}><X size={16} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {([["Name", "name"], ["Location", "location"], ["Temperature type", "temp"]] as [string, string][]).map(([lbl, key]) => (
                <div key={key} style={{ gridColumn: key === "name" ? "1/-1" : undefined }}>
                  <label style={{ fontSize: 12, color: "var(--c-muted)", display: "block", marginBottom: 5 }}>{lbl}</label>
                  <input value={(editing as any)[key]} onChange={(e) => setEditing((p) => p ? { ...p, [key]: e.target.value } : p)} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface2)", color: "var(--c-text)", fontSize: 13, outline: "none", boxSizing: "border-box" as const }} />
                </div>
              ))}
              {([["Staff", "staff"], ["Sq. Ft.", "sqft"], ["Zones", "zones"], ["Docks", "docks"]] as [string, string][]).map(([lbl, key]) => (
                <div key={key}>
                  <label style={{ fontSize: 12, color: "var(--c-muted)", display: "block", marginBottom: 5 }}>{lbl}</label>
                  <input type="number" value={(editing as any)[key]} onChange={(e) => setEditing((p) => p ? { ...p, [key]: Number(e.target.value) } : p)} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface2)", color: "var(--c-text)", fontSize: 13, outline: "none", boxSizing: "border-box" as const }} />
                </div>
              ))}
              <div style={{ gridColumn: "1/-1", display: "flex", alignItems: "center", gap: 10 }}>
                <label style={{ fontSize: 12, color: "var(--c-muted)" }}>Active</label>
                <button onClick={() => setEditing((p) => p ? { ...p, active: !p.active } : p)} style={{ width: 42, height: 24, borderRadius: 12, border: "none", cursor: "pointer", position: "relative", background: editing.active ? "var(--c-accent)" : "var(--c-surface3)" }}>
                  <div style={{ position: "absolute", top: 3, left: editing.active ? 21 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
                </button>
              </div>
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
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--c-text)", margin: "0 0 10px" }}>Remove warehouse?</h2>
            <p style={{ fontSize: 13, color: "var(--c-muted)", margin: "0 0 22px" }}>{deleteConfirm.name} ({deleteConfirm.id}) will be permanently removed from the platform.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleDelete} style={{ flex: 1, padding: 10, borderRadius: 8, background: "var(--c-red)", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>Remove</button>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid var(--c-border)", background: "transparent", color: "var(--c-muted)", fontSize: 13, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatPill({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, color: "var(--c-dim)", marginBottom: 2 }}>{icon}</div>
      <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, fontWeight: 600, color: "var(--c-text)" }}>{value}</div>
      <div style={{ fontSize: 9.5, color: "var(--c-dim)" }}>{label}</div>
    </div>
  );
}
