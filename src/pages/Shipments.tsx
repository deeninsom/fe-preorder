import { useState } from "react";
import { Search, X, CheckCircle2, Clock, AlertTriangle, Package, Truck } from "lucide-react";
import { shipments, type Shipment } from "@/data/data";
import { useNotification } from "@/contexts/NotificationContext";

const statusCfg: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  IN_TRANSIT:        { label: "In Transit",        color: "var(--c-accent)", icon: <Truck size={12} /> },
  OUT_FOR_DELIVERY:  { label: "Out for Delivery",   color: "var(--c-cyan)",   icon: <Truck size={12} /> },
  DELIVERED:         { label: "Delivered",           color: "var(--c-green)",  icon: <CheckCircle2 size={12} /> },
  EXCEPTION:         { label: "Exception",           color: "var(--c-red)",    icon: <AlertTriangle size={12} /> },
  PENDING:           { label: "Pending Dispatch",    color: "var(--c-muted)",  icon: <Clock size={12} /> },
};

const CARRIERS = ["All", "DHL Express", "UPS Ground", "FedEx Freight", "USPS Priority", "Maersk Line"];

const trackingEvents = [
  { time: "Sep 10 14:30", event: "Shipment picked up by carrier", loc: "Newark, NJ" },
  { time: "Sep 10 18:00", event: "Departed origin facility",      loc: "Newark Hub WH-01" },
  { time: "Sep 11 03:00", event: "Arrived at transit hub",         loc: "Memphis, TN" },
  { time: "Sep 11 06:00", event: "Departed transit hub",           loc: "Memphis, TN" },
  { time: "Sep 11 14:00", event: "Out for delivery",               loc: "Los Angeles, CA" },
];

