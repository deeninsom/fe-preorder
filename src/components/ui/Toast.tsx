import { useEffect, useRef } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useNotification, type Toast } from "@/contexts/NotificationContext";

const cfg = {
  success: { icon: CheckCircle2, color: "var(--c-green)",  bg: "var(--c-green-bg)",  border: "var(--c-green)" },
  error:   { icon: XCircle,      color: "var(--c-red)",    bg: "var(--c-red-bg)",    border: "var(--c-red)" },
  warning: { icon: AlertTriangle,color: "var(--c-amber)",  bg: "var(--c-amber-bg)",  border: "var(--c-amber)" },
  info:    { icon: Info,         color: "var(--c-accent)", bg: "var(--c-accent-bg)", border: "var(--c-accent)" },
};

function ToastItem({ t }: { t: Toast }) {
  const { dismiss } = useNotification();
  const c = cfg[t.type];
  const Icon = c.icon;
  const dur = t.duration ?? 5000;
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = barRef.current;
    if (!el || dur <= 0) return;
    el.style.animationDuration = `${dur}ms`;
  }, [dur]);

  return (
    <div
      className={t.exiting ? "toast-out" : "toast-in"}
      style={{
        background: "var(--c-surface)",
        border: `1px solid var(--c-border)`,
        borderLeft: `3px solid ${c.border}`,
        borderRadius: 10,
        padding: "12px 14px",
        minWidth: 300,
        maxWidth: 380,
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <Icon size={16} style={{ color: c.color, flexShrink: 0, marginTop: 1 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--c-text)", margin: 0, lineHeight: 1.3 }}>{t.title}</p>
          {t.message && (
            <p style={{ fontSize: 11.5, color: "var(--c-muted)", margin: "3px 0 0", lineHeight: 1.4 }}>{t.message}</p>
          )}
        </div>
        <button
          onClick={() => dismiss(t.id)}
          style={{ color: "var(--c-dim)", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", flexShrink: 0 }}
        >
          <X size={14} />
        </button>
      </div>
      {dur > 0 && (
        <div
          ref={barRef}
          className="toast-progress"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: 2,
            background: c.color,
            opacity: 0.5,
          }}
        />
      )}
    </div>
  );
}

export default function ToastContainer() {
  const { toasts } = useNotification();
  if (toasts.length === 0) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <div key={t.id} style={{ pointerEvents: "all" }}>
          <ToastItem t={t} />
        </div>
      ))}
    </div>
  );
}
