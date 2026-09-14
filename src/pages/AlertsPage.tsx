import { useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X, Bell, Filter } from "lucide-react";
import { alertsData, type AlertItem } from "@/data/data";
import { useNotification } from "@/contexts/NotificationContext";

type Severity = "all" | "critical" | "warning" | "info";
type Category = "all" | "inventory" | "shipment" | "warehouse" | "system" | "order";

const severityIcon = {
  critical: <AlertTriangle size={14} />,
  warning:  <AlertTriangle size={14} />,
  info:     <Info size={14} />,
};

const severityColor: Record<string, string> = {
  critical: "var(--c-red)",
  warning:  "var(--c-amber)",
  info:     "var(--c-muted)",
};

const severityBg: Record<string, string> = {
  critical: "var(--c-red-bg)",
  warning:  "var(--c-amber-bg)",
  info:     "var(--c-surface2)",
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>(alertsData);
  const [severity, setSeverity] = useState<Severity>("all");
  const [category, setCategory] = useState<Category>("all");
  const { success, info: toastInfo } = useNotification();

  const filtered = alerts.filter((a) => {
    if (severity !== "all" && a.type !== severity) return false;
    if (category !== "all" && a.category !== category) return false;
    return true;
  });

  const unread = alerts.filter((a) => !a.read).length;

  const markRead = (id: number) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  };

  const dismiss = (id: number) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    toastInfo("Alert dismissed");
  };

  const markAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    success("All alerts marked as read");
  };

  const counts = {
    critical: alerts.filter((a) => a.type === "critical").length,
    warning:  alerts.filter((a) => a.type === "warning").length,
    info:     alerts.filter((a) => a.type === "info").length,
  };

  return (
    <div className="p-4 md:p-5 flex flex-col gap-4 overflow-x-hidden">
      {/* header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--c-text)", margin: 0, letterSpacing: "-0.5px" }}>Alerts</h1>
          <p style={{ fontSize: 11.5, color: "var(--c-muted)", margin: "3px 0 0", fontFamily: "JetBrains Mono, monospace" }}>
            {unread} unread · {alerts.length} total
          </p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", fontSize: 12.5, cursor: "pointer", color: "var(--c-muted)" }}>
            <CheckCircle2 size={13} /> Mark all read
          </button>
        )}
      </div>

      {/* summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {[
          { type: "critical", label: "Critical", count: counts.critical, color: "var(--c-red)",   bg: "var(--c-red-bg)" },
          { type: "warning",  label: "Warnings", count: counts.warning,  color: "var(--c-amber)", bg: "var(--c-amber-bg)" },
          { type: "info",     label: "Info",      count: counts.info,     color: "var(--c-muted)", bg: "var(--c-surface2)" },
        ].map((s) => (
          <button
            key={s.type}
            onClick={() => setSeverity(severity === s.type as Severity ? "all" : s.type as Severity)}
            style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, borderRadius: 12, border: `1px solid ${severity === s.type ? s.color : "var(--c-border)"}`, background: severity === s.type ? s.bg : "var(--c-surface)", cursor: "pointer", textAlign: "left" }}
          >
            <AlertTriangle size={20} color={s.color} />
            <div>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 24, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.count}</div>
              <div style={{ fontSize: 12, color: "var(--c-muted)", marginTop: 3 }}>{s.label}</div>
            </div>
          </button>
        ))}
      </div>

      {/* filters */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Filter size={13} color="var(--c-dim)" />
        <div style={{ display: "flex", gap: 4 }}>
          {(["all", "critical", "warning", "info"] as Severity[]).map((s) => (
            <button key={s} onClick={() => setSeverity(s)} style={{ padding: "5px 12px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, background: severity === s ? "var(--c-accent-bg)" : "var(--c-surface)", color: severity === s ? "var(--c-accent)" : "var(--c-muted)", textTransform: "capitalize" }}>
              {s}
            </button>
          ))}
        </div>
        <div style={{ width: 1, height: 16, background: "var(--c-border2)" }} />
        <div style={{ display: "flex", gap: 4 }}>
          {(["all", "inventory", "shipment", "warehouse", "system", "order"] as Category[]).map((c) => (
            <button key={c} onClick={() => setCategory(c)} style={{ padding: "5px 12px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, background: category === c ? "var(--c-surface3)" : "transparent", color: category === c ? "var(--c-text)" : "var(--c-muted)", textTransform: "capitalize" }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* alerts list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.length === 0 && (
          <div style={{ padding: 48, textAlign: "center", color: "var(--c-dim)", fontSize: 13 }}>
            <Bell size={24} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <div>No alerts match your filters.</div>
          </div>
        )}
        {filtered.map((a) => (
          <div
            key={a.id}
            onClick={() => markRead(a.id)}
            style={{
              display: "flex", gap: 14, padding: "14px 16px",
              borderRadius: 12, cursor: "pointer",
              border: `1px solid ${a.read ? "var(--c-border)" : severityColor[a.type]}`,
              background: a.read ? "var(--c-surface)" : severityBg[a.type],
              borderLeft: `3px solid ${severityColor[a.type]}`,
              opacity: a.read ? 0.65 : 1,
            }}
          >
            <div style={{ color: severityColor[a.type], flexShrink: 0, marginTop: 1 }}>
              {severityIcon[a.type]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", padding: "1px 6px", borderRadius: 4, background: "var(--c-surface3)", color: "var(--c-dim)", textTransform: "capitalize" }}>{a.category}</span>
                {!a.read && <span style={{ width: 6, height: 6, borderRadius: "50%", background: severityColor[a.type], display: "inline-block" }} />}
              </div>
              <p style={{ fontSize: 13, color: "var(--c-text)", margin: "0 0 4px", lineHeight: 1.4, fontWeight: a.read ? 400 : 500 }}>{a.msg}</p>
              {a.detail && <p style={{ fontSize: 11.5, color: "var(--c-muted)", margin: "0 0 4px", lineHeight: 1.4 }}>{a.detail}</p>}
              <p style={{ fontSize: 10.5, fontFamily: "JetBrains Mono, monospace", color: "var(--c-dim)", margin: 0 }}>{a.time}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); dismiss(a.id); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-dim)", display: "flex", alignSelf: "flex-start", flexShrink: 0, padding: 2 }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