export default function Shipments() {
  const [carrier, setCarrier] = useState("All");
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Shipment | null>(null);
  const { success, warning, info } = useNotification();

  const statuses = ["All", ...Object.keys(statusCfg)];

  const filtered = shipments.filter((s) => {
    if (carrier !== "All" && s.carrier !== carrier) return false;
    if (status !== "All" && s.status !== status) return false;
    if (search && !s.id.toLowerCase().includes(search.toLowerCase()) && !s.customer.toLowerCase().includes(search.toLowerCase()) && !s.tracking.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-4 md:p-5 flex flex-col gap-4 overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--c-text)", margin: 0, letterSpacing: "-0.5px" }}>Shipments</h1>
          <p style={{ fontSize: 11.5, color: "var(--c-muted)", margin: "3px 0 0", fontFamily: "JetBrains Mono, monospace" }}>
            {filtered.length} shipments · {shipments.filter((s) => s.status === "EXCEPTION").length} exceptions
          </p>
        </div>
        <button onClick={() => info("Tracking sync", "Pulling latest status from all carriers…")} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", fontSize: 12.5, cursor: "pointer", color: "var(--c-muted)" }}>Sync Carriers</button>
      </div>

      {/* carrier performance */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {[
          { carrier: "DHL Express", onTime: "98%", active: 2, col: "var(--c-accent)" },
          { carrier: "UPS Ground", onTime: "95%", active: 2, col: "var(--c-green)" },
          { carrier: "FedEx Freight", onTime: "91%", active: 2, col: "var(--c-cyan)" },
          { carrier: "Maersk Line", onTime: "80%", active: 1, col: "var(--c-red)" },
        ].map((c) => (
          <div key={c.carrier} style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--c-text)", marginBottom: 8 }}>{c.carrier}</div>
            <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 20, fontWeight: 700, color: c.col, lineHeight: 1 }}>{c.onTime}</div>
            <div style={{ fontSize: 10.5, color: "var(--c-dim)", marginTop: 4 }}>on-time · {c.active} active</div>
          </div>
        ))}
      </div>

      {/* filters */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", flex: 1, minWidth: 200 }}>
          <Search size={13} color="var(--c-dim)" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search shipments, tracking…" style={{ background: "none", border: "none", outline: "none", fontSize: 12.5, color: "var(--c-text)", flex: 1 }} />
          {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-dim)", display: "flex" }}><X size={11} /></button>}
        </div>
        <select value={carrier} onChange={(e) => setCarrier(e.target.value)} style={{ padding: "7px 11px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text)", fontSize: 12, outline: "none" }}>
          {CARRIERS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: "7px 11px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text)", fontSize: 12, outline: "none" }}>
          {statuses.map((s) => <option key={s} value={s}>{s === "All" ? "All statuses" : statusCfg[s]?.label}</option>)}
        </select>
      </div>

      {/* list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map((s) => {
          const cfg = statusCfg[s.status];
          const isException = s.status === "EXCEPTION";
          return (
            <div
              key={s.id}
              onClick={() => setSelected(s)}
              style={{ background: "var(--c-surface)", border: `1px solid ${isException ? "var(--c-red)" : "var(--c-border)"}`, borderRadius: 12, padding: 16, cursor: "pointer", display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 20, alignItems: "center" }}
            >
              <div>
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "var(--c-accent)", fontWeight: 600 }}>{s.id}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-text)", marginTop: 2 }}>{s.customer}</div>
                <div style={{ fontSize: 11, color: "var(--c-dim)", marginTop: 3 }}>{s.orderId} · {s.carrier}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--c-dim)", marginBottom: 3 }}>Route</div>
                <div style={{ fontSize: 12, color: "var(--c-text)" }}>{s.origin}</div>
                <div style={{ fontSize: 11, color: "var(--c-muted)", marginTop: 2 }}>→ {s.destination}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--c-dim)", marginBottom: 3 }}>ETA · {s.weight} · {s.pallets}p</div>
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "var(--c-text)", fontWeight: 600 }}>{s.eta}</div>
                <div style={{ fontSize: 11, color: "var(--c-dim)", marginTop: 2, fontFamily: "JetBrains Mono, monospace" }}>Dispatched {s.dispatched}</div>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 7, background: `${cfg.color}18`, color: cfg.color, fontSize: 11, fontFamily: "JetBrains Mono, monospace", fontWeight: 500, flexShrink: 0 }}>
                {cfg.icon} {cfg.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* detail drawer */}
      {selected && (
        <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 400, background: "var(--c-surface)", borderLeft: "1px solid var(--c-border)", boxShadow: "-8px 0 40px rgba(0,0,0,0.15)", zIndex: 100, overflowY: "auto", padding: 24 }} className="fade-in">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: "var(--c-accent)", fontWeight: 600 }}>{selected.id}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--c-text)", marginTop: 3 }}>{selected.customer}</div>
            </div>
            <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-dim)", display: "flex" }}><X size={18} /></button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {[
              ["Carrier", selected.carrier],
              ["Tracking #", selected.tracking],
              ["Order", selected.orderId],
              ["Origin", selected.origin],
              ["Destination", selected.destination],
              ["Weight", selected.weight],
              ["Pallets", String(selected.pallets)],
              ["ETA", selected.eta],
              ["Dispatched", selected.dispatched],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid var(--c-border2)" }}>
                <span style={{ fontSize: 12, color: "var(--c-dim)" }}>{k}</span>
                <span style={{ fontSize: 12, color: "var(--c-text)", fontFamily: "JetBrains Mono, monospace" }}>{v}</span>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 10.5, fontFamily: "JetBrains Mono, monospace", color: "var(--c-dim)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 12px" }}>Tracking Timeline</p>
          <div style={{ position: "relative", paddingLeft: 20 }}>
            <div style={{ position: "absolute", left: 7, top: 8, bottom: 8, width: 1, background: "var(--c-border)" }} />
            {trackingEvents.map((ev, i) => (
              <div key={i} style={{ position: "relative", marginBottom: 16 }}>
                <div style={{ position: "absolute", left: -20, top: 3, width: 8, height: 8, borderRadius: "50%", background: i === trackingEvents.length - 1 ? "var(--c-accent)" : "var(--c-surface3)", border: `2px solid ${i === trackingEvents.length - 1 ? "var(--c-accent)" : "var(--c-border)"}` }} />
                <div style={{ fontSize: 12, fontWeight: 500, color: "var(--c-text)" }}>{ev.event}</div>
                <div style={{ fontSize: 10.5, color: "var(--c-dim)", marginTop: 2, fontFamily: "JetBrains Mono, monospace" }}>{ev.time} · {ev.loc}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
            <button onClick={() => { success("Tracking updated", "Latest carrier scan retrieved."); }} style={{ flex: 1, padding: 9, borderRadius: 8, background: "var(--c-accent)", color: "#fff", fontSize: 12.5, fontWeight: 600, border: "none", cursor: "pointer" }}>Refresh Tracking</button>
            {selected.status === "EXCEPTION" && (
              <button onClick={() => { warning("Case opened", `Exception case for ${selected.id} filed.`); setSelected(null); }} style={{ flex: 1, padding: 9, borderRadius: 8, border: "1px solid var(--c-red)", color: "var(--c-red)", background: "transparent", fontSize: 12.5, cursor: "pointer" }}>File Exception</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
